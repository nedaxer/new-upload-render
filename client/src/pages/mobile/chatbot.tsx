import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Globe, Power, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '中文(马来西亚)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '中文繁体' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'es', name: 'Spanish (International)', nativeName: 'Español (Internacional)' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)' }
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showEndChatDialog, setShowEndChatDialog] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: '1',
      text: "Hello there! I'm Nedaxer Bot, how can I assist you today?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.text,
          language: selectedLanguage.code,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get bot response');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageSelector(false);
    toast({
      title: "Language Changed",
      description: `Chat language changed to ${language.name}`,
    });
  };

  const handleEndChat = () => {
    setShowEndChatDialog(false);
    // Save current conversation to history
    const chatSession = {
      id: Date.now().toString(),
      messages,
      timestamp: new Date(),
      language: selectedLanguage.code
    };
    
    // Save to localStorage for chat history
    const existingHistory = JSON.parse(localStorage.getItem('nedaxer_chat_history') || '[]');
    localStorage.setItem('nedaxer_chat_history', JSON.stringify([chatSession, ...existingHistory]));
    
    // Clear current conversation
    setMessages([{
      id: '1',
      text: "Hello there! I'm Nedaxer Bot, how can I assist you today?",
      isUser: false,
      timestamp: new Date()
    }]);
    
    toast({
      title: "Chat Ended",
      description: "Your chat history has been saved for future reference.",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (showChatHistory) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Chat History Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <button onClick={() => setShowChatHistory(false)}>
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold">Chat History</h1>
          <div className="w-6 h-6" />
        </div>

        {/* Chat History List */}
        <div className="p-4 space-y-3">
          {JSON.parse(localStorage.getItem('nedaxer_chat_history') || '[]').map((session: any) => (
            <Card key={session.id} className="bg-gray-900 border-gray-700 p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-medium text-sm">
                  Chat Session - {languages.find(l => l.code === session.language)?.name || 'English'}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(session.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-400 text-xs mb-2">
                {session.messages.length} messages
              </p>
              <div className="text-gray-500 text-xs">
                Last message: {session.messages[session.messages.length - 1]?.text.substring(0, 50)}...
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="/mobile">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
        <h1 className="text-lg font-semibold">24/7 Dedicated Support</h1>
        <div className="flex items-center space-x-3">
          <button onClick={() => setShowLanguageSelector(true)}>
            <Globe className="w-6 h-6 text-gray-400" />
          </button>
          <button onClick={() => setShowEndChatDialog(true)}>
            <Power className="w-6 h-6 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Chat History Button */}
      <div className="px-4 py-2 border-b border-gray-800">
        <button 
          onClick={() => setShowChatHistory(true)}
          className="flex items-center space-x-2 text-gray-400 text-sm"
        >
          <Clock className="w-4 h-4" />
          <span>View Chat History</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-70">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex space-x-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Drop your question(s) here"
            className="flex-1 bg-gray-900 border-gray-700 text-white placeholder-gray-400"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputText.trim()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="w-full bg-gray-900 rounded-t-lg p-4 max-h-[70vh] overflow-y-auto">
            <h2 className="text-white text-lg font-semibold mb-4">Select Language</h2>
            <div className="space-y-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedLanguage.code === language.code
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{language.nativeName}</span>
                    {selectedLanguage.code === language.code && (
                      <span className="text-orange-200">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <Button
              onClick={() => setShowLanguageSelector(false)}
              variant="outline"
              className="w-full mt-4 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* End Chat Dialog */}
      {showEndChatDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-white text-lg font-semibold mb-2">
              Would you like to end this chat?
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Your chat history will be saved for future reference. Even after closing the
              chat window, you can return to this thread to address any additional concerns.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleEndChat}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                End Chat
              </Button>
              <Button
                onClick={() => setShowEndChatDialog(false)}
                variant="outline"
                className="w-full border-gray-600 text-gray-300"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}