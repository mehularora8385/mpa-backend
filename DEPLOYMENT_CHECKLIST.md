# Deployment Checklist - MPA Exam Management System

## Pre-Deployment Checklist

### 1. Environment Setup ✅
- [ ] Node.js 16+ installed
- [ ] PostgreSQL database configured
- [ ] AWS account and services set up
- [ ] Environment variables configured in `.env`
- [ ] All dependencies installed (`npm install`)

### 2. AWS Services Setup ✅
- [ ] S3 bucket created and configured
  - [ ] Bucket name matches `.env` configuration
  - [ ] Server-side encryption enabled
  - [ ] Folder structure created (faces/, fingerprints/, omr/, backups/)
- [ ] DynamoDB tables created
  - [ ] `DownloadPasswords` table with correct schema
  - [ ] `OMRRecords` table with correct schema
  - [ ] TTL configured for expired passwords (optional)
- [ ] Amazon Rekognition access verified
  - [ ] IAM permissions configured
  - [ ] Region matches application configuration
  - [ ] Pricing reviewed and budget alerts set
- [ ] (Optional) SNS topics configured for notifications

### 3. Database Setup ✅
- [ ] PostgreSQL database created
- [ ] Database migrations run (`npm run migrate`)
- [ ] Seed data populated (optional)
- [ ] Database backups configured
- [ ] Connection pool size optimized
- [ ] Indexes verified and optimized

### 4. Security Configuration ✅
- [ ] JWT_SECRET changed from default value
- [ ] Database credentials are secure
- [ ] AWS credentials configured (or IAM roles for production)
- [ ] SSL/TLS enabled for database connections
- [ ] HTTPS enabled for API endpoints
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] IP blocking configured
- [ ] Helmet security headers enabled
- [ ] Request validation middleware active

### 5. AWS Security ✅
- [ ] IAM policies follow least privilege principle
- [ ] MFA enabled for AWS account
- [ ] Access keys rotated regularly
- [ ] CloudTrail enabled for audit logging
- [ ] VPC configured (if using VPC)
- [ ] Security groups configured
- [ ] S3 bucket policies configured
- [ ] DynamoDB point-in-time recovery enabled

## Deployment Steps

### 1. Code Deployment

#### Option A: Direct Deployment
```bash
# Clone repository
git clone <repository-url>
cd mpa-backend

# Install dependencies
npm install --production

# Run migrations
npm run migrate

# Start server
npm start
```

#### Option B: Docker Deployment
```bash
# Build Docker image
docker build -t mpa-backend:latest .

# Run container
docker run -d \
  --name mpa-backend \
  --env-file .env \
  -p 3000:3000 \
  -p 8080:8080 \
  mpa-backend:latest
```

#### Option C: Docker Compose
```bash
# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f
```

### 2. AWS Resources Verification

#### Test S3 Access
```bash
node test-s3.js
```

Expected output:
```
S3 Buckets: [...]
```

#### Test DynamoDB Access
```bash
node test-dynamodb.js
```

Expected output:
```
DynamoDB Connection Successful
```

#### Test Rekognition Access
```bash
node test-rekognition.js
```

Expected output:
```
Rekognition Collections: [...]
```

### 3. Application Testing

#### Health Check
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2024-01-16T10:30:00.000Z",
  "uptime": 3600.123,
  "version": "2.0.0"
}
```

#### WebSocket Connection
```bash
# Use a WebSocket client to connect to ws://localhost:8080/ws
# Send: {"type": "ping"}
# Expect: {"type": "pong", "timestamp": "..."}
```

#### API Endpoints Testing
- [ ] Authentication endpoints working
- [ ] Admin endpoints accessible to admin users
- [ ] Operator endpoints accessible to operator users
- [ ] Download password generation working
- [ ] Face recognition API functional
- [ ] Fingerprint capture working
- [ ] OMR scanning and validation working
- [ ] Slot management functional
- [ ] Sync conflict detection working

### 4. Load Testing

#### Install Artillery
```bash
npm install -g artillery
```

#### Create Test Script (load-test.yml)
```yaml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - flow:
      - post:
          url: "/api/auth/login"
          json:
            username: "test_user"
            password: "test_password"
