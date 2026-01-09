# MPA Biometric Admin Panel - Backend API

Complete REST API backend for the MPA Biometric Admin Panel with all required endpoints for exam management, candidate data, exports, and more.

## Features

✅ **Authentication**
- User login/logout
- Session management
- JWT token-based authentication
- Logout all sessions

✅ **Exam Management**
- Create, read, update, delete exams
- Exam status management
- Slot allocation
- Mock exam support

✅ **Data Management**
- Centre management
- Operator assignments
- Candidate data handling
- Biometric status tracking

✅ **File Operations**
- Excel file upload for candidate data
- Export to Excel (XLSX)
- Export to CSV
- Batch file processing

✅ **Data Synchronization**
- Real-time data sync
- Dashboard statistics
- Biometric capture status
- Operator activity tracking

✅ **Reporting**
- Biometric status reports
- Centre-wise data reports
- Slot allocation reports
- Operator activity reports
- App data exports

## Installation

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/mehularora8385/mpa-backend.git
cd mpa-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start server
npm start
```

### Development Mode

```bash
npm run dev
```

## API Endpoints

### Authentication

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "Mehul2026",
  "password": "Mehul@7300"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "sessionId": "uuid",
  "user": {
    "id": "admin1",
    "username": "Mehul2026",
    "role": "admin"
  }
}
```

#### Logout
```
POST /api/auth/logout
Content-Type: application/json

{
  "sessionId": "uuid"
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Logout All Sessions
```
POST /api/auth/logout-all

Response:
{
  "success": true,
  "message": "All sessions logged out"
}
```

### Exams

#### Get All Exams
```
GET /api/exams

Response:
{
  "success": true,
  "data": [
    {
      "id": "exam1",
      "name": "Exam A",
      "date": "2025-01-15",
      "slots": 3,
      "candidates": 260,
      "status": "active"
    }
  ]
}
```

#### Create Exam
```
POST /api/exams
Content-Type: application/json

{
  "name": "New Exam",
  "date": "2025-02-15",
  "slots": 3
}

Response:
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "name": "New Exam",
    "date": "2025-02-15",
    "slots": 3,
    "candidates": 0,
    "status": "active",
    "createdAt": "2026-01-09T..."
  }
}
```

#### Update Exam
```
PUT /api/exams/:id
Content-Type: application/json

{
  "name": "Updated Exam",
  "status": "inactive"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

#### Delete Exam
```
DELETE /api/exams/:id

Response:
{
  "success": true,
  "message": "Exam deleted"
}
```

### Slots

#### Get Slots by Exam
```
GET /api/slots/:examId

Response:
{
  "success": true,
  "data": [
    {
      "id": "slot1",
      "examId": "exam1",
      "time": "09:00",
      "capacity": 100
    }
  ]
}
```

### Centres

#### Get All Centres
```
GET /api/centres

Response:
{
  "success": true,
  "data": [
    {
      "id": "c1",
      "code": "C0001",
      "name": "Main Exam Centre",
      "state": "Maharashtra",
      "district": "Mumbai",
      "candidates": 123,
      "operators": 3
    }
  ]
}
```

### Operators

#### Get All Operators
```
GET /api/operators

Response:
{
  "success": true,
  "data": [
    {
      "id": "op1",
      "name": "Operator 1",
      "opId": "OP001",
      "exam": "exam_a",
      "centre": "C0001",
      "status": "active"
    }
  ]
}
```

### Candidates

#### Get All Candidates
```
GET /api/candidates

Response:
{
  "success": true,
  "data": [
    {
      "id": "cand1",
      "omrNo": "11000001",
      "rollNo": "11000001",
      "name": "Candidate 1",
      "fatherName": "Father 1",
      "dob": "1995-05-15",
      "centre": "C0001",
      "uploadPhoto": "✓",
      "verifiedPhoto": "✓",
      "fingerprint": "✓",
      "status": "verified",
      "match": "98.5%"
    }
  ]
}
```

#### Upload Candidate Data
```
POST /api/candidates/upload
Content-Type: multipart/form-data

file: <Excel file>

Response:
{
  "success": true,
  "message": "50 candidates uploaded",
  "data": [ ... ]
}
```

### Data Synchronization

#### Sync All Data
```
GET /api/sync

Response:
{
  "success": true,
  "data": {
    "exams": [ ... ],
    "slots": [ ... ],
    "centres": [ ... ],
    "operators": [ ... ],
    "candidates": [ ... ],
    "timestamp": "2026-01-09T...",
    "totalCandidates": 6,
    "biometricCaptured": 5,
    "operatorsActive": 5,
    "centresOnline": 5
  }
}
```

### Exports

#### Export to Excel
```
GET /api/export/excel/:type

Types: biometric, centre_data, slots, operators

Response: Binary Excel file download
```

#### Export to CSV
```
GET /api/export/csv/:type

Types: biometric, centre_data, slots, operators

Response: Binary CSV file download
```

### Health Check

#### Server Health
```
GET /api/health

Response:
{
  "status": "ok",
  "timestamp": "2026-01-09T...",
  "uptime": 3600
}
```

## Configuration

### Environment Variables

```env
PORT=3000                    # Server port
NODE_ENV=production          # Environment
JWT_SECRET=your-secret-key   # JWT signing key
DB_HOST=localhost            # Database host
DB_PORT=5432                 # Database port
DB_NAME=mpa_biometric        # Database name
DB_USER=postgres             # Database user
DB_PASSWORD=password         # Database password
CORS_ORIGIN=*                # CORS allowed origin
UPLOAD_DIR=./uploads         # Upload directory
MAX_FILE_SIZE=52428800       # Max file size (50MB)
```

## Deployment

### Docker

```bash
docker build -t mpa-backend .
docker run -p 3000:3000 --env-file .env mpa-backend
```

### AWS EC2

```bash
# SSH into instance
ssh -i key.pem ec2-user@instance-ip

# Clone and setup
git clone https://github.com/mehularora8385/mpa-backend.git
cd mpa-backend
npm install
npm start
```

### Heroku

```bash
heroku create mpa-backend
git push heroku main
heroku config:set JWT_SECRET=your-secret-key
```

## Testing

```bash
npm test
```

## API Documentation

Full API documentation available at: `http://localhost:3000/api/docs`

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2026-01-09T..."
}
```

## Security

- JWT token-based authentication
- CORS protection
- Input validation
- File upload restrictions
- Session management
- Password hashing (bcryptjs)

## Performance

- In-memory database (can be replaced with PostgreSQL/MongoDB)
- File streaming for large exports
- Batch processing for uploads
- Request rate limiting ready

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/mehularora8385/mpa-backend/issues
- Email: mehul@example.com

## Version History

### v1.0.0 (2026-01-09)
- Initial release
- All core endpoints implemented
- Authentication system
- File upload/export functionality
- Data synchronization
- Reporting features

---

**Built with ❤️ by Mehul Arora**
