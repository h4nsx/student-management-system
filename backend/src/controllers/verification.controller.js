const db = require('../config/db');

exports.verifyQR = async (req, res, next) => {
  try {
    const { qr_code, location, device } = req.body;
    
    if (!qr_code) {
      return res.status(400).json({ success: false, message: 'QR code is required' });
    }
    
    // In real scenario, we might decode or decrypt the QR content.
    // Assuming QR directly contains the student's ID or unique code.
    const { rows } = await db.query(
      'SELECT id, student_code, full_name, student_status FROM students WHERE qr_code = $1',
      [qr_code]
    );
    
    let status_result = 'Invalid QR';
    let studentInfo = null;
    let isValid = false;
    
    if (rows.length > 0) {
      const student = rows[0];
      studentInfo = student;
      
      if (['studying', 'reserved'].includes(student.student_status)) {
        status_result = 'Valid';
        isValid = true;
      } else {
        status_result = `Invalid Status: ${student.student_status}`;
      }
      
      // Log the scan
      await db.query(
        'INSERT INTO scan_logs (student_id, scanned_by, location, device, status_result) VALUES ($1, $2, $3, $4, $5)',
        [student.id, req.user.id, location || 'Unknown', device || req.headers['user-agent'], status_result]
      );
    }
    
    res.status(200).json({
      success: true,
      isValid,
      message: status_result,
      student: studentInfo
    });
  } catch (error) {
    next(error);
  }
};

exports.getScanLogs = async (req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT sl.*, s.student_code, s.full_name, u.email as scanner_email
      FROM scan_logs sl
      LEFT JOIN students s ON sl.student_id = s.id
      LEFT JOIN users u ON sl.scanned_by = u.id
      ORDER BY sl.created_at DESC
      LIMIT 100
    `);
    
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};
