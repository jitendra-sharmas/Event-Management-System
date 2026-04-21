const express = require('express');
const db = require('../database/init');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Dashboard stats
router.get('/stats', authenticate, authorize('admin', 'organizer'), (req, res) => {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalEvents = db.prepare('SELECT COUNT(*) as count FROM events').get().count;
    const totalRegistrations = db.prepare("SELECT COUNT(*) as count FROM registrations WHERE status = 'confirmed'").get().count;
    const upcomingEvents = db.prepare("SELECT COUNT(*) as count FROM events WHERE status = 'upcoming'").get().count;

    const categoryStats = db.prepare(`
      SELECT category, COUNT(*) as count FROM events GROUP BY category ORDER BY count DESC
    `).all();

    const recentRegistrations = db.prepare(`
      SELECT r.*, u.full_name, u.email, e.title as event_title
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id
      ORDER BY r.registered_at DESC
      LIMIT 10
    `).all();

    const popularEvents = db.prepare(`
      SELECT e.*, COUNT(r.id) as reg_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id AND r.status = 'confirmed'
      GROUP BY e.id
      ORDER BY reg_count DESC
      LIMIT 5
    `).all();

    res.json({
      totalUsers, totalEvents, totalRegistrations, upcomingEvents,
      categoryStats, recentRegistrations, popularEvents
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get all users (admin only)
router.get('/users', authenticate, authorize('admin'), (req, res) => {
  try {
    const users = db.prepare('SELECT id, full_name, email, role, department, year, phone, avatar_color, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role (admin only)
router.put('/users/:id/role', authenticate, authorize('admin'), (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    db.prepare('DELETE FROM registrations WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM feedback WHERE user_id = ?').run(req.params.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