```

#### Run Load Test
```bash
artillery run load-test.yml
```

Monitor:
- Response times
- Error rates
- CPU and memory usage
- Database connection pool

## Post-Deployment Checklist

### 1. Monitoring Setup ✅
- [ ] Application logs configured and accessible
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Health check endpoint monitoring
- [ ] WebSocket connection monitoring
- [ ] Database query performance monitoring

### 2. Alert Configuration ✅
- [ ] Server down alerts
- [ ] High CPU usage alerts
- [ ] High memory usage alerts
- [ ] Database connection errors alerts
- [ ] API error rate alerts
- [ ] AWS service quota alerts
- [ ] Cost budget alerts

### 3. Backup Strategy ✅
- [ ] Database backups scheduled
- [ ] S3 versioning enabled
- [ ] DynamoDB point-in-time recovery enabled
- [ ] Backup restoration tested
- [ ] Backup retention policy defined

### 4. Scaling Configuration ✅
- [ ] Auto-scaling configured (if using AWS)
- [ ] Load balancer configured
- [ ] Database read replicas (if needed)
- [ ] CDN configured for static assets
- [ ] Caching strategy implemented (Redis)

### 5. Documentation ✅
- [ ] API documentation updated
- [ ] Deployment guide completed
- [ ] Runbook created for common issues
- [ ] Onboarding documentation for team
- [ ] Architecture diagram updated

## Feature-Specific Verification

### 1. Admin Live Download Password ✅
- [ ] Password generation working
- [ ] Password validation working
- [ ] Password expiry working
- [ ] One-time use enforced
- [ ] Backup API requires password

### 2. Two-Station Enforcement ✅
- [ ] Attendance checkpoint active
- [ ] Biometric blocked without attendance
- [ ] Operator assignment enforced
- [ ] Audit trail working

### 3. OMR Barcode Validation ✅
- [ ] Barcode scanning working
- [ ] Duplicate detection working
- [ ] Roll number binding working
- [ ] Validation enforced

### 4. Face Recognition ✅
- [ ] Face enrollment working
- [ ] Face comparison with Rekognition
- [ ] 96.5% threshold enforced
- [ ] Match scores accurate
- [ ] Face images stored in S3

### 5. Fingerprint Capture ✅
- [ ] Fingerprint capture working
- [ ] Images stored in S3 with encryption
- [ ] No matching logic (capture-only)
- [ ] Quality validation working

### 6. Slot-Based Filtering ✅
- [ ] Slot creation working
- [ ] Operator-slot assignment working
- [ ] Data filtering by slot active
- [ ] Cross-slot access blocked

### 7. Real-Time Admin Updates ✅
- [ ] WebSocket server running
- [ ] Admin subscription working
- [ ] Real-time updates pushing
- [ ] 30-second keep-alive working

### 8. Offline Sync Conflict Handling ✅
- [ ] Conflict detection working
- [ ] Unique constraints enforced
- [ ] Conflict resolution working
- [ ] Sync status tracking working

## Performance Optimization

### 1. Database Optimization ✅
- [ ] Indexes created on frequently queried fields
- [ ] Query performance tested
- [ ] Connection pool size optimized
- [ ] Slow query logging enabled
- [ ] Database statistics updated

### 2. API Optimization ✅
- [ ] Response times under 500ms for most endpoints
- [ ] Caching implemented where appropriate
- [ ] Pagination implemented for list endpoints
- [ ] Compression enabled
- [ ] GZIP compression active

### 3. AWS Optimization ✅
- [ ] S3 transfer acceleration enabled (if needed)
- [ ] DynamoDB auto-scaling configured
- [ ] CloudFront CDN configured (if needed)
- [ ] AWS Lambda cold start optimization (if using Lambda)

## Security Audit

### 1. Application Security ✅
- [ ] No hardcoded secrets in code
- [ ] Environment variables secured
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] Output encoding implemented

### 2. AWS Security ✅
- [ ] IAM policies reviewed
- [ ] S3 bucket policies reviewed
- [ ] Security group rules reviewed
- [ ] Encryption at rest verified
- [ ] Encryption in transit verified
- [ ] Access logs enabled

### 3. Network Security ✅
- [ ] Firewall rules configured
- [ ] DDoS protection enabled
- [ ] WAF rules configured (if using AWS WAF)
- [ ] VPN access configured (if needed)

## Disaster Recovery

### 1. Backup Verification ✅
- [ ] Database backup tested
- [ ] S3 backup tested
- [ ] DynamoDB backup tested
- [ ] Restore procedure documented
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

### 2. Failover Testing ✅
- [ ] Database failover tested
- [ ] Application failover tested
- [ ] AWS service failover tested
- [ ] DNS failover tested (if applicable)

## Documentation

### 1. Technical Documentation ✅
- [ ] API documentation complete
- [ ] Architecture diagram updated
- [ ] Database schema documented
- [ ] AWS infrastructure documented
- [ ] Deployment guide complete

### 2. User Documentation ✅
- [ ] Admin user guide
- [ ] Operator user guide
- [ ] FAQ section
- [ ] Troubleshooting guide
- [ ] Video tutorials (optional)

### 3. Maintenance Documentation ✅
- [ ] Maintenance schedule defined
- [ ] Update procedure documented
- [ ] Rollback procedure documented
- [ ] Monitoring guide complete
- [ ] On-call procedures defined

## Final Verification

### 1. Smoke Test ✅
- [ ] All critical endpoints responding
- [ ] Database connections stable
- [ ] WebSocket connections stable
- [ ] AWS services accessible
- [ ] Error handling working

### 2. End-to-End Test ✅
- [ ] Complete user flow tested
- [ ] Admin flow tested
- [ ] Operator flow tested
- [ ] Offline sync tested
- [ ] Real-time updates tested

### 3. Stakeholder Sign-off ✅
- [ ] Development team sign-off
- [ ] QA team sign-off
- [ ] Security team sign-off
- [ ] Operations team sign-off
- [ ] Product owner sign-off

## Go-Live Checklist

### 1. Pre-Launch ✅
- [ ] All team members notified
- [ ] Maintenance window scheduled
- [ ] Rollback plan prepared
- [ ] Monitoring dashboard ready
- [ ] Communication plan prepared

### 2. Launch ✅
- [ ] Database backed up
- [ ] Application deployed
- [ ] Health checks passing
- [ ] Monitoring active
- [ ] Team on standby

### 3. Post-Launch ✅
- [ ] System stability verified
- [ ] Performance metrics reviewed
- [ ] Error logs reviewed
- [ ] User feedback collected
- [ ] Issues documented and prioritized

## Troubleshooting Guide

### Common Issues

#### Issue: Server won't start
**Solution**: 
- Check environment variables
- Verify database connection
- Check port availability
- Review logs for errors

#### Issue: AWS connection errors
**Solution**:
- Verify AWS credentials
- Check region configuration
- Verify IAM permissions
- Check service quotas

#### Issue: Database connection errors
**Solution**:
- Check database credentials
- Verify database is running
- Check network connectivity
- Review connection pool settings

#### Issue: WebSocket connection failures
**Solution**:
- Verify WebSocket port is open
- Check firewall rules
- Review WebSocket server logs
- Test with WebSocket client

## Contact Information

### Support Team
- **Primary Contact**: [Name] - [Email] - [Phone]
- **Secondary Contact**: [Name] - [Email] - [Phone]
- **On-Call Rotation**: [Schedule]

### Emergency Contacts
- **Infrastructure**: [Name] - [Phone]
- **Database**: [Name] - [Phone]
- **AWS**: [Name] - [Phone]

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: 2.0.0  
**Status**: ✅ Ready for Production