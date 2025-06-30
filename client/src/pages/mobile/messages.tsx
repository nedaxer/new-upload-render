import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { ArrowLeft, MessageSquare, Clock, User, Eye, EyeOff, Reply, AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ContactMessage {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  isRead: boolean;
  hasReply: boolean;
  adminReply?: string;
  adminReplyAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    profilePicture?: string;
    username?: string;
  };
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Fetch user's contact messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/user/contact-messages'],
    enabled: !!user,
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest(`/api/user/contact-messages/${messageId}/read`, {
        method: 'PATCH',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/contact-messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      toast({
        title: "Message marked as read",
        description: "The message has been marked as read successfully.",
      });
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical': return <AlertCircle className="w-4 h-4 text-blue-400" />;
      case 'billing': return <MessageSquare className="w-4 h-4 text-green-400" />;
      case 'general': return <User className="w-4 h-4 text-gray-400" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a2e] text-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading your messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a2e] text-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-white/10">
        <Link href="/mobile/home">
          <Button variant="ghost" size="sm" className="mr-3 text-white hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Messages</h1>
          <p className="text-sm text-gray-400">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Messages List */}
        <div className="w-full lg:w-1/2 border-r border-white/10">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">No Messages</h3>
                  <p className="text-gray-300 mb-4">You haven't sent any contact messages yet.</p>
                  <Link href="/company/contact">
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      Send Message
                    </Button>
                  </Link>
                </div>
              ) : (
                messages.map((message: ContactMessage) => (
                  <Card
                    key={message._id}
                    className={`cursor-pointer transition-all duration-200 border-white/20 ${
                      selectedMessage?._id === message._id
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedMessage(message)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(message.category)}
                          <span className="text-gray-300 text-sm capitalize">{message.category}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {!message.isRead && (
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
                      
                      <div className="text-gray-300 text-xs line-clamp-2 mb-3">
                        {message.message}
                      </div>
                      
                      {message.hasReply && message.adminReply && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <Reply className="w-3 h-3 text-blue-400" />
                            <span className="text-blue-400 text-xs font-medium">Admin Reply</span>
                          </div>
                          <div className="text-gray-300 text-xs line-clamp-2">
                            {message.adminReply}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                        {message.hasReply && (
                          <div className="flex items-center space-x-1 text-blue-400">
                            <Reply className="w-3 h-3" />
                            <span>Replied</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Message Details */}
        <div className="w-full lg:w-1/2">
          <ScrollArea className="h-full">
            {selectedMessage ? (
              <div className="p-6">
                <Card className="bg-white/5 border-white/20">
                  <CardContent className="p-6">
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedMessage.user?.profilePicture} />
                          <AvatarFallback className="bg-orange-500 text-white">
                            {selectedMessage.firstName[0]}{selectedMessage.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white font-medium">
                            {selectedMessage.firstName} {selectedMessage.lastName}
                          </div>
                          <div className="text-gray-400 text-sm">{selectedMessage.email}</div>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                      <div className="text-gray-300 text-sm mb-1">Subject</div>
                      <div className="text-white text-lg font-medium">{selectedMessage.subject}</div>
                    </div>

                    {/* Original Message */}
                    <div className="mb-6">
                      <div className="text-gray-300 text-sm mb-2">Message</div>
                      <div className="bg-white/5 rounded-lg p-4 text-white whitespace-pre-wrap">
                        {selectedMessage.message}
                      </div>
                    </div>

                    {/* Admin Reply */}
                    {selectedMessage.hasReply && selectedMessage.adminReply && (
                      <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <Reply className="w-4 h-4 text-blue-400" />
                          <div className="text-blue-400 text-sm font-medium">Admin Reply</div>
                          <div className="text-gray-400 text-xs">
                            {selectedMessage.adminReplyAt && formatDate(selectedMessage.adminReplyAt)}
                          </div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-white whitespace-pre-wrap">
                          {selectedMessage.adminReply}
                        </div>
                      </div>
                    )}

                    {/* Message Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/20 pt-4">
                      <div>
                        <div className="text-gray-300 mb-1">Category</div>
                        <div className="text-white capitalize">{selectedMessage.category}</div>
                      </div>
                      <div>
                        <div className="text-gray-300 mb-1">Status</div>
                        <div className="flex items-center space-x-2">
                          {selectedMessage.isRead ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-white">
                            {selectedMessage.isRead ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-300 mb-1">Sent</div>
                        <div className="text-white">{formatDate(selectedMessage.createdAt)}</div>
                      </div>
                      <div>
                        <div className="text-gray-300 mb-1">Last Updated</div>
                        <div className="text-white">{formatDate(selectedMessage.updatedAt)}</div>
                      </div>
                    </div>

                    {/* Mark as Read Button */}
                    {!selectedMessage.isRead && (
                      <div className="pt-4 border-t border-white/20 mt-4">
                        <Button
                          onClick={() => markAsReadMutation.mutate(selectedMessage._id)}
                          disabled={markAsReadMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {markAsReadMutation.isPending ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Select a Message</h3>
                  <p className="text-gray-300">Choose a message from the list to view details</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}