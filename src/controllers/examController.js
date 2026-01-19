const Exam = require('../models/Exam');
const Slot = require('../models/Slot');
const Candidate = require('../models/Candidate');
const { Op } = require('sequelize');

/**
 * Get all exams
 */
exports.getAllExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({
            include: [{
                model: Slot,
                as: 'slots'
            }],
            order: [['examDate', 'DESC']]
        });

        res.json({
            success: true,
            data: exams
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exams',
            message: error.message
        });
    }
};

/**
 * Get exam by ID
 */
exports.getExamById = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByPk(id, {
            include: [{
                model: Slot,
                as: 'slots'
            }]
        });

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Get candidate count
        const candidateCount = await Candidate.count({
            where: { examId: id }
        });

        res.json({
            success: true,
            data: {
                ...exam.toJSON(),
                candidateCount
            }
        });
    } catch (error) {
        console.error('Get exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch exam',
            message: error.message
        });
    }
};

/**
 * Create new exam
 */
exports.createExam = async (req, res) => {
    try {
        const { name, code, examDate, description, totalSlots, slots } = req.body;

        // Validate required fields
        if (!name || !code || !examDate) {
            return res.status(400).json({
                success: false,
                error: 'Name, code, and exam date are required'
            });
        }

        // Check if code already exists
        const existingExam = await Exam.findOne({ where: { code } });
        if (existingExam) {
            return res.status(400).json({
                success: false,
                error: 'Exam code already exists'
            });
        }

        // Create exam
        const exam = await Exam.create({
            name,
            code,
            examDate,
            description,
            totalSlots: totalSlots || 3,
            status: 'draft'
        });

        // Create slots if provided
        if (slots && Array.isArray(slots)) {
            for (const slot of slots) {
                await Slot.create({
                    examId: exam.id,
                    slotNumber: slot.slotNumber,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    capacity: slot.capacity || 100
                });
            }
        }

        // Fetch exam with slots
        const createdExam = await Exam.findByPk(exam.id, {
            include: [{
                model: Slot,
                as: 'slots'
            }]
        });

        res.status(201).json({
            success: true,
            data: createdExam,
            message: 'Exam created successfully'
        });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create exam',
            message: error.message
        });
    }
};

/**
 * Update exam
 */
exports.updateExam = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, examDate, description, totalSlots } = req.body;

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Update exam
        await exam.update({
            name: name || exam.name,
            code: code || exam.code,
            examDate: examDate || exam.examDate,
            description: description !== undefined ? description : exam.description,
            totalSlots: totalSlots || exam.totalSlots
        });

        // Fetch updated exam with slots
        const updatedExam = await Exam.findByPk(id, {
            include: [{
                model: Slot,
                as: 'slots'
            }]
        });

        res.json({
            success: true,
            data: updatedExam,
            message: 'Exam updated successfully'
        });
    } catch (error) {
        console.error('Update exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update exam',
            message: error.message
        });
    }
};

/**
 * Delete exam
 */
exports.deleteExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        // Check if exam has candidates
        const candidateCount = await Candidate.count({
            where: { examId: id }
        });

        if (candidateCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete exam with registered candidates'
            });
        }

        // Delete associated slots
        await Slot.destroy({ where: { examId: id } });

        // Delete exam
        await exam.destroy();

        res.json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        console.error('Delete exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete exam',
            message: error.message
        });
    }
};

/**
 * Activate exam
 */
exports.activateExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        await exam.update({ status: 'active' });

        res.json({
            success: true,
            data: exam,
            message: 'Exam activated successfully'
        });
    } catch (error) {
        console.error('Activate exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate exam',
            message: error.message
        });
    }
};

/**
 * Deactivate exam
 */
exports.deactivateExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByPk(id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        await exam.update({ status: 'completed' });

        res.json({
            success: true,
            data: exam,
            message: 'Exam deactivated successfully'
        });
    } catch (error) {
        console.error('Deactivate exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate exam',
            message: error.message
        });
    }
};

/**
 * Activate mock exam
 */
exports.activateMockExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByPk(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        exam.mockActive = true;
        await exam.save();

        res.json({
            success: true,
            message: 'Mock exam activated successfully',
            data: exam
        });
    } catch (error) {
        console.error('Activate mock exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to activate mock exam',
            message: error.message
        });
    }
};

/**
 * Deactivate mock exam
 */
exports.deactivateMockExam = async (req, res) => {
    try {
        const { id } = req.params;

        const exam = await Exam.findByPk(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                error: 'Exam not found'
            });
        }

        exam.mockActive = false;
        await exam.save();

        res.json({
            success: true,
            message: 'Mock exam deactivated successfully',
            data: exam
        });
    } catch (error) {
        console.error('Deactivate mock exam error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deactivate mock exam',
            message: error.message
        });
    }
};

/**
 * Get available exams (for mobile app)
 */
exports.getAvailableExams = async (req, res) => {
    try {
        const exams = await Exam.findAll({
            where: {
                status: 'active',
                examDate: {
                    [Op.gte]: new Date()
                }
            },
            include: [{
                model: Slot,
                as: 'slots'
            }],
            order: [['examDate', 'ASC']]
        });

        res.json({
            success: true,
            data: exams
        });
    } catch (error) {
        console.error('Get available exams error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch available exams',
            message: error.message
        });
    }
};

