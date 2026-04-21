const express = require('express');
const db = require('../database/init');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all announcements
router.get('/', (req, res) => {
  try {
    const announcements = db.prepare(`
      SELECT a.*, u.full_name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `).all();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Create announcement (admin/organizer)
router.post('/', authenticate, authorize('admin', 'organizer'), (req, res) => {
  try {
    const { title, message, priority } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });

    const result = db.prepare('INSERT INTO announcements (title, message, priority, author_id) VALUES (?, ?, ?, ?)')
      .run(title, message, priority || 'normal', req.user.id);

    const announcement = db.prepare('SELECT a.*, u.full_name as author_name FROM announcements a LEFT JOIN users u ON a.author_id = u.id WHERE a.id = ?')
      .get(result.lastInsertRowid);
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Delete announcement
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

module.exports = router;
