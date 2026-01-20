const SyncStatus = require('../models/SyncStatus');
const Candidate = require('../models/Candidate');
const Attendance = require('../models/Attendance');
const Biometric = require('../models/Biometric');
const syncConflictService = require('./syncConflictService');

/**
 * Sync Service
 * Handles data synchronization between mobile devices and backend
 */

// Sync pending data from mobile device
const syncPendingData = async (operatorId, examId, syncData) => {
  try {
    const { 
      candidates = [], 
      attendance = [], 
      biometrics = [],
      timestamp 
    } = syncData;

    const results = {
      success: true,
      synced: 0,
      conflicts: 0,
      failed: 0,
      details: []
    };

    // Sync candidates
    for (const candidate of candidates) {
      try {
        const conflictResult = await syncConflictService.syncData({
          type: 'candidate',
          operatorId,
          examId,
          data: candidate
        });

        if (conflictResult.conflict) {
          results.conflicts++;
          results.details.push({
            type: 'candidate',
            rollNo: candidate.rollNo,
            status: 'conflict',
            conflictId: conflictResult.conflictId
          });
        } else {
          results.synced++;
          results.details.push({
            type: 'candidate',
            rollNo: candidate.rollNo,
            status: 'synced'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          type: 'candidate',
          rollNo: candidate.rollNo,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Sync attendance
    for (const att of attendance) {
      try {
        const conflictResult = await syncConflictService.syncData({
          type: 'attendance',
          operatorId,
          examId,
          data: att
        });

        if (conflictResult.conflict) {
          results.conflicts++;
          results.details.push({
            type: 'attendance',
            rollNo: att.rollNo,
            status: 'conflict',
            conflictId: conflictResult.conflictId
          });
        } else {
          results.synced++;
          results.details.push({
            type: 'attendance',
            rollNo: att.rollNo,
            status: 'synced'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          type: 'attendance',
          rollNo: att.rollNo,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Sync biometrics
    for (const bio of biometrics) {
      try {
        const conflictResult = await syncConflictService.syncData({
          type: 'biometric',
          operatorId,
          examId,
          data: bio
        });

        if (conflictResult.conflict) {
          results.conflicts++;
          results.details.push({
            type: 'biometric',
            rollNo: bio.rollNo,
            status: 'conflict',
            conflictId: conflictResult.conflictId
          });
        } else {
          results.synced++;
          results.details.push({
            type: 'biometric',
            rollNo: bio.rollNo,
            status: 'synced'
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          type: 'biometric',
          rollNo: bio.rollNo,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update sync status
    await SyncStatus.create({
      operatorId,
      examId,
      syncType: 'device_sync',
      syncStatus: results.conflicts > 0 ? 'partial' : 'success',
      syncedAt: new Date(),
      metadata: {
        synced: results.synced,
        conflicts: results.conflicts,
        failed: results.failed,
        deviceTimestamp: timestamp
      }
    });

    return {
      success: true,
      message: 'Sync completed',
      data: results
    };

  } catch (error) {
    console.error('Sync pending data error:', error);
    
    // Log failed sync
    await SyncStatus.create({
      operatorId,
      examId,
      syncType: 'device_sync',
      syncStatus: 'failed',
      syncedAt: new Date(),
      metadata: {
        error: error.message
      }
    });

    throw new Error(`Sync failed: ${error.message}`);
  }
};

// Get sync status for operator
const getOperatorSyncStatus = async (operatorId, examId) => {
  try {
    const syncStatuses = await SyncStatus.findAll({
      where: {
        operatorId,
        examId
      },
      order: [['syncedAt', 'DESC']],
      limit: 10
    });

    const latestStatus = syncStatuses.length > 0 ? syncStatuses[0] : null;

    // Get pending count
    const pendingCount = await SyncStatus.count({
      where: {
        operatorId,
        examId,
        syncStatus: 'pending'
      }
    });

    return {
      success: true,
      data: {
        latestStatus,
        recentSyncs: syncStatuses,
        pendingCount,
        summary: {
          total: syncStatuses.length,
          successful: syncStatuses.filter(s => s.syncStatus === 'success').length,
          partial: syncStatuses.filter(s => s.syncStatus === 'partial').length,
          failed: syncStatuses.filter(s => s.syncStatus === 'failed').length,
          pending: pendingCount
        }
      }
    };
  } catch (error) {
    console.error('Get sync status error:', error);
    throw new Error(`Failed to get sync status: ${error.message}`);
  }
};

// Trigger sync for all operators
const triggerSyncAll = async (examId) => {
  try {
    // This would typically be called by admin or scheduled job
    // In a real implementation, you might use a message queue
    
    const activeSyncs = await SyncStatus.findAll({
      where: {
        examId,
        syncStatus: 'pending'
      },
      order: [['syncedAt', 'ASC']]
    });

    return {
      success: true,
      message: `Found ${activeSyncs.length} pending syncs`,
      data: {
        pendingCount: activeSyncs.length,
        syncs: activeSyncs.map(s => ({
          id: s.id,
          operatorId: s.operatorId,
          syncType: s.syncType,
          syncedAt: s.syncedAt
        }))
      }
    };
  } catch (error) {
    console.error('Trigger sync all error:', error);
    throw new Error(`Failed to trigger sync: ${error.message}`);
  }
};

// Sync conflict resolution
const resolveSyncConflict = async (conflictId, resolutionData) => {
  try {
    const result = await syncConflictService.resolveConflict(
      conflictId,
      resolutionData
    );

    return {
      success: true,
      message: 'Conflict resolved successfully',
      data: result.conflict
    };
  } catch (error) {
    console.error('Resolve sync conflict error:', error);
    throw new Error(`Failed to resolve conflict: ${error.message}`);
  }
};

// Get all conflicts for exam
const getExamConflicts = async (examId) => {
  try {
    const result = await syncConflictService.getConflicts(examId);

    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('Get exam conflicts error:', error);
    throw new Error(`Failed to get conflicts: ${error.message}`);
  }
};

// Retry failed syncs
const retryFailedSyncs = async (operatorId, examId) => {
  try {
    const failedSyncs = await SyncStatus.findAll({
      where: {
        operatorId,
        examId,
        syncStatus: 'failed'
      },
      order: [['syncedAt', 'ASC']],
      limit: 50
    });

    const results = {
      success: true,
      retried: failedSyncs.length,
      successful: 0,
      failed: 0,
      details: []
    };

    for (const sync of failedSyncs) {
      try {
        // Update status to pending for retry
        await sync.update({
          syncStatus: 'pending',
          retryCount: (sync.retryCount || 0) + 1
        });

        results.successful++;
        results.details.push({
          syncId: sync.id,
          status: 'requeued'
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          syncId: sync.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return {
      success: true,
      message: `Retried ${results.retried} failed syncs`,
      data: results
    };
  } catch (error) {
    console.error('Retry failed syncs error:', error);
    throw new Error(`Failed to retry syncs: ${error.message}`);
  }
};

// Clean up old sync records
const cleanupOldSyncRecords = async (daysToKeep = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await SyncStatus.destroy({
      where: {
        syncStatus: 'success',
        syncedAt: {
          [require('sequelize').Op.lt]: cutoffDate
        }
      }
    });

    return {
      success: true,
      message: `Cleaned up ${deletedCount} old sync records`,
      data: {
        deletedCount,
        cutoffDate: cutoffDate.toISOString()
      }
    };
  } catch (error) {
    console.error('Cleanup old sync records error:', error);
    throw new Error(`Failed to cleanup: ${error.message}`);
  }
};

// Get sync statistics
const getSyncStatistics = async (examId, startDate = null, endDate = null) => {
  try {
    const whereClause = { examId };
    
    if (startDate && endDate) {
      whereClause.syncedAt = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    const syncStatuses = await SyncStatus.findAll({
      where: whereClause
    });

    const statistics = {
      total: syncStatuses.length,
      byStatus: {
        success: 0,
        partial: 0,
        failed: 0,
        pending: 0,
        conflict: 0
      },
      byType: {},
      byOperator: {},
      averageRetryCount: 0,
      totalRetryCount: 0
    };

    syncStatuses.forEach(sync => {
      // By status
      if (statistics.byStatus[sync.syncStatus] !== undefined) {
        statistics.byStatus[sync.syncStatus]++;
      }

      // By type
      if (!statistics.byType[sync.syncType]) {
        statistics.byType[sync.syncType] = 0;
      }
      statistics.byType[sync.syncType]++;

      // By operator
      if (!statistics.byOperator[sync.operatorId]) {
        statistics.byOperator[sync.operatorId] = 0;
      }
      statistics.byOperator[sync.operatorId]++;

      // Retry count
      if (sync.retryCount) {
        statistics.totalRetryCount += sync.retryCount;
      }
    });

    if (syncStatuses.length > 0) {
      statistics.averageRetryCount = statistics.totalRetryCount / syncStatuses.length;
    }

    return {
      success: true,
      data: statistics
    };
  } catch (error) {
    console.error('Get sync statistics error:', error);
    throw new Error(`Failed to get statistics: ${error.message}`);
  }
};

module.exports = {
  syncPendingData,
  getOperatorSyncStatus,
  triggerSyncAll,
  resolveSyncConflict,
  getExamConflicts,
  retryFailedSyncs,
  cleanupOldSyncRecords,
  getSyncStatistics
};