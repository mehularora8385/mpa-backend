const Operator = require('../models/Operator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Get all operators
 */
exports.getAllOperators = async (req, res) => {
    try {
        const { examId, centreCode, status } = req.query;

        const where = {};
        if (examId) where.examId = examId;
        if (centreCode) where.centreCode = centreCode;
        if (status) where.status = status;

        const operators = await Operator.findAll({
            where,
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: operators
        });
    } catch (error) {
        console.error('Get operators error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch operators',
            message: error.message
        });
    }
};

/**
 * Get operator by ID
 */
exports.getOperatorById = async (req, res) => {
    try {
        const { id } = req.params;

        const operator = await Operator.findByPk(id);

        if (!operator) {
            return res.status(404).json({
                success: false,
                error: 'Operator not found'
            });
        }

        res.json({
            success: true,
            data: operator
        });
    } catch (error) {
        console.error('Get operator error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch operator',
            message: error.message
        });
    }
};

/**
 * Create operator
 */
exports.createOperator = async (req, res) => {
    try {
        const { operatorId, name, examId, centreCode, mobile, status, password } = req.body;

        // Validate required fields
        if (!operatorId || !name || !examId || !centreCode || !password) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Check if operator ID already exists
        const existingOperator = await Operator.findOne({ where: { operatorId } });
        if (existingOperator) {
            return res.status(400).json({
                success: false,
                error: 'Operator ID already exists'
            });
        }

        // Create user first
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username: operatorId,
            password: hashedPassword,
            role: 'operator',
            fullName: name,
            mobile: mobile,
            isActive: status === 'active'
        });

        // Create operator
        const operator = await Operator.create({
            userId: user.id,
            operatorId,
            name,
            examId,
            centreCode,
            mobile,
            status: status || 'active'
        });

        res.status(201).json({
            success: true,
            data: operator,
            message: 'Operator created successfully'
        });
    } catch (error) {
        console.error('Create operator error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create operator',
            message: error.message
        });
    }
};

/**
 * Update operator
 */
exports.updateOperator = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, examId, centreCode, mobile, status } = req.body;

        const operator = await Operator.findByPk(id);

        if (!operator) {
            return res.status(404).json({
                success: false,
                error: 'Operator not found'
            });
        }

        // Update operator
        await operator.update({
            name: name || operator.name,
            examId: examId || operator.examId,
            centreCode: centreCode || operator.centreCode,
            mobile: mobile || operator.mobile,
            status: status || operator.status
        });

        // Update user if status changed
        if (status) {
            await User.update(
                { isActive: status === 'active' },
                { where: { id: operator.userId } }
            );
        }

        res.json({
            success: true,
            data: operator,
            message: 'Operator updated successfully'
        });
    } catch (error) {
        console.error('Update operator error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update operator',
            message: error.message
        });
    }
};

/**
 * Delete operator
 */
exports.deleteOperator = async (req, res) => {
    try {
        const { id } = req.params;

        const operator = await Operator.findByPk(id);

        if (!operator) {
            return res.status(404).json({
                success: false,
                error: 'Operator not found'
            });
        }

        // Delete associated user
        await User.destroy({ where: { id: operator.userId } });

        // Delete operator
        await operator.destroy();

        res.json({
            success: true,
            message: 'Operator deleted successfully'
        });
    } catch (error) {
        console.error('Delete operator error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete operator',
            message: error.message
        });
    }
};

/**
 * Bulk upload operators
 */
exports.bulkUpload = async (req, res) => {
    try {
        const { file } = req;
        // TODO: Implement bulk upload logic
        res.json({
            success: true,
            message: 'Bulk upload not yet implemented'
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload operators',
            message: error.message
        });
    }
};

// Bulk upload operators (for CSV upload)
exports.bulkUpload = async (req, res, next) => {
  try {
    const { file } = req;
    const result = await operatorService.bulkUpload(file);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Logout all operators (for admin panel logout all button)
exports.logoutAll = async (req, res, next) => {
  try {
    // This would typically invalidate all operator tokens or send logout command via WebSocket
    // For now, we'll return a success response
    // The actual logout mechanism would be implemented with real-time communication
    
    const result = await operatorService.logoutAllOperators();
    
    res.json({
      success: true,
      message: 'All operators logged out successfully',
      data: {
        loggedOutAt: new Date(),
        operatorsCount: result.operatorsCount || 0
      }
    });
    
  } catch (error) {
    next(error);
  }
};
