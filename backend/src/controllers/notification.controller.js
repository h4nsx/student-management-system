const db = require('../config/db');

exports.getNotifications = async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Optional: mark all as read
    if (id === 'all') {
      await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
      return res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
    
    const { rows } = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.status(200).json({ success: true, message: 'Notification marked as read', data: rows[0] });
  } catch (error) {
    next(error);
  }
};

// Internal utility to create a notification
exports.createNotification = async (user_id, title, message, type) => {
  await db.query(
    'INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)',
    [user_id, title, message, type]
  );
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const { rowCount } = await db.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    next(error);
  }
};
