const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  subject:     { type: String, required: true },
  semester:    { type: String, required: true },
  file_url:    { type: String, required: true },
  uploaded_by: { type: String, required: true },
  upload_date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Material', MaterialSchema);
