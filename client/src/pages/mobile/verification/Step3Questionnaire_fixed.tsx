import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface QuestionnaireData {
  sourceOfIncome?: string;
  annualIncome?: string;
  investmentExperience?: string;
  plannedDeposit?: string;
  investmentGoal?: string;
}

interface Step3QuestionnaireProps {
  onNext: (data: QuestionnaireData) => void;
  onBack: () => void;
  onClose: () => void;
  initialValue: QuestionnaireData;
}

const questions = [
  {
    id: 'sourceOfIncome',
    title: 'What is your primary source of income?',
    options: [
      'Employment',
      'Business',
      'Investment',
      'Pension',
      'Other'
    ]
  },
  {
    id: 'annualIncome',
    title: 'What is your annual income range?',
    options: [
      'Under $25,000',
      '$25,000 - $50,000',
      '$50,000 - $100,000',
      '$100,000 - $250,000',
      'Over $250,000'
    ]
  },
  {
    id: 'investmentExperience',
    title: 'How much investment experience do you have?',
    options: [
      'None',
      'Basic (1-2 years)',
      'Intermediate (3-5 years)',
      'Advanced (5+ years)',
      'Professional'
    ]
  },
  {
    id: 'plannedDeposit',
    title: 'How much do you plan to deposit initially?',
    options: [
      'Under $1,000',
      '$1,000 - $5,000',
      '$5,000 - $25,000',
      '$25,000 - $100,000',
      'Over $100,000'
    ]
  },
  {
    id: 'investmentGoal',
    title: 'What is your primary investment goal?',
    options: [
      'Long-term growth',
      'Income generation',
      'Portfolio diversification',
      'Short-term trading',
      'Learning and education'
    ]
  }
];

export const Step3Questionnaire: React.FC<Step3QuestionnaireProps> = ({ 
  onNext, 
  onBack, 
  onClose, 
  initialValue 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireData>(initialValue);
  
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  const handleNext = () => {
    if (isLastQuestion) {
      onNext(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      onBack();
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const selectedAnswer = answers[currentQuestion.id as keyof QuestionnaireData];

  return (
    <div className="min-h-screen bg-[#0a0a2e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#0a0a2e]">
        <Button variant="ghost" size="sm" onClick={handlePrevious} className="text-white p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-white text-base font-medium">Verification</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white p-0">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-orange-500 h-2 rounded-full w-4/6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Question Counter */}
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>

        {/* Question Title */}
        <h2 className="text-lg font-semibold text-white text-center mb-8">
          {currentQuestion.title}
        </h2>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-3 rounded-lg border text-left transition-all ${
                selectedAnswer === option
                  ? 'border-orange-500 bg-orange-500/10 text-white'
                  : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{option}</span>
                {selectedAnswer === option && (
                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`w-full py-3 text-base font-semibold rounded-full ${
              selectedAnswer 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'Continue' : 'Next'}
          </Button>
          
          <Button 
            onClick={handlePrevious}
            variant="ghost"
            className="w-full py-3 text-base text-gray-400 hover:text-white"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};