import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield } from 'lucide-react';
import { useLocation } from 'wouter';

interface VerificationBannerProps {
  userName: string;
  onVerifyClick: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ userName, onVerifyClick }) => {
  return (
    <div className="mx-4 mb-4 p-6 bg-[#f8f9fa] rounded-lg">
      <div className="text-center">
        <h3 className="text-black font-bold text-xl mb-3">
          {userName}, is it really you?
        </h3>
        <p className="text-gray-600 text-base mb-6 leading-relaxed">
          Verifying your identity helps us prevent someone else from creating an account in your name.
        </p>
        
        <Button 
          onClick={onVerifyClick}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 text-lg rounded-full"
        >
          Verify Your Account
        </Button>
      </div>
    </div>
  );
};