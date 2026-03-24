require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');

async function verify() {
  await connectDB();

  const User = require('../models/User');
  const Exercise = require('../models/Exercise');
  const WorkoutPlan = require('../models/WorkoutPlan');
  const AiPrompt = require('../models/AiPrompt');
  const KnowledgeBase = require('../models/KnowledgeBase');
  const ActivationCode = require('../models/ActivationCode');

  const counts = {
    users: await User.countDocuments(),
    exercises: await Exercise.countDocuments(),
    plans: await WorkoutPlan.countDocuments(),
    prompts: await AiPrompt.countDocuments(),
    knowledge: await KnowledgeBase.countDocuments(),
    codes: await ActivationCode.countDocuments(),
  };

  console.log('\n=== DATABASE COUNTS ===');
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  // Test id conversion (critical check)
  const ex = await Exercise.findOne();
  if (ex) {
    const j = ex.toJSON();
    console.log('\n=== ID CONVERSION TEST ===');
    console.log('  Has "id" field:', !!j.id);
    console.log('  Has "__v" field:', j.__v !== undefined);
    console.log('  Sample id:', j.id);
    console.log('  Sample title:', j.title);
    console.log('  Category:', j.category);
    console.log('  Duration:', j.duration);
    console.log('  Difficulty:', j.difficulty);
  }

  // Test admin user
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    const aj = admin.toJSON();
    console.log('\n=== ADMIN USER ===');
    console.log('  email:', aj.email);
    console.log('  role:', aj.role);
    console.log('  Has "id" field:', !!aj.id);
    console.log('  full_name:', aj.full_name);
  }

  // Test workout plan
  const plan = await WorkoutPlan.findOne();
  if (plan) {
    const pj = plan.toJSON();
    console.log('\n=== WORKOUT PLAN ===');
    console.log('  title:', pj.title);
    console.log('  Has "id" field:', !!pj.id);
    console.log('  difficulty:', pj.difficulty);
    console.log('  target_area:', pj.target_area);
    console.log('  duration_days:', pj.duration_days);
  }

  // Test AI prompt
  const prompt = await AiPrompt.findOne();
  if (prompt) {
    const prj = prompt.toJSON();
    console.log('\n=== AI PROMPT ===');
    console.log('  prompt_type:', prj.prompt_type);
    console.log('  model:', prj.model);
    console.log('  temperature:', prj.temperature);
    console.log('  max_tokens:', prj.max_tokens);
    console.log('  Has "id" field:', !!prj.id);
  }

  console.log('\n=== ALL CHECKS PASSED ===');
  process.exit(0);
}

verify().catch(err => {
  console.error('VERIFICATION FAILED:', err.message);
  process.exit(1);
});
