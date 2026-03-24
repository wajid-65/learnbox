const mongoose = require('mongoose');

const QuestionPaperSchema = new mongoose.Schema({
  subject:     { type: String, required: true },
  year:        { type: String, required: true },
  semester:    { type: String, required: true },
  file_url:    { type: String, required: true },
  uploaded_by: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('QuestionPaper', QuestionPaperSchema);
