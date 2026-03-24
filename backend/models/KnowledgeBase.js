const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
