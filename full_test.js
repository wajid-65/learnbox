
/**
 * Full Pre-Deployment Functionality Test
 * Tests: Login (both roles), Upload Material, Upload QP, Download, Search, Delete, Logout
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── helpers ───────────────────────────────────────────────────
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data), headers: res.headers, cookies: res.headers['set-cookie'] || [] }); }
        catch { resolve({ status: res.statusCode, body: data, headers: res.headers, cookies: res.headers['set-cookie'] || [] }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function json(method, urlPath, cookieStr = '') {
  return { hostname: 'localhost', port: 5000, path: urlPath, method,
    headers: { 'Content-Type': 'application/json', ...(cookieStr ? { Cookie: cookieStr } : {}) } };
}

// Multipart upload helper
function uploadFile(urlPath, fields, filePath, cookieStr = '') {
  return new Promise((resolve, reject) => {
    const boundary = '----TestBoundary' + Date.now();
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    let body = Buffer.alloc(0);

    // Add text fields
    for (const [key, val] of Object.entries(fields)) {
      const part = `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${val}\r\n`;
      body = Buffer.concat([body, Buffer.from(part)]);
    }
    // Add file field
    const filePart = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
    body = Buffer.concat([body, Buffer.from(filePart), fileContent, Buffer.from(`\r\n--${boundary}--\r\n`)]);

    const options = {
      hostname: 'localhost', port: 5000, path: urlPath, method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        ...(cookieStr ? { Cookie: cookieStr } : {})
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── test runner ───────────────────────────────────────────────
const results = [];
function log(test, status, detail) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️ ';
  console.log(`${emoji} [${status}] ${test}`);
  console.log(`        → ${detail}`);
  results.push({ test, status, detail });
}

const PDF_PATH = 'D:\\learnbox\\test_sample.pdf';

async function run() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   LearnBox – Full Pre-Deployment Functionality Test  ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // ── SECTION 1: Backend Health ──────────────────────────────
  console.log('── Section 1: Backend Health ──────────────────────────');
  try {
    const r = await request({ hostname:'localhost', port:5000, path:'/', method:'GET' });
    r.status === 200
      ? log('Backend Health Check', 'PASS', r.body.message)
      : log('Backend Health Check', 'FAIL', 'Status ' + r.status);
  } catch(e) { log('Backend Health Check', 'FAIL', 'Server not reachable: ' + e.message); }

  // ── SECTION 2: Authentication ──────────────────────────────
  console.log('\n── Section 2: Authentication ──────────────────────────');

  // 2a. Empty login
  try {
    const r = await request(json('POST','/api/login'), '{}');
    r.status === 400 ? log('Login – Empty Fields Validation', 'PASS', '400 – ' + r.body.message)
                     : log('Login – Empty Fields Validation', 'FAIL', 'Got ' + r.status);
  } catch(e) { log('Login – Empty Fields Validation', 'FAIL', e.message); }

  // 2b. Wrong credentials
  try {
    const r = await request(json('POST','/api/login'), JSON.stringify({user_id:'bad', name:'bad', password:'bad'}));
    r.status === 401 ? log('Login – Wrong Credentials Rejected', 'PASS', '401 – ' + r.body.message)
                     : log('Login – Wrong Credentials Rejected', 'FAIL', 'Got ' + r.status);
  } catch(e) { log('Login – Wrong Credentials Rejected', 'FAIL', e.message); }

  // 2c. Admin login
  let adminCookie = '';
  try {
    const r = await request(json('POST','/api/login'), JSON.stringify({user_id:'ADM001', name:'Dr. Robert Smith', password:'admin123'}));
    if (r.status === 200 && r.body.success) {
      adminCookie = r.cookies.map(c => c.split(';')[0]).join('; ');
      log('Admin Login (ADM001)', 'PASS', `Logged in as "${r.body.user.name}" [role: ${r.body.user.role}]`);
    } else {
      log('Admin Login (ADM001)', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
    }
  } catch(e) { log('Admin Login (ADM001)', 'FAIL', e.message); }

  // 2d. Student login
  let studentCookie = '';
  try {
    const r = await request(json('POST','/api/login'), JSON.stringify({user_id:'STU001', name:'Alice Johnson', password:'student123'}));
    if (r.status === 200 && r.body.success) {
      studentCookie = r.cookies.map(c => c.split(';')[0]).join('; ');
      log('Student Login (STU001)', 'PASS', `Logged in as "${r.body.user.name}" [role: ${r.body.user.role}]`);
    } else {
      log('Student Login (STU001)', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
    }
  } catch(e) { log('Student Login (STU001)', 'FAIL', e.message); }

  // 2e. Session persistence (/me)
  try {
    const r = await request(json('GET','/api/me', adminCookie));
    r.status === 200 && r.body.user
      ? log('Session Persistence (GET /me)', 'PASS', `user_id=${r.body.user.user_id}, role=${r.body.user.role}`)
      : log('Session Persistence (GET /me)', 'FAIL', 'Status ' + r.status);
  } catch(e) { log('Session Persistence (GET /me)', 'FAIL', e.message); }

  // 2f. Unauthenticated access blocked
  try {
    const r = await request(json('GET','/api/me'));
    r.status === 401 ? log('Unauthenticated Access Blocked', 'PASS', '401 – Not authenticated')
                     : log('Unauthenticated Access Blocked', 'FAIL', 'Got ' + r.status);
  } catch(e) { log('Unauthenticated Access Blocked', 'FAIL', e.message); }

  // ── SECTION 3: Study Materials ─────────────────────────────
  console.log('\n── Section 3: Study Materials ─────────────────────────');

  // 3a. Check test PDF exists
  if (!fs.existsSync(PDF_PATH)) {
    log('Test PDF File', 'FAIL', 'File not found at ' + PDF_PATH);
  } else {
    log('Test PDF File', 'PASS', 'Found at ' + PDF_PATH + ' (' + fs.statSync(PDF_PATH).size + ' bytes)');
  }

  // 3b. Student cannot upload material
  try {
    const r = await uploadFile('/api/materials', { title:'X', subject:'Y', semester:'1' }, PDF_PATH, studentCookie);
    r.status === 403 ? log('Student Cannot Upload Material', 'PASS', '403 – Access denied')
                     : log('Student Cannot Upload Material', 'FAIL', 'Expected 403, got ' + r.status);
  } catch(e) { log('Student Cannot Upload Material', 'FAIL', e.message); }

  // 3c. Admin uploads material
  let uploadedMaterialId = null;
  try {
    const r = await uploadFile('/api/materials', { title:'Mathematics Notes - Semester 3', subject:'Mathematics', semester:'3' }, PDF_PATH, adminCookie);
    if (r.status === 201 && r.body.success) {
      uploadedMaterialId = r.body.data._id;
      log('Admin Upload Study Material', 'PASS', `Created: "${r.body.data.title}" | file: ${r.body.data.file_url}`);
    } else {
      log('Admin Upload Study Material', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
    }
  } catch(e) { log('Admin Upload Study Material', 'FAIL', e.message); }

  // 3d. Material appears in list
  try {
    const r = await request(json('GET','/api/materials', studentCookie));
    const found = r.body.data && r.body.data.find(m => m._id === uploadedMaterialId);
    found ? log('Material Appears in List', 'PASS', `Found "${found.title}" | subject: ${found.subject} | semester: ${found.semester}`)
          : log('Material Appears in List', 'FAIL', 'Uploaded material not found in list. Count: ' + (r.body.data ? r.body.data.length : 'N/A'));
  } catch(e) { log('Material Appears in List', 'FAIL', e.message); }

  // 3e. Search materials
  try {
    const r = await request(json('GET','/api/materials/search?query=Mathematics', studentCookie));
    const found = r.body.data && r.body.data.find(m => m._id === uploadedMaterialId);
    found ? log('Search Study Materials', 'PASS', `Search "Mathematics" found ${r.body.data.length} result(s)`)
          : log('Search Study Materials', 'FAIL', 'Search did not return uploaded material. Count: ' + (r.body.data ? r.body.data.length : 0));
  } catch(e) { log('Search Study Materials', 'FAIL', e.message); }

  // 3f. Download material (verify file is served)
  let materialFileUrl = null;
  try {
    const r = await request(json('GET','/api/materials', studentCookie));
    const mat = r.body.data && r.body.data.find(m => m._id === uploadedMaterialId);
    if (mat) {
      materialFileUrl = mat.file_url;
      // Try fetching the file
      const fileReq = await request({ hostname:'localhost', port:5000, path: mat.file_url, method:'GET' });
      fileReq.status === 200
        ? log('Download Study Material File', 'PASS', `File served at ${mat.file_url} – Content-Type: ${fileReq.headers['content-type']}`)
        : log('Download Study Material File', 'FAIL', 'File request returned status ' + fileReq.status);
    } else {
      log('Download Study Material File', 'FAIL', 'Could not find material to get file URL');
    }
  } catch(e) { log('Download Study Material File', 'FAIL', e.message); }

  // 3g. Verify physical file exists on disk
  if (materialFileUrl) {
    const diskPath = path.join('D:\\learnbox\\server', materialFileUrl.replace(/\//g, '\\'));
    fs.existsSync(diskPath)
      ? log('Material File Saved on Disk', 'PASS', 'File exists at: ' + diskPath)
      : log('Material File Saved on Disk', 'FAIL', 'File missing at: ' + diskPath);
  }

  // ── SECTION 4: Question Papers ─────────────────────────────
  console.log('\n── Section 4: Question Papers ────────────────────────');

  // 4a. Student cannot upload QP
  try {
    const r = await uploadFile('/api/questionpapers', { subject:'Math', year:'2024', semester:'3' }, PDF_PATH, studentCookie);
    r.status === 403 ? log('Student Cannot Upload QP', 'PASS', '403 – Access denied')
                     : log('Student Cannot Upload QP', 'FAIL', 'Expected 403, got ' + r.status);
  } catch(e) { log('Student Cannot Upload QP', 'FAIL', e.message); }

  // 4b. Admin uploads question paper
  let uploadedQpId = null;
  try {
    const r = await uploadFile('/api/questionpapers', { subject:'Mathematics', year:'2024', semester:'3' }, PDF_PATH, adminCookie);
    if (r.status === 201 && r.body.success) {
      uploadedQpId = r.body.data._id;
      log('Admin Upload Question Paper', 'PASS', `Created: Subject="${r.body.data.subject}" Year=${r.body.data.year} | file: ${r.body.data.file_url}`);
    } else {
      log('Admin Upload Question Paper', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
    }
  } catch(e) { log('Admin Upload Question Paper', 'FAIL', e.message); }

  // 4c. QP appears in list
  try {
    const r = await request(json('GET','/api/questionpapers', studentCookie));
    const found = r.body.data && r.body.data.find(q => q._id === uploadedQpId);
    found ? log('QP Appears in List', 'PASS', `Found Subject="${found.subject}" Year=${found.year} Semester=${found.semester}`)
          : log('QP Appears in List', 'FAIL', 'Uploaded QP not found. Count: ' + (r.body.data ? r.body.data.length : 'N/A'));
  } catch(e) { log('QP Appears in List', 'FAIL', e.message); }

  // 4d. Search question papers
  try {
    const r = await request(json('GET','/api/questionpapers/search?query=Mathematics', studentCookie));
    const found = r.body.data && r.body.data.find(q => q._id === uploadedQpId);
    found ? log('Search Question Papers', 'PASS', `Search "Mathematics" found ${r.body.data.length} result(s)`)
          : log('Search Question Papers', 'FAIL', 'Search did not return uploaded QP. Count: ' + (r.body.data ? r.body.data.length : 0));
  } catch(e) { log('Search Question Papers', 'FAIL', e.message); }

  // 4e. Download question paper
  let qpFileUrl = null;
  try {
    const r = await request(json('GET','/api/questionpapers', studentCookie));
    const qp = r.body.data && r.body.data.find(q => q._id === uploadedQpId);
    if (qp) {
      qpFileUrl = qp.file_url;
      const fileReq = await request({ hostname:'localhost', port:5000, path: qp.file_url, method:'GET' });
      fileReq.status === 200
        ? log('Download Question Paper File', 'PASS', `File served at ${qp.file_url} – Content-Type: ${fileReq.headers['content-type']}`)
        : log('Download Question Paper File', 'FAIL', 'File request returned status ' + fileReq.status);
    } else {
      log('Download Question Paper File', 'FAIL', 'Could not find QP to get file URL');
    }
  } catch(e) { log('Download Question Paper File', 'FAIL', e.message); }

  // 4f. Verify QP file on disk
  if (qpFileUrl) {
    const diskPath = path.join('D:\\learnbox\\server', qpFileUrl.replace(/\//g, '\\'));
    fs.existsSync(diskPath)
      ? log('QP File Saved on Disk', 'PASS', 'File exists at: ' + diskPath)
      : log('QP File Saved on Disk', 'FAIL', 'File missing at: ' + diskPath);
  }

  // ── SECTION 5: Delete ──────────────────────────────────────
  console.log('\n── Section 5: Delete Operations ───────────────────────');

  // 5a. Student cannot delete material
  if (uploadedMaterialId) {
    try {
      const r = await request(json('DELETE', '/api/materials/' + uploadedMaterialId, studentCookie));
      r.status === 403 ? log('Student Cannot Delete Material', 'PASS', '403 – Access denied')
                       : log('Student Cannot Delete Material', 'FAIL', 'Expected 403, got ' + r.status);
    } catch(e) { log('Student Cannot Delete Material', 'FAIL', e.message); }
  }

  // 5b. Admin deletes material
  if (uploadedMaterialId) {
    try {
      const r = await request(json('DELETE', '/api/materials/' + uploadedMaterialId, adminCookie));
      if (r.status === 200 && r.body.success) {
        log('Admin Delete Material', 'PASS', r.body.message);
        // Verify it's gone
        const check = await request(json('GET','/api/materials', adminCookie));
        const stillThere = check.body.data && check.body.data.find(m => m._id === uploadedMaterialId);
        stillThere ? log('Material Removed from List', 'FAIL', 'Material still in list after delete')
                   : log('Material Removed from List', 'PASS', 'Material no longer appears in list');
      } else {
        log('Admin Delete Material', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
      }
    } catch(e) { log('Admin Delete Material', 'FAIL', e.message); }
  }

  // 5c. Admin deletes QP
  if (uploadedQpId) {
    try {
      const r = await request(json('DELETE', '/api/questionpapers/' + uploadedQpId, adminCookie));
      if (r.status === 200 && r.body.success) {
        log('Admin Delete Question Paper', 'PASS', r.body.message);
        const check = await request(json('GET','/api/questionpapers', adminCookie));
        const stillThere = check.body.data && check.body.data.find(q => q._id === uploadedQpId);
        stillThere ? log('QP Removed from List', 'FAIL', 'QP still in list after delete')
                   : log('QP Removed from List', 'PASS', 'QP no longer appears in list');
      } else {
        log('Admin Delete Question Paper', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
      }
    } catch(e) { log('Admin Delete Question Paper', 'FAIL', e.message); }
  }

  // ── SECTION 6: Registration ────────────────────────────────
  console.log('\n── Section 6: Registration ────────────────────────────');

  // 6a. Register new student
  try {
    const r = await request(json('POST','/api/register'), JSON.stringify({
      user_id:'NEWSTU99', name:'Test Student', password:'pass123', role:'student', department:'Computer Science'
    }));
    if (r.status === 201 && r.body.success) {
      log('Register New Student', 'PASS', `Created: ${r.body.user.name} [${r.body.user.role}]`);
      // Test login with new account
      const loginR = await request(json('POST','/api/login'), JSON.stringify({user_id:'NEWSTU99', name:'Test Student', password:'pass123'}));
      loginR.status === 200 && loginR.body.success
        ? log('Login with New Account', 'PASS', 'New student can log in immediately after registration')
        : log('Login with New Account', 'FAIL', 'Status ' + loginR.status);
    } else {
      log('Register New Student', 'FAIL', 'Status ' + r.status + ' – ' + JSON.stringify(r.body));
    }
  } catch(e) { log('Register New Student', 'FAIL', e.message); }

  // ── SECTION 7: Logout ─────────────────────────────────────
  console.log('\n── Section 7: Logout ──────────────────────────────────');

  // 7a. Admin logout
  try {
    const r = await request(json('POST','/api/logout', adminCookie));
    r.status === 200 && r.body.success ? log('Admin Logout', 'PASS', r.body.message)
                                       : log('Admin Logout', 'FAIL', 'Status ' + r.status);
  } catch(e) { log('Admin Logout', 'FAIL', e.message); }

  // 7b. Session invalidated after logout
  try {
    const r = await request(json('GET','/api/me', adminCookie));
    r.status === 401 ? log('Session Destroyed After Logout', 'PASS', '401 – Session invalidated correctly')
                     : log('Session Destroyed After Logout', 'FAIL', 'Expected 401, got ' + r.status);
  } catch(e) { log('Session Destroyed After Logout', 'FAIL', e.message); }

  // 7c. Student logout
  try {
    const r = await request(json('POST','/api/logout', studentCookie));
    r.status === 200 && r.body.success ? log('Student Logout', 'PASS', r.body.message)
                                       : log('Student Logout', 'FAIL', 'Status ' + r.status);
  } catch(e) { log('Student Logout', 'FAIL', e.message); }

  // ── FINAL SUMMARY ─────────────────────────────────────────
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║                   TEST SUMMARY                      ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  ✅ PASS: ${String(pass).padEnd(3)} / ${results.length}                                   ║`);
  console.log(`║  ❌ FAIL: ${String(fail).padEnd(3)} / ${results.length}                                   ║`);
  console.log(`║  ⚠️  WARN: ${String(warn).padEnd(3)} / ${results.length}                                   ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  if (fail > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  • ${r.test}: ${r.detail}`);
    });
  } else {
    console.log('\n🎉 All tests passed! Application is ready for deployment.');
  }
}

run().catch(e => { console.error('Test runner crashed:', e); process.exit(1); });
