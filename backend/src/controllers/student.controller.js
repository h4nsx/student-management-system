const db = require('../config/db');

exports.getStudentProfile = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, f.name as faculty_name 
      FROM students s
      LEFT JOIN faculties f ON s.faculty_id = f.id
      WHERE s.user_id = $1
    `, [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.updateProfileRequest = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const student = rows[0];
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    const changedData = req.body;
    
    const requestRes = await db.query(
      'INSERT INTO change_requests (student_id, changed_data) VALUES ($1, $2) RETURNING *',
      [student.id, changedData]
    );
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, ip_address, device) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'request_profile_update', req.ip, req.headers['user-agent']]
    );
    
    res.status(201).json({ success: true, message: 'Update request submitted', data: requestRes.rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getChangeRequests = async (req, res, next) => {
  try {
    const { rows: studentRows } = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const student = studentRows[0];
    
    const { rows } = await db.query('SELECT * FROM change_requests WHERE student_id = $1 ORDER BY created_at DESC', [student.id]);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.updateProfileDirectly = async (req, res, next) => {
  try {
    const { phone, permanent_address, avatar_url, requested_email } = req.body;
    
    // Update students table
    const { rows } = await db.query(`
      UPDATE students 
      SET phone = COALESCE($1, phone),
          permanent_address = COALESCE($2, permanent_address),
          avatar_url = COALESCE($3, avatar_url),
          personal_email = COALESCE($4, personal_email),
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $5
      RETURNING *
    `, [phone, permanent_address, avatar_url, requested_email, req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }
    
    // Update users table email if provided
    if (requested_email) {
      // Check if email is already taken by another user
      const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [requested_email, req.user.id]);
      if (emailCheck.rows.length === 0) {
        await db.query('UPDATE users SET email = $1 WHERE id = $2', [requested_email, req.user.id]);
      }
    }
    
    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action, ip_address, device) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_profile_directly', req.ip, req.headers['user-agent']]
    );
    
    res.status(200).json({ success: true, message: 'Profile updated successfully', data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getQrData = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT qr_code FROM students WHERE user_id = $1', [req.user.id]);
    let qrToken = rows[0]?.qr_code;
    
    if (!qrToken) {
      const crypto = require('crypto');
      qrToken = crypto.randomUUID();
      await db.query('UPDATE students SET qr_code = $1 WHERE user_id = $2', [qrToken, req.user.id]);
    }
    
    res.status(200).json({ success: true, data: { token: qrToken, expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() } });
  } catch (error) {
    next(error);
  }
};

exports.getScanHistory = async (req, res, next) => {
  try {
    const { rows: studentRows } = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const student = studentRows[0];
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    const { rows } = await db.query(
      'SELECT location, created_at, status_result FROM scan_logs WHERE student_id = $1 ORDER BY created_at DESC',
      [student.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getMyClasses = async (req, res, next) => {
  try {
    const { rows: studentRows } = await db.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const student = studentRows[0];
    
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    
    // Fetch courses
    const { rows: courses } = await db.query(`
      SELECT c.* 
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = $1
    `, [student.id]);
    
    // Fetch schedules for these courses
    if (courses.length > 0) {
      const courseIds = courses.map(c => c.id);
      const { rows: schedules } = await db.query(`
        SELECT * FROM class_schedules WHERE course_id = ANY($1)
      `, [courseIds]);
      
      for (const course of courses) {
        course.schedules = schedules.filter(s => s.course_id === course.id);
      }
    }
    
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.getClassDetail = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    
    const { rows: courseRows } = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    const course = courseRows[0];
    
    const { rows: announcements } = await db.query(
      'SELECT * FROM class_announcements WHERE course_id = $1 ORDER BY created_at DESC',
      [courseId]
    );
    
    const { rows: classmates } = await db.query(`
      SELECT s.student_code, s.full_name, s.avatar_url
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = $1
      ORDER BY s.full_name ASC
    `, [courseId]);
    
    const { rows: documents } = await db.query(
      'SELECT id, title, type, file_url, created_at FROM documents WHERE class_name = $1 AND student_id IS NULL ORDER BY created_at DESC',
      [course.name]
    );
    
    res.status(200).json({ 
      success: true, 
      data: {
        ...course,
        announcements,
        classmates,
        documents
      } 
    });
  } catch (error) {
    next(error);
  }
};
