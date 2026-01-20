const syncService = require('../services/syncService');

// Sync pending data from device
exports.syncDeviceData = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { examId } = req.params;
    const syncData = req.body;

    const result = await syncService.syncPendingData(operatorId, examId, syncData);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    next(error);
  }
};

// Get operator sync status
exports.getSyncStatus = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { examId } = req.params;

    const result = await syncService.getOperatorSyncStatus(operatorId, examId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Trigger sync for all operators (admin only)
exports.triggerSyncAll = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const result = await syncService.triggerSyncAll(examId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Retry failed syncs
exports.retryFailedSyncs = async (req, res, next) => {
  try {
    const operatorId = req.user.id;
    const { examId } = req.params;

    const result = await syncService.retryFailedSyncs(operatorId, examId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get exam conflicts (admin only)
exports.getExamConflicts = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const result = await syncService.getExamConflicts(examId);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Resolve conflict
exports.resolveConflict = async (req, res, next) => {
  try {
    const { conflictId } = req.params;
    const resolutionData = req.body;

    const result = await syncService.resolveSyncConflict(conflictId, resolutionData);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get sync statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const result = await syncService.getSyncStatistics(examId, start, end);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Cleanup old sync records (admin only)
exports.cleanup = async (req, res, next) => {
  try {
    const { daysToKeep } = req.query;

    const result = await syncService.cleanupOldSyncRecords(
      parseInt(daysToKeep) || 30
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};