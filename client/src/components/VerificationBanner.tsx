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
    <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 mb-3">
        <Shield className="w-6 h-6 text-white" />
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg">
            {userName}, is it really you?
          </h3>
          <p className="text-white/90 text-sm">
            We need to verify your identity to keep your account secure
          </p>
        </div>
      </div>
      
      <Button 
        onClick={onVerifyClick}
        className="w-full bg-white text-orange-600 hover:bg-gray-100 font-semibold py-3"
      >
        Verify Your Account
      </Button>
    </div>
  );
};