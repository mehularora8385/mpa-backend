# AWS Setup Guide for MPA Exam Management System

This guide will help you set up and configure all AWS services required for the MPA exam management system.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (optional)
- Node.js installed on your machine

## AWS Services Overview

The following AWS services will be used:

1. **Amazon S3** - Secure file storage
2. **Amazon DynamoDB** - Fast NoSQL database
3. **Amazon Rekognition** - Face recognition API
4. **Amazon SNS** - Real-time notifications (optional)

---

## 1. Amazon S3 Setup

### Create S3 Bucket

1. Log in to AWS Management Console
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure bucket:
   - **Bucket name**: `mpa-exam-system-bucket` (or your preferred name)
   - **Region**: Select same region as your application (e.g., `us-east-1`)
   - **Block Public Access settings**: Enable (recommended for security)
5. Click **Create bucket**

### Configure Bucket Security

1. Select your bucket
2. Go to **Permissions** tab
3. Scroll to **Server-side encryption settings**
4. Click **Edit**
5. Enable **Default encryption**
6. Select **AES-256** (SSE-S3) or **AWS-KMS**
7. Save changes

### Create Folder Structure (Optional)

Create the following folders in your bucket:
- `faces/enrolled/`
- `faces/live/`
- `fingerprints/`
- `omr/`
- `backups/`

### IAM Permissions

Your AWS credentials need the following S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mpa-exam-system-bucket",
        "arn:aws:s3:::mpa-exam-system-bucket/*"
      ]
    }
  ]
}
```

---

## 2. Amazon DynamoDB Setup

### Create DynamoDB Tables

#### Table 1: DownloadPasswords

1. Navigate to **DynamoDB** service
2. Click **Create table**
3. Configure:
   - **Table name**: `DownloadPasswords`
   - **Partition key**: `passwordId` (String)
   - **Sort key**: `examId` (String)
4. Click **Create**

#### Table 2: OMRRecords

1. Click **Create table**
2. Configure:
   - **Table name**: `OMRRecords`
   - **Partition key**: `barcode` (String)
   - **Sort key**: `examId` (String)
3. Click **Create**

### Configure TTL (Optional)

For automatic cleanup of expired passwords:

1. Select `DownloadPasswords` table
2. Go to **Additional settings** tab
3. Scroll to **TTL**
4. Click **Enable TTL**
5. Set **TTL attribute name**: `expiresAt`
6. Click **Save changes**

### IAM Permissions

Your AWS credentials need the following DynamoDB permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/DownloadPasswords",
        "arn:aws:dynamodb:*:*:table/OMRRecords"
      ]
    }
  ]
}
```

---

## 3. Amazon Rekognition Setup

### Verify Access

1. Navigate to **Amazon Rekognition** service
2. Ensure you have access to the service in your region
3. Review pricing: https://aws.amazon.com/rekognition/pricing/

### IAM Permissions

Your AWS credentials need the following Rekognition permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "rekognition:CreateCollection",
        "rekognition:DeleteCollection",
        "rekognition:IndexFaces",
        "rekognition:SearchFacesByImage",
        "rekognition:CompareFaces",
        "rekognition:DeleteFaces",
        "rekognition:ListFaces"
      ],
      "Resource": "*"
    }
  ]
}
```

### Collection Management

Face collections will be created automatically by the application when needed. Each exam will have its own collection:
- `exam-collection-{examId}`

---

## 4. Environment Configuration

Update your `.env` file with AWS credentials:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# S3 Configuration
S3_BUCKET_NAME=mpa-exam-system-bucket
S3_REGION=us-east-1

# DynamoDB Configuration
DYNAMODB_TABLE_DOWNLOAD_PASSWORDS=DownloadPasswords
DYNAMODB_TABLE_OMR_RECORDS=OMRRecords

# Rekognition Configuration
REKOGNITION_COLLECTION_PREFIX=exam-collection-
REKOGNITION_SIMILARITY_THRESHOLD=96.5

# Download Password Configuration
PASSWORD_EXPIRY_MINUTES=30
PASSWORD_LENGTH=12
```

