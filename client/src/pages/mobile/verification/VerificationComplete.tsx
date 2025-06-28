import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

interface VerificationCompleteProps {
  onContinue: () => void;
}

export const VerificationComplete: React.FC<VerificationCompleteProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-[#0a0a2e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <div className="w-6 h-6" />
        <h1 className="text-white text-base font-medium">Verification</h1>
        <div className="w-6 h-6" />
      </div>

      {/* Progress Bar - Complete */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full w-full"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-white text-center mb-4">
          Thank you!
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-center mb-12 px-4 leading-relaxed text-sm">
          Your profile has been submitted and is under verification.
        </p>

        {/* Continue Button */}
        <Button 
          onClick={onContinue}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 text-base rounded-full"
        >
          Continue to home page
        </Button>

        {/* Additional Info */}
        <div className="mt-8 bg-gray-800/50 p-4 rounded-lg">
          <p className="text-gray-400 text-sm text-center">
            We'll notify you once your verification is complete. 
            This process typically takes 24-48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};