import { User } from '../models/user.model.js';

export const userRepository = {
  create(data) {
    return User.create(data);
  },

  findByEmail(email) {
    return User.findOne({ email });
  },

  findByEmailWithPassword(email) {
    return User.findOne({ email }).select('+passwordHash +tokenVersion');
  },

  findByIdForAuthentication(id) {
    return User.findById(id).select('+tokenVersion');
  },

  updateLastLogin(id, lastLoginAt) {
    return User.findByIdAndUpdate(id, { lastLoginAt }, { new: true, runValidators: true })
      .select('+tokenVersion');
  },

  incrementTokenVersion(id, currentVersion) {
    return User.findOneAndUpdate(
      { _id: id, tokenVersion: currentVersion },
      { $inc: { tokenVersion: 1 } },
      { new: true, runValidators: true }
    ).select('+tokenVersion');
  }
};
