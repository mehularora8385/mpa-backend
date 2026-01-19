const Candidate = require('../models/Candidate');
const Operator = require('../models/Operator');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const { Op } = require('sequelize');
const db = require('../config/database');

/**
 * Get biometric report
 */
exports.getBiometricReport = async (req, res) => {
    try {
        const { examId, centreCode, status, startDate, endDate } = req.query;

        const where = {};
        if (examId) where.examId = examId;
        if (centreCode) where.centreCode = centreCode;
        if (status) where.status = status;

        if (startDate && endDate) {
            where.verifiedAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const candidates = await Candidate.findAll({
            where,
            attributes: [
                'id',
                'rollNo',
                'name',
                'fatherName',
                'dob',
                'centreCode',
                'omrNo',
                'photoUrl',
                'enrolledFaceImage',
                'faceMatchPercentage',
                'fingerprintData',
                'verified',
                'verifiedAt',
                'status'
            ],
            include: [{
                model: Exam,
                as: 'exam',
                attributes: ['name', 'code']
            }],
            order: [['centreCode', 'ASC'], ['rollNo', 'ASC']]
        });

        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        console.error('Get biometric report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate biometric report',
            message: error.message
        });
    }
};

/**
 * Get centre report
 */
exports.getCentreReport = async (req, res) => {
    try {
        const { examId } = req.query;

        const where = {};
        if (examId) where.examId = examId;

        const centreStats = await Candidate.findAll({
            where,
            attributes: [
                'centreCode',
                [db.fn('COUNT', db.col('id')), 'totalCandidates'],
                [db.fn('SUM', db.literal('CASE WHEN present = true THEN 1 ELSE 0 END')), 'attendanceMarked'],
                [db.fn('SUM', db.literal('CASE WHEN verified = true THEN 1 ELSE 0 END')), 'biometricCompleted'],
                [db.fn('AVG', db.col('faceMatchPercentage')), 'avgMatchPercentage']
            ],
            group: ['centreCode'],
            raw: true
        });

        res.json({
            success: true,
            data: centreStats,
            count: centreStats.length
        });
    } catch (error) {
        console.error('Get centre report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate centre report',
            message: error.message
        });
    }
};

/**
 * Get slot report
 */
exports.getSlotReport = async (req, res) => {
    try {
        const { examId } = req.query;

        const where = {};
        if (examId) where.examId = examId;

        const slotStats = await Candidate.findAll({
            where,
            attributes: [
                'slotId',
                [db.fn('COUNT', db.col('id')), 'totalCandidates'],
                [db.fn('SUM', db.literal('CASE WHEN present = true THEN 1 ELSE 0 END')), 'attendanceMarked'],
                [db.fn('SUM', db.literal('CASE WHEN verified = true THEN 1 ELSE 0 END')), 'biometricCompleted']
            ],
            group: ['slotId'],
            raw: true
        });

        res.json({
            success: true,
            data: slotStats,
            count: slotStats.length
        });
    } catch (error) {
        console.error('Get slot report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate slot report',
            message: error.message
        });
    }
};

/**
 * Get operator report
 */
exports.getOperatorReport = async (req, res) => {
    try {
        const { examId, centreCode } = req.query;

        const where = {};
        if (examId) where.examId = examId;
        if (centreCode) where.centreCode = centreCode;

        const operators = await Operator.findAll({
            where,
            attributes: [
                'id',
                'operatorId',
                'name',
                'centreCode',
                'mobile',
                'status',
                'lastCheckIn',
                'lastCheckOut'
            ],
            order: [['centreCode', 'ASC'], ['name', 'ASC']]
        });

        res.json({
            success: true,
            data: operators,
            count: operators.length
        });
    } catch (error) {
        console.error('Get operator report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate operator report',
            message: error.message
        });
    }
};

/**
 * Get comprehensive report
 */
