import mongoose from 'mongoose';
import { ACCOUNT_STATUS, ACCOUNT_STATUS_VALUES } from '../constants/account-status.js';
import { ROLE_VALUES } from '../constants/roles.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, required: true, enum: ROLE_VALUES, index: true },
  status: {
    type: String,
    required: true,
    enum: ACCOUNT_STATUS_VALUES,
    default: ACCOUNT_STATUS.ACTIVE,
    index: true
  },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', default: null },
  tokenVersion: { type: Number, required: true, min: 0, default: 0, select: false },
  lastLoginAt: { type: Date, default: null }
}, {
  timestamps: true,
  toJSON: {
    transform(_document, value) {
      value.id = value._id?.toString();
      delete value._id;
      delete value.__v;
      delete value.passwordHash;
      delete value.tokenVersion;
      return value;
    }
  }
});

userSchema.index({ role: 1, status: 1 });

export const User = mongoose.model('User', userSchema);
