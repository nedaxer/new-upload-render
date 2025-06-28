import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { mongoStorage as storage } from '../mongoStorage';

// Auth middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  next();
};

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Submit KYC verification
router.post('/submit', requireAuth, upload.fields([
  { name: 'documentFront', maxCount: 1 },
  { name: 'documentBack', maxCount: 1 },
  { name: 'documentSingle', maxCount: 1 }
]), async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const {
      hearAboutUs,
      dateOfBirth,
      sourceOfIncome,
      annualIncome,
      investmentExperience,
      plannedDeposit,
      investmentGoal,
      documentType
    } = req.body;

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Parse date of birth
    let parsedDateOfBirth;
    try {
      parsedDateOfBirth = JSON.parse(dateOfBirth);
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid date of birth format' });
    }

    // Prepare document data
    const documents: any = {};
    
    if (files.documentFront) {
      documents.front = files.documentFront[0].buffer.toString('base64');
    }
    if (files.documentBack) {
      documents.back = files.documentBack[0].buffer.toString('base64');
    }
    if (files.documentSingle) {
      documents.single = files.documentSingle[0].buffer.toString('base64');
    }

    // Prepare KYC data
    const kycData = {
      hearAboutUs,
      dateOfBirth: parsedDateOfBirth,
      sourceOfIncome,
      annualIncome,
      investmentExperience,
      plannedDeposit,
      investmentGoal,
      documentType,
      documents,
      verificationResults: {
        documentValid: false,
        faceMatch: false,
        confidence: 0,
        issues: []
      }
    };

    // Get current user and update with KYC data
    const currentUser = await storage.getUser(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update user with KYC data and set status to pending
    const updatedUser = {
      ...currentUser,
      kycStatus: 'pending' as const,
      kycData
    };
    
    await storage.updateUserProfile(userId, updatedUser);

    // Simulate real-time verification process
    setTimeout(async () => {
      try {
        // Simulate OCR and face verification
        const mockVerificationResults = {
          documentValid: true,
          faceMatch: true,
          ocrResults: {
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            dateOfBirth: `${parsedDateOfBirth.day}/${parsedDateOfBirth.month}/${parsedDateOfBirth.year}`,
            documentNumber: 'DOC' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            expiryDate: '2030-12-31'
          },
          confidence: 95,
          issues: []
        };

        // Update verification status to verified
        const verifiedUser = {
          ...updatedUser,
          kycStatus: 'verified' as const,
          kycData: {
            ...kycData,
            verificationResults: mockVerificationResults
          }
        };
        
        await storage.updateUserProfile(userId, verifiedUser);
        console.log(`✅ User ${userId} verification completed successfully`);
      } catch (error) {
        console.error('Error updating verification status:', error);
        
        // Mark as rejected if verification fails
        const rejectedUser = {
          ...updatedUser,
          kycStatus: 'rejected' as const,
          kycData: {
            ...kycData,
            verificationResults: {
              ...kycData.verificationResults,
              issues: ['Verification failed due to technical error']
            }
          }
        };
        
        await storage.updateUserProfile(userId, rejectedUser);
      }
    }, 5000); // 5 second delay to simulate processing

    res.json({
      success: true,
      message: 'Verification submitted successfully',
      status: 'pending'
    });

  } catch (error) {
    console.error('Verification submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit verification'
    });
  }
});

// Get verification status
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        kycStatus: user.kycStatus || 'none',
        kycData: user.kycData || null
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get verification status'
    });
  }
});

export default router;