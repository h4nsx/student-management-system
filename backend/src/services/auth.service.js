const UserModel = require('../models/user.model');
const { comparePassword, hashPassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const db = require('../config/db'); // For activity logging

class AuthService {
  static async login(email, password, ip, userAgent) {
    const user = await UserModel.findByEmail(email);
    
    if (!user || !(await comparePassword(password, user.password_hash))) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'active') {
      throw new Error('Account is disabled or inactive');
    }

    const token = generateToken(user.id, user.role);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, ip_address, device) VALUES ($1, $2, $3, $4)',
      [user.id, 'login', ip, userAgent]
    );

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  static async changePassword(userId, oldPassword, newPassword, ip, userAgent) {
    const user = await UserModel.findById(userId);
    
    if (!(await comparePassword(oldPassword, user.password_hash))) {
      throw new Error('Invalid old password');
    }
    
    const hashed = await hashPassword(newPassword);
    await UserModel.updatePassword(user.id, hashed);
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, ip_address, device) VALUES ($1, $2, $3, $4)',
      [user.id, 'change_password', ip, userAgent]
    );
  }
}

module.exports = AuthService;
