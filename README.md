# MPA Exam Management System - Backend

A comprehensive backend API for managing multi-purpose assessments with biometric verification, face recognition, and secure data handling powered by AWS services.

## 🚀 Features

### Core Features
- ✅ User authentication and authorization
- ✅ Exam and center management
- ✅ Candidate management
- ✅ Attendance tracking
- ✅ Biometric verification
- ✅ Backup and restore functionality

### New AWS-Integrated Features
1. **Admin Live Download Password** - Secure password-protected data downloads
2. **Two-Station Enforcement** - Mandatory attendance before biometric verification
3. **OMR Barcode Validation** - Secure barcode scanning and roll number binding
4. **Face Recognition** - Real-time face matching using AWS Rekognition (96.5% threshold)
5. **Fingerprint Capture** - Secure, encrypted fingerprint storage (capture-only policy)
6. **Slot-Based Data Filtering** - Operators see only their assigned slot data
7. **Real-Time Admin Updates** - WebSocket-based live monitoring
8. **Offline Sync Conflict Handling** - Prevent duplicate records with conflict resolution

## 📋 Prerequisites

- Node.js >= 16.0.0
- PostgreSQL database
- AWS Account with:
  - Amazon S3
  - Amazon DynamoDB
  - Amazon Rekognition
  - (Optional) Amazon SNS

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mpa-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mpa_db
DB_USER=mpa_user
DB_PASSWORD=mpa_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# S3 Configuration
S3_BUCKET_NAME=mpa-exam-system-bucket
S3_REGION=us-east-1

# DynamoDB Configuration
DYNAMODB_TABLE_DOWNLOAD_PASSWORDS=DownloadPasswords
DYNAMODB_TABLE_OMR_RECORDS=OMRRecords

# Rekognition Configuration
REKOGNITION_COLLECTION_PREFIX=exam-collection-
REKOGNITION_SIMILARITY_THRESHOLD=96.5

# WebSocket Configuration
WS_PORT=8080
WS_PATH=/ws

# Download Password Configuration
PASSWORD_EXPIRY_MINUTES=30
PASSWORD_LENGTH=12
```

### 4. Setup Database

```bash
# Run migrations
npm run migrate

# (Optional) Seed database
npm run seed
```

### 5. Setup AWS Services

Follow the [AWS Setup Guide](./AWS_SETUP_GUIDE.md) for detailed instructions.

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on:
- HTTP API: `http://localhost:3000`
- WebSocket: `ws://localhost:8080`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Centers
- `GET /api/centres` - Get all centers
- `GET /api/centres/:id` - Get center by ID
- `POST /api/centres` - Create center
- `PUT /api/centres/:id` - Update center
- `DELETE /api/centres/:id` - Delete center

### Attendance
- `GET /api/attendance` - Get all attendance records
- `GET /api/attendance/:id` - Get attendance by ID
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### Biometric Verification
- `POST /api/biometric/verify` - Verify biometric (requires attendance)
- `POST /api/biometric/reverify` - Re-verify biometric

### Face Recognition (AWS)
- `POST /api/face-recognition/collection/:examId` - Create face collection
- `POST /api/face-recognition/enroll` - Enroll candidate face
- `POST /api/face-recognition/verify` - Verify face
- `DELETE /api/face-recognition/:examId/:candidateId` - Delete face
- `GET /api/face-recognition/list/:examId` - List faces in collection

### Fingerprint Management
- `POST /api/fingerprint/capture` - Capture fingerprint
- `GET /api/fingerprint/status/:candidateId/:examId` - Get fingerprint status
- `DELETE /api/fingerprint/:fingerprintId` - Delete fingerprint (admin)
- `GET /api/fingerprint/list/:examId` - List fingerprints (admin)

### OMR Management
- `POST /api/omr/scan` - Scan OMR barcode
- `POST /api/omr/validate` - Validate OMR against roll number
- `GET /api/omr/barcode/:barcode/:examId` - Get OMR by barcode
- `GET /api/omr/list/:examId` - List OMRs for exam
- `DELETE /api/omr/:barcode/:examId` - Delete OMR (admin)

### Slot Management
- `POST /api/slots` - Create slot (admin)
- `POST /api/slots/assign` - Assign operator to slot (admin)
- `GET /api/slots/operator/:examId` - Get operator's assigned slots
- `GET /api/slots/candidates/:examId` - Filter candidates by slot
- `PATCH /api/slots/:slotId/status` - Update slot status (admin)
- `GET /api/slots/exam/:examId` - Get all slots for exam
- `DELETE /api/slots/assign` - Remove operator from slot (admin)

### Download Password Management
- `POST /api/download-password/generate` - Generate download password (admin)
- `POST /api/download-password/verify` - Verify download password (operator)
- `GET /api/download-password/status/:examId` - Get password status (admin)
- `POST /api/download-password/regenerate` - Regenerate password (admin)

