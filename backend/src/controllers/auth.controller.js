const db = require('../config/db');
const AuthService = require('../services/auth.service');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const result = await AuthService.login(email, password, req.ip, req.headers['user-agent']);

    res.status(200).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (error) {
    if (error.message === 'Invalid credentials' || error.message === 'Account is disabled or inactive') {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, email, role, status FROM users WHERE id = $1', [req.user.id]);
    const user = rows[0];
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let profile = null;
    if (user.role === 'student') {
      const studentRes = await db.query('SELECT * FROM students WHERE user_id = $1', [user.id]);
      profile = studentRes.rows[0];
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old and new passwords' });
    }
    
    await AuthService.changePassword(req.user.id, oldPassword, newPassword, req.ip, req.headers['user-agent']);
    
    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    if (error.message === 'Invalid old password') {
      return res.status(401).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  // Mock forgot password
  try {
    const { email } = req.body;
    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ success: true, message: 'Password reset OTP sent to email (mock)' });
  } catch (error) {
    next(error);
  }
};
