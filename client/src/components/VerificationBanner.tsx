import React from 'react';
import { Button } from '@/components/ui/button';

interface VerificationBannerProps {
  userName: string;
  onVerifyClick: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ userName, onVerifyClick }) => {
  return (
    <div className="mx-4 mb-4 p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-gray-900 font-semibold text-lg mb-2">
          {userName}, is it really you?
        </h3>
        <p className="text-gray-600 text-sm">
          Verifying your identity helps us prevent someone else from creating an account in your name.
        </p>
      </div>
      
      <Button 
        onClick={onVerifyClick}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full"
      >
        Verify Your Account
      </Button>
    </div>
  );
};