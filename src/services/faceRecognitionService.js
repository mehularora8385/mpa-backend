const { rekognition, s3 } = require('../config/aws');
const Candidate = require('../models/Candidate');
const Biometric = require('../models/Biometric');
const fs = require('fs');
const path = require('path');

// Create face collection for exam
const createFaceCollection = async (examId) => {
  const collectionId = `${process.env.REKOGNITION_COLLECTION_PREFIX}${examId}`;
  
  try {
    await rekognition.createCollection({
      CollectionId: collectionId
    }).promise();
    
    console.log(`Face collection created: ${collectionId}`);
    return { success: true, collectionId };
  } catch (error) {
    if (error.code === 'ResourceAlreadyExistsException') {
      console.log(`Face collection already exists: ${collectionId}`);
      return { success: true, collectionId, message: 'Collection already exists' };
    }
    throw new Error(`Failed to create face collection: ${error.message}`);
  }
};

// Enroll candidate face
const enrollFace = async (examId, candidateId, imageBuffer, imageFilename) => {
  try {
    // Create collection if not exists
    await createFaceCollection(examId);
    
    const collectionId = `${process.env.REKOGNITION_COLLECTION_PREFIX}${examId}`;
    
    // Upload image to S3
    const s3Key = `faces/enrolled/${examId}/${candidateId}/${Date.now()}_${imageFilename}`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
      ServerSideEncryption: 'AES256'
    };
    
    const s3UploadResult = await s3.upload(uploadParams).promise();
    
    // Index face in Rekognition
    const indexParams = {
      CollectionId: collectionId,
      Image: {
        S3Object: {
          Bucket: process.env.S3_BUCKET_NAME,
          Name: s3Key
        }
      },
      ExternalImageId: candidateId,
      MaxFaces: 1,
      QualityFilter: 'AUTO'
    };
    
    const indexResult = await rekognition.indexFaces(indexParams).promise();
    
    if (indexResult.FaceRecords.length === 0) {
      throw new Error('No face detected in the uploaded image');
    }
    
    const faceId = indexResult.FaceRecords[0].Face.FaceId;
    
    // Update candidate with face enrollment data
    await Candidate.update({
      enrolledFaceImage: s3UploadResult.Location,
      faceId: faceId
    }, {
      where: { id: candidateId }
    });
    
    return {
      success: true,
      message: 'Face enrolled successfully',
      faceId: faceId,
      imageUrl: s3UploadResult.Location,
      confidence: indexResult.FaceRecords[0].Face.Confidence
    };
    
  } catch (error) {
    console.error('Face enrollment error:', error);
    throw new Error(`Face enrollment failed: ${error.message}`);
  }
};

// Verify face using AWS Rekognition
const verifyFace = async (examId, candidateId, liveImageBuffer) => {
  try {
    const candidate = await Candidate.findByPk(candidateId);
    
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    
    if (!candidate.enrolledFaceImage || !candidate.faceId) {
      throw new Error('Candidate face not enrolled. Please enroll face first.');
    }
    
    const collectionId = `${process.env.REKOGNITION_COLLECTION_PREFIX}${examId}`;
    
    // Upload live image to S3 temporarily for comparison
    const tempS3Key = `faces/live/${examId}/${candidateId}/${Date.now()}.jpg`;
    
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: tempS3Key,
      Body: liveImageBuffer,
      ContentType: 'image/jpeg',
      ServerSideEncryption: 'AES256'
    };
    
    await s3.upload(uploadParams).promise();
    
    // Search for face in collection
    const searchParams = {
      CollectionId: collectionId,
      Image: {
        S3Object: {
          Bucket: process.env.S3_BUCKET_NAME,
          Name: tempS3Key
        }
      },
      MaxFaces: 1,
      FaceMatchThreshold: parseFloat(process.env.REKOGNITION_SIMILARITY_THRESHOLD) || 96.5
    };
    
    const searchResult = await rekognition.searchFacesByImage(searchParams).promise();
    
    // Clean up temporary image
    try {
      await s3.deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: tempS3Key
      }).promise();
    } catch (cleanupError) {
      console.error('Failed to cleanup temporary image:', cleanupError);
    }
    
    if (searchResult.FaceMatches.length === 0) {
      return {
        success: false,
        matchPercentage: 0,
        threshold: parseFloat(process.env.REKOGNITION_SIMILARITY_THRESHOLD) || 96.5,
        message: 'No face match found below threshold',
        verified: false
      };
    }
    
    const match = searchResult.FaceMatches[0];
    const matchPercentage = match.Similarity;
    const threshold = parseFloat(process.env.REKOGNITION_SIMILARITY_THRESHOLD) || 96.5;
    const isVerified = matchPercentage >= threshold;
    
    // Store verification result in database
    const biometric = await Biometric.create({
      candidateId,
      examId,
      verificationType: 'face',
      faceMatchPercentage: matchPercentage,
      matchThreshold: threshold,
      isVerified: isVerified,
      faceImageUrl: tempS3Key,
      enrolledFaceImage: candidate.enrolledFaceImage,
      faceId: match.Face.FaceId,
      verificationTimestamp: new Date(),
      metadata: {
        searchResult: {
          matchedFaceId: match.Face.FaceId,
          confidence: match.Face.Confidence
        }
      }
    });
    
    return {
      success: true,
      verified: isVerified,
      matchPercentage: matchPercentage.toFixed(2),
      threshold: threshold,
      message: isVerified ? 'Face verified successfully' : 'Face verification failed - match below threshold',
      biometricId: biometric.id,
      faceDetails: match.Face
    };
    
  } catch (error) {
    console.error('Face verification error:', error);
    throw new Error(`Face verification failed: ${error.message}`);
  }
};

// Delete face from collection
const deleteFace = async (examId, candidateId) => {
  try {
    const candidate = await Candidate.findByPk(candidateId);
    
    if (!candidate || !candidate.faceId) {
      throw new Error('Candidate face not found');
    }
    
    const collectionId = `${process.env.REKOGNITION_COLLECTION_PREFIX}${examId}`;
    
    await rekognition.deleteFaces({
      CollectionId: collectionId,
      FaceIds: [candidate.faceId]
    }).promise();
    
    // Update candidate record
    await Candidate.update({
      faceId: null,
      enrolledFaceImage: null
    }, {
      where: { id: candidateId }
    });
    
    return {
      success: true,
      message: 'Face deleted successfully'
    };
    
  } catch (error) {
    console.error('Delete face error:', error);
    throw new Error(`Failed to delete face: ${error.message}`);
  }
};

// List faces in collection
const listFaces = async (examId) => {
  try {
    const collectionId = `${process.env.REKOGNITION_COLLECTION_PREFIX}${examId}`;
    
    const result = await rekognition.listFaces({
      CollectionId: collectionId,
      MaxResults: 100
    }).promise();
    
    return {
      success: true,
      faces: result.Faces,
      count: result.Faces.length
    };
    
  } catch (error) {
    console.error('List faces error:', error);
    throw new Error(`Failed to list faces: ${error.message}`);
  }
};

module.exports = {
  createFaceCollection,
  enrollFace,
  verifyFace,
  deleteFace,
  listFaces
};