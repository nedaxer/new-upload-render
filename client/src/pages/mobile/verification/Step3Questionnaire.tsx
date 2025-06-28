import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface Step3QuestionnaireProps {
  onNext: (data: {
    sourceOfIncome: string;
    annualIncome: string;
    investmentExperience: string;
    plannedDeposit: string;
    investmentGoal: string;
  }) => void;
  onBack: () => void;
  onClose: () => void;
  initialValue?: {
    sourceOfIncome?: string;
    annualIncome?: string;
    investmentExperience?: string;
    plannedDeposit?: string;
    investmentGoal?: string;
  };
}

export const Step3Questionnaire: React.FC<Step3QuestionnaireProps> = ({ 
  onNext, 
  onBack, 
  onClose, 
  initialValue 
}) => {
  const [sourceOfIncome, setSourceOfIncome] = useState(initialValue?.sourceOfIncome || '');
  const [annualIncome, setAnnualIncome] = useState(initialValue?.annualIncome || '');
  const [investmentExperience, setInvestmentExperience] = useState(initialValue?.investmentExperience || '');
  const [plannedDeposit, setPlannedDeposit] = useState(initialValue?.plannedDeposit || '');
  const [investmentGoal, setInvestmentGoal] = useState(initialValue?.investmentGoal || '');

  const handleNext = () => {
    onNext({
      sourceOfIncome,
      annualIncome,
      investmentExperience,
      plannedDeposit,
      investmentGoal
    });
  };

  const isValid = sourceOfIncome && annualIncome && investmentExperience && plannedDeposit && investmentGoal;

  const incomeOptions = [
    { value: 'employment', label: 'Employment' },
    { value: 'self_employed', label: 'Self-employed' },
    { value: 'investments', label: 'Investments' },
    { value: 'pension', label: 'Pension' },
    { value: 'other', label: 'Other' }
  ];

  const annualIncomeOptions = [
    { value: 'under_25k', label: 'Under $25,000' },
    { value: '25k_50k', label: '$25,000 - $50,000' },
    { value: '50k_100k', label: '$50,000 - $100,000' },
    { value: '100k_250k', label: '$100,000 - $250,000' },
    { value: 'over_250k', label: 'Over $250,000' }
  ];

  const experienceOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'experienced', label: 'Experienced' },
    { value: 'professional', label: 'Professional trader' }
  ];

  const depositOptions = [
    { value: 'under_1k', label: 'Under $1,000' },
    { value: '1k_5k', label: '$1,000 - $5,000' },
    { value: '5k_25k', label: '$5,000 - $25,000' },
    { value: '25k_100k', label: '$25,000 - $100,000' },
    { value: 'over_100k', label: 'Over $100,000' }
  ];

  const goalOptions = [
    { value: 'growth', label: 'Long-term growth' },
    { value: 'income', label: 'Regular income' },
    { value: 'speculation', label: 'Short-term speculation' },
    { value: 'diversification', label: 'Portfolio diversification' }
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
          <div className="bg-orange-500 h-2 rounded-full w-4/6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {/* Title - Reduced font size */}
        <h2 className="text-lg font-bold text-white text-center mb-4">
          Investment Profile
        </h2>
        
        <p className="text-gray-400 text-center mb-6 text-xs">
          Help us understand your investment profile
        </p>

        {/* Questions */}
        <div className="space-y-6">
          {/* Source of Income */}
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Primary source of income</h3>
            <div className="space-y-2">
              {incomeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSourceOfIncome(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    sourceOfIncome === option.value
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Annual Income */}
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Annual income</h3>
            <div className="space-y-2">
              {annualIncomeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setAnnualIncome(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    annualIncome === option.value
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Experience */}
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Investment experience</h3>
            <div className="space-y-2">
              {experienceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setInvestmentExperience(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    investmentExperience === option.value
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Planned Deposit */}
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Planned initial deposit</h3>
            <div className="space-y-2">
              {depositOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPlannedDeposit(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    plannedDeposit === option.value
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Investment Goal */}
          <div>
            <h3 className="text-white text-sm font-medium mb-3">Primary investment goal</h3>
            <div className="space-y-2">
              {goalOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setInvestmentGoal(option.value)}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    investmentGoal === option.value
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Next Button */}
        <div className="mt-8 mb-6">
          <Button 
            onClick={handleNext}
            disabled={!isValid}
            className={`w-full py-3 text-base font-semibold rounded-full ${
              isValid 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};