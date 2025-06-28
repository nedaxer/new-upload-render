import express from 'express';
import { UserStorage } from '../storage';
import { WebSocketManager } from '../websocket-manager';

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

    // Update user verification status
    const user = await UserStorage.getUser(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update verification status
    await UserStorage.updateVerificationStatus(userId, status, reason);

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

    await UserStorage.createNotification(notificationData);

    // Broadcast real-time notification via WebSocket
    const wsManager = WebSocketManager.getInstance();
    wsManager.sendToUser(userId, {
      type: 'kyc_status_update',
      data: {
        status,
        notification: notificationData
      }
    });

    // Also send notification update
    wsManager.sendToUser(userId, {
      type: 'notification_update',
      data: notificationData
    });

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
    const pendingVerifications = await UserStorage.getPendingVerifications();
    
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