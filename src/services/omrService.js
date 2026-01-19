const { dynamodb } = require('../config/aws');
const { s3 } = require('../config/aws');
const Candidate = require('../models/Candidate');

// Scan OMR barcode
const scanOMR = async (barcode, examId, operatorId, imageUrl) => {
  try {
    const tableName = process.env.DYNAMODB_TABLE_OMR_RECORDS || 'OMRRecords';
    
    // Check if barcode already exists for this exam
    const existingParams = {
      TableName: tableName,
      Key: {
        barcode: barcode,
        examId: examId
      }
    };
    
    const existing = await dynamodb.get(existingParams).promise();
    
    if (existing.Item) {
      throw new Error('Barcode already scanned for this exam');
    }
    
    // Store OMR record in DynamoDB
    const params = {
      TableName: tableName,
      Item: {
        barcode: barcode,
        examId: examId,
        operatorId: operatorId,
        scannedAt: new Date().toISOString(),
        scannedBy: operatorId,
        validated: false,
        omrImageUrl: imageUrl,
        status: 'scanned'
      }
    };
    
    await dynamodb.put(params).promise();
    
    return {
      success: true,
      message: 'OMR scanned successfully',
      barcode: barcode,
      status: 'scanned'
    };
    
  } catch (error) {
    console.error('OMR scan error:', error);
    throw new Error(`OMR scan failed: ${error.message}`);
  }
};

// Validate OMR barcode against roll number
const validateOMR = async (barcode, rollNumber, examId) => {
  try {
    const tableName = process.env.DYNAMODB_TABLE_OMR_RECORDS || 'OMRRecords';
    
    // Get OMR record
    const params = {
      TableName: tableName,
      Key: {
        barcode: barcode,
        examId: examId
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      throw new Error('OMR record not found for this barcode');
    }
    
    const omr = result.Item;
    
    if (omr.validated) {
      throw new Error('OMR already validated and bound to a candidate');
    }
    
    // Find candidate by roll number
    const candidate = await Candidate.findOne({
      where: {
        rollNo: rollNumber, // Using rollNo from existing schema
        examId: examId
      }
    });
    
    if (!candidate) {
      throw new Error('Candidate not found for this roll number');
    }
    
    // Update OMR record with candidate binding
    const updateParams = {
      TableName: tableName,
      Key: {
        barcode: barcode,
        examId: examId
      },
      UpdateExpression: 'SET rollNumber = :rollNumber, candidateId = :candidateId, validated = :validated, status = :status, validatedAt = :validatedAt',
      ExpressionAttributeValues: {
        ':rollNumber': rollNumber,
        ':candidateId': candidate.id,
        ':validated': true,
        ':status': 'validated',
        ':validatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const updateResult = await dynamodb.update(updateParams).promise();
    
    // Update candidate with OMR barcode
    await Candidate.update({
      omrBarcode: barcode
    }, {
      where: { id: candidate.id }
    });
    
    return {
      success: true,
      message: 'OMR validated and bound to candidate successfully',
      omr: updateResult.Attributes,
      candidate: {
        id: candidate.id,
        rollNo: candidate.rollNo,
        name: candidate.name
      }
    };
    
  } catch (error) {
    console.error('OMR validation error:', error);
    throw new Error(`OMR validation failed: ${error.message}`);
  }
};

// Get OMR record by barcode
const getOMRByBarcode = async (barcode, examId) => {
  try {
    const tableName = process.env.DYNAMODB_TABLE_OMR_RECORDS || 'OMRRecords';
    
    const params = {
      TableName: tableName,
      Key: {
        barcode: barcode,
        examId: examId
      }
    };
    
    const result = await dynamodb.get(params).promise();
    
    if (!result.Item) {
      return null;
    }
    
    return result.Item;
    
  } catch (error) {
    console.error('Get OMR error:', error);
    throw new Error(`Failed to get OMR record: ${error.message}`);
  }
};

// List OMR records for exam
const listOMRs = async (examId) => {
  try {
    const tableName = process.env.DYNAMODB_TABLE_OMR_RECORDS || 'OMRRecords';
    
    const params = {
      TableName: tableName,
      IndexName: 'examId-index', // Requires GSI on examId
      KeyConditionExpression: 'examId = :examId',
      ExpressionAttributeValues: {
        ':examId': examId
      }
    };
    
    const result = await dynamodb.query(params).promise();
    
    return {
      success: true,
      omrs: result.Items,
      count: result.Items.length
    };
    
  } catch (error) {
    console.error('List OMRs error:', error);
    throw new Error(`Failed to list OMR records: ${error.message}`);
  }
};

// Delete OMR record (admin action)
const deleteOMR = async (barcode, examId, adminId) => {
  try {
    const tableName = process.env.DYNAMODB_TABLE_OMR_RECORDS || 'OMRRecords';
    
    const params = {
      TableName: tableName,
      Key: {
        barcode: barcode,
        examId: examId
      }
    };
    
    await dynamodb.delete(params).promise();
    
    // Remove barcode from candidate if bound
    const candidate = await Candidate.findOne({
      where: { omrBarcode: barcode }
    });
    
    if (candidate) {
      await Candidate.update({
        omrBarcode: null
      }, {
        where: { id: candidate.id }
      });
    }
    
    return {
      success: true,
      message: 'OMR record deleted successfully'
    };
    
  } catch (error) {
    console.error('Delete OMR error:', error);
    throw new Error(`Failed to delete OMR record: ${error.message}`);
  }
};

module.exports = {
  scanOMR,
  validateOMR,
  getOMRByBarcode,
  listOMRs,
  deleteOMR
};