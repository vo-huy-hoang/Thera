const mongoose = require('mongoose');

const aiPromptSchema = new mongoose.Schema({
  prompt_type: { type: String, required: true, unique: true },
  system_prompt: { type: String, required: true },
  temperature: { type: Number, default: 0.7 },
  max_tokens: { type: Number, default: 1000 },
  model: { type: String, default: 'llama-3.3-70b-versatile' },
  is_active: { type: Boolean, default: true },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AiPrompt', aiPromptSchema);
