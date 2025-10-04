const OCR = require('../models/OCR');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Upload receipt image for OCR processing
// @route   POST /api/ocr/upload
// @access  Employee
exports.uploadReceipt = async (req, res, next) => {
  try {
    // In a real implementation, you would:
    // 1. Handle file upload (using multer)
    // 2. Process image with OCR service (Google Vision, AWS Textract, etc.)
    // 3. Parse the extracted data
    
    // For now, we'll simulate the OCR process
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return next(new ErrorResponse('Please provide image URL', 400));
    }
    
    // Create OCR record
    const ocrRecord = await OCR.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      imageUrl,
      status: 'processing'
    });
    
    // Simulate OCR processing (in real app, this would be async)
    setTimeout(async () => {
      try {
        // Simulate parsed data (replace with actual OCR results)
        const mockParsedData = {
          amount: Math.floor(Math.random() * 1000) + 10,
          currency: 'USD',
          date: new Date(),
          merchant: 'Sample Merchant',
          description: 'Sample expense description',
          category: 'meals'
        };
        
        await OCR.findByIdAndUpdate(ocrRecord._id, {
          parsedData: mockParsedData,
          confidence: 0.85,
          status: 'completed'
        });
      } catch (error) {
        await OCR.findByIdAndUpdate(ocrRecord._id, {
          status: 'failed',
          errorMessage: 'OCR processing failed'
        });
      }
    }, 2000);
    
    res.status(201).json({
      success: true,
      data: {
        id: ocrRecord._id,
        status: 'processing',
        message: 'Receipt uploaded successfully. Processing...'
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parsed OCR data
// @route   GET /api/ocr/:id
// @access  Employee
exports.getOCRData = async (req, res, next) => {
  try {
    const ocrRecord = await OCR.findById(req.params.id);
    
    if (!ocrRecord) {
      return next(new ErrorResponse('OCR record not found', 404));
    }
    
    // Check if user owns this OCR record
    if (ocrRecord.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this OCR record', 403));
    }
    
    res.status(200).json({
      success: true,
      data: ocrRecord
    });
  } catch (error) {
    next(error);
  }
};
