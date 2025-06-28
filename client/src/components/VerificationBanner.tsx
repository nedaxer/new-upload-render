import React from 'react';
import { Button } from '@/components/ui/button';

interface VerificationBannerProps {
  userName: string;
  onVerifyClick: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ userName, onVerifyClick }) => {
  return (
    <div className="mx-4 mb-4 p-4 bg-orange-500 rounded-lg shadow-lg">
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