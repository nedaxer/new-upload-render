import express from 'express';

const router = express.Router();

// Admin KYC approval/rejection endpoint
router.post('/approve-kyc', async (req, res) => {
  try {
    const { userId, status, reason } = req.body;
    
    if (!userId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and status are required' 
      });
    }

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status must be verified or rejected' 
      });
    }

    // Import MongoDB models
    const { User } = await import('../models/User');
    const { Notification } = await import('../models/Notification');

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user verification status
    user.kycStatus = status;
    if (reason) {
      user.kycRejectionReason = reason;
    }
    await user.save();

    // Create notification for user
    const notificationData = {
      userId,
      type: status === 'verified' ? 'kyc_approved' : 'kyc_rejected',
      title: status === 'verified' ? 'KYC Verification Approved' : 'KYC Verification Rejected',
      message: status === 'verified' 
        ? 'Your identity verification has been approved. You now have full access to all features.'
        : `Your identity verification was rejected. Reason: ${reason || 'Please contact support for more information.'}`,
      data: {
        status,
        reason,
        timestamp: new Date().toISOString()
      },
      createdAt: new Date(),
      isRead: false
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Broadcast real-time notification via WebSocket
    try {
      const app = req.app;
      const wss = app.get('wss');
      
      if (wss) {
        wss.clients.forEach((client: any) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'KYC_STATUS_UPDATE',
              userId,
              status,
              notification: notificationData
            }));
          }
        });
      }
    } catch (wsError) {
      console.error('Error broadcasting WebSocket:', wsError);
    }

    res.json({
      success: true,
      message: `KYC ${status} successfully`,
      data: {
        userId,
        status,
        notification: notificationData
      }
    });

  } catch (error) {
    console.error('Admin KYC action error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pending KYC verifications for admin
router.get('/pending-kyc', async (req, res) => {
  try {
    // Import User model
    const { User } = await import('../models/User');
    
    // Find users with pending KYC status
    const pendingVerifications = await User.find({ 
      kycStatus: 'pending' 
    }).select('_id uid email username firstName lastName kycStatus kycData createdAt');
    
    res.json({
      success: true,
      data: pendingVerifications
    });

  } catch (error) {
    console.error('Get pending KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;