const Candidate = require('../models/Candidate');
const Operator = require('../models/Operator');
const db = require('../config/database');

/**
 * Get all centres
 */
exports.getAllCentres = async (req, res) => {
    try {
        const { examId } = req.query;

        const where = {};
        if (examId) where.examId = examId;

        // Get unique centres from candidates
        const centres = await Candidate.findAll({
            where,
            attributes: [
                [db.fn('DISTINCT', db.col('centreCode')), 'code'],
                'centreCode'
            ],
            group: ['centreCode'],
            raw: true
        });

        // Get statistics for each centre
        const centresWithStats = await Promise.all(centres.map(async (centre) => {
            const stats = await this.getCentreStats(centre.centreCode, examId);
            return {
                id: centre.centreCode,
                code: centre.centreCode,
                name: `Centre ${centre.centreCode}`,
                ...stats
            };
        }));

        res.json({
            success: true,
            data: centresWithStats
        });
    } catch (error) {
        console.error('Get centres error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch centres',
            message: error.message
        });
    }
};

/**
 * Get centre by ID
 */
exports.getCentreById = async (req, res) => {
    try {
        const { id } = req.params;
        const { examId } = req.query;

        const stats = await this.getCentreStats(id, examId);

        res.json({
            success: true,
            data: {
                id,
                code: id,
                name: `Centre ${id}`,
                ...stats
            }
        });
    } catch (error) {
        console.error('Get centre error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch centre',
            message: error.message
        });
    }
};

/**
 * Get centre statistics
 */
exports.getCentreStats = async (centreCode, examId = null) => {
    const where = { centreCode };
    if (examId) where.examId = examId;

    const totalCandidates = await Candidate.count({ where });
    const attendanceMarked = await Candidate.count({ where: { ...where, present: true } });
    const biometricCompleted = await Candidate.count({ where: { ...where, verified: true } });
    
    const operatorWhere = { centreCode, status: 'active' };
    if (examId) operatorWhere.examId = examId;
    const activeOperators = await Operator.count({ where: operatorWhere });

    return {
        totalCandidates,
        attendanceMarked,
        biometricCompleted,
        activeOperators,
        capacity: totalCandidates,
        registered: totalCandidates,
        completed: biometricCompleted,
        inProgress: attendanceMarked - biometricCompleted,
        status: biometricCompleted === totalCandidates ? 'Completed' : 'In Progress'
    };
};

/**
 * Get centre candidates
 */
exports.getCentreCandidates = async (req, res) => {
    try {
        const { id } = req.params;
        const { examId } = req.query;

        const where = { centreCode: id };
        if (examId) where.examId = examId;

        const candidates = await Candidate.findAll({
            where,
            order: [['rollNo', 'ASC']]
        });

        res.json({
            success: true,
            data: candidates
        });
    } catch (error) {
        console.error('Get centre candidates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch candidates',
            message: error.message
        });
    }
};

/**
 * Get centre operators
 */
exports.getCentreOperators = async (req, res) => {
    try {
        const { id } = req.params;
        const { examId } = req.query;

        const where = { centreCode: id };
        if (examId) where.examId = examId;

        const operators = await Operator.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: operators
        });
    } catch (error) {
        console.error('Get centre operators error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch operators',
            message: error.message
        });
    }
};

/**
 * Get centre statistics endpoint
 */
exports.getCentreStatsEndpoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { examId } = req.query;

        const stats = await this.getCentreStats(id, examId);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get centre stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch centre statistics',
            message: error.message
        });
    }
};

/**
 * Check centre capacity
 */
exports.checkCapacity = async (req, res) => {
    try {
        const { centreId } = req.params;
        const stats = await this.getCentreStats(centreId);

        res.json({
            success: true,
            data: {
                centreCode: centreId,
                capacity: stats.capacity,
                registered: stats.registered,
                available: stats.capacity - stats.registered,
                utilizationPercentage: ((stats.registered / stats.capacity) * 100).toFixed(2)
            }
        });
    } catch (error) {
        console.error('Check capacity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check capacity',
            message: error.message
        });
    }
};
