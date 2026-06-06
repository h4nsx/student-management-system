const db = require('../config/db');
const { hashPassword } = require('../utils/hashPassword');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalStudentsRes = await db.query('SELECT COUNT(*) FROM students');
    const verifiedStudentsRes = await db.query("SELECT COUNT(*) FROM students WHERE student_status = 'verified'");
    const pendingRequestsRes = await db.query("SELECT COUNT(*) FROM change_requests WHERE status = 'pending'");
    const activeClassesRes = await db.query("SELECT COUNT(*) FROM courses WHERE start_date + (total_weeks * INTERVAL '1 week') >= CURRENT_DATE");
    const totalDocumentsRes = await db.query('SELECT COUNT(*) FROM documents');
    
    // Add tuition_debt logic safely
    let totalTuitionDebtRes = { rows: [{ sum: 0 }] };
    try {
      totalTuitionDebtRes = await db.query('SELECT SUM(tuition_debt) FROM students');
    } catch (e) {
      // Ignore if column doesn't exist
    }

    const facultyStats = await db.query(`
      SELECT f.name as faculty, COUNT(s.id) 
      FROM students s JOIN faculties f ON s.faculty_id = f.id 
      GROUP BY f.name
    `);

    // We don't have verification tracking yet except 'student_status' in students
    const verificationStatus = await db.query(`
      SELECT 
        CASE 
          WHEN student_status = 'verified' THEN 'verified'
          WHEN student_status = 'pending' THEN 'pending'
          ELSE 'unverified'
        END as status, 
        COUNT(*) as count 
      FROM students 
      GROUP BY status
    `);

    const monthlyRegistration = await db.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COUNT(*) as count 
      FROM students 
      GROUP BY month ORDER BY month DESC LIMIT 6
    `);

    const recentActivities = await db.query(`
      SELECT al.*, u.email 
      FROM activity_logs al 
      JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC LIMIT 50
    `);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalStudents: parseInt(totalStudentsRes.rows[0].count),
          verifiedStudents: parseInt(verifiedStudentsRes.rows[0].count),
          pendingVerification: parseInt(pendingRequestsRes.rows[0].count),
          activeClasses: parseInt(activeClassesRes.rows[0].count),
          totalDocuments: parseInt(totalDocumentsRes.rows[0].count),
          totalTuitionDebt: totalTuitionDebtRes.rows[0].sum || 0
        },
        charts: {
          studentsByFaculty: facultyStats.rows,
          verificationStatus: verificationStatus.rows,
          monthlyRegistration: monthlyRegistration.rows
        },
        recentActivities: recentActivities.rows
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

exports.getNextMssv = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const prefix = `${currentYear}11`;
    
    const codeRes = await db.query(
      `SELECT student_code FROM students WHERE student_code LIKE $1 ORDER BY student_code DESC LIMIT 1`,
      [`${prefix}%`]
    );
    
    let nextNumber = 1;
    if (codeRes.rows.length > 0) {
      const lastCode = codeRes.rows[0].student_code;
      const lastNumber = parseInt(lastCode.slice(prefix.length)) || 0;
      nextNumber = lastNumber + 1;
    }
    const student_code = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    
    res.status(200).json({ success: true, data: student_code });
  } catch (error) {
    next(error);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const { email, password, full_name, dob, gender, address, faculty_id, major, class_name, phone } = req.body;
    let student_code = req.body.student_code;
    
    if (!student_code) {
      // Auto-generate student code if not provided
      const currentYear = new Date().getFullYear().toString().slice(-2);
      const prefix = `${currentYear}11`;
      
      const codeRes = await db.query(
        `SELECT student_code FROM students WHERE student_code LIKE $1 ORDER BY student_code DESC LIMIT 1`,
        [`${prefix}%`]
      );
      
      let nextNumber = 1;
      if (codeRes.rows.length > 0) {
        const lastCode = codeRes.rows[0].student_code;
        const lastNumber = parseInt(lastCode.slice(prefix.length)) || 0;
        nextNumber = lastNumber + 1;
      }
      student_code = `${prefix}${nextNumber.toString().padStart(4, '0')}`;
    }

    // Create user
    const hashed = await hashPassword(password);
    const userRes = await db.query(
      "INSERT INTO users (email, password_hash, role, status) VALUES ($1, $2, 'student', 'active') RETURNING id",
      [email, hashed]
    );
    const userId = userRes.rows[0].id;

    // Create student
    const studentRes = await db.query(
      `INSERT INTO students (user_id, student_code, full_name, dob, gender, address, faculty_id, major, class_name, phone_number, student_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'unverified') RETURNING *`,
      [userId, student_code, full_name, dob, gender, address, faculty_id, major, class_name, phone]
    );

    res.status(201).json({ success: true, data: studentRes.rows[0] });
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
    
    // Allowed fields for students table
    const allowedFields = ['full_name', 'student_code', 'class_name', 'major', 'student_status', 'dob', 'gender', 'phone_number', 'address', 'faculty_id'];
    let updateQuery = 'UPDATE students SET ';
    const updateParams = [];
    let i = 1;
    let hasStudentUpdates = false;

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        updateQuery += `${key} = $${i}, `;
        updateParams.push(updates[key]);
        i++;
        hasStudentUpdates = true;
      }
    }

    if (hasStudentUpdates) {
      updateQuery += `updated_at = CURRENT_TIMESTAMP WHERE id = $${i} RETURNING *`;
      updateParams.push(id);
      await db.query(updateQuery, updateParams);
    }
    
    // Allow updating user email or status if needed
    if (updates.email || updates.account_status) {
      const studentRes = await db.query('SELECT user_id FROM students WHERE id = $1', [id]);
      if (studentRes.rows.length > 0) {
        const userId = studentRes.rows[0].user_id;
        if (updates.email) {
          await db.query('UPDATE users SET email = $1 WHERE id = $2', [updates.email, userId]);
        }
        if (updates.account_status) {
          await db.query('UPDATE users SET status = $1 WHERE id = $2', [updates.account_status, userId]);
        }
      }
    }

    res.status(200).json({ success: true, message: 'Student updated successfully' });
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

// --- CLASS MANAGEMENT ---
exports.getClasses = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM courses WHERE 1=1';
    const params = [];
    if (search) {
      query += ` AND (class_code ILIKE $1 OR class_name ILIKE $1)`;
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await db.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.createClass = async (req, res, next) => {
  try {
    const { class_code, class_name, faculty_id, lecturer } = req.body;
    const { rows } = await db.query(
      'INSERT INTO courses (class_code, class_name, faculty_id, lecturer) VALUES ($1, $2, $3, $4) RETURNING *',
      [class_code, class_name, faculty_id, lecturer]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get class info
    const classRes = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
    if (classRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Class not found' });
    
    // Get enrolled students from the enrollments table
    const studentsRes = await db.query(`
      SELECT s.* 
      FROM students s
      JOIN enrollments e ON s.id = e.student_id
      WHERE e.course_id = $1
    `, [id]);
    
    // Get schedules
    const schedulesRes = await db.query('SELECT * FROM class_schedules WHERE course_id = $1', [id]);
    
    // Get documents
    const documentsRes = await db.query('SELECT * FROM documents WHERE class_name = $1', [classRes.rows[0].class_code]);

    res.status(200).json({
      success: true,
      data: {
        ...classRes.rows[0],
        students: studentsRes.rows,
        schedules: schedulesRes.rows,
        documents: documentsRes.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.editClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { class_name, lecturer, faculty_id } = req.body;
    const { rows } = await db.query(
      'UPDATE courses SET class_name = $1, lecturer = $2, faculty_id = $3 WHERE id = $4 RETURNING *',
      [class_name, lecturer, faculty_id, id]
    );
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// --- SCHEDULE MANAGEMENT ---
exports.getSchedules = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT s.*, c.class_name, c.class_code 
      FROM class_schedules s
      JOIN courses c ON s.course_id = c.id
      ORDER BY s.day_of_week, s.start_time
    `);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const { course_id, subject, room, day_of_week, start_time, end_time } = req.body;
    const { rows } = await db.query(
      'INSERT INTO class_schedules (course_id, subject, room, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [course_id, subject, room, day_of_week, start_time, end_time]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.editSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { course_id, subject, room, day_of_week, start_time, end_time } = req.body;
    const { rows } = await db.query(
      'UPDATE class_schedules SET course_id = $1, subject = $2, room = $3, day_of_week = $4, start_time = $5, end_time = $6 WHERE id = $7 RETURNING *',
      [course_id, subject, room, day_of_week, start_time, end_time, id]
    );
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM class_schedules WHERE id = $1', [id]);
    res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- FACULTY MANAGEMENT ---
exports.getFaculties = async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT * FROM faculties ORDER BY name');
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

// --- DOCUMENT MANAGEMENT ---
exports.getDocuments = async (req, res, next) => {
  try {
    const { search, type, class_name } = req.query;
    let query = `
      SELECT d.*, u.email as uploaded_by_email 
      FROM documents d 
      LEFT JOIN users u ON d.uploaded_by = u.id 
      WHERE d.student_id IS NULL
    `;
    const params = [];
    let paramCount = 1;
    
    if (search) {
      query += ` AND d.title ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }
    if (type) {
      query += ` AND d.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }
    if (class_name) {
      query += ` AND d.class_name = $${paramCount}`;
      params.push(class_name);
      paramCount++;
    }
    
    query += ' ORDER BY d.created_at DESC';
    const { rows } = await db.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { title, type, class_name, file_url } = req.body;
    // req.user might be set if authentication middleware sets it
    const uploaded_by = req.user ? req.user.id : null; 
    
    const { rows } = await db.query(
      'INSERT INTO documents (title, type, class_name, file_url, uploaded_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, type, class_name || null, file_url, uploaded_by]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('DELETE FROM documents WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ success: false, message: 'Document not found' });
    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// --- ANNOUNCEMENT MANAGEMENT ---
exports.getAnnouncements = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM announcements';
    const params = [];
    if (search) {
      query += ' WHERE title ILIKE $1';
      params.push(`%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const { rows } = await db.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT * FROM announcements WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, audience, target_id, status } = req.body;
    const { rows } = await db.query(
      'INSERT INTO announcements (title, content, audience, target_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, audience, target_id || null, status || 'published']
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.editAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, audience, target_id, status } = req.body;
    const { rows } = await db.query(
      'UPDATE announcements SET title = $1, content = $2, audience = $3, target_id = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [title, content, audience, target_id || null, status || 'published', id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};

exports.archiveAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      "UPDATE announcements SET status = 'archived', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Announcement not found' });
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};
