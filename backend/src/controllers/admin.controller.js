const db = require('../config/db');
const { hashPassword } = require('../utils/hashPassword');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudentsRes = await db.query('SELECT COUNT(*) FROM students');
    const statusStatsRes = await db.query('SELECT student_status, COUNT(*) FROM students GROUP BY student_status');
    const pendingRequestsRes = await db.query("SELECT COUNT(*) FROM change_requests WHERE status = 'pending'");
    
    // Add new stats
    const facultyStats = await db.query(`
      SELECT f.name as faculty, COUNT(s.id) 
      FROM students s JOIN faculties f ON s.faculty_id = f.id 
      GROUP BY f.name
    `);
    
    const recentActivities = await db.query(`
      SELECT al.*, u.email 
      FROM activity_logs al 
      JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC LIMIT 10
    `);

    res.status(200).json({
      success: true,
      data: {
        total_students: parseInt(totalStudentsRes.rows[0].count),
        status_distribution: statusStatsRes.rows,
        pending_requests: parseInt(pendingRequestsRes.rows[0].count),
        faculty_distribution: facultyStats.rows,
        recent_activities: recentActivities.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, status, faculty_id, major, class_name } = req.query;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT s.*, u.status as account_status, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE 1=1';
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND (s.student_code ILIKE $${paramCount} OR s.full_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }
    
    if (status) { query += ` AND s.student_status = $${paramCount}`; params.push(status); paramCount++; }
    if (faculty_id) { query += ` AND s.faculty_id = $${paramCount}`; params.push(faculty_id); paramCount++; }
    if (major) { query += ` AND s.major ILIKE $${paramCount}`; params.push(`%${major}%`); paramCount++; }
    if (class_name) { query += ` AND s.class_name ILIKE $${paramCount}`; params.push(`%${class_name}%`); paramCount++; }
    
    query += ` ORDER BY s.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);
    
    const { rows } = await db.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getStudentById = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, u.status as account_status, u.email 
      FROM students s JOIN users u ON s.user_id = u.id 
      WHERE s.id = $1
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// --- NEW ACTIONS ---

exports.toggleAccountStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'lock' or 'unlock'
    const status = action === 'lock' ? 'disabled' : 'active';
    
    const studentRes = await db.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (studentRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, studentRes.rows[0].user_id]);
    
    res.status(200).json({ success: true, message: `Account ${status} successfully` });
  } catch (error) {
    next(error);
  }
};

exports.resetStudentPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    const studentRes = await db.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (studentRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    const hashed = await hashPassword(newPassword);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, studentRes.rows[0].user_id]);
    
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const studentRes = await db.query('SELECT user_id FROM students WHERE id = $1', [id]);
    if (studentRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    
    // CASCADE delete will remove student record when user is deleted
    await db.query('DELETE FROM users WHERE id = $1', [studentRes.rows[0].user_id]);
    
    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.editStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    let updateQuery = 'UPDATE students SET ';
    const updateParams = [];
    let i = 1;
    for (const key in updates) {
      updateQuery += `${key} = $${i}, `;
      updateParams.push(updates[key]);
      i++;
    }
    updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`;
    updateParams.push(id);
    
    const { rows } = await db.query(updateQuery, updateParams);
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// ... keep change requests
exports.getChangeRequests = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT cr.*, s.student_code, s.full_name
      FROM change_requests cr
      JOIN students s ON cr.student_id = s.id
      WHERE cr.status = 'pending'
      ORDER BY cr.created_at ASC
    `);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.handleChangeRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    const { rows } = await db.query(
      'UPDATE change_requests SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, reason || null, id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });
    const request = rows[0];
    
    if (action === 'approve') {
      const updates = request.changed_data;
      let updateQuery = 'UPDATE students SET ';
      const updateParams = [];
      let i = 1;
      for (const key in updates) {
        updateQuery += `${key} = $${i}, `;
        updateParams.push(updates[key]);
        i++;
      }
      updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = $${i}`;
      updateParams.push(request.student_id);
      await db.query(updateQuery, updateParams);
    }
    
    res.status(200).json({ success: true, message: `Request ${action}d successfully` });
  } catch (error) {
    next(error);
  }
};
