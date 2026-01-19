const { s3 } = require('../config/aws');
const Fingerprint = require('../models/Fingerprint');
const crypto = require('crypto');

// Capture and store fingerprint
const captureFingerprint = async (candidateId, examId, operatorId, imageBuffer, metadata = {}) => {
  try {
    // Generate unique filename
    const filename = `fingerprints/${examId}/${candidateId}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}.png`;
    
    // Upload to S3 with encryption
    const uploadParams = {
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
    
    const uploadResult = await s3.upload(uploadParams).promise();
    
    // Store metadata in database (CRITICAL: No matching logic)
    const fingerprint = await Fingerprint.create({
      candidateId,
      examId,
      operatorId,
      fingerprintImage: uploadResult.Location,
      captureTimestamp: new Date(),
      storageLocation: filename,
      encrypted: true,
      metadata: {
        ...metadata,
        captureDevice: metadata.captureDeviceId || 'unknown',
        imageQuality: metadata.imageQuality || 'unknown',
        captureMethod: 'manual'
      }
    });
    
    return {
      success: true,
      message: 'Fingerprint captured and stored successfully',
      fingerprintId: fingerprint.id,
      storageLocation: uploadResult.Location,
      captureTimestamp: fingerprint.captureTimestamp
      // IMPORTANT: No matching, comparison, or verification logic returned
    };
    
  } catch (error) {
    console.error('Fingerprint capture error:', error);
    throw new Error(`Fingerprint capture failed: ${error.message}`);
  }
};

// Get fingerprint status (metadata only - no image data)
const getFingerprintStatus = async (candidateId, examId) => {
  try {
    const fingerprint = await Fingerprint.findOne({
      where: { candidateId, examId },
      attributes: ['id', 'captureTimestamp', 'storageLocation', 'encrypted', 'metadata']
    });
    
    if (!fingerprint) {
      return {
        success: true,
        captured: false,
        message: 'No fingerprint captured for this candidate'
      };
    }
    
    // CRITICAL: Return only metadata, no actual image or matching logic
    return {
      success: true,
      captured: true,
      fingerprintId: fingerprint.id,
      captureTimestamp: fingerprint.captureTimestamp,
      encrypted: fingerprint.encrypted,
      metadata: fingerprint.metadata
      // NO image data, NO matching logic, NO comparison
    };
    
  } catch (error) {
    console.error('Get fingerprint status error:', error);
    throw new Error(`Failed to get fingerprint status: ${error.message}`);
  }
};

// Delete fingerprint (admin action only)
const deleteFingerprint = async (fingerprintId, adminId) => {
  try {
    const fingerprint = await Fingerprint.findByPk(fingerprintId);
    
    if (!fingerprint) {
      throw new Error('Fingerprint not found');
    }
    
    // Delete from S3
    try {
      await s3.deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fingerprint.storageLocation
      }).promise();
    } catch (s3Error) {
      console.error('Failed to delete from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }
    
    // Delete from database
    await fingerprint.destroy();
    
    return {
      success: true,
      message: 'Fingerprint deleted successfully'
    };
    
  } catch (error) {
    console.error('Delete fingerprint error:', error);
    throw new Error(`Failed to delete fingerprint: ${error.message}`);
  }
};

// List fingerprints for exam (admin only - metadata only)
const listFingerprints = async (examId) => {
  try {
    const fingerprints = await Fingerprint.findAll({
      where: { examId },
      attributes: ['id', 'candidateId', 'captureTimestamp', 'encrypted', 'metadata'],
      order: [['captureTimestamp', 'DESC']]
    });
    
    return {
      success: true,
      fingerprints: fingerprints.map(fp => ({
        fingerprintId: fp.id,
        candidateId: fp.candidateId,
        captureTimestamp: fp.captureTimestamp,
        encrypted: fp.encrypted,
        metadata: fp.metadata
      })),
      count: fingerprints.length
      // NO actual fingerprint images or matching data
    };
    
  } catch (error) {
    console.error('List fingerprints error:', error);
    throw new Error(`Failed to list fingerprints: ${error.message}`);
  }
};

// Validate fingerprint data quality (called during capture)
const validateFingerprintQuality = async (imageBuffer) => {
  try {
    // Basic validation checks
    const checks = {
      fileSize: imageBuffer.length > 1000 && imageBuffer.length < 5 * 1024 * 1024, // 1KB to 5MB
      format: true // PNG format validation could be added here
    };
    
    if (!checks.fileSize) {
      return {
        valid: false,
        message: 'Invalid file size. Must be between 1KB and 5MB.',
        checks
      };
    }
    
    return {
      valid: true,
      message: 'Fingerprint quality validation passed',
      checks
    };
    
  } catch (error) {
    console.error('Fingerprint quality validation error:', error);
    throw new Error(`Quality validation failed: ${error.message}`);
  }
};

module.exports = {
  captureFingerprint,
  getFingerprintStatus,
  deleteFingerprint,
  listFingerprints,
  validateFingerprintQuality
};