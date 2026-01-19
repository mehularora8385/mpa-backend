const Candidate = require('../models/Candidate');
const Operator = require('../models/Operator');
const Exam = require('../models/Exam');
const { Op } = require('sequelize');
const db = require('../config/database');

/**
 * Get dashboard statistics
 */
exports.getStats = async (req, res) => {
    try {
        const { examId } = req.query;

        const where = {};
        if (examId) where.examId = examId;

        // Get total candidates
        const totalCandidates = await Candidate.count({ where });

        // Get biometric completed count
        const biometricCompleted = await Candidate.count({
            where: {
                ...where,
                verified: true
            }
        });

        // Get active operators count
        const activeOperators = await Operator.count({
            where: {
                status: 'active',
                ...(examId && { examId })
            }
        });

        // Get unique centres count
        const centres = await Candidate.findAll({
            where,
            attributes: [[db.fn('DISTINCT', db.col('centreCode')), 'centreCode']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                totalCandidates,
                biometricCompleted,
                activeOperators,
                totalCentres: centres.length,
                biometricPercentage: totalCandidates > 0 
                    ? ((biometricCompleted / totalCandidates) * 100).toFixed(2)
                    : 0
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            message: error.message
        });
    }
};

/**
 * Get centre-wise data
 */
exports.getCentreData = async (req, res) => {
    try {
        const { examId, search } = req.query;

        const where = {};
        if (examId) where.examId = examId;

        // Get all candidates grouped by centre
        const candidates = await Candidate.findAll({
            where,
            attributes: [
                'centreCode',
                [db.fn('COUNT', db.col('id')), 'totalCandidates'],
                [db.fn('SUM', db.literal('CASE WHEN verified = true THEN 1 ELSE 0 END')), 'biometricCompleted'],
                [db.fn('SUM', db.literal('CASE WHEN present = true THEN 1 ELSE 0 END')), 'attendanceMarked']
            ],
            group: ['centreCode'],
            raw: true
        });

        // Get operators per centre
        const operators = await Operator.findAll({
            where: {
                status: 'active',
                ...(examId && { examId })
            },
            attributes: [
                'centreCode',
                [db.fn('COUNT', db.col('id')), 'operatorCount']
            ],
            group: ['centreCode'],
            raw: true
        });

        // Merge data
        const centreData = candidates.map(centre => {
            const operatorData = operators.find(op => op.centreCode === centre.centreCode);
            
            return {
                centreCode: centre.centreCode,
                centreName: `Centre ${centre.centreCode}`, // TODO: Get from Centre model
                totalCandidates: parseInt(centre.totalCandidates),
                biometricCompleted: parseInt(centre.biometricCompleted || 0),
                attendanceMarked: parseInt(centre.attendanceMarked || 0),
                operators: parseInt(operatorData?.operatorCount || 0),
                status: parseInt(centre.biometricCompleted || 0) === parseInt(centre.totalCandidates) 
                    ? 'Completed' 
                    : 'In Progress'
            };
        });

        // Apply search filter if provided
        let filteredData = centreData;
        if (search) {
            filteredData = centreData.filter(centre => 
                centre.centreCode.toLowerCase().includes(search.toLowerCase()) ||
                centre.centreName.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json({
            success: true,
            data: filteredData,
            count: filteredData.length
        });
    } catch (error) {
        console.error('Get centre data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch centre data',
            message: error.message
        });
    }
};

/**
 * Get exam-specific statistics
 */
exports.getExamStats = async (req, res) => {
    try {
        const { examId } = req.params;

        // Get exam details
        const exam = await Exam.findByPk(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Get statistics
        const totalCandidates = await Candidate.count({
            where: { examId }
        });

        const attendanceMarked = await Candidate.count({
            where: {
                examId,
                present: true
            }
        });

        const biometricCompleted = await Candidate.count({
            where: {
                examId,
                verified: true
            }
        });

        const activeOperators = await Operator.count({
            where: {
                examId,
                status: 'active'
            }
        });

        // Get centre count
        const centres = await Candidate.findAll({
            where: { examId },
            attributes: [[db.fn('DISTINCT', db.col('centreCode')), 'centreCode']],
            raw: true
        });

        // Get status distribution
        const statusDistribution = await Candidate.findAll({
            where: { examId },
            attributes: [
                'status',
                [db.fn('COUNT', db.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        res.json({
            success: true,
            data: {
                exam: {
                    id: exam.id,
                    name: exam.name,
                    code: exam.code,
                    date: exam.examDate,
                    status: exam.status
                },
                statistics: {
                    totalCandidates,
                    attendanceMarked,
                    biometricCompleted,
                    activeOperators,
                    totalCentres: centres.length,
                    attendancePercentage: totalCandidates > 0 
                        ? ((attendanceMarked / totalCandidates) * 100).toFixed(2)
                        : 0,
                    biometricPercentage: totalCandidates > 0 
                        ? ((biometricCompleted / totalCandidates) * 100).toFixed(2)
                        : 0
                },
                statusDistribution
            }
        });
    } catch (error) {
        console.error('Get exam stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam statistics',
            message: error.message
        });
    }
};

/**
 * Get real-time updates
 */
exports.getRealTimeUpdates = async (req, res) => {
    try {
        const { examId, since } = req.query;

        const where = {};
        if (examId) where.examId = examId;
        
        if (since) {
            where.updatedAt = {
                [Op.gte]: new Date(since)
            };
        }

        // Get recently updated candidates
        const recentUpdates = await Candidate.findAll({
            where,
            order: [['updatedAt', 'DESC']],
            limit: 50,
            attributes: ['id', 'rollNo', 'name', 'centreCode', 'status', 'verified', 'updatedAt']
        });

        res.json({
            success: true,
            data: recentUpdates,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Get real-time updates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch updates',
            message: error.message
        });
    }
};

module.exports = exports;