const QuestionPaper = require('../models/QuestionPaper');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// GET /api/questionpapers
const getQuestionPapers = async (req, res) => {
  try {
    const papers = await QuestionPaper.find().sort({ year: -1 });
    res.json({ success: true, data: papers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/questionpapers/search?query=
const searchQuestionPapers = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ success: true, data: [] });
  try {
    const regex = new RegExp(query, 'i');
    const papers = await QuestionPaper.find({
      $or: [{ subject: regex }, { year: regex }, { semester: regex }]
    }).sort({ year: -1 });
    res.json({ success: true, data: papers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/questionpapers (admin only)
const uploadQuestionPaper = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { subject, year, semester } = req.body;
    if (!subject || !year || !semester) {
      return res.status(400).json({ message: 'Subject, year and semester are required' });
    }

    // Upload temporary multer file to GridFS
    await new Promise((resolve, reject) => {
      const db = mongoose.connection.db;
      const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
      const uploadStream = bucket.openUploadStream(req.file.filename);
      fs.createReadStream(req.file.path)
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });

    // Remove the temporary file from local disk
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    const paper = await QuestionPaper.create({
      subject,
      year,
      semester,
      file_url:    `/uploads/questionpapers/${req.file.filename}`,
      uploaded_by: req.session.user.name
    });
    res.status(201).json({ success: true, data: paper });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/questionpapers/:id (admin only)
const deleteQuestionPaper = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const paper = await QuestionPaper.findById(req.params.id);
    if (!paper) return res.status(404).json({ message: 'Question paper not found' });

    // Delete file from GridFS instead of disk
    const filename = paper.file_url.split('/').pop();
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const files = await bucket.find({ filename }).toArray();
    if (files.length > 0) {
      await bucket.delete(files[0]._id);
    }

    await paper.deleteOne();
    res.json({ success: true, message: 'Question paper deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getQuestionPapers, searchQuestionPapers, uploadQuestionPaper, deleteQuestionPaper };
