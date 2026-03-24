const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const connectDB = require('./config/db');

connectDB();
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (e.g. Render health checks, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));



const app = express();

// CORS – allow all deployed frontends + local dev
const allowedOrigins = [
  'https://jazzy-monstera-1023fe.netlify.app',        // React admin (permanent URL)
  'https://learnbox-65-1.netlify.app',                // Angular student (permanent URL)
  'https://69c23fbcc919f2cf09668b2d--jazzy-monstera-1023fe.netlify.app', // deploy preview
  'https://69c24465cc26b9e021bae6ec--learnbox-65-1.netlify.app',         // deploy preview
  'http://localhost:5173',                             // local React dev
  'http://localhost:4200',                             // local Angular dev
];


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'dkh_super_secret_2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/department_knowledge_hub',
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/questionpapers', require('./routes/questionpapers'));

// Health check
app.get('/', (req, res) => res.json({ message: 'Department Knowledge Hub API is running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
