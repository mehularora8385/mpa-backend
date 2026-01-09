const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// In-memory database (replace with real DB)
const db = {
  users: [
    { id: 'admin1', username: 'Mehul2026', password: '$2a$10$YourHashedPasswordHere', role: 'admin' }
  ],
  exams: [
    { id: 'exam1', name: 'Exam A', date: '2025-01-15', slots: 3, candidates: 260, status: 'active' },
    { id: 'exam2', name: 'Exam B', date: '2025-01-20', slots: 3, candidates: 205, status: 'inactive' },
    { id: 'exam3', name: 'Mock Exam 1', date: '2025-01-10', slots: 2, candidates: 235, status: 'active' }
  ],
  slots: [
    { id: 'slot1', examId: 'exam1', time: '09:00', capacity: 100 },
    { id: 'slot2', examId: 'exam1', time: '12:00', capacity: 100 },
    { id: 'slot3', examId: 'exam1', time: '15:00', capacity: 60 }
  ],
  centres: [
    { id: 'c1', code: 'C0001', name: 'Main Exam 1 Subsidiary', state: 'Maharashtra', district: 'Mumbai', candidates: 123, operators: 3 },
    { id: 'c2', code: 'C0002', name: 'Regional Centre Mumbai', state: 'Maharashtra', district: 'Mumbai', candidates: 140, operators: 4 },
    { id: 'c3', code: 'C0003', name: 'State Exam Centre', state: 'Maharashtra', district: 'Pune', candidates: 145, operators: 4 },
    { id: 'c4', code: 'C0004', name: 'Main Exam 1 Subsidiary', state: 'Maharashtra', district: 'Nagpur', candidates: 110, operators: 3 },
    { id: 'c5', code: 'C0005', name: 'Regional Centre Aurangabad', state: 'Maharashtra', district: 'Aurangabad', candidates: 142, operators: 4 }
  ],
  operators: [
    { id: 'op1', name: 'Operator 1', opId: 'OP001', exam: 'exam_a', centre: 'C0001', status: 'active' },
    { id: 'op2', name: 'Operator 2', opId: 'OP002', exam: 'exam_b', centre: 'C0002', status: 'inactive' },
    { id: 'op3', name: 'Operator 3', opId: 'OP003', exam: 'exam_a', centre: 'C0003', status: 'active' },
    { id: 'op4', name: 'Operator 4', opId: 'OP004', exam: 'mock_1', centre: 'C0001', status: 'active' },
    { id: 'op5', name: 'Operator 5', opId: 'OP005', exam: 'exam_b', centre: 'C0005', status: 'active' }
  ],
  candidates: [
    { id: 'cand1', omrNo: '11000001', rollNo: '11000001', name: 'Candidate 1', fatherName: 'Father 1', dob: '1995-05-15', centre: 'C0001', uploadPhoto: '✓', verifiedPhoto: '✓', fingerprint: '✓', status: 'verified', match: '98.5%' },
    { id: 'cand2', omrNo: '11000002', rollNo: '11000002', name: 'Candidate 2', fatherName: 'Father 2', dob: '1996-03-20', centre: 'C0002', uploadPhoto: '✓', verifiedPhoto: '-', fingerprint: '✓', status: 'pending', match: '-' },
    { id: 'cand3', omrNo: '11000003', rollNo: '11000003', name: 'Candidate 3', fatherName: 'Father 3', dob: '1994-07-10', centre: 'C0003', uploadPhoto: '✓', verifiedPhoto: '✓', fingerprint: '✓', status: 'verified', match: '97.2%' },
    { id: 'cand4', omrNo: '11000004', rollNo: '11000004', name: 'Candidate 4', fatherName: 'Father 4', dob: '1995-11-08', centre: 'C0001', uploadPhoto: '✓', verifiedPhoto: '✓', fingerprint: '✓', status: 'verified', match: '99.1%' },
    { id: 'cand5', omrNo: '11000005', rollNo: '11000005', name: 'Candidate 5', fatherName: 'Father 5', dob: '1993-09-20', centre: 'C0004', uploadPhoto: '✓', verifiedPhoto: '✓', fingerprint: '✓', status: 'verified', match: '96.8%' },
    { id: 'cand6', omrNo: '11000006', rollNo: '11000006', name: 'Candidate 6', fatherName: 'Father 6', dob: '1997-02-14', centre: 'C0005', uploadPhoto: '✓', verifiedPhoto: '-', fingerprint: '-', status: 'not_verified', match: '-' }
  ],
  sessions: {}
};