### Sync Management
- `POST /api/sync/upload` - Sync data with conflict detection
- `POST /api/sync/resolve/:conflictId` - Resolve conflict (admin)
- `GET /api/sync/conflicts/:examId` - Get conflicts for exam
- `GET /api/sync/status/:examId` - Get sync status for operator
- `GET /api/sync/all/:examId` - Get all sync statuses (admin)

### Backup
- `POST /api/backup/trigger` - Trigger backup (requires password)

### Logs
- `GET /api/logs` - Get all logs
- `GET /api/logs/:id` - Get log by ID

## 🔐 Security Features

### 1. Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Operator, User)
- Token expiration and refresh

### 2. Data Security
- AES-256 encryption for sensitive data
- Secure password hashing with bcrypt
- Server-side encryption for S3 uploads
- No plain-text password storage

### 3. API Security
- Rate limiting
- IP blocking
- CORS configuration
- Helmet security headers
- Request validation

### 4. Access Control
- Two-station enforcement (attendance → biometric)
- Slot-based data filtering
- Operator-slot assignment
- Role-based endpoint access

## 📊 WebSocket Integration

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');

// Subscribe to exam updates
ws.send(JSON.stringify({
  type: 'subscribe',
  examId: 'exam-uuid-here'
}));

// Handle updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update received:', data);
};
```

### Events

- `connected` - Connection established
- `subscribed` - Successfully subscribed to exam
- `unsubscribed` - Unsubscribed from exam
- `update` - Real-time data update
- `keepalive` - Keep-alive ping (every 30 seconds)

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

## 📈 Monitoring

### Health Check

```bash
GET /api/health
```

Response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-16T10:30:00.000Z",
  "uptime": 3600.123,
  "version": "2.0.0"
}
```

### WebSocket Stats

Connect to WebSocket and send:
```javascript
ws.send(JSON.stringify({ type: 'ping' }));
```

## 🔄 Database Migrations

### Create New Migration

```bash
npx sequelize migration:generate --name migration_name
```

### Run Migrations

```bash
npm run migrate
```

### Undo Last Migration

```bash
npx sequelize db:migrate:undo
```

## 🐳 Docker Support

### Build Docker Image

```bash
docker build -t mpa-backend .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

## 📝 Project Structure

```
mpa-backend/
├── src/
│   ├── config/
│   │   ├── aws.js              # AWS configuration
│   │   ├── database.js         # Database configuration
│   │   └── environment.js      # Environment variables
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── biometricController.js
│   │   ├── downloadPasswordController.js
│   │   ├── faceRecognitionController.js
│   │   ├── fingerprintController.js
│   │   ├── omrController.js
│   │   ├── slotController.js
│   │   └── syncConflictController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── biometricEnforcement.js
│   │   ├── downloadPasswordAuth.js
│   │   ├── rateLimiter.js
│   │   └── slotFilter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Candidate.js
│   │   ├── Attendance.js
│   │   ├── Biometric.js
│   │   ├── DownloadPassword.js
│   │   ├── Fingerprint.js
│   │   ├── Slot.js
│   │   ├── OperatorSlot.js
│   │   └── SyncStatus.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── biometric.js
│   │   ├── downloadPassword.js
│   │   ├── faceRecognition.js
│   │   ├── fingerprint.js
│   │   ├── omr.js
│   │   ├── slot.js
│   │   └── sync.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── attendanceService.js
│   │   ├── biometricService.js
│   │   ├── downloadPasswordService.js
│   │   ├── faceRecognitionService.js
│   │   ├── fingerprintService.js
│   │   ├── omrService.js
│   │   ├── slotService.js
│   │   └── syncConflictService.js
│   ├── websocket/
│   │   └── server.js            # WebSocket server
│   ├── app.js                   # Express app
│   └── server.js                # Server entry point
├── src/database/migrations/
│   ├── 001_create_missing_tables.sql
│   └── 002_add_new_tables_and_columns.js
├── .env                         # Environment variables
├── package.json
├── AWS_IMPLEMENTATION_PLAN.md   # Detailed implementation plan
├── AWS_SETUP_GUIDE.md          # AWS setup instructions
└── README.md                   # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
- Email: support@example.com
- Documentation: Check the `/docs` folder
- Issues: Create an issue in the repository

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- Basic authentication and authorization
- Exam and center management
- Candidate management
- Attendance tracking
- Basic biometric verification

### Phase 2: AWS Integration ✅
- Admin live download password
- Two-station enforcement
- OMR barcode validation
- Face recognition with AWS Rekognition
- Fingerprint capture and storage
- Slot-based data filtering
- Real-time admin updates
- Offline sync conflict handling

### Phase 3: Advanced Features (Planned)
- Multi-factor authentication
- Advanced analytics and reporting
- Mobile app integration
- Video proctoring
- AI-powered fraud detection

## 📚 Additional Documentation

- [AWS Implementation Plan](./AWS_IMPLEMENTATION_PLAN.md) - Detailed technical implementation
- [AWS Setup Guide](./AWS_SETUP_GUIDE.md) - Step-by-step AWS configuration

---

**Version**: 2.0.0  
**Last Updated**: January 2024