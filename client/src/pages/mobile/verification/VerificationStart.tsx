import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { useLocation } from 'wouter';
import MobileLayout from '@/components/mobile-layout';
import hikerImage from '@assets/first image_1751118123626.jpg';

interface VerificationStartProps {
  onNext: () => void;
  onClose: () => void;
}

export const VerificationStart: React.FC<VerificationStartProps> = ({ onNext, onClose }) => {
  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-white text-lg font-semibold">Profile</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-1/6"></div>
        </div>
      </div>

      {/* Content */}
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
        <h2 className="text-2xl font-bold text-white text-center mb-4">
          You're on the path to investing!
        </h2>

        {/* Subtitle */}
        <p className="text-gray-300 text-center mb-12 px-4 leading-relaxed">
          We just need to collect some details to fully activate your account.
        </p>

        {/* CTA Button */}
        <Button 
          onClick={onNext}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 text-lg rounded-full mb-8"
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