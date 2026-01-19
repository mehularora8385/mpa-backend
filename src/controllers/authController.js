const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Operator = require('../models/Operator');

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Admin Login
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide username and password'
            });
        }

        // Find user
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account is inactive'
            });
        }

        // Update last login
        await user.update({ lastLoginAt: new Date() });

        // Generate tokens
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        const refreshToken = jwt.sign(
            { id: user.id, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message
        });
    }
};

/**
 * Operator Login (for mobile app)
 */
exports.operatorLogin = async (req, res) => {
    try {
        const { operatorId, password } = req.body;

        // Validate input
        if (!operatorId || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide operator ID and password'
            });
        }

        // Find operator
        const operator = await Operator.findOne({ 
            where: { operatorId },
            include: [{
                model: User,
                as: 'user'
            }]
        });
        
        if (!operator) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Get user from operator
        const user = await User.findByPk(operator.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check if operator is active
        if (operator.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: 'Operator account is not active'
            });
        }

        // Update last check-in
        await operator.update({ lastCheckIn: new Date() });

        // Generate token
        const token = jwt.sign(
            { 
                id: user.id, 
                operatorId: operator.operatorId,
                examId: operator.examId,
                centreCode: operator.centreCode,
                role: 'operator'
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        res.json({
            success: true,
            token,
            operator: {
                id: operator.id,
                operatorId: operator.operatorId,
                name: operator.name,
                examId: operator.examId,
                centreCode: operator.centreCode,
                mobile: operator.mobile
            }
        });
    } catch (error) {
        console.error('Operator login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message
        });
    }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
    try {
        // If operator, update last check-out
        if (req.user.operatorId) {
            await Operator.update(
                { lastCheckOut: new Date() },
                { where: { operatorId: req.user.operatorId } }
            );
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            message: error.message
        });
    }
};

/**
 * Refresh Token
 */
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required'
            });
        }

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }

        // Find user
        const user = await User.findByPk(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'User not found or inactive'
            });
        }

        // Generate new access token
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid or expired refresh token'
        });
    }
};

/**
 * Check Duplicate Operator
 */
exports.checkDuplicate = async (req, res) => {
    try {
        const { operatorId } = req.body;

        const operator = await Operator.findOne({ where: { operatorId } });

        res.json({
            success: true,
            exists: !!operator
        });
    } catch (error) {
        console.error('Check duplicate error:', error);
        res.status(500).json({
            success: false,
            error: 'Check failed',
            message: error.message
        });
    }
};

/**
 * Forgot Password
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // TODO: Implement email sending logic
        // For now, just return success
        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process request',
            message: error.message
        });
    }
};

/**
 * Change Password
 */
exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Current password is incorrect'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await user.update({ password: hashedPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to change password',
            message: error.message
        });
    }
};