exports.getComprehensiveReport = async (req, res) => {
    try {
        const { examId } = req.query;

        if (!examId) {
            return res.status(400).json({
                success: false,
                error: 'Exam ID is required'
            });
        }

        // Get exam details
        const exam = await Exam.findByPk(examId);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Get all statistics
        const totalCandidates = await Candidate.count({ where: { examId } });
        const attendanceMarked = await Candidate.count({ where: { examId, present: true } });
        const biometricCompleted = await Candidate.count({ where: { examId, verified: true } });
        const activeOperators = await Operator.count({ where: { examId, status: 'active' } });

        // Get centre-wise data
        const centreData = await Candidate.findAll({
            where: { examId },
            attributes: [
                'centreCode',
                [db.fn('COUNT', db.col('id')), 'totalCandidates'],
                [db.fn('SUM', db.literal('CASE WHEN verified = true THEN 1 ELSE 0 END')), 'biometricCompleted']
            ],
            group: ['centreCode'],
            raw: true
        });

        // Get detailed candidate list
        const candidates = await Candidate.findAll({
            where: { examId },
            attributes: [
                'rollNo',
                'name',
                'fatherName',
                'dob',
                'centreCode',
                'omrNo',
                'photoUrl',
                'enrolledFaceImage',
                'faceMatchPercentage',
                'present',
                'verified',
                'status',
                'verifiedAt'
            ],
            order: [['centreCode', 'ASC'], ['rollNo', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                exam: {
                    name: exam.name,
                    code: exam.code,
                    date: exam.examDate,
                    status: exam.status
                },
                summary: {
                    totalCandidates,
                    attendanceMarked,
                    biometricCompleted,
                    activeOperators,
                    attendancePercentage: totalCandidates > 0 
                        ? ((attendanceMarked / totalCandidates) * 100).toFixed(2)
                        : 0,
                    biometricPercentage: totalCandidates > 0 
                        ? ((biometricCompleted / totalCandidates) * 100).toFixed(2)
                        : 0
                },
                centreWiseData: centreData,
                candidates
            }
        });
    } catch (error) {
        console.error('Get comprehensive report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate comprehensive report',
            message: error.message
        });
    }
};

/**
 * Get detailed export report (15 columns)
 */
exports.getDetailedExportReport = async (req, res) => {
    try {
        const { examId, centreCode } = req.query;

        const where = {};
        if (examId) where.examId = examId;
        if (centreCode) where.centreCode = centreCode;

        const candidates = await Candidate.findAll({
            where,
            attributes: [
                'centreCode',
                'name',
                'fatherName',
                'dob',
                'photoUrl',
                'enrolledFaceImage',
                'faceMatchPercentage',
                'fingerprintData',
                'omrNo',
                'rollNo',
                'status',
                'verifiedAt',
                'createdAt'
            ],
            order: [['centreCode', 'ASC'], ['rollNo', 'ASC']]
        });

        // Format data with 15 columns
        const formattedData = candidates.map(candidate => ({
            centreCode: candidate.centreCode,
            centreName: `Centre ${candidate.centreCode}`, // TODO: Get from Centre model
            studentName: candidate.name,
            fatherName: candidate.fatherName,
            dob: candidate.dob,
            uploadedPhotoUrl: candidate.photoUrl,
            realtimePhotoUrl: candidate.enrolledFaceImage,
            matchPercentage: candidate.faceMatchPercentage || 0,
            fingerprintImageUrl: candidate.fingerprintData ? 'Available' : 'N/A',
            omrNo: candidate.omrNo,
            candidateId: candidate.rollNo,
            status: candidate.status,
            startTime: candidate.createdAt,
            endTime: candidate.verifiedAt,
            score: 0 // TODO: Calculate from exam results
        }));

        res.json({
            success: true,
            data: formattedData,
            count: formattedData.length
        });
    } catch (error) {
        console.error('Get detailed export report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate detailed export report',
            message: error.message
        });
    }
};

module.exports = exports;