/**
 * Download candidates for exam (with password protection)
 */
exports.downloadCandidates = async (req, res) => {
    try {
        const { examId, centreCode, password } = req.body;

        // TODO: Verify download password from DynamoDB
        // For now, just fetch candidates

        const candidates = await Candidate.findAll({
            where: {
                examId,
                centreCode
            },
            attributes: ['id', 'rollNo', 'name', 'fatherName', 'dob', 'photoUrl', 'omrNo']
        });

        res.json({
            success: true,
            data: candidates,
            message: `Downloaded ${candidates.length} candidates`
        });
    } catch (error) {
        console.error('Download candidates error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download candidates',
            message: error.message
        });
    }
};

/**
 * Create Dashboard for Exam
 */
exports.createDashboard = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find exam
        const exam = await Exam.findByPk(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Generate unique credentials
        const examName = exam.name.toLowerCase().replace(/\s+/g, '_');
        const username = `${examName}_user`;
        const password = `${examName}_pass`;
        
        // Generate dashboard link (using environment variable or default)
        const dashboardBaseUrl = process.env.DASHBOARD_URL || 'http://13.204.65.158:8080';
        const dashboardLink = `${dashboardBaseUrl}/dashboard?exam=${id}`;

        // Store dashboard credentials in exam
        exam.dashboardUsername = username;
        exam.dashboardPassword = password;
        exam.dashboardLink = dashboardLink;
        exam.dashboardCreated = true;
        await exam.save();

        res.json({
            success: true,
            message: 'Dashboard created successfully',
            data: {
                examId: id,
                examName: exam.name,
                username,
                password,
                dashboardLink
            }
        });
    } catch (error) {
        console.error('Error creating dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating dashboard',
            error: error.message
        });
    }
};

/**
 * Upload Candidates with Auto Distribution
 */
exports.uploadCandidates = async (req, res) => {
    try {
        const { id } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Find exam
        const exam = await Exam.findByPk(id);
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Parse Excel file
        const XLSX = require('xlsx');
        const workbook = XLSX.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (!data || data.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Excel file is empty or invalid'
            });
        }

        // Get exam slots
        const slots = await Slot.findAll({
            where: { examId: id },
            order: [['slotNumber', 'ASC']]
        });

        if (!slots || slots.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No slots found for this exam. Please create slots first.'
            });
        }

        // Group candidates by centre code and shift
        const groupedCandidates = {};
        
        data.forEach(row => {
            const centreCode = row.centreCode || row.centre_code || row.CentreCode || 'DEFAULT';
            const shift = row.shift || row.Shift || 'Morning';
            
            const key = `${centreCode}_${shift}`;
            
            if (!groupedCandidates[key]) {
                groupedCandidates[key] = [];
            }
            
            groupedCandidates[key].push(row);
        });

        // Auto-distribute candidates across slots
        const distributionSummary = [];
        let totalDistributed = 0;

        for (const [key, candidates] of Object.entries(groupedCandidates)) {
            const [centreCode, shift] = key.split('_');
            const candidatesCount = candidates.length;
            const slotsCount = slots.length;
            const candidatesPerSlot = Math.floor(candidatesCount / slotsCount);
            const remainder = candidatesCount % slotsCount;

            let currentIndex = 0;

            for (let i = 0; i < slotsCount; i++) {
                const slot = slots[i];
                const slotCandidatesCount = candidatesPerSlot + (i < remainder ? 1 : 0);
                const slotCandidates = candidates.slice(currentIndex, currentIndex + slotCandidatesCount);

                // Save candidates to database
                for (const candidateData of slotCandidates) {
                    await Candidate.create({
                        examId: id,
                        slotId: slot.id,
                        centreCode,
                        shift,
                        name: candidateData.name || candidateData.Name,
                        fatherName: candidateData.fatherName || candidateData.father_name || candidateData.FatherName,
                        dob: candidateData.dob || candidateData.DOB,
                        omrNo: candidateData.omrNo || candidateData.omr_no || candidateData.OMRNo,
                        rollNo: candidateData.rollNo || candidateData.roll_no || candidateData.RollNo,
                        candidateId: candidateData.candidateId || candidateData.candidate_id || candidateData.CandidateId,
                        uploadedPhotoUrl: candidateData.photoUrl || candidateData.photo_url || candidateData.PhotoUrl,
                        status: 'Pending'
                    });
                }

                distributionSummary.push({
                    centreCode,
                    shift,
                    slotNumber: slot.slotNumber,
                    slotName: slot.name,
                    candidatesCount: slotCandidatesCount
                });

                currentIndex += slotCandidatesCount;
                totalDistributed += slotCandidatesCount;
            }
        }

        // Delete uploaded file
        const fs = require('fs');
        fs.unlinkSync(file.path);

        res.json({
            success: true,
            message: 'Candidates uploaded and distributed successfully',
            data: {
                totalCandidates: data.length,
                totalDistributed,
                distributionSummary
            }
        });
    } catch (error) {
        console.error('Error uploading candidates:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading candidates',
            error: error.message
        });
    }
};

module.exports = exports;