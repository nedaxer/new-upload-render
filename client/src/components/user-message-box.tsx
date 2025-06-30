import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Mail, 
  Clock, 
  Reply,
  X,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface UserContactMessage {
  _id: string;
  subject: string;
  message: string;
  category: 'general' | 'support' | 'security' | 'technical';
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  adminReply?: string;
  adminReplyAt?: string;
  hasReply: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserMessageBoxProps {
  className?: string;
}

export default function UserMessageBox({ className = "" }: UserMessageBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<UserContactMessage | null>(null);

  // Fetch user's contact messages
  const { data: messagesData, isLoading } = useQuery<{ success: boolean; data: UserContactMessage[] }>({
    queryKey: ['/api/user/contact-messages'],
    queryFn: async () => {
      const response = await fetch('/api/user/contact-messages', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      return response.json();
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const messages = messagesData?.data || [];
  const unreadReplies = messages.filter(m => m.hasReply && !m.isRead).length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'support': return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'security': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'technical': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <Mail className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <>
      {/* Message Box Icon */}
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="p-2 text-white hover:bg-white/10 relative"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadReplies > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadReplies}
            </span>
          )}
        </Button>
      </div>

      {/* Messages Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gradient-to-br from-[#0a0a2e] to-[#1a1a40] border-white/20">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Your Messages
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[60vh]">
            {/* Messages List */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Contact Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[45vh]">
                  {isLoading ? (
                    <div className="text-center text-gray-400 py-8">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <div>No messages yet</div>
                      <div className="text-sm">Contact support to get help</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div
                          key={message._id}
                          onClick={() => setSelectedMessage(message)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                            selectedMessage?._id === message._id 
                              ? 'border-orange-500 bg-orange-500/10' 
                              : 'border-white/20 bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getCategoryIcon(message.category)}
                              <span className="text-gray-300 text-sm capitalize">{message.category}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {message.hasReply && !message.isRead && (
                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                              )}
                              <Badge className={getPriorityColor(message.priority)}>
                                {message.priority}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="text-white text-sm font-medium mb-1 truncate">
                            {message.subject}
                          </div>
                          
                          {message.hasReply && (
                            <div className="flex items-center space-x-1 mb-2">
                              <Reply className="w-3 h-3 text-orange-400" />
                              <span className="text-orange-400 text-xs">Admin replied</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(message.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message Detail Panel */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Message Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedMessage ? (
                  <ScrollArea className="h-[45vh]">
                    <div className="space-y-4">
                      {/* Message Header */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className={getPriorityColor(selectedMessage.priority)}>
                            {selectedMessage.priority}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(selectedMessage.category)}
                            <span className="text-gray-300 text-sm capitalize">{selectedMessage.category}</span>
                          </div>
                        </div>
                        <div className="text-white text-lg font-medium">{selectedMessage.subject}</div>
                        <div className="text-gray-400 text-sm">
                          Sent on {formatDate(selectedMessage.createdAt)}
                        </div>
                      </div>

                      {/* Original Message */}
                      <div className="space-y-2">
                        <div className="text-gray-300 text-sm font-medium">Your Message</div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-white text-sm whitespace-pre-wrap">{selectedMessage.message}</div>
                        </div>
                      </div>

                      {/* Admin Reply */}
                      {selectedMessage.hasReply && selectedMessage.adminReply && (
                        <div className="space-y-2">
                          <div className="text-gray-300 text-sm font-medium">Admin Reply</div>
                          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-3">
                            <div className="text-white text-sm whitespace-pre-wrap">{selectedMessage.adminReply}</div>
                            {selectedMessage.adminReplyAt && (
                              <div className="text-gray-400 text-xs mt-2">
                                Replied on {formatDate(selectedMessage.adminReplyAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {!selectedMessage.hasReply && (
                        <div className="text-center text-gray-400 py-4">
                          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <div>Waiting for admin response</div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-[45vh] text-gray-400">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <div>Select a message to view details</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}