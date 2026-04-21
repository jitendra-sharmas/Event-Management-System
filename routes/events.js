const express = require('express');
const db = require('../database/init');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Get all events with optional filters
router.get('/', (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = `
      SELECT e.*, u.full_name as organizer_name, u.department as organizer_dept,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as registered_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      query += ' AND e.category = ?';
      params.push(category);
    }
    if (status && status !== 'all') {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.date ASC, e.time ASC';
    const events = db.prepare(query).all(...params);
    res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get user's registrations (MUST be before /:id to avoid matching "user" as an event ID)
router.get('/user/registrations', authenticate, (req, res) => {
  try {
    const registrations = db.prepare(`
      SELECT r.*, e.title, e.date, e.time, e.venue, e.category, e.status as event_status
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.user_id = ?
      ORDER BY e.date ASC
    `).all(req.user.id);
    res.json(registrations);
  } catch (err) {
    console.error('Get registrations error:', err);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// Get single event
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare(`
      SELECT e.*, u.full_name as organizer_name, u.email as organizer_email, u.department as organizer_dept,
        (SELECT COUNT(*) FROM registrations r WHERE r.event_id = e.id AND r.status = 'confirmed') as registered_count
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.id = ?
    `).get(req.params.id);

    if (!event) return res.status(404).json({ error: 'Event not found' });

    // Get registrations
    const registrations = db.prepare(`
      SELECT r.*, u.full_name, u.email, u.department, u.year
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = ?
    `).all(req.params.id);

    // Get feedback
    const feedback = db.prepare(`
      SELECT f.*, u.full_name, u.avatar_color
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      WHERE f.event_id = ?
      ORDER BY f.created_at DESC
    `).all(req.params.id);

    res.json({ ...event, registrations, feedback });
  } catch (err) {
    console.error('Get event error:', err);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create event (organizer/admin)
router.post('/', authenticate, authorize('organizer', 'admin'), (req, res) => {
  try {
    const { title, description, category, date, time, venue, capacity, image_url } = req.body;

    if (!title || !category || !date || !time || !venue) {
      return res.status(400).json({ error: 'Title, category, date, time, and venue are required' });
    }

    const result = db.prepare(
      'INSERT INTO events (title, description, category, date, time, venue, capacity, image_url, organizer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(title, description, category, date, time, venue, capacity || 100, image_url, req.user.id);

    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(event);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/:id', authenticate, authorize('organizer', 'admin'), (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const { title, description, category, date, time, venue, capacity, image_url, status } = req.body;

    db.prepare(
      'UPDATE events SET title=?, description=?, category=?, date=?, time=?, venue=?, capacity=?, image_url=?, status=? WHERE id=?'
    ).run(
      title || event.title, description || event.description, category || event.category,
      date || event.date, time || event.time, venue || event.venue,
      capacity || event.capacity, image_url || event.image_url, status || event.status,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    db.prepare('DELETE FROM registrations WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM feedback WHERE event_id = ?').run(req.params.id);
    db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);

    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Register for event
router.post('/:id/register', authenticate, (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const count = db.prepare("SELECT COUNT(*) as cnt FROM registrations WHERE event_id = ? AND status = 'confirmed'").get(req.params.id);
    if (count.cnt >= event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    const existing = db.prepare('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?').get(req.user.id, req.params.id);
    if (existing) {
      if (existing.status === 'cancelled') {
        db.prepare("UPDATE registrations SET status = 'confirmed' WHERE id = ?").run(existing.id);
        return res.json({ message: 'Re-registered successfully' });
      }
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    console.error('Register for event error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// Cancel registration
router.delete('/:id/register', authenticate, (req, res) => {
  try {
    const reg = db.prepare('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?').get(req.user.id, req.params.id);
    if (!reg) return res.status(404).json({ error: 'Registration not found' });

    db.prepare("UPDATE registrations SET status = 'cancelled' WHERE id = ?").run(reg.id);
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    console.error('Cancel registration error:', err);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
});

// Submit feedback
router.post('/:id/feedback', authenticate, (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existing = db.prepare('SELECT * FROM feedback WHERE user_id = ? AND event_id = ?').get(req.user.id, req.params.id);
    if (existing) {
      db.prepare('UPDATE feedback SET rating = ?, comment = ? WHERE id = ?').run(rating, comment, existing.id);
      return res.json({ message: 'Feedback updated' });
    }

    db.prepare('INSERT INTO feedback (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)').run(req.user.id, req.params.id, rating, comment);
    res.status(201).json({ message: 'Feedback submitted' });
  } catch (err) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// Note: /user/registrations route has been moved above /:id route to prevent route conflicts

module.exports = router;
