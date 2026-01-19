# AWS Implementation Plan for MPA Exam Management System

## Executive Summary

This document outlines the implementation of 8 critical AWS-based features missing from the current MPA (Multi-Purpose Assessment) exam management system. The implementation will integrate AWS services to enhance security, compliance, and operational efficiency.

## Current System Architecture

**Backend Stack:**
- Node.js with Express framework
- PostgreSQL database with Sequelize ORM
- Basic REST API architecture
- Local file storage

**Current Limitations:**
- No secure download mechanism
- Missing workflow enforcement
- No face recognition integration
- Basic biometric handling
- No real-time monitoring
- Manual sync operations

## Target AWS Architecture

### AWS Services to Integrate:
1. **Amazon S3** - Secure file storage (fingerprints, face images, backups)
2. **Amazon DynamoDB** - Fast data access (download passwords, OMR data)
3. **Amazon Rekognition** - Face recognition and comparison
4. **Amazon SNS** - Real-time notifications
5. **AWS Lambda** - Serverless functions (optional)
6. **AWS KMS** - Key Management Service (encryption keys)

---

## Feature 1: Admin Live Download Password

### Problem Statement
Currently, anyone with login can download full exam data without any additional authentication, creating a security risk.

### Solution Architecture

**AWS Services:**
- DynamoDB for password storage and management
- S3 for encrypted backup storage
- KMS for password encryption

**Implementation Details:**

#### 1. Database Schema (DynamoDB)
```json
{
  "TableName": "DownloadPasswords",
  "KeySchema": [
    {"AttributeName": "passwordId", "KeyType": "HASH"},
    {"AttributeName": "examId", "KeyType": "RANGE"}
  ],
  "Attributes": [
    {"AttributeName": "passwordId", "AttributeType": "S"},
    {"AttributeName": "examId", "AttributeType": "S"},
    {"AttributeName": "hashedPassword", "AttributeType": "S"},
    {"AttributeName": "createdAt", "AttributeType": "S"},
    {"AttributeName": "expiresAt", "AttributeType": "S"},
    {"AttributeName": "used", "AttributeType": "BOOL"},
    {"AttributeName": "usedBy", "AttributeType": "S"},
    {"AttributeName": "usedAt", "AttributeType": "S"}
  ]
}
```

#### 2. API Endpoints

**POST /api/admin/download/password/generate**
```javascript
{
  examId: string,
  expiryMinutes: number (default: 30)
}
```

**POST /api/admin/download/verify**
```javascript
{
  examId: string,
  password: string,
  operatorId: string
}
```

#### 3. Middleware Implementation
```javascript
// middleware/downloadPasswordAuth.js
const verifyDownloadPassword = async (req, res, next) => {
  const { examId, password, operatorId } = req.body;
  
  // Verify password from DynamoDB
  const isValid = await verifyPassword(examId, password);
  
  if (!isValid) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired download password'
    });
  }
  
  // Mark password as used
  await markPasswordUsed(examId, operatorId);
  
  next();
};
```

### Security Features:
- Password hashing with bcrypt
- Time-based expiry (configurable)
- One-time use enforcement
- Audit logging of all download attempts
- IP-based rate limiting

---

## Feature 2: Two-Station Enforcement (Attendance → Biometric)

### Problem Statement
Operators can skip attendance and directly perform biometric verification, violating the required workflow and creating audit failures.

### Solution Architecture

**Implementation Approach:**
- Database constraints
- Middleware validation
- Audit trail enforcement

### Implementation Details:

#### 1. Database Model Updates
```javascript
// models/Attendance.js (updated)
const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: DataTypes.UUID,
  operatorId: DataTypes.UUID,
  examId: DataTypes.UUID,
  centreId: DataTypes.UUID,
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'skipped'),
    defaultValue: 'pending'
  },
  checkpoint: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: DataTypes.DATE,
  biometricEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // ... other fields
});
```

#### 2. Middleware Implementation
```javascript
// middleware/biometricEnforcement.js
const enforceAttendanceFirst = async (req, res, next) => {
  const { candidateId, operatorId } = req.body;
  
  // Check if attendance is completed
  const attendance = await Attendance.findOne({
    where: {
      candidateId,
      status: 'completed',
      biometricEligible: true
    }
  });
  
  if (!attendance) {
    return res.status(403).json({
      success: false,
      error: 'Attendance must be completed before biometric verification',
      code: 'ATTENDANCE_REQUIRED'
    });
  }
  
  // Verify operator is assigned to this candidate
  if (attendance.operatorId !== operatorId) {
    return res.status(403).json({
      success: false,
      error: 'Operator not authorized for this candidate',
      code: 'OPERATOR_MISMATCH'
    });
  }
  
  next();
};
```

