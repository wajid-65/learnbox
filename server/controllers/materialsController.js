const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// @route GET /api/materials
const getMaterials = async (req, res) => {
  try {
    const materials = await Material.find().sort({ upload_date: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/materials/search?query=
const searchMaterials = async (req, res) => {
  const { query } = req.query;
  if (!query) return res.json({ success: true, data: [] });

  try {
    const regex = new RegExp(query, 'i');
    const materials = await Material.find({
      $or: [{ title: regex }, { subject: regex }]
    }).sort({ upload_date: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/materials  (admin only)
const uploadMaterial = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // req.headers — read content-type sent by the client (e.g. multipart/form-data)
    const contentType = req.headers['content-type'] || 'unknown';
    console.log(`[Upload] Content-Type from client: ${contentType}`);

    const { title, subject, semester } = req.body;
    if (!title || !subject || !semester) {
      return res.status(400).json({ message: 'Title, subject and semester are required' });
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

    const material = await Material.create({
      title,
      subject,
      semester,
      file_url:    `/uploads/materials/${req.file.filename}`,
      uploaded_by: req.session.user.name,
      upload_date: new Date()
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PUT /api/materials/:id  (admin only) — findByIdAndUpdate
const updateMaterial = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, subject, semester } = req.body;
    if (!title && !subject && !semester) {
      return res.status(400).json({ message: 'Provide at least one field to update' });
    }

    // findByIdAndUpdate — finds by _id and updates only the provided fields
    const updated = await Material.findByIdAndUpdate(
      req.params.id,
      { $set: { title, subject, semester } },
      { new: true }            // returns the updated document
    );

    if (!updated) return res.status(404).json({ message: 'Material not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/materials/:id  (admin only)
const deleteMaterial = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });

    // Delete file from GridFS instead of disk
    const filename = material.file_url.split('/').pop();
    const db = mongoose.connection.db;
    const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: 'uploads' });
    const files = await bucket.find({ filename }).toArray();
    if (files.length > 0) {
      await bucket.delete(files[0]._id);
    }

    await material.deleteOne();
    res.json({ success: true, message: 'Material deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getMaterials, searchMaterials, uploadMaterial, updateMaterial, deleteMaterial };
