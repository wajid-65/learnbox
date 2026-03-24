/**
 * build.cjs — Builds both portals and copies output into server/public/
 * Run: node build.cjs
 * Render build command: node build.cjs
 */
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const root       = __dirname;
const serverPub  = path.join(root, 'server', 'public');
const adminDest  = path.join(serverPub, 'admin');
const studentDest= path.join(serverPub, 'student');

function run(cmd, cwd) {
  console.log(`\n▶ ${cmd}  [in ${path.relative(root, cwd) || '.'}]`);
  execSync(cmd, { cwd, stdio: 'inherit' });
}

function copyDir(src, dest) {
  if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true });
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
  console.log(`   Copied  ${path.relative(root, src)}  →  ${path.relative(root, dest)}`);
}

// ── Install backend deps ───────────────────────────────────────
run('npm install', path.join(root, 'server'));

// ── Build React admin portal ───────────────────────────────────
// --include=dev ensures vite is installed even when NODE_ENV=production
run('npm install --include=dev', path.join(root, 'admin-portal'));
run('npm run build', path.join(root, 'admin-portal'));
copyDir(path.join(root, 'admin-portal', 'dist'), adminDest);

// ── Build Angular student portal ───────────────────────────────
// --include=dev ensures @angular/cli is installed even when NODE_ENV=production
run('npm install --include=dev', path.join(root, 'student-portal'));
run('npm run build', path.join(root, 'student-portal'));
copyDir(
  path.join(root, 'student-portal', 'dist', 'student-portal', 'browser'),
  studentDest
);

console.log('\n✅  Build complete!');
console.log('   Admin  static files →', path.relative(root, adminDest));
console.log('   Student static files →', path.relative(root, studentDest));
