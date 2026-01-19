const SyncStatus = require('../models/SyncStatus');
const Attendance = require('../models/Attendance');
const Biometric = require('../models/Biometric');
const Fingerprint = require('../models/Fingerprint');
const { Op } = require('sequelize');

// Detect conflict before sync
const detectConflict = async (candidateId, examId, entityType, data) => {
  try {
    let existingRecord = null;
    
    // Check for existing record based on entity type
    switch (entityType) {
      case 'attendance':
        existingRecord = await Attendance.findOne({
          where: { candidateId, examId }
        });
        break;
        
      case 'biometric':
        existingRecord = await Biometric.findOne({
          where: { candidateId, examId }
        });
        break;
        
      case 'fingerprint':
        existingRecord = await Fingerprint.findOne({
          where: { candidateId, examId }
        });
        break;
        
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }
    
    if (existingRecord) {
      // Conflict detected
      const conflict = await SyncStatus.create({
        operatorId: data.operatorId,
        examId,
        entityType,
        entityId: existingRecord.id,
        syncStatus: 'conflict',
        syncTimestamp: new Date(),
        conflictDetected: true,
        conflictReason: `Duplicate ${entityType} record detected for candidate ${candidateId}`
      });
      
      return {
        conflict: true,
        conflictId: conflict.id,
        existingRecord: existingRecord,
        message: `Conflict: ${entityType} already exists for this candidate`
      };
    }
    
    return {
      conflict: false,
      message: 'No conflict detected'
    };
    
  } catch (error) {
    console.error('Detect conflict error:', error);
    throw new Error(`Conflict detection failed: ${error.message}`);
  }
};

// Resolve conflict
const resolveConflict = async (conflictId, resolution) => {
  try {
    const conflict = await SyncStatus.findByPk(conflictId);
    
    if (!conflict) {
      throw new Error('Conflict not found');
    }
    
    if (!conflict.conflictDetected) {
      throw new Error('This is not a conflict record');
    }
    
    let resolutionDetails = '';
    
    switch (resolution.strategy) {
      case 'keep_existing':
        // Discard new record, keep existing
        resolutionDetails = `Kept existing ${conflict.entityType} record`;
        break;
        
      case 'use_new':
        // Replace existing with new record
        if (!resolution.newData) {
          throw new Error('New data required for use_new strategy');
        }
        
        // Replace the existing record
        await replaceRecord(conflict.entityType, conflict.entityId, resolution.newData);
        resolutionDetails = `Replaced with new ${conflict.entityType} record`;
        break;
        
      case 'merge':
        // Merge data (entity-specific logic)
        await mergeRecords(conflict.entityType, conflict.entityId, resolution.newData);
        resolutionDetails = `Merged ${conflict.entityType} records`;
        break;
        
      default:
        throw new Error(`Invalid resolution strategy: ${resolution.strategy}`);
    }
    
    // Update conflict status
    await conflict.update({
      resolved: true,
      resolvedAt: new Date(),
      resolvedBy: resolution.resolvedBy,
      resolution: resolutionDetails
    });
    
    return {
      success: true,
      message: 'Conflict resolved successfully',
      conflict: conflict
    };
    
  } catch (error) {
    console.error('Resolve conflict error:', error);
    throw new Error(`Conflict resolution failed: ${error.message}`);
  }
};

// Replace existing record with new data
const replaceRecord = async (entityType, entityId, newData) => {
  try {
    switch (entityType) {
      case 'attendance':
        await Attendance.update(newData, {
          where: { id: entityId }
        });
        break;
        
      case 'biometric':
        await Biometric.update(newData, {
          where: { id: entityId }
        });
        break;
        
      case 'fingerprint':
        await Fingerprint.update(newData, {
          where: { id: entityId }
        });
        break;
        
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('Replace record error:', error);
    throw error;
  }
};

// Merge records (simple implementation)
const mergeRecords = async (entityType, entityId, newData) => {
  try {
    // This would need entity-specific merge logic
    // For now, we'll just update with new data
    return await replaceRecord(entityType, entityId, newData);
    
  } catch (error) {
    console.error('Merge records error:', error);
    throw error;
  }
};

// Sync data with conflict detection
const syncData = async (data) => {
  try {
    const { candidateId, examId, entityType, operatorId } = data;
    
    // Detect conflicts
    const conflictCheck = await detectConflict(candidateId, examId, entityType, data);
    
    if (conflictCheck.conflict) {
      // Return conflict information for manual resolution
      return {
        success: false,
        conflict: true,
        message: 'Conflict detected. Manual resolution required.',
        conflictId: conflictCheck.conflictId,
        existingRecord: conflictCheck.existingRecord
      };
    }
    
    // No conflict, proceed with sync
    let result;
    switch (entityType) {
      case 'attendance':
        result = await Attendance.create(data);
        break;
        
      case 'biometric':
        result = await Biometric.create(data);
        break;
        
      case 'fingerprint':
        result = await Fingerprint.create(data);
        break;
        
      default:
        throw new Error(`Invalid entity type: ${entityType}`);
    }
    
    // Update sync status
    await SyncStatus.create({
      operatorId,
      examId,
      entityType,
      entityId: result.id,
      syncStatus: 'synced',
      syncTimestamp: new Date(),
      conflictDetected: false
    });
    
    return {
      success: true,
      data: result,
      message: 'Data synced successfully'
    };
    
  } catch (error) {
    console.error('Sync data error:', error);
    
    // Log failed sync
    try {
      await SyncStatus.create({
        operatorId: data.operatorId,
        examId: data.examId,
        entityType: data.entityType,
        syncStatus: 'failed',
        conflictReason: error.message
      });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }
    
    throw error;
  }
};

// Get conflicts for exam
const getConflicts = async (examId) => {
  try {
    const conflicts = await SyncStatus.findAll({
      where: {
        examId,
        conflictDetected: true,
        resolved: false
      },
      order: [['syncTimestamp', 'DESC']]
    });
    
    return {
      success: true,
      conflicts: conflicts,
      count: conflicts.length
    };
    
  } catch (error) {
    console.error('Get conflicts error:', error);
    throw new Error(`Failed to get conflicts: ${error.message}`);
  }
};

// Get sync status for operator
const getSyncStatus = async (operatorId, examId) => {
  try {
    const syncStatuses = await SyncStatus.findAll({
      where: {
        operatorId,
        examId
      },
      order: [['syncTimestamp', 'DESC']]
    });
    
    // Summary statistics
    const summary = {
      total: syncStatuses.length,
      synced: syncStatuses.filter(s => s.syncStatus === 'synced').length,
      pending: syncStatuses.filter(s => s.syncStatus === 'pending').length,
      conflicts: syncStatuses.filter(s => s.syncStatus === 'conflict').length,
      failed: syncStatuses.filter(s => s.syncStatus === 'failed').length
    };
    
    return {
      success: true,
      statuses: syncStatuses,
      summary: summary
    };
    
  } catch (error) {
    console.error('Get sync status error:', error);
    throw new Error(`Failed to get sync status: ${error.message}`);
  }
};

module.exports = {
  detectConflict,
  resolveConflict,
  syncData,
  getConflicts,
  getSyncStatus
};