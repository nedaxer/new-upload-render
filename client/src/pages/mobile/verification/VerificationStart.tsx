import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import MobileLayout from '@/components/mobile-layout';
import hikerImage from '@assets/first image_1751118123626.jpg';

interface VerificationStartProps {
  onNext: () => void;
  onClose: () => void;
}

export const VerificationStart: React.FC<VerificationStartProps> = ({ onNext, onClose }) => {
  const { user } = useAuth();
  
  // Get user's full name or fallback to username
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'User';

  return (
    <MobileLayout hideBottomNav>
      {/* Header - No title label as requested */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="w-6 h-6"></div> {/* Spacer for centering */}
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* No progress bar on first screen as requested */}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Illustration */}
        <div className="mb-8">
          <img 
            src={hikerImage} 
            alt="Identity verification" 
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

        {/* CTA Button */}
        <Button 
          onClick={onNext}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 text-base rounded-full mb-8"
        >
          Let's Do It
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