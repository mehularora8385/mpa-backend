const Candidate = require('../models/Candidate');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const { Op } = require('sequelize');

/**
 * Get all candidates
 */
exports.getAllCandidates = async (req, res) => {
    try {
        const { examId, centreCode, status, search, page = 1, limit = 50 } = req.query;

        const where = {};
        
        if (examId) where.examId = examId;
        if (centreCode) where.centreCode = centreCode;
        if (status) where.status = status;
        
        if (search) {
            where[Op.or] = [
                { rollNo: { [Op.iLike]: `%${search}%` } },
                { name: { [Op.iLike]: `%${search}%` } },
                { omrNo: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Candidate.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['rollNo', 'ASC']],
            include: [{
                model: Exam,
                as: 'exam',
                attributes: ['id', 'name', 'code']
            }]
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch candidates',
            message: error.message
        });
    }
};

/**
 * Get candidate by ID
 */
exports.getCandidateById = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await Candidate.findByPk(id, {
            include: [
                {
                    model: Exam,
                    as: 'exam'
                },
                {
                    model: Attendance,
                    as: 'attendance'
                }
            ]
        });

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        res.json({
            success: true,
            data: candidate
        });
    } catch (error) {
        console.error('Get candidate error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch candidate',
            message: error.message
        });
    }
};

/**
 * Get candidate by roll number
 */
exports.getCandidateByRollNo = async (req, res) => {
    try {
        const { rollNo } = req.params;

        const candidate = await Candidate.findOne({
            where: { rollNo },
            include: [
                {
                    model: Exam,
                    as: 'exam'
                },
                {
                    model: Attendance,
                    as: 'attendance'
                }
            ]
        });

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        res.json({
            success: true,
            data: candidate
        });
    } catch (error) {
        console.error('Get candidate by roll no error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch candidate',
            message: error.message
        });
    }
};

/**
 * Create candidate
 */
exports.createCandidate = async (req, res) => {
    try {
        const {
            rollNo,
            omrNo,
            name,
            fatherName,
            dob,
            gender,
            centreCode,
            examId,
            slotId,
            photoUrl
        } = req.body;

        // Validate required fields
        if (!rollNo || !omrNo || !name || !fatherName || !dob || !gender || !centreCode || !examId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Check if candidate already exists
        const existingCandidate = await Candidate.findOne({
            where: {
                [Op.or]: [
                    { rollNo },
                    { omrNo }
                ]
            }
        });

        if (existingCandidate) {
            return res.status(400).json({
                success: false,
                error: 'Candidate with this roll number or OMR number already exists'
            });
        }

        // Create candidate
        const candidate = await Candidate.create({
            rollNo,
            omrNo,
            name,
            fatherName,
            dob,
            gender,
            centreCode,
            examId,
            slotId,
            photoUrl,
            status: 'registered'
        });

        res.status(201).json({
            success: true,
            data: candidate,
            message: 'Candidate created successfully'
        });
    } catch (error) {
        console.error('Create candidate error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create candidate',
            message: error.message
        });
    }
};

/**
 * Update candidate
 */
exports.updateCandidate = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const candidate = await Candidate.findByPk(id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        await candidate.update(updateData);

        res.json({
            success: true,
            data: candidate,
            message: 'Candidate updated successfully'
        });
    } catch (error) {
        console.error('Update candidate error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update candidate',
            message: error.message
        });
    }
};

/**
 * Get candidates by exam
 */
exports.getCandidatesByExam = async (req, res) => {
    try {
        const { examId } = req.params;

        const candidates = await Candidate.findAll({
            where: { examId },
            order: [['rollNo', 'ASC']]
        });

        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        console.error('Get candidates by exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch candidates',
            message: error.message
        });
    }
};

/**
 * Get candidates by centre
 */
exports.getCandidatesByCentre = async (req, res) => {
    try {
        const { centreCode } = req.params;
        const { examId } = req.query;

        const where = { centreCode };
        if (examId) where.examId = examId;

        const candidates = await Candidate.findAll({
            where,
            order: [['rollNo', 'ASC']]
        });

        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        console.error('Get candidates by centre error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch candidates',
            message: error.message
        });
    }
};

/**
 * Filter candidates
 */
exports.filterCandidates = async (req, res) => {
    try {
        const { examId, centreCode, status, present, verified } = req.query;

        const where = {};
        
        if (examId) where.examId = examId;
        if (centreCode) where.centreCode = centreCode;
        if (status) where.status = status;
        if (present !== undefined) where.present = present === 'true';
        if (verified !== undefined) where.verified = verified === 'true';

        const candidates = await Candidate.findAll({
            where,
            order: [['rollNo', 'ASC']]
        });

        res.json({
            success: true,
            data: candidates,
            count: candidates.length
        });
    } catch (error) {
        console.error('Filter candidates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to filter candidates',
            message: error.message
        });
    }
};

/**
 * Get biometric status
 */
exports.getBiometricStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await Candidate.findByPk(id, {
            attributes: ['id', 'rollNo', 'name', 'present', 'verified', 'faceMatchPercentage', 'status']
        });

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        res.json({
            success: true,
            data: {
                rollNo: candidate.rollNo,
                name: candidate.name,
                attendanceMarked: candidate.present,
                biometricVerified: candidate.verified,
                faceMatchPercentage: candidate.faceMatchPercentage,
                status: candidate.status
            }
        });
    } catch (error) {
        console.error('Get biometric status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch biometric status',
            message: error.message
        });
    }
};

/**
 * Update candidate status
 */
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const candidate = await Candidate.findByPk(id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        await candidate.update({ status });

        res.json({
            success: true,
            data: candidate,
            message: 'Status updated successfully'
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update status',
            message: error.message
        });
    }
};

/**
 * Reverify candidate
 */
exports.reverifyCandidate = async (req, res) => {
    try {
        const { id } = req.params;

        const candidate = await Candidate.findByPk(id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                error: 'Candidate not found'
            });
        }

        // Reset verification status
        await candidate.update({
            verified: false,
            faceMatchPercentage: null,
            status: 'attendance_completed'
        });

        res.json({
            success: true,
            data: candidate,
            message: 'Candidate marked for reverification'
        });
    } catch (error) {
        console.error('Reverify candidate error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reverify candidate',
            message: error.message
        });
    }
};

module.exports = exports;