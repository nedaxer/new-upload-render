import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useHaptics } from '@/hooks/use-haptics';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: any;
}

export function ConnectionRequestModal({ isOpen, onClose, notification }: ConnectionRequestModalProps) {
  const [hasResponded, setHasResponded] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { light } = useHaptics();

  const connectionRequestData = notification?.data;

  const respondMutation = useMutation({
    mutationFn: async ({ response }: { response: 'accept' | 'decline' }) => {
      const requestBody = {
        connectionRequestId: connectionRequestData?.connectionRequestId,
        response
      };
      const result = await apiRequest('POST', `/api/connection-request/respond`, requestBody);
      return await result.json();
    },
    onSuccess: (data, variables) => {
      const { response } = variables;
      setResponseMessage(data.message);
      setHasResponded(true);
      
      // Update the notifications cache to mark this notification as read and responded
      queryClient.setQueryData(['/api/notifications'], (oldData: any) => {
        if (!oldData?.data) return oldData;
        
        const updatedNotifications = oldData.data.map((notif: any) => {
          if (notif.type === 'connection_request' && notif.data?.connectionRequestId === connectionRequestData?.connectionRequestId) {
            return {
              ...notif,
              isRead: true,
              data: {
                ...notif.data,
                status: response === 'accept' ? 'accepted' : 'declined',
                responded: true
              }
            };
          }
          return notif;
        });
        
        return {
          ...oldData,
          data: updatedNotifications
        };
      });
      
      // Refresh notifications and unread count
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      
      toast({
        title: response === 'accept' ? 'Connection Accepted' : 'Connection Declined',
        description: response === 'accept' ? 'Successfully connected' : 'Connection request declined',
        variant: 'default',
      });
      
      light();
      
      // Close modal after a short delay to show the response
      setTimeout(() => {
        onClose();
      }, 2000);
    },
    onError: (error) => {
      console.error('Connection request response error:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to connection request',
        variant: 'destructive',
      });
    }
  });

  if (!connectionRequestData) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0a0a2e] border-[#2a2a50] text-white max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg font-semibold text-white">
            Connection Request
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 text-sm">
            {connectionRequestData.adminName} wants to connect with you
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-[#1a1a40] p-4 rounded-lg border border-[#2a2a50]">
            <div className="flex items-center space-x-3 mb-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-white">Message</span>
            </div>
            <p className="text-sm text-gray-300">{connectionRequestData.message}</p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-200">
              Admin Request
            </Badge>
          </div>
        </div>

        {hasResponded ? (
          <div className="flex flex-col items-center space-y-3 pt-4">
            <div className="bg-green-500/20 p-3 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-center text-sm text-green-400">{responseMessage}</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-2 pt-4">
            <Button 
              onClick={() => respondMutation.mutate({ response: 'accept' })}
              disabled={respondMutation.isPending}
              className="bg-green-500 hover:bg-green-600 text-white font-medium"
            >
              {respondMutation.isPending ? 'Responding...' : 'Accept Connection'}
            </Button>
            <Button 
              onClick={() => respondMutation.mutate({ response: 'decline' })}
              disabled={respondMutation.isPending}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              {respondMutation.isPending ? 'Responding...' : 'Decline'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={respondMutation.isPending}
              className="text-gray-400 hover:text-white hover:bg-[#1a1a40]"
            >
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}