const db = require('../config/db');

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    if (req.user.role === 'student') {
      await db.query(
        'UPDATE students SET avatar_url = $1 WHERE user_id = $2',
        [avatarUrl, req.user.id]
      );
    }
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { url: avatarUrl }
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadClassDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a document file' });
    }
    
    const { class_name, title, type } = req.body;
    
    if (!class_name || !title) {
      return res.status(400).json({ success: false, message: 'Class name and title are required' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    
    const { rows } = await db.query(
      `INSERT INTO documents (class_name, title, type, file_url, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [class_name, title, type || 'class_material', fileUrl, req.user.id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Class document uploaded successfully',
      data: rows[0]
    });
  } catch (error) {
    next(error);
  }
};

exports.getClassDocuments = async (req, res, next) => {
  try {
    const { class_name } = req.query;
    
    let query = 'SELECT d.*, u.email as uploaded_by_email FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE student_id IS NULL';
    const params = [];
    
    if (class_name) {
      query += ' AND d.class_name = $1';
      params.push(class_name);
    }
    
    query += ' ORDER BY d.created_at DESC';
    
    const { rows } = await db.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT d.*, u.email as uploaded_by_email FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = $1',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
};
