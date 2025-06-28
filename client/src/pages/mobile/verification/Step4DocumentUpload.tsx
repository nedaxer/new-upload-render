import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X, Upload } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

interface DocumentFiles {
  front?: File;
  back?: File;
  single?: File;
}

interface Step4DocumentUploadProps {
  documentType: string;
  onNext: (files: DocumentFiles) => void;
  onBack: () => void;
  onClose: () => void;
  initialFiles?: DocumentFiles;
}

export const Step4DocumentUpload: React.FC<Step4DocumentUploadProps> = ({ 
  documentType, 
  onNext, 
  onBack, 
  onClose, 
  initialFiles 
}) => {
  const [files, setFiles] = useState<DocumentFiles>(initialFiles || {});
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);

  const isPassport = documentType === 'passport';
  const requiresTwoSides = documentType === 'driving_license' || documentType === 'residence_permit';

  const getTitle = () => {
    switch (documentType) {
      case 'passport':
        return 'Upload your Passport';
      case 'driving_license':
        return 'Upload your Driving License';
      case 'residence_permit':
        return 'Upload your Residence Permit';
      default:
        return 'Upload your Document';
    }
  };

  const handleFileSelect = (type: 'front' | 'back' | 'single', file: File) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleNext = () => {
    if (isPassport && files.single) {
      onNext({ single: files.single });
    } else if (requiresTwoSides && files.front && files.back) {
      onNext({ front: files.front, back: files.back });
    }
  };

  const canProceed = isPassport ? !!files.single : (!!files.front && !!files.back);

  const DocumentUploadBox = ({ 
    type, 
    label, 
    file, 
    inputRef 
  }: { 
    type: 'front' | 'back' | 'single'; 
    label: string; 
    file?: File; 
    inputRef: React.RefObject<HTMLInputElement> 
  }) => (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) {
            handleFileSelect(type, selectedFile);
          }
        }}
        className="hidden"
      />
      
      <div className="flex flex-col items-center space-y-3">
        <Upload className="w-12 h-12 text-gray-500" />
        <div>
          <p className="text-white font-medium">{label}</p>
          {file ? (
            <p className="text-orange-500 text-sm mt-1">✓ {file.name}</p>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              className="text-orange-500 text-sm hover:text-orange-400"
            >
              Upload document
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
          {getTitle()}
        </h2>
        
        {requiresTwoSides && (
          <p className="text-gray-400 text-center mb-8 text-sm">
            Two files required. One for each side
          </p>
        )}

        {/* Upload Areas */}
        <div className="space-y-6 mb-8">
          {isPassport ? (
            <DocumentUploadBox
              type="single"
              label="Upload document"
              file={files.single}
              inputRef={singleInputRef}
            />
          ) : (
            <>
              <DocumentUploadBox
                type="front"
                label="Front side"
                file={files.front}
                inputRef={frontInputRef}
              />
              <DocumentUploadBox
                type="back"
                label="Back side"
                file={files.back}
                inputRef={backInputRef}
              />
            </>
          )}
        </div>

        {/* Instructions */}
        <p className="text-gray-400 text-center mb-8 text-sm">
          Please tap "next" to save your documents
        </p>

        {/* Next Button - Orange accent */}
        <Button 
          onClick={handleNext}
          disabled={!canProceed}
          className={`w-full py-4 text-base font-medium rounded-full ${
            canProceed 
              ? 'bg-orange-500 hover:bg-orange-600 text-white' 
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next
        </Button>
      </div>
    </MobileLayout>
  );
};