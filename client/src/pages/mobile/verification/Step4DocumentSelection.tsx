import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, FileText, CreditCard, MapPin } from 'lucide-react';

interface Step4DocumentSelectionProps {
  onNext: (documentType: string) => void;
  onBack: () => void;
  onClose: () => void;
  initialValue?: string;
}

export const Step4DocumentSelection: React.FC<Step4DocumentSelectionProps> = ({ 
  onNext, 
  onBack, 
  onClose, 
  initialValue 
}) => {
  const [selectedDocument, setSelectedDocument] = useState(initialValue || '');

  const handleNext = () => {
    if (selectedDocument) {
      onNext(selectedDocument);
    }
  };

  const documentTypes = [
    {
      value: 'driving_license',
      label: 'Driving License',
      icon: CreditCard,
      description: 'Government-issued driving license'
    },
    {
      value: 'passport',
      label: 'Passport',
      icon: FileText,
      description: 'Valid passport document'
    },
    {
      value: 'residence_permit',
      label: 'Residence Permit',
      icon: MapPin,
      description: 'Residence permit or ID card'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a2e] flex flex-col">
      {/* Header - No "Profile" text */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div></div>
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
        {/* Title - Reduced font size */}
        <h2 className="text-lg font-bold text-white text-center mb-4">
          Choose Document Type
        </h2>
        
        <p className="text-gray-400 text-center mb-8 text-xs">
          Select the type of document you'd like to upload
        </p>

        {/* Document Options */}
        <div className="space-y-4 mb-8">
          {documentTypes.map((doc) => {
            const Icon = doc.icon;
            return (
              <button
                key={doc.value}
                onClick={() => setSelectedDocument(doc.value)}
                className={`w-full p-4 rounded-lg border text-left transition-all ${
                  selectedDocument === doc.value
                    ? 'border-orange-500 bg-orange-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedDocument === doc.value 
                      ? 'bg-orange-500/20' 
                      : 'bg-gray-700'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      selectedDocument === doc.value 
                        ? 'text-orange-400' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-sm font-medium ${
                      selectedDocument === doc.value 
                        ? 'text-white' 
                        : 'text-gray-300'
                    }`}>
                      {doc.label}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {doc.description}
                    </p>
                  </div>
                  {selectedDocument === doc.value && (
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button 
          onClick={handleNext}
          disabled={!selectedDocument}
          className={`w-full py-3 text-base font-semibold rounded-full ${
            selectedDocument 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};