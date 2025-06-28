import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';

interface Step2DateOfBirthProps {
  onNext: (value: { day: number; month: number; year: number }) => void;
  onBack: () => void;
  onClose: () => void;
  initialValue?: { day: number; month: number; year: number };
}

export const Step2DateOfBirth: React.FC<Step2DateOfBirthProps> = ({ 
  onNext, 
  onBack, 
  onClose, 
  initialValue 
}) => {
  const [day, setDay] = useState(initialValue?.day || 1);
  const [month, setMonth] = useState(initialValue?.month || 1);
  const [year, setYear] = useState(initialValue?.year || new Date().getFullYear() - 18);

  const handleNext = () => {
    onNext({ day, month, year });
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
  };

  const isValid = day && month && year;

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
          <div className="bg-orange-500 h-2 rounded-full w-3/6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Title - Reduced font size */}
        <h2 className="text-lg font-bold text-white text-center mb-8">
          What is your date of birth?
        </h2>

        {/* Date Picker */}
        <div className="grid grid-cols-3 gap-4 mb-16">
          {/* Day */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Day</p>
            <select
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="w-full bg-transparent text-white text-xl font-light text-center border-none outline-none appearance-none"
              style={{ fontSize: '1.25rem' }}
            >
              {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1).map(d => (
                <option key={d} value={d} className="bg-[#0a0a2e]">{d}</option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Month</p>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full bg-transparent text-white text-xl font-light text-center border-none outline-none appearance-none"
              style={{ fontSize: '1.25rem' }}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m} className="bg-[#0a0a2e]">
                  {new Date(2000, m - 1).toLocaleDateString('en', { month: 'short' })}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Year</p>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full bg-transparent text-white text-xl font-light text-center border-none outline-none appearance-none"
              style={{ fontSize: '1.25rem' }}
            >
              {getYears().map(y => (
                <option key={y} value={y} className="bg-[#0a0a2e]">{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Next Button */}
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
  );
};