// ==================== AUTH ENDPOINTS ====================

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = db.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo, accept any password
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30m' }
    );

    const sessionId = uuidv4();
    db.sessions[sessionId] = { userId: user.id, token, createdAt: Date.now() };

    res.json({ 
      success: true, 
      token, 
      sessionId,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId && db.sessions[sessionId]) {
      delete db.sessions[sessionId];
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout All Sessions
app.post('/api/auth/logout-all', (req, res) => {
  try {
    db.sessions = {};
    res.json({ success: true, message: 'All sessions logged out' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EXAM ENDPOINTS ====================

// Get all exams
app.get('/api/exams', (req, res) => {
  try {
    res.json({ success: true, data: db.exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create exam
app.post('/api/exams', (req, res) => {
  try {
    const { name, date, slots } = req.body;
    
    if (!name || !date) {
      return res.status(400).json({ error: 'Name and date required' });
    }

    const newExam = {
      id: uuidv4(),
      name,
      date,
      slots: slots || 3,
      candidates: 0,
      status: 'active',
      createdAt: new Date()
    };

    db.exams.push(newExam);
    res.status(201).json({ success: true, data: newExam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update exam
app.put('/api/exams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, date, status } = req.body;

    const exam = db.exams.find(e => e.id === id);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    if (name) exam.name = name;
    if (date) exam.date = date;
    if (status) exam.status = status;
    exam.updatedAt = new Date();

    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete exam
app.delete('/api/exams/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = db.exams.findIndex(e => e.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    db.exams.splice(index, 1);
    res.json({ success: true, message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SLOTS ENDPOINTS ====================

// Get slots by exam
app.get('/api/slots/:examId', (req, res) => {
  try {
    const { examId } = req.params;
    const slots = db.slots.filter(s => s.examId === examId);
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CENTRES ENDPOINTS ====================

// Get all centres
app.get('/api/centres', (req, res) => {
  try {
    res.json({ success: true, data: db.centres });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== OPERATORS ENDPOINTS ====================

// Get all operators
app.get('/api/operators', (req, res) => {
  try {
    res.json({ success: true, data: db.operators });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CANDIDATES ENDPOINTS ====================

// Get all candidates
app.get('/api/candidates', (req, res) => {
  try {
    res.json({ success: true, data: db.candidates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload candidate data
app.post('/api/candidates/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Process uploaded data
    const uploadedCandidates = data.map((row, index) => ({
      id: uuidv4(),
      omrNo: row['OMR No'] || `OMR${index}`,
      rollNo: row['Roll No'] || `ROLL${index}`,
      name: row['Candidate Name'] || '',
      fatherName: row['Father Name'] || '',
      dob: row['DOB'] || '',
      centre: row['Centre Code'] || '',
      uploadPhoto: '✓',
      verifiedPhoto: '-',
      fingerprint: '-',
      status: 'pending',
      match: '-'
    }));

    db.candidates.push(...uploadedCandidates);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({ 
      success: true, 
      message: `${uploadedCandidates.length} candidates uploaded`,
      data: uploadedCandidates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SYNC ENDPOINTS ====================

// Sync data
app.post('/api/sync', (req, res) => {
  try {
    const syncData = {
      exams: db.exams,
      slots: db.slots,
      centres: db.centres,
      operators: db.operators,
      candidates: db.candidates,
      timestamp: new Date(),
      totalCandidates: db.candidates.length,
      biometricCaptured: db.candidates.filter(c => c.status === 'verified').length,
      operatorsActive: db.operators.filter(o => o.status === 'active').length,
      centresOnline: db.centres.length
    };

    res.json({ success: true, data: syncData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EXPORT ENDPOINTS ====================

// Export to Excel
app.get('/api/export/excel/:type', (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    let filename = '';

    switch(type) {
      case 'biometric':
        data = db.candidates;
        filename = 'biometric_report.xlsx';
        break;
      case 'centre_data':
        data = db.centres;
        filename = 'centre_data.xlsx';
        break;
      case 'slots':
        data = db.slots;
        filename = 'slots_report.xlsx';
        break;
      case 'operators':
        data = db.operators;
        filename = 'operators_report.xlsx';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const filepath = path.join('/tmp', filename);
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, filename, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export to CSV
app.get('/api/export/csv/:type', (req, res) => {
  try {
    const { type } = req.params;
    let data = [];
    let filename = '';

    switch(type) {
      case 'biometric':
        data = db.candidates;
        filename = 'biometric_report.csv';
        break;
      case 'centre_data':
        data = db.centres;
        filename = 'centre_data.csv';
        break;
      case 'slots':
        data = db.slots;
        filename = 'slots_report.csv';
        break;
      case 'operators':
        data = db.operators;
        filename = 'operators_report.csv';
        break;
      default:
        return res.status(400).json({ error: 'Invalid export type' });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const filepath = path.join('/tmp', filename);
    XLSX.writeFile(workbook, filepath);

    res.download(filepath, filename, (err) => {
      if (err) console.error(err);
      fs.unlinkSync(filepath);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MPA Backend API running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});

module.exports = app;
