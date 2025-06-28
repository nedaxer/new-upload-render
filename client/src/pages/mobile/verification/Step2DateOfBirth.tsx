import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import MobileLayout from '@/components/mobile-layout';

interface Step2DateOfBirthProps {
  onNext: (dateOfBirth: { day: number; month: number; year: number }) => void;
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
  const [day, setDay] = useState(initialValue?.day || 12);
  const [month, setMonth] = useState(initialValue?.month || 6);
  const [year, setYear] = useState(initialValue?.year || 1990);

  const handleNext = () => {
    onNext({ day, month, year });
  };

  const generateDays = () => Array.from({ length: 31 }, (_, i) => i + 1);
  const generateMonths = () => Array.from({ length: 12 }, (_, i) => i + 1);
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 100 }, (_, i) => currentYear - 18 - i);
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
          <div className="bg-green-500 h-2 rounded-full w-3/6"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white text-center mb-12">
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
              className="w-full bg-transparent text-white text-3xl font-light text-center border-none outline-none appearance-none"
              style={{ fontSize: '2rem' }}
            >
              {generateDays().map(d => (
                <option key={d} value={d} className="bg-[#0a0a2e] text-white">
                  {d.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Month</p>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full bg-transparent text-white text-3xl font-light text-center border-none outline-none appearance-none"
              style={{ fontSize: '2rem' }}
            >
              {generateMonths().map(m => (
                <option key={m} value={m} className="bg-[#0a0a2e] text-white">
                  {m.toString().padStart(2, '0')}
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
              className="w-full bg-transparent text-white text-3xl font-light text-center border-none outline-none appearance-none"
              style={{ fontSize: '2rem' }}
            >
              {generateYears().map(y => (
                <option key={y} value={y} className="bg-[#0a0a2e] text-white">
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Next Button */}
        <Button 
          onClick={handleNext}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 text-lg rounded-full"
        >
          Next
        </Button>
      </div>
    </MobileLayout>
  );
};