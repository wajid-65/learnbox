const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMaterials, searchMaterials, uploadMaterial, updateMaterial, deleteMaterial } = require('../controllers/materialsController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/materials')),
  filename:    (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX, PPT, PPTX files are allowed'));
  }
});

router.get('/',        getMaterials);
router.get('/search',  searchMaterials);
router.post('/',       upload.single('file'), uploadMaterial);
router.put('/:id',     updateMaterial);   // findByIdAndUpdate — edit title/subject/semester
router.delete('/:id',  deleteMaterial);

module.exports = router;
