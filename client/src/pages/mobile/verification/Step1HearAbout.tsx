import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

interface Step1HearAboutProps {
  onNext: (value: string) => void;
  onBack: () => void;
  onClose: () => void;
  initialValue?: string;
}

const options = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'advertisements', label: 'Advertisements' },
  { value: 'from_friend', label: 'From a Friend' },
  { value: 'search_engine', label: 'Search Engine' },
  { value: 'news_article', label: 'News Article' },
  { value: 'other', label: 'Other' }
];

export const Step1HearAbout: React.FC<Step1HearAboutProps> = ({ 
  onNext, 
  onBack, 
  onClose, 
  initialValue 
}) => {
  const [selectedOption, setSelectedOption] = useState(initialValue || '');

  const handleNext = () => {
    if (selectedOption) {
      onNext(selectedOption);
    }
  };

  const handleSkip = () => {
    onNext('');
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-white text-lg font-semibold">Profile</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full w-2/6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          How did you hear about Nedaxer?
        </h2>
        
        <p className="text-gray-400 text-center mb-8 text-sm">
          Help us understand how you discovered our platform
        </p>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedOption(option.value)}
              className={`w-full p-4 rounded-lg border text-left transition-all ${
                selectedOption === option.value
                  ? 'border-green-500 bg-green-500/10 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {selectedOption === option.value && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleNext}
            disabled={!selectedOption}
            className={`w-full py-4 text-lg font-semibold rounded-full ${
              selectedOption 
                ? 'bg-green-500 hover:bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </Button>
          
          <Button 
            onClick={handleSkip}
            variant="ghost"
            className="w-full py-4 text-lg text-gray-400 hover:text-white"
          >
            Skip
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};