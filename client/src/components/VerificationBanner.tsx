import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface VerificationBannerProps {
  userName: string;
  onVerifyClick: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ userName, onVerifyClick }) => {
  const { user } = useAuth();
  
  // Determine progress based on user verification data
  const hasCompletedQuestionnaire = user?.verificationData?.sourceOfIncome && 
                                   user?.verificationData?.annualIncome && 
                                   user?.verificationData?.investmentExperience;
  
  const hasCompletedDocuments = user?.verificationData?.documents;

  return (
    <div className="mx-4 mb-4 p-4 bg-orange-500 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-lg mb-2">
          {userName}, is it really you?
        </h3>
        <p className="text-orange-100 text-sm mb-3">
          Verifying your identity helps us prevent someone else from creating an account in your name.
        </p>
        
        {/* Progress Indicators */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          {/* Step 1 - Always completed when banner shows */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-orange-100 mt-1">Started</span>
          </div>
          
          {/* Connector Line */}
          <div className="w-8 h-px bg-orange-300"></div>
          
          {/* Step 2 - Questionnaire */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
              hasCompletedQuestionnaire 
                ? 'bg-orange-600 border-orange-600' 
                : 'border-orange-300 bg-transparent'
            }`}>
              <span className={`text-lg font-bold ${
                hasCompletedQuestionnaire ? 'text-white' : 'text-orange-200'
              }`}>
                2
              </span>
            </div>
            <span className="text-xs text-orange-100 mt-1">Forms</span>
          </div>
          
          {/* Connector Line */}
          <div className="w-8 h-px bg-orange-300"></div>
          
          {/* Step 3 - Documents */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
              hasCompletedDocuments 
                ? 'bg-orange-600 border-orange-600' 
                : 'border-gray-400 bg-transparent'
            }`}>
              <span className={`text-lg font-bold ${
                hasCompletedDocuments ? 'text-white' : 'text-gray-400'
              }`}>
                3
              </span>
            </div>
            <span className="text-xs text-orange-100 mt-1">Docs</span>
          </div>
        </div>
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