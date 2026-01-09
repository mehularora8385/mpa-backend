# MPA Backend API - Complete Documentation

## Base URL
```
http://localhost:3000
or
https://your-domain.com
```

## Authentication

All endpoints (except login) require Bearer token in header:
```
Authorization: Bearer <token>
```

## Endpoints Summary

### 1. Authentication (3 endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout single session |
| POST | `/api/auth/logout-all` | Logout all sessions |

### 2. Exams (4 endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/exams` | Get all exams |
| POST | `/api/exams` | Create new exam |
| PUT | `/api/exams/:id` | Update exam |
| DELETE | `/api/exams/:id` | Delete exam |

### 3. Slots (1 endpoint)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/slots/:examId` | Get slots for exam |

### 4. Centres (1 endpoint)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/centres` | Get all centres |

### 5. Operators (1 endpoint)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/operators` | Get all operators |

### 6. Candidates (2 endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/candidates` | Get all candidates |
| POST | `/api/candidates/upload` | Upload candidate data |

### 7. Synchronization (1 endpoint)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/sync` | Sync all data |

### 8. Exports (2 endpoints)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/export/excel/:type` | Export to Excel |
| GET | `/api/export/csv/:type` | Export to CSV |

### 9. Health (1 endpoint)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Server health check |

---

## Detailed Endpoint Documentation

### POST /api/auth/login

**Description:** Authenticate user and get JWT token

**Request:**
```json
{
  "username": "Mehul2026",
  "password": "Mehul@7300"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "admin1",
    "username": "Mehul2026",
    "role": "admin"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/logout

**Description:** Logout a specific session

**Request:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /api/auth/logout-all

**Description:** Logout all active sessions

**Response (200):**
```json
{
  "success": true,
  "message": "All sessions logged out"
}
```

---

### GET /api/exams

**Description:** Retrieve all exams

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "exam1",
      "name": "Exam A",
      "date": "2025-01-15",
      "slots": 3,
      "candidates": 260,
      "status": "active",
      "createdAt": "2026-01-09T10:30:00Z"
    },
    {
      "id": "exam2",
      "name": "Exam B",
      "date": "2025-01-20",
      "slots": 3,
      "candidates": 205,
      "status": "inactive",
      "createdAt": "2026-01-09T10:30:00Z"
    }
  ]
}
```

---

### POST /api/exams

**Description:** Create a new exam

**Request:**
```json
{
  "name": "Exam C",
  "date": "2025-02-15",
  "slots": 4
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "exam3",
    "name": "Exam C",
    "date": "2025-02-15",
    "slots": 4,
    "candidates": 0,
    "status": "active",
    "createdAt": "2026-01-09T10:35:00Z"
  }
}
```

---

### PUT /api/exams/:id

**Description:** Update an exam

**Request:**
```json
{
  "name": "Exam A Updated",
  "status": "inactive"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "exam1",
    "name": "Exam A Updated",
    "date": "2025-01-15",
    "slots": 3,
    "candidates": 260,
    "status": "inactive",
    "updatedAt": "2026-01-09T10:40:00Z"
  }
}
```

---

### DELETE /api/exams/:id

**Description:** Delete an exam

**Response (200):**
```json
{
  "success": true,
  "message": "Exam deleted"
}
```

---

### GET /api/slots/:examId

**Description:** Get all slots for an exam

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "slot1",
      "examId": "exam1",
      "time": "09:00",
      "capacity": 100
    },
    {
      "id": "slot2",
      "examId": "exam1",
      "time": "12:00",
      "capacity": 100
    },
    {
      "id": "slot3",
      "examId": "exam1",
      "time": "15:00",
      "capacity": 60
    }
  ]
}
```

---

### GET /api/centres

**Description:** Get all centres

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "c1",
      "code": "C0001",
      "name": "Main Exam 1 Subsidiary",
      "state": "Maharashtra",
      "district": "Mumbai",
      "candidates": 123,
      "operators": 3
    },
    {
      "id": "c2",
      "code": "C0002",
      "name": "Regional Centre Mumbai",
      "state": "Maharashtra",
      "district": "Mumbai",
      "candidates": 140,
      "operators": 4
    }
  ]
}
```

---

### GET /api/operators

**Description:** Get all operators

**Response (200):**
```json
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
    },
    {
      "id": "op2",
      "name": "Operator 2",
      "opId": "OP002",
      "exam": "exam_b",
      "centre": "C0002",
      "status": "inactive"
    }
  ]
}
```

---

### GET /api/candidates

**Description:** Get all candidates

**Response (200):**
```json
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

---

### POST /api/candidates/upload

**Description:** Upload candidate data from Excel file

**Request:**
```
Content-Type: multipart/form-data

file: <Excel file (.xlsx)>
```

**Response (200):**
```json
{
  "success": true,
  "message": "50 candidates uploaded",
  "data": [
    {
      "id": "uuid",
      "omrNo": "11000007",
      "rollNo": "11000007",
      "name": "New Candidate",
      "fatherName": "Father Name",
      "dob": "1995-01-01",
      "centre": "C0001",
      "uploadPhoto": "✓",
      "verifiedPhoto": "-",
      "fingerprint": "-",
      "status": "pending",
      "match": "-"
    }
  ]
}
```

---

### POST /api/sync

**Description:** Synchronize all data from server

**Response (200):**
```json
{
  "success": true,
  "data": {
    "exams": [ ... ],
    "slots": [ ... ],
    "centres": [ ... ],
    "operators": [ ... ],
    "candidates": [ ... ],
    "timestamp": "2026-01-09T10:45:00Z",
    "totalCandidates": 6,
    "biometricCaptured": 5,
    "operatorsActive": 5,
    "centresOnline": 5
  }
}
```

---

### GET /api/export/excel/:type

**Description:** Export data to Excel file

**Types:**
- `biometric` - Biometric status report
- `centre_data` - Centre-wise data
- `slots` - Slot allocation
- `operators` - Operator assignments

**Response:** Binary Excel file (.xlsx)

**Example:**
```
GET /api/export/excel/biometric
```

---

### GET /api/export/csv/:type

**Description:** Export data to CSV file

**Types:** Same as Excel export

**Response:** Binary CSV file (.csv)

**Example:**
```
GET /api/export/csv/centre_data
```

---

### GET /api/health

**Description:** Check server health

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T10:50:00Z",
  "uptime": 3600
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Username and password required"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Exam not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication failed |
| 404 | Not Found - Resource not found |
| 500 | Server Error - Internal error |

---

## Rate Limiting

Currently no rate limiting. Implement in production:
- 100 requests per minute per IP
- 1000 requests per hour per user

---

## Pagination

Not implemented yet. Add to future versions:
```
GET /api/candidates?page=1&limit=20
```

---

## Filtering

Not implemented yet. Add to future versions:
```
GET /api/candidates?status=verified&centre=C0001
```

---

## Sorting

Not implemented yet. Add to future versions:
```
GET /api/candidates?sort=name&order=asc
```

---

## Version

**Current Version:** 1.0.0  
**Last Updated:** 2026-01-09

---

## Support

For API issues and questions:
- GitHub: https://github.com/mehularora8385/mpa-backend
- Email: mehul@example.com
