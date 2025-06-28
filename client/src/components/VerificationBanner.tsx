import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface VerificationBannerProps {
  userName: string;
  onVerifyClick: () => void;
  questionsCompleted?: boolean;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ 
  userName, 
  onVerifyClick,
  questionsCompleted = false 
}) => {
  return (
    <div className="mx-4 mb-4 p-4 bg-orange-500 rounded-lg shadow-lg">
      {/* Progress indicators */}
      <div className="flex items-center justify-center mb-4 space-x-4">
        {/* Step 1 - Questions (always completed when shown) */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500">
          <Check className="w-6 h-6 text-white" />
        </div>
        
        <div className="w-8 h-1 bg-gray-300 rounded"></div>
        
        {/* Step 2 - Documents */}
        <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
          questionsCompleted 
            ? 'bg-orange-500 border-orange-500 text-white' 
            : 'border-gray-300 text-gray-300'
        }`}>
          <span className="text-lg font-semibold">2</span>
        </div>
        
        <div className="w-8 h-1 bg-gray-300 rounded"></div>
        
        {/* Step 3 - Review */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 text-gray-300">
          <span className="text-lg font-semibold">3</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg mb-2">
          {userName}, is it really you?
        </h3>
        <p className="text-orange-100 text-sm">
          Verifying your identity helps us prevent someone else from creating an account in your name.
        </p>
      </div>
      
      <Button 
        onClick={onVerifyClick}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-full"
      >
        Verify Your Account
      </Button>
    </div>
  );
};