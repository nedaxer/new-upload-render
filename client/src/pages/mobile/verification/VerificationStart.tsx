import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import MobileLayout from '@/components/mobile-layout';
import professionalImage from '@assets/Picsart_25-06-28_15-49-20-738 (1)_1751125238732.png';

interface VerificationStartProps {
  onNext: () => void;
  onClose: () => void;
}

export const VerificationStart: React.FC<VerificationStartProps> = ({ onNext, onClose }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Get user's full name or fallback to username
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'User';

  const handleNext = async () => {
    setIsLoading(true);
    // Add loading delay for professional UX
    await new Promise(resolve => setTimeout(resolve, 800));
    onNext();
  };

  return (
    <MobileLayout hideBottomNav>
      {/* Header - No X button, only back arrow */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="w-6 h-6"></div> {/* Spacer for centering */}
        <div className="w-6 h-6"></div> {/* No X button */}
      </div>

      {/* No progress bar on first screen */}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Professional Illustration */}
        <div className="mb-8">
          <img 
            src={professionalImage} 
            alt="Professional verification" 
            className="w-64 h-48 object-contain"
          />
        </div>

        {/* Title with user's full name */}
        <h2 className="text-xl font-semibold text-white text-center mb-4">
          {displayName}, is it really you?
        </h2>

        {/* Subtitle */}
        <p className="text-gray-300 text-center mb-12 px-4 text-sm leading-relaxed">
          We just need to collect some details to fully activate your account.
        </p>

        {/* CTA Button with loading state */}
        <Button 
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 text-base rounded-full mb-8 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Let's Do It"}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
          We rely on you for accurate information. Keep us informed of any material changes. 
          We may not be able to provide our services when you choose not to provide the required information.
        </p>
      </div>
    </MobileLayout>
  );
};