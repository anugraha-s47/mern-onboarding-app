import mongoose from 'mongoose';
const formEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  step1: { type: mongoose.Schema.Types.Mixed, default: {} }, step2: { type: mongoose.Schema.Types.Mixed, default: {} },
  step3: { type: mongoose.Schema.Types.Mixed, default: { acknowledged: false } }, step4: { type: mongoose.Schema.Types.Mixed, default: {} },
  step5: { type: mongoose.Schema.Types.Mixed, default: {} }, step6: { type: mongoose.Schema.Types.Mixed, default: {} },
  step7: { type: mongoose.Schema.Types.Mixed, default: {} }, step8: { type: mongoose.Schema.Types.Mixed, default: {} },
  completionStatus: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' }, completedAt: { type: Date, default: null }
}, { timestamps: true, minimize: false });
export default mongoose.model('FormEntry', formEntrySchema);
