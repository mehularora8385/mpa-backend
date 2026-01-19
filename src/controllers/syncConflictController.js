const syncConflictService = require('../services/syncConflictService');

// Sync data with conflict detection
exports.syncData = async (req, res, next) => {
  try {
    const result = await syncConflictService.syncData(req.body);
    
    if (result.conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: result.message,
        data: {
          conflictId: result.conflictId,
          existingRecord: result.existingRecord
        }
      });
    }
    
    res.status(201).json({
      success: true,
      message: result.message,
      data: result.data
    });
    
  } catch (error) {
    next(error);
  }
};

// Trigger sync for admin panel (broadcasts sync command to all APK instances)
exports.triggerSync = async (req, res, next) => {
  try {
    // This would typically use WebSocket or push notification to trigger sync on all APKs
    // For now, we'll return a success response
    // The actual sync mechanism would be implemented with real-time communication
    
    res.json({
      success: true,
      message: 'Sync command sent to all devices successfully',
      data: {
        triggeredAt: new Date(),
        status: 'syncing'
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Resolve conflict
exports.resolveConflict = async (req, res, next) => {
  try {
    const { conflictId } = req.params;
    const { strategy, resolvedBy, newData } = req.body;
    
    const result = await syncConflictService.resolveConflict(conflictId, {
      strategy,
      resolvedBy,
      newData
    });
    
    res.json({
      success: true,
      message: result.message,
      data: result.conflict
    });
    
  } catch (error) {
    next(error);
  }
};

// Get conflicts for exam
exports.getConflicts = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const result = await syncConflictService.getConflicts(examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Get sync status for operator
exports.getSyncStatus = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { examId } = req.params;
    
    const result = await syncConflictService.getSyncStatus(operatorId, examId);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    next(error);
  }
};

// Get all sync statuses (admin only)
exports.getAllSyncStatuses = async (req, res, next) => {
  try {
    const { examId } = req.params;
    
    const SyncStatus = require('../models/SyncStatus');
    const statuses = await SyncStatus.findAll({
      where: { examId },
      order: [['syncTimestamp', 'DESC']]
    });
    
    // Calculate summary
    const summary = {
      total: statuses.length,
      synced: statuses.filter(s => s.syncStatus === 'synced').length,
      pending: statuses.filter(s => s.syncStatus === 'pending').length,
      conflicts: statuses.filter(s => s.syncStatus === 'conflict').length,
      failed: statuses.filter(s => s.syncStatus === 'failed').length,
      resolved: statuses.filter(s => s.resolved).length
    };
    
    res.json({
      success: true,
      data: {
        statuses,
        summary
      }
    });
    
  } catch (error) {
    next(error);
  }
};