#### 3. Workflow Integration
```javascript
// routes/biometric.js
router.post('/verify', 
  authenticateToken,
  enforceAttendanceFirst,  // Critical enforcement
  biometricController.verify
);
```

### Audit Features:
- Attendance-biometric linkage tracking
- Operator-candidate assignment validation
- Workflow step logging
- Violation alerts

---

## Feature 3: OMR Barcode Validation

### Problem Statement
OMR barcodes are not validated or bound to roll numbers, allowing wrong OMR sheets to be linked to incorrect candidates.

### Solution Architecture

**AWS Services:**
- DynamoDB for OMR data storage and fast lookup
- S3 for OMR image storage

### Implementation Details:

#### 1. Database Schema (DynamoDB)
```json
{
  "TableName": "OMRRecords",
  "KeySchema": [
    {"AttributeName": "barcode", "KeyType": "HASH"},
    {"AttributeName": "examId", "KeyType": "RANGE"}
  ],
  "Attributes": [
    {"AttributeName": "barcode", "AttributeType": "S"},
    {"AttributeName": "examId", "AttributeType": "S"},
    {"AttributeName": "rollNumber", "AttributeType": "S"},
    {"AttributeName": "candidateId", "AttributeType": "S"},
    {"AttributeName": "scannedAt", "AttributeType": "S"},
    {"AttributeName": "scannedBy", "AttributeType": "S"},
    {"AttributeName": "validated", "AttributeType": "BOOL"},
    {"AttributeName": "omrImageUrl", "AttributeType": "S"},
    {"AttributeName": "status", "AttributeType": "S"}
  ]
}
```

#### 2. API Endpoints

**POST /api/omr/scan**
```javascript
{
  barcode: string,
  examId: string,
  operatorId: string,
  imageUrl: string (S3 URL)
}
```

**GET /api/omr/validate/:barcode**
```javascript
{
  barcode: string,
  rollNumber: string,
  examId: string
}
```

#### 3. Validation Logic
```javascript
// services/omrService.js
const scanOMR = async (barcode, examId, operatorId, imageUrl) => {
  // Check if barcode already exists
  const existing = await getOMRByBarcode(barcode, examId);
  
  if (existing) {
    throw new Error('Barcode already scanned for this exam');
  }
  
  // Store in DynamoDB
  await storeOMRRecord({
    barcode,
    examId,
    operatorId,
    imageUrl,
    scannedAt: new Date().toISOString(),
    validated: false,
    status: 'scanned'
  });
  
  return { success: true, message: 'OMR scanned successfully' };
};

const validateOMR = async (barcode, rollNumber, examId) => {
  const omr = await getOMRByBarcode(barcode, examId);
  
  if (!omr) {
    throw new Error('OMR record not found');
  }
  
  if (omr.validated) {
    throw new Error('OMR already validated');
  }
  
  // Validate against candidate roll number
  const candidate = await getCandidateByRollNumber(rollNumber, examId);
  
  if (!candidate) {
    throw new Error('Candidate not found for this roll number');
  }
  
  // Bind barcode to candidate
  await updateOMRRecord(barcode, examId, {
    rollNumber,
    candidateId: candidate.id,
    validated: true,
    status: 'validated'
  });
  
  return { success: true, candidate };
};
```

### Validation Features:
- Duplicate barcode prevention
- Barcode-roll number binding
- Candidate verification
- Image storage in S3
- Audit trail

---

## Feature 4: Face Match Percentage (AWS Rekognition)

### Problem Statement
Current face verification shows a fake/static match percentage (96.5%) without actual AI comparison.

### Solution Architecture

**AWS Services:**
- Amazon Rekognition for face recognition
- S3 for face image storage
- DynamoDB for face collection metadata

### Implementation Details:

#### 1. Setup AWS Rekognition
```javascript
// config/aws.js
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

module.exports = { rekognition, s3 };
```

