/**
 * Deep Schema Verification Script
 * Compares all Mongoose model fields against the original Supabase SQL schema
 * Run: node scripts/deepVerify.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const connectDB = require('../config/db');

// Expected fields from original SQL schema
const EXPECTED_SCHEMA = {
  Exercise: {
    fields: ['title', 'description', 'video_url', 'thumbnail_url', 'duration', 'calories',
             'difficulty', 'target_areas', 'category', 'tags', 'instructions', 'benefits',
             'variations', 'is_pro', 'order_index', 'created_at'],
    model: '../models/Exercise',
  },
  WorkoutPlan: {
    fields: ['title', 'description', 'duration_days', 'target_area', 'difficulty',
             'thumbnail_url', 'is_pro', 'created_at'],
    model: '../models/WorkoutPlan',
  },
  PlanExercise: {
    fields: ['plan_id', 'exercise_id', 'day_number', 'order_in_day'],
    model: '../models/PlanExercise',
  },
  User: {
    fields: ['email', 'full_name', 'avatar_url', 'age', 'occupation', 'pain_areas',
             'symptoms', 'surgery_history', 'preferred_time', 'role', 'is_pro',
             'owned_devices', 'created_at', 'updated_at'],
    model: '../models/User',
  },
  PainLog: {
    fields: ['user_id', 'date', 'pain_areas', 'pain_level', 'notes', 'created_at'],
    model: '../models/PainLog',
  },
  AiPrompt: {
    fields: ['prompt_type', 'system_prompt', 'temperature', 'max_tokens', 'model',
             'is_active', 'updated_at'],
    model: '../models/AiPrompt',
  },
  KnowledgeBase: {
    fields: ['title', 'content', 'category', 'tags', 'created_at'],
    model: '../models/KnowledgeBase',
  },
  ActivationCode: {
    fields: ['code', 'is_used', 'used_by', 'used_at', 'created_at'],
    model: '../models/ActivationCode',
  },
  WorkoutLog: {
    fields: ['user_id', 'exercise_id', 'plan_id', 'started_at', 'completed_at',
             'is_completed', 'duration_seconds', 'skipped', 'created_at', 'day_number'],
    model: '../models/WorkoutLog',
  },
  WorkoutFeedback: {
    fields: ['user_id', 'workout_log_id', 'feeling', 'skip_reason', 'comment', 'created_at'],
    model: '../models/WorkoutFeedback',
  },
  UserBehavior: {
    fields: ['user_id', 'total_workouts', 'streak_days', 'favorite_exercises',
             'avoided_exercises', 'avg_session_duration', 'last_workout_at', 'updated_at'],
    model: '../models/UserBehavior',
  },
  ChatHistory: {
    fields: ['user_id', 'message', 'role', 'created_at'],
    model: '../models/ChatHistory',
  },
  DailyRecommendation: {
    fields: ['user_id', 'date', 'nutrition_advice', 'sport_advice',
             'device_level', 'device_duration', 'created_at'],
    model: '../models/DailyRecommendation',
  },
  DeviceUsageLog: {
    fields: ['user_id', 'pain_log_id', 'device_level', 'duration_minutes',
             'started_at', 'completed_at', 'created_at'],
    model: '../models/DeviceUsageLog',
  },
  HealthTip: {
    fields: ['title', 'content', 'category', 'target_area', 'created_at'],
    model: '../models/HealthTip',
  },
  NutritionTip: {
    fields: ['title', 'content', 'category', 'target_area', 'created_at'],
    model: '../models/NutritionTip',
  },
  NotificationToken: {
    fields: ['user_id', 'token', 'platform', 'created_at'],
    model: '../models/NotificationToken',
  },
};

async function verify() {
  await connectDB();
  
  let allPassed = true;
  let totalFields = 0;
  let matchedFields = 0;
  
  console.log('====================================');
  console.log('  DEEP SCHEMA VERIFICATION');
  console.log('====================================\n');
  
  for (const [name, config] of Object.entries(EXPECTED_SCHEMA)) {
    try {
      const Model = require(config.model);
      const schema = Model.schema;
      const schemaPaths = Object.keys(schema.paths).filter(p => p !== '_id' && p !== '__v');
      
      const missing = [];
      const present = [];
      
      for (const field of config.fields) {
        if (schemaPaths.includes(field)) {
          present.push(field);
          matchedFields++;
        } else {
          missing.push(field);
        }
        totalFields++;
      }
      
      const status = missing.length === 0 ? '✅' : '❌';
      console.log(`${status} ${name} (${present.length}/${config.fields.length} fields)`);
      
      if (missing.length > 0) {
        console.log(`   MISSING: ${missing.join(', ')}`);
        allPassed = false;
      }
    } catch (err) {
      console.log(`❌ ${name} — ERROR: ${err.message}`);
      allPassed = false;
    }
  }
  
  console.log('\n====================================');
  console.log(`  TOTAL: ${matchedFields}/${totalFields} fields matched`);
  console.log(`  STATUS: ${allPassed ? 'ALL PASSED ✅' : 'ISSUES FOUND ❌'}`);
  console.log('====================================\n');
  
  // Also verify the toJSON id conversion
  const Exercise = require('../models/Exercise');
  const ex = await Exercise.findOne();
  if (ex) {
    const j = ex.toJSON();
    const idOk = !!j.id && typeof j.id === 'string';
    const noV = j.__v === undefined;
    console.log('ID CONVERSION:');
    console.log(`  id field present: ${idOk ? '✅' : '❌'}`);
    console.log(`  __v removed: ${noV ? '✅' : '❌'}`);
    if (!idOk || !noV) allPassed = false;
  }
  
  // Verify admin login works
  const User = require('../models/User');
  const bcrypt = require('bcryptjs');
  const admin = await User.findOne({ role: 'admin' }).select('+password');
  if (admin) {
    const loginOk = await admin.comparePassword('admin123');
    console.log(`\nADMIN LOGIN: ${loginOk ? '✅ Password matches' : '❌ Password WRONG'}`);
    if (!loginOk) allPassed = false;
  } else {
    console.log('\nADMIN LOGIN: ❌ Admin user not found!');
    allPassed = false;
  }
  
  // Check AI prompts are seeded
  const AiPrompt = require('../models/AiPrompt');
  const prompts = await AiPrompt.find();
  const expectedTypes = ['recommendation', 'chatbot', 'tips', 'nutrition', 'analysis', 'motivation'];
  const foundTypes = prompts.map(p => p.prompt_type);
  const missingTypes = expectedTypes.filter(t => !foundTypes.includes(t));
  console.log(`\nAI PROMPTS: ${missingTypes.length === 0 ? '✅' : '❌'} (${foundTypes.length}/4 types)`);
  if (missingTypes.length > 0) {
    console.log(`  Missing: ${missingTypes.join(', ')}`);
    allPassed = false;
  }
  
  console.log('\n====================================');
  console.log(`  FINAL VERDICT: ${allPassed ? '🟢 PRODUCTION READY' : '🔴 NOT READY'}`);
  console.log('====================================');
  
  process.exit(allPassed ? 0 : 1);
}

verify().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
