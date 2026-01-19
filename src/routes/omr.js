const express = require('express');
const router = express.Router();
const omrController = require('../controllers/omrController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Scan OMR barcode
router.post('/scan',
  omrController.upload.single('omrImage'),
  omrController.scanOMR
);

// Validate OMR barcode against roll number
router.post('/validate', omrController.validateOMR);

// Get OMR by barcode
router.get('/barcode/:barcode/:examId', omrController.getOMRByBarcode);

// List OMRs for exam
router.get('/list/:examId', omrController.listOMRs);

// Delete OMR (admin only)
router.delete('/:barcode/:examId', omrController.deleteOMR);

module.exports = router;