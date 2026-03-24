const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getQuestionPapers, searchQuestionPapers, uploadQuestionPaper, deleteQuestionPaper } = require('../controllers/questionPapersController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/questionpapers')),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  }
});

router.get('/',        getQuestionPapers);
router.get('/search',  searchQuestionPapers);
router.post('/',       upload.single('file'), uploadQuestionPaper);
router.delete('/:id',  deleteQuestionPaper);

module.exports = router;
