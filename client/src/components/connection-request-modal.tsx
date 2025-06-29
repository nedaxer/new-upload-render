import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link2, X, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useHaptics } from '@/hooks/use-haptics';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionRequestId: string;
  customMessage: string;
  serviceName: string;
}

export function ConnectionRequestModal({ 
  isOpen, 
  onClose, 
  connectionRequestId, 
  customMessage, 
  serviceName 
}: ConnectionRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [responded, setResponded] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const queryClient = useQueryClient();
  const { medium, heavy } = useHaptics();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const bottomNav = document.querySelector('[data-navigation="bottom"]') as HTMLElement;
    const mobileLayout = document.querySelector('[data-layout="mobile"]') as HTMLElement;
    
    if (isOpen) {
      // Blur bottom navigation
      if (bottomNav) {
        bottomNav.style.filter = 'blur(4px)';
        bottomNav.style.transition = 'filter 0.3s ease-out';
      }
      
      // Blur main content
      if (mobileLayout) {
        mobileLayout.style.filter = 'blur(2px)';
        mobileLayout.style.transition = 'filter 0.3s ease-out';
      }
      
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    } else {
      // Remove blur effects
      if (bottomNav) {
        bottomNav.style.filter = 'none';
      }
      if (mobileLayout) {
        mobileLayout.style.filter = 'none';
      }
      
      // Restore scrolling
      document.body.style.overflow = 'auto';
    }

    return () => {
      if (bottomNav) {
        bottomNav.style.filter = 'none';
      }
      if (mobileLayout) {
        mobileLayout.style.filter = 'none';
      }
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Connection request response mutation
  const respondMutation = useMutation({
    mutationFn: (response: 'accept' | 'decline') => 
      apiRequest('POST', '/api/connection-request/respond', {
        connectionRequestId,
        response
      }),
    onSuccess: (data) => {
      heavy(); // Strong haptic feedback for successful response
      setResponseMessage(data.message);
      setResponded(true);
      
      // Refresh notification data
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: (error) => {
      console.error('Connection request response error:', error);
      setResponseMessage('Failed to respond to connection request. Please try again.');
    }
  });

  const handleResponse = (response: 'accept' | 'decline') => {
    medium(); // Haptic feedback for button press
    respondMutation.mutate(response);
  };

  const handleClose = () => {
    medium();
    onClose();
    
    // Reset state when closing
    setTimeout(() => {
      setResponded(false);
      setResponseMessage('');
    }, 300);
  };

  if (!isOpen || !mounted) return null;
  
  return createPortal(
    <div 
      className="connection-request-modal-overlay fixed inset-0" 
      style={{ 
        zIndex: 999999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }} 
      data-modal="connection-request"
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={handleClose} />
      <div 
        className="connection-request-modal-content fixed inset-4 bg-[#0a0a2e] border border-[#1a1a40] text-white rounded-2xl flex flex-col"
        style={{
          zIndex: 999999999,
          position: 'fixed',
          top: '20px',
          left: '20px',
          right: '20px',
          bottom: '20px',
          maxHeight: 'calc(100vh - 40px)',
          transform: 'scale(1)',
          transition: 'transform 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1a1a40]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Link2 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Connection Request</h2>
              <p className="text-xs text-gray-400">Service: {serviceName}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-8 h-8 bg-gray-600/20 rounded-full flex items-center justify-center hover:bg-gray-600/30 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!responded ? (
            <>
              {/* Connection Request Message */}
              <div className="bg-[#1a1a40] rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Shield className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-base leading-relaxed">
                      Dear User, {customMessage}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-200 text-sm font-medium mb-1">Security Notice</p>
                    <p className="text-amber-200/80 text-xs leading-relaxed">
                      Only accept this connection if you requested it. If you didn't initiate this request, 
                      please decline and contact support immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleResponse('accept')}
                  disabled={respondMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {respondMutation.isPending ? 'Processing...' : 'Accept Connection'}
                </Button>
                
                <Button
                  onClick={() => handleResponse('decline')}
                  disabled={respondMutation.isPending}
                  variant="outline"
                  className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 font-medium py-4 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {respondMutation.isPending ? 'Processing...' : 'Decline Connection'}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Response Message */}
              <div className="bg-[#1a1a40] rounded-lg p-6 mb-6 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Response Recorded</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {responseMessage}
                </p>
              </div>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 px-4 rounded-lg transition-colors"
              >
                Close
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}