#### 2. Face Collection Management
```javascript
// services/faceCollectionService.js
const createFaceCollection = async (examId) => {
  const params = {
    CollectionId: `exam-${examId}`,
  };
  
  try {
    await rekognition.createCollection(params).promise();
    console.log(`Face collection created for exam ${examId}`);
  } catch (error) {
    if (error.code === 'ResourceAlreadyExistsException') {
      console.log(`Collection already exists for exam ${examId}`);
    } else {
      throw error;
    }
  }
};

const indexFaces = async (examId, candidateId, imageUrl) => {
  const params = {
    CollectionId: `exam-${examId}`,
    Image: {
      S3Object: {
        Bucket: process.env.S3_BUCKET_NAME,
        Name: imageUrl
      }
    },
    ExternalImageId: candidateId,
    MaxFaces: 1,
    QualityFilter: 'AUTO'
  };
  
  const result = await rekognition.indexFaces(params).promise();
  return result;
};
```

#### 3. Face Comparison API
```javascript
// services/faceComparisonService.js
const compareFaces = async (examId, candidateId, liveImageBuffer) => {
  // Get candidate's enrolled face
  const candidate = await getCandidateById(candidateId);
  
  if (!candidate.faceId) {
    throw new Error('Candidate face not enrolled');
  }
  
  // Compare faces
  const params = {
    SourceImage: {
      S3Object: {
        Bucket: process.env.S3_BUCKET_NAME,
        Name: candidate.enrolledFaceImage
      }
    },
    TargetImage: {
      Bytes: liveImageBuffer
    },
    SimilarityThreshold: 80  // Minimum threshold
  };
  
  const result = await rekognition.compareFaces(params).promise();
  
  if (result.FaceMatches.length === 0) {
    return {
      success: false,
      matchPercentage: 0,
      message: 'No face match found'
    };
  }
  
  const matchPercentage = result.FaceMatches[0].Similarity;
  
  // Validate against required threshold (96.5%)
  const isMatch = matchPercentage >= 96.5;
  
  return {
    success: isMatch,
    matchPercentage: matchPercentage.toFixed(2),
    threshold: 96.5,
    message: isMatch ? 'Face verified successfully' : 'Face verification failed',
    faceDetails: result.FaceMatches[0]
  };
};
```

#### 4. API Endpoints

**POST /api/face/enroll**
```javascript
{
  examId: string,
  candidateId: string,
  faceImage: File (multipart/form-data)
}
```

**POST /api/face/verify**
```javascript
{
  examId: string,
  candidateId: string,
  liveFaceImage: File (multipart/form-data)
}
```

### Features:
- Real-time face comparison using AWS Rekognition
- 96.5% match threshold enforcement
- Face collection management per exam
- Secure image storage in S3
- Detailed match confidence scores
- Audit logging

---

## Feature 5: Fingerprint Capture & Storage

### Problem Statement
Fingerprint images should be captured and stored securely without any matching logic (capture-only policy).

### Solution Architecture

**AWS Services:**
- S3 for encrypted fingerprint storage
- KMS for encryption keys

### Implementation Details:

#### 1. Database Model
```javascript
// models/Fingerprint.js
const Fingerprint = sequelize.define('Fingerprint', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  candidateId: DataTypes.UUID,
  examId: DataTypes.UUID,
  operatorId: DataTypes.UUID,
  fingerprintImage: DataTypes.STRING,  // S3 URL
  captureTimestamp: DataTypes.DATE,
  captureDeviceId: DataTypes.STRING,
  imageQuality: DataTypes.FLOAT,
  storageLocation: DataTypes.STRING,  // S3 path
  encrypted: DataTypes.BOOLEAN,
  metadata: DataTypes.JSONB
});
```

#### 2. Fingerprint Capture Service
```javascript
// services/fingerprintService.js
const uploadFingerprint = async (candidateId, examId, operatorId, imageBuffer, metadata) => {
  // Generate unique filename
  const filename = `fingerprints/${examId}/${candidateId}/${Date.now()}.png`;
  
  // Upload to S3 with encryption
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: imageBuffer,
    ContentType: 'image/png',
    ServerSideEncryption: 'AES256',
    Metadata: {
      candidateId,
      examId,
      operatorId,
      captureTimestamp: new Date().toISOString()
    }
  };
  
  const uploadResult = await s3.upload(params).promise();
  
  // Store metadata in database
  const fingerprint = await Fingerprint.create({
    candidateId,
    examId,
    operatorId,
    fingerprintImage: uploadResult.Location,
    captureTimestamp: new Date(),
    storageLocation: filename,
    encrypted: true,
    metadata
  });
  
  return fingerprint;
};

const getFingerprint = async (candidateId, examId) => {
  const fingerprint = await Fingerprint.findOne({
    where: { candidateId, examId }
  });
  
  if (!fingerprint) {
    throw new Error('Fingerprint not found');
  }
  
  // CRITICAL: Return only metadata, no matching logic
  return {
    captured: true,
    captureTimestamp: fingerprint.captureTimestamp,
    imageQuality: fingerprint.imageQuality,
    storageLocation: fingerprint.storageLocation
    // NO matching, comparison, or verification logic
  };
};
```

#### 3. API Endpoints

**POST /api/fingerprint/capture**
```javascript
{
  candidateId: string,
  examId: string,
  operatorId: string,
  fingerprintImage: File,
  metadata: object
}
```

**GET /api/fingerprint/status/:candidateId/:examId**

### Security Features:
- Server-side encryption (AES-256)
- No matching or comparison logic (capture-only)
- Secure S3 storage
- Audit logging of all captures
- Access control enforcement

---

## Feature 6: Slot-Wise Data Filter

### Problem Statement
Operators can access candidates from other shifts/slots, creating data privacy and operational issues.

### Solution Architecture

**Implementation Approach:**
- Slot management system
- Operator-slot assignment
- Query filtering middleware

### Implementation Details:

#### 1. Database Models
```javascript
// models/Slot.js
const Slot = sequelize.define('Slot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: DataTypes.UUID,
  centreId: DataTypes.UUID,
  slotName: DataTypes.STRING,
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
  maxCandidates: DataTypes.INTEGER,
  currentCount: DataTypes.INTEGER,
  status: {
    type: DataTypes.ENUM('scheduled', 'active', 'completed'),
    defaultValue: 'scheduled'
  }
});

// models/OperatorSlot.js (junction table)
const OperatorSlot = sequelize.define('OperatorSlot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  operatorId: DataTypes.UUID,
  slotId: DataTypes.UUID,
  assignedAt: DataTypes.DATE,
  assignedBy: DataTypes.UUID
});

// models/Candidate (updated)
Candidate.belongsTo(Slot, { foreignKey: 'slotId' });
```

#### 2. Slot Filtering Middleware
```javascript
// middleware/slotFilter.js
const filterBySlot = async (req, res, next) => {
  const operatorId = req.user.id;
  const examId = req.params.examId || req.body.examId;
  
  // Get operator's assigned slots
  const operatorSlots = await OperatorSlot.findAll({
    where: { operatorId },
    include: [{
      model: Slot,
      where: { examId, status: 'active' }
    }]
  });
  
  const slotIds = operatorSlots.map(os => os.slotId);
  
  if (slotIds.length === 0) {
    return res.status(403).json({
      success: false,
      error: 'Operator not assigned to any active slots',
      code: 'NO_SLOT_ASSIGNED'
    });
  }
  
  // Attach slot filter to request
  req.slotFilter = { slotId: { [Op.in]: slotIds } };
  
  next();
};
```

#### 3. Updated Candidate Query
```javascript
// services/candidateService.js (updated)
const getCandidatesBySlot = async (filters, slotFilter) => {
  const candidates = await Candidate.findAll({
    where: {
      ...filters,
      ...slotFilter  // Apply slot filter
    },
    include: [
      { model: Slot },
      { model: Attendance }
    ]
  });
  
  return candidates;
};
```

#### 4. API Endpoints

**GET /api/candidates/:examId** (with slot filtering)

**POST /api/slot/assign**
```javascript
{
  operatorId: string,
  slotId: string,
  assignedBy: string
}
```

### Features:
- Strict slot-based data access
- Operator-slot assignment tracking
- Automatic query filtering
- Slot management endpoints
- Access logging

---

## Feature 7: Real-Time Admin Updates

### Problem Statement
Admin dashboard requires manual refresh, causing delayed monitoring and status updates.

### Solution Architecture

**Implementation Approach:**
- WebSocket server for real-time communication
- Event-based data push
- 30-second auto-refresh fallback

### Implementation Details:

#### 1. WebSocket Server Setup
```javascript
// websocket/server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

const adminClients = new Map();

wss.on('connection', (ws, req) => {
  const clientId = generateClientId();
  adminClients.set(clientId, ws);
  
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'subscribe') {
      // Admin subscribes to exam updates
      ws.examSubscription = data.examId;
      console.log(`Client ${clientId} subscribed to exam ${data.examId}`);
    }
  });
  
  ws.on('close', () => {
    adminClients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });
});

// Broadcast function
const broadcastToAdmins = (examId, data) => {
  adminClients.forEach((ws, clientId) => {
    if (ws.examSubscription === examId && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update',
        examId,
        data,
        timestamp: new Date().toISOString()
      }));
    }
  });
};

module.exports = { wss, broadcastToAdmins };
```

#### 2. Event Triggers
```javascript
// services/eventTrigger.js
const { broadcastToAdmins } = require('../websocket/server');

const triggerAttendanceUpdate = async (examId, data) => {
  broadcastToAdmins(examId, {
    event: 'attendance_update',
    data
  });
};

const triggerBiometricUpdate = async (examId, data) => {
  broadcastToAdmins(examId, {
    event: 'biometric_update',
    data
  });
};

const triggerStatusChange = async (examId, data) => {
  broadcastToAdmins(examId, {
    event: 'status_change',
    data
  });
};
```

#### 3. Auto-Refresh Fallback (Polling)
```javascript
// routes/admin.js
router.get('/stats/:examId', async (req, res) => {
  const examId = req.params.examId;
  
  const stats = await getRealTimeStats(examId);
  
  res.json({
    success: true,
    data: stats,
    timestamp: new Date().toISOString(),
    refreshInterval: 30000  // 30 seconds
  });
});
```

#### 4. Integration Points
```javascript
// controllers/attendanceController.js
exports.create = async (req, res, next) => {
  try {
    const attendance = await attendanceService.create(req.body);
    
    // Trigger real-time update
    await triggerAttendanceUpdate(attendance.examId, attendance);
    
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};
```

### Features:
- Real-time WebSocket updates
- Event-based data push
- Admin subscription management
- 30-second polling fallback
- Connection health monitoring
- Automatic reconnection

---

## Feature 8: Offline Sync Conflict Handling

### Problem Statement
Duplicate biometric records can be created when offline data syncs multiple times for the same roll number.

### Solution Architecture

**Implementation Approach:**
- Unique constraints on roll numbers
- Conflict detection and resolution
- Sync status tracking

### Implementation Details:

#### 1. Database Constraints
```javascript
// migrations/add_unique_constraints.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Biometrics', {
      fields: ['candidateId', 'examId'],
      type: 'unique',
      name: 'unique_biometric_per_exam_candidate'
    });
    
    await queryInterface.addConstraint('Attendance', {
      fields: ['candidateId', 'examId'],
      type: 'unique',
      name: 'unique_attendance_per_exam_candidate'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Biometrics', 'unique_biometric_per_exam_candidate');
    await queryInterface.removeConstraint('Attendance', 'unique_attendance_per_exam_candidate');
  }
};
```

#### 2. Sync Status Model
```javascript
// models/SyncStatus.js
const SyncStatus = sequelize.define('SyncStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  operatorId: DataTypes.UUID,
  examId: DataTypes.UUID,
  entityType: DataTypes.STRING,  // 'attendance', 'biometric', 'fingerprint'
  entityId: DataTypes.UUID,
  syncStatus: {
    type: DataTypes.ENUM('pending', 'synced', 'conflict', 'failed'),
    defaultValue: 'pending'
  },
  syncTimestamp: DataTypes.DATE,
  conflictDetected: DataTypes.BOOLEAN,
  conflictReason: DataTypes.TEXT,
  resolved: DataTypes.BOOLEAN,
  resolvedAt: DataTypes.DATE
});
```

#### 3. Conflict Detection Service
```javascript
// services/syncConflictService.js
const detectConflict = async (data) => {
  const { candidateId, examId, entityType } = data;
  
  // Check if record already exists
  const existingRecord = await getExistingRecord(candidateId, examId, entityType);
  
  if (existingRecord) {
    // Conflict detected
    await logSyncConflict({
      candidateId,
      examId,
      entityType,
      conflictReason: 'Duplicate record detected',
      existingRecordId: existingRecord.id
    });
    
    throw new Error('Conflict: Record already exists for this candidate and exam');
  }
  
  return { conflict: false };
};

const resolveConflict = async (conflictId, resolution) => {
  const conflict = await SyncStatus.findByPk(conflictId);
  
  if (!conflict) {
    throw new Error('Conflict not found');
  }
  
  // Apply resolution strategy
  if (resolution === 'keep_existing') {
    // Discard new record
    await conflict.update({
      resolved: true,
      resolvedAt: new Date()
    });
  } else if (resolution === 'use_new') {
    // Replace existing with new
    await replaceRecord(conflict.entityId, resolution.newData);
    await conflict.update({
      resolved: true,
      resolvedAt: new Date()
    });
  }
  
  return conflict;
};
```

#### 4. Sync Service with Conflict Handling
```javascript
// services/syncService.js (enhanced)
const syncData = async (data) => {
  try {
    // Detect conflicts
    const conflictCheck = await detectConflict(data);
    
    if (conflictCheck.conflict) {
      return {
        success: false,
        conflict: true,
        message: 'Conflict detected. Manual resolution required.',
        conflictId: conflictCheck.conflictId
      };
    }
    
    // No conflict, proceed with sync
    const result = await performSync(data);
    
    // Update sync status
    await updateSyncStatus({
      operatorId: data.operatorId,
      examId: data.examId,
      entityType: data.entityType,
      entityId: result.id,
      syncStatus: 'synced',
      syncTimestamp: new Date()
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error) {
    // Log failed sync
    await updateSyncStatus({
      operatorId: data.operatorId,
      examId: data.examId,
      entityType: data.entityType,
      syncStatus: 'failed',
      conflictReason: error.message
    });
    
    throw error;
  }
};
```

#### 5. API Endpoints

**POST /api/sync/upload**
```javascript
{
  operatorId: string,
  examId: string,
  entityType: string,
  data: object
}
```

**GET /api/sync/conflicts/:examId**

**POST /api/sync/resolve/:conflictId**
```javascript
{
  resolution: 'keep_existing' | 'use_new',
  newData: object (if use_new)
}
```

### Features:
- Unique constraint enforcement
- Automatic conflict detection
- Manual conflict resolution
- Sync status tracking
- Audit logging
- Data integrity protection

---

## Implementation Timeline

### Week 1-2: Foundation Setup
- AWS credentials configuration
- S3 bucket creation
- DynamoDB tables setup
- Rekognition configuration
- Basic testing infrastructure

### Week 3-4: Critical Features (Priority 1)
- Feature 1: Admin Live Download Password
- Feature 2: Two-Station Enforcement
- Feature 4: Face Match Percentage

### Week 5-6: Data Security & Validation
- Feature 3: OMR Barcode Validation
- Feature 5: Fingerprint Capture & Storage
- Feature 6: Slot-Wise Data Filter

### Week 7-8: Real-Time & Sync
- Feature 7: Real-Time Admin Updates
- Feature 8: Offline Sync Conflict Handling

### Week 9-10: Testing & Deployment
- Integration testing
- Security audit
- Performance testing
- Documentation
- Deployment to production

---

## Security Considerations

1. **Encryption at Rest**: All sensitive data encrypted with AES-256
2. **Encryption in Transit**: TLS/SSL for all communications
3. **Access Control**: IAM roles and policies
4. **Audit Logging**: All operations logged
5. **Key Management**: AWS KMS for encryption keys
6. **Network Security**: VPC, security groups
7. **Authentication**: JWT tokens with proper expiry
8. **Rate Limiting**: API rate limiting and IP blocking

---

## Cost Estimation

### AWS Services (Monthly Estimate):
- **S3**: $50-100 (storage and requests)
- **DynamoDB**: $100-200 (read/write capacity)
- **Rekognition**: $200-500 (based on usage)
- **SNS**: $10-20 (notifications)
- **KMS**: $20-30 (key management)
- **Data Transfer**: $50-100

**Total Estimated Cost**: $430-950/month

---

## Monitoring & Maintenance

1. **CloudWatch**: Monitor AWS service usage and performance
2. **Error Tracking**: Sentry or similar for error monitoring
3. **Health Checks**: Regular health check endpoints
4. **Log Analysis**: CloudWatch Logs or ELK stack
5. **Backup**: Automated backups of DynamoDB and PostgreSQL
6. **Scaling**: Auto-scaling based on demand

---

## Conclusion

This implementation plan provides a comprehensive roadmap for integrating 8 critical AWS-based features into the MPA exam management system. The solution prioritizes security, compliance, and operational efficiency while maintaining scalability and performance.

The implementation will transform the current system from a basic examination management tool into a robust, secure, and feature-rich platform suitable for high-stakes examinations with strict compliance requirements.