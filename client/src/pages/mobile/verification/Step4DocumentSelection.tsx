import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, FileText, CreditCard, Home } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

interface Step4DocumentSelectionProps {
  onNext: (documentType: string) => void;
  onBack: () => void;
  onClose: () => void;
  initialValue?: string;
}

const documentTypes = [
  {
    value: 'passport',
    label: 'Passport',
    description: 'Only the face-side is required.',
    icon: FileText
  },
  {
    value: 'driving_license',
    label: 'Driving License',
    description: 'Two files required. One for each side',
    icon: CreditCard
  },
  {
    value: 'residence_permit',
    label: 'Residence Permit',
    description: 'Two files required. One for each side',
    icon: Home
  }
];

export const Step4DocumentSelection: React.FC<Step4DocumentSelectionProps> = ({ 
  onNext, 
  onBack, 
  onClose, 
  initialValue 
}) => {
  const [selectedType, setSelectedType] = useState(initialValue || '');

  const handleSelect = (type: string) => {
    setSelectedType(type);
    onNext(type);
  };

  return (
    <MobileLayout hideBottomNav>
      {/* Header - No title label */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="w-6 h-6"></div> {/* Spacer for centering */}
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar - Orange color */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full w-5/6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Title - Smaller font */}
        <h2 className="text-lg font-semibold text-white text-center mb-2">
          Verify Your Identity
        </h2>
        
        <p className="text-gray-400 text-center mb-8 text-sm">
          Choose your document type
        </p>

        {/* Document Types - Neutral styling */}
        <div className="space-y-4 mb-8">
          {documentTypes.map((docType) => {
            const IconComponent = docType.icon;
            return (
              <button
                key={docType.value}
                onClick={() => handleSelect(docType.value)}
                className="w-full p-4 border border-gray-600 rounded-lg text-left hover:border-orange-400 transition-all"
              >
                <div className="flex items-center space-x-4">
                  <IconComponent className="w-6 h-6 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{docType.label}</h3>
                    <p className="text-gray-400 text-sm">{docType.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <p className="text-gray-300 text-sm text-center">
            Your information will be encrypted, stored securely and only used to verify your identity
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};