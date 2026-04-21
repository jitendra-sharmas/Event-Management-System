const db = require('./init');
const bcrypt = require('bcryptjs');

function seedDatabase() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  db.exec('DELETE FROM feedback');
  db.exec('DELETE FROM registrations');
  db.exec('DELETE FROM announcements');
  db.exec('DELETE FROM events');
  db.exec('DELETE FROM users');

  // Reset auto-increment
  db.exec("DELETE FROM sqlite_sequence");

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // Insert users
  const insertUser = db.prepare(`
    INSERT INTO users (full_name, email, password, role, department, year, phone, avatar_color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    ['Admin User', 'admin@college.edu', hash('admin123'), 'admin', 'Administration', null, '9876543210', '#FF6B6B'],
    ['Dr. Priya Sharma', 'priya@college.edu', hash('org123'), 'organizer', 'Computer Science', null, '9876543211', '#6C63FF'],
    ['Prof. Rahul Verma', 'rahul@college.edu', hash('org123'), 'organizer', 'Electronics', null, '9876543212', '#00C9A7'],
    ['Arjun Patel', 'arjun@student.edu', hash('student123'), 'student', 'Computer Science', '3rd Year', '9876543213', '#FFC75F'],
    ['Sneha Reddy', 'sneha@student.edu', hash('student123'), 'student', 'Electronics', '2nd Year', '9876543214', '#FF6F91'],
    ['Karthik Nair', 'karthik@student.edu', hash('student123'), 'student', 'Mechanical', '4th Year', '9876543215', '#845EC2'],
    ['Divya Iyer', 'divya@student.edu', hash('student123'), 'student', 'Computer Science', '1st Year', '9876543216', '#D65DB1'],
    ['Rohan Gupta', 'rohan@student.edu', hash('student123'), 'student', 'Civil', '3rd Year', '9876543217', '#FF9671'],
  ];

  users.forEach(u => insertUser.run(...u));

  // Insert events
  const insertEvent = db.prepare(`
    INSERT INTO events (title, description, category, date, time, venue, capacity, image_url, organizer_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const events = [
    ['TechFest 2026', 'Annual technology festival featuring hackathons, coding competitions, robotics challenges, and tech talks from industry leaders. A 3-day extravaganza of innovation and creativity!', 'Technical', '2026-05-15', '09:00', 'Main Auditorium', 500, null, 2, 'upcoming'],
    ['Cultural Night: Rhythms & Colors', 'A mesmerizing evening of dance, music, drama, and art performances showcasing the diverse cultural heritage of our college community.', 'Cultural', '2026-05-01', '18:00', 'Open Air Theatre', 800, null, 3, 'upcoming'],
    ['AI & Machine Learning Workshop', 'Hands-on workshop covering neural networks, deep learning, NLP, and computer vision. Build real projects with TensorFlow and PyTorch!', 'Workshop', '2026-04-28', '10:00', 'CS Lab 301', 60, null, 2, 'upcoming'],
    ['Inter-College Sports Meet', 'Annual sports competition featuring cricket, football, basketball, athletics, and more. Teams from 15+ colleges competing for the championship trophy!', 'Sports', '2026-05-20', '07:00', 'Sports Complex', 1000, null, 3, 'upcoming'],
    ['Startup Pitch Competition', 'Present your startup ideas to a panel of venture capitalists and industry mentors. Top 3 ideas win seed funding and mentorship!', 'Seminar', '2026-05-10', '11:00', 'Business School Hall', 200, null, 2, 'upcoming'],
    ['Photography Exhibition: Campus Chronicles', 'A curated exhibition of the best photographs capturing campus life, nature, architecture, and student moments throughout the year.', 'Cultural', '2026-04-25', '10:00', 'Art Gallery', 150, null, 3, 'upcoming'],
    ['Cybersecurity Bootcamp', 'Intensive 2-day bootcamp on ethical hacking, penetration testing, network security, and digital forensics. CTF challenges included!', 'Workshop', '2026-05-08', '09:00', 'IT Lab 205', 40, null, 2, 'upcoming'],
    ['Annual Alumni Meet 2026', 'Reconnect with fellow alumni, share experiences, and network. Features keynote speeches, panel discussions, and a grand dinner.', 'Seminar', '2026-06-01', '16:00', 'Convention Center', 300, null, 2, 'upcoming'],
    ['Green Campus Drive', 'Join us in planting 1000 trees across the campus! Includes workshops on sustainability, waste management, and eco-friendly practices.', 'Social', '2026-04-22', '08:00', 'Campus Grounds', 250, null, 3, 'upcoming'],
    ['Coding Marathon: 48-Hour Hackathon', 'Non-stop 48-hour coding challenge. Build innovative solutions for real-world problems. Amazing prizes and job opportunities await!', 'Technical', '2026-05-25', '00:00', 'Innovation Hub', 150, null, 2, 'upcoming'],
  ];

  events.forEach(e => insertEvent.run(...e));

  // Insert registrations
  const insertReg = db.prepare(`INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, ?)`);
  [[4,1,'confirmed'],[4,3,'confirmed'],[4,5,'confirmed'],[5,1,'confirmed'],[5,2,'confirmed'],
   [6,4,'confirmed'],[6,1,'confirmed'],[7,3,'confirmed'],[7,2,'confirmed'],[8,4,'confirmed'],
   [8,9,'confirmed'],[5,7,'confirmed'],[6,10,'confirmed'],[7,5,'confirmed']].forEach(r => insertReg.run(...r));

  // Insert announcements
  const insertAnn = db.prepare(`INSERT INTO announcements (title, message, priority, author_id) VALUES (?, ?, ?, ?)`);
  [
    ['TechFest Registration Open!', 'Register now for TechFest 2026! Early bird registrations get exclusive merchandise. Limited slots available.', 'high', 1],
    ['Campus WiFi Upgrade', 'The campus WiFi network will be upgraded this weekend. Expect intermittent connectivity on Saturday.', 'normal', 1],
    ['Exam Schedule Released', 'End semester examination schedule has been released. Check the academic portal for details.', 'urgent', 1],
    ['New Library Hours', 'Starting next week, the central library will be open 24/7 during the exam period. Student ID required for entry after 10 PM.', 'normal', 1],
    ['Internship Fair Next Month', 'Top companies including Google, Microsoft, and Amazon will be visiting campus for the annual internship fair. Prepare your resumes!', 'high', 2],
  ].forEach(a => insertAnn.run(...a));

  // Insert feedback
  const insertFeedback = db.prepare(`INSERT INTO feedback (user_id, event_id, rating, comment) VALUES (?, ?, ?, ?)`);
  [
    [4, 9, 5, 'Amazing initiative! Great to see the college taking sustainability seriously.'],
    [5, 9, 4, 'Well organized event. Would love to see more such drives.'],
    [8, 9, 5, 'Planted my first tree today! Wonderful experience.'],
  ].forEach(f => insertFeedback.run(...f));

  console.log('✅ Database seeded successfully!');
  console.log('   👤 8 users created');
  console.log('   📅 10 events created');
  console.log('   📝 14 registrations created');
  console.log('   📢 5 announcements created');
  console.log('   ⭐ 3 feedback entries created');
  console.log('');
  console.log('   Login Credentials:');
  console.log('   Admin:     admin@college.edu / admin123');
  console.log('   Organizer: priya@college.edu / org123');
  console.log('   Student:   arjun@student.edu / student123');
}

seedDatabase();
