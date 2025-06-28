import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import hikerImage from '@assets/Picsart_25-06-28_15-49-20-738 (1)_1751122763615.png';

interface VerificationIntroProps {
  userName: string;
  onNext: () => void;
  onClose: () => void;
}

export const VerificationIntro: React.FC<VerificationIntroProps> = ({ userName, onNext, onClose }) => {
  return (
    <div className="min-h-screen bg-[#0a0a2e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="w-6 h-6" />
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Illustration */}
        <div className="mb-8">
          <img 
            src={hikerImage} 
            alt="Verification illustration" 
            className="w-64 h-48 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-4">
          {userName}, is it really you?
        </h2>

        {/* Description */}
        <p className="text-gray-300 text-center mb-12 px-4 leading-relaxed text-sm">
          Verifying your identity helps us prevent someone else from creating an account in your name.
        </p>

        {/* Verify Button */}
        <Button 
          onClick={onNext}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 text-lg rounded-full max-w-sm"
        >
          Verify Your Account
        </Button>
      </div>
    </div>
  );
};