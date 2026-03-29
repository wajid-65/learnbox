const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');

connectDB();

const app = express();

// Required for Render (and any reverse-proxy host): tells Express to trust
// the X-Forwarded-* headers so secure cookies work correctly over HTTPS
app.set('trust proxy', 1);

// CORS – allow all deployed frontends + local dev
const allowedOrigins = [
  'https://learnbox-ype6.onrender.com',                // Render server itself (same-origin module scripts)
  'https://learnbox-react.netlify.app',                // React admin (Netlify — kept for fallback)
  'https://jazzy-monstera-1023fe.netlify.app',         // React admin (old Netlify URL)
  'https://learnbox-65-1.netlify.app',                 // Angular student (old Netlify URL)
  'http://localhost:5173',                              // local React dev
  'http://localhost:4200',                              // local Angular dev
  'http://localhost:5000',                              // local Express dev
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session config shared between both portals
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/department_knowledge_hub';
const cookieConfig = {
  maxAge: 1000 * 60 * 60 * 24, // 1 day
  httpOnly: true,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production'
};

// Admin portal session — cookie: dkh_admin_sid
const adminSession = session({
  name: 'dkh_admin_sid',
  secret: process.env.SESSION_SECRET || 'dkh_super_secret_2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl, collectionName: 'sessions_admin' }),
  cookie: cookieConfig
});

// Student portal session — cookie: dkh_student_sid
const studentSession = session({
  name: 'dkh_student_sid',
  secret: process.env.SESSION_SECRET || 'dkh_super_secret_2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl, collectionName: 'sessions_student' }),
  cookie: cookieConfig
});

// Dynamically pick session based on which portal made the request
app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  const isStudent =
    origin.includes('learnbox-65') ||
    origin.includes('learnbox-65-1') ||
    origin.includes('4200');
  return isStudent
    ? studentSession(req, res, next)
    : adminSession(req, res, next);
});


// ── Uploaded files (served from GridFS) ─────────────────────
const mongoose = require('mongoose');

app.get('/uploads/:type/:filename', async (req, res) => {
  try {
    const db = mongoose.connection.db;
    if (!db) return res.status(500).json({ message: 'Database not connected' });
    
    const bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads'
    });

    const files = await bucket.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    
    let contentType = 'application/octet-stream';
    if (file.filename.endsWith('.pdf')) contentType = 'application/pdf';
    else if (file.filename.endsWith('.doc')) contentType = 'application/msword';
    else if (file.filename.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (file.filename.endsWith('.ppt')) contentType = 'application/vnd.ms-powerpoint';
    else if (file.filename.endsWith('.pptx')) contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

    res.set('Content-Type', contentType);
    
    const downloadStream = bucket.openDownloadStream(file._id);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving file', error: err.message });
  }
});

// ── API routes ────────────────────────────────────────────────
app.use('/api', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/questionpapers', require('./routes/questionpapers'));

// ── Serve built static portals ────────────────────────────────
const adminDist   = path.join(__dirname, 'public', 'admin');
const studentDist = path.join(__dirname, 'public', 'student');

// React admin portal — served under /admin
app.use('/admin', express.static(adminDist));
// SPA fallback: only catch /admin/* paths that have no file extension
app.get(/^\/admin(\/[^.]*)?$/, (req, res) => {
  res.sendFile('index.html', { root: adminDist });
});

// Angular student portal — served at root /
app.use('/', express.static(studentDist));
// SPA fallback: only catch paths with no file extension (not .js/.css/.png etc.)
app.get(/^\/[^.]*$/, (req, res) => {
  res.sendFile('index.html', { root: studentDist });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