---

## 5. Testing AWS Integration

### Test S3 Connection

Create a test script `test-s3.js`:

```javascript
const { s3 } = require('./src/config/aws');

s3.listBuckets((err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('S3 Buckets:', data.Buckets);
  }
});
```

Run with: `node test-s3.js`

### Test DynamoDB Connection

Create a test script `test-dynamodb.js`:

```javascript
const { dynamodb } = require('./src/config/aws');

const params = {
  TableName: 'DownloadPasswords',
  Limit: 1
};

dynamodb.scan(params, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('DynamoDB Connection Successful');
  }
});
```

Run with: `node test-dynamodb.js`

### Test Rekognition Connection

Create a test script `test-rekognition.js`:

```javascript
const { rekognition } = require('./src/config/aws');

rekognition.listCollections({}, (err, data) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Rekognition Collections:', data.CollectionIds);
  }
});
```

Run with: `node test-rekognition.js`

---

## 6. Security Best Practices

### 1. Use IAM Roles (Recommended for Production)

Instead of hardcoded credentials, use IAM roles:

```javascript
// For EC2, ECS, or Lambda
const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition({
  region: process.env.AWS_REGION
  // Credentials will be automatically loaded from IAM role
});
```

### 2. Enable MFA for AWS Account

Enable Multi-Factor Authentication for your AWS root account and IAM users.

### 3. Use Least Privilege Principle

Only grant necessary permissions to your AWS credentials.

### 4. Rotate Access Keys Regularly

Rotate your AWS access keys every 90 days.

### 5. Enable CloudTrail

Enable AWS CloudTrail to log all API calls for auditing.

---

## 7. Cost Monitoring

### Set Up Budget Alerts

1. Go to **Billing and Cost Management**
2. Click **Budgets**
3. Create a budget for your AWS services
4. Set up email alerts when costs exceed thresholds

### Monitor Service Usage

- **S3**: Check storage usage and request counts
- **DynamoDB**: Monitor read/write capacity units
- **Rekognition**: Track API call counts

---

## 8. Troubleshooting

### Common Issues

#### Issue: "Access Denied"
**Solution**: Verify IAM permissions and ensure credentials are correct.

#### Issue: "Bucket not found"
**Solution**: Check S3 bucket name in `.env` file matches actual bucket.

#### Issue: "Table not found"
**Solution**: Ensure DynamoDB tables are created with correct names.

#### Issue: "Region mismatch"
**Solution**: Ensure all services are in the same AWS region.

### Enable Debug Logging

Set environment variable for detailed logs:

```bash
NODE_ENV=development
DEBUG=aws-sdk*
```

---

## 9. Production Deployment Checklist

- [ ] Use IAM roles instead of access keys
- [ ] Enable bucket encryption
- [ ] Set up CloudWatch alarms
- [ ] Configure backup and disaster recovery
- [ ] Enable VPC endpoints (if applicable)
- [ ] Set up automated backups for DynamoDB
- [ ] Enable S3 versioning
- [ ] Configure CloudTrail for audit logging
- [ ] Set up cost monitoring and alerts
- [ ] Review and optimize IAM policies
- [ ] Test failover procedures

---

## 10. Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [AWS CLI Guide](https://docs.aws.amazon.com/cli/)
- [AWS SDK for Node.js](https://docs.aws.amazon.com/sdk-for-javascript/)
- [Security Best Practices](https://docs.aws.amazon.com/accounts/latest/reference/best-practices.html)

---

## Support

For issues related to:
- **AWS Services**: Contact AWS Support
- **Application Integration**: Check application logs and documentation
- **IAM Permissions**: Review IAM policies and security groups

---

## Summary

After completing this guide, you should have:

✅ S3 bucket configured for file storage
✅ DynamoDB tables created for password and OMR management
✅ Rekognition access enabled for face recognition
✅ Environment variables configured
✅ IAM permissions set up
✅ Testing completed successfully

Your MPA exam management system is now ready to use AWS services!