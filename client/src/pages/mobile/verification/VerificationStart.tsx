import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { useLocation } from 'wouter';
import hikerImage from '@assets/first image (1)_1751120752630.png';

interface VerificationStartProps {
  onNext: () => void;
  onClose: () => void;
}

export const VerificationStart: React.FC<VerificationStartProps> = ({ onNext, onClose }) => {
  return (
    <div className="min-h-screen bg-[#0a0a2e] flex flex-col">
      {/* Header - No "Profile" text */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div></div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Content - No progress bar on first page */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Illustration */}
        <div className="mb-8">
          <img 
            src={hikerImage} 
            alt="You're on the path to investing!" 
            className="w-64 h-48 object-contain"
          />
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-4">
          You're on the path to investing!
        </h2>

        {/* Subtitle */}
        <p className="text-gray-300 text-center mb-12 px-4 leading-relaxed text-sm">
          We just need to collect some details to fully activate your account.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onNext}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-base rounded-full mb-8"
        >
          Let's Do It
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
          We rely on you for accurate information. Keep us informed of any material changes. 
          We may not be able to provide our services when you choose not to provide the required information.
        </p>
      </div>
    </div>
  );
};