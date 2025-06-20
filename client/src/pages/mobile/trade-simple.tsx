import { MobileLayout } from '@/components/mobile-layout';
import { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import MobileSpot from './spot';
import MobileFutures from './futures';

export default function MobileTradeSimple() {
  const { t } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('Spot'); // 'Spot' or 'Futures'
  const [showChart, setShowChart] = useState(false);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    setShowChart(false);
  };

  const handleChartClick = () => {
    setShowChart(!showChart);
  };

  return (
    <MobileLayout>
      {/* Header with Navigation Tabs */}
      <div className="bg-gray-900 px-4 py-3">
        <h1 className="text-xl font-bold text-white text-center mb-4">
          {showChart ? 'Chart View' : `${selectedTab} Trading`}
        </h1>
        
        {/* Main Trade Type Tabs */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          <button 
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-colors ${
              selectedTab === 'Spot' && !showChart
                ? 'bg-orange-600 text-white rounded-md' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('Spot')}
          >
            Spot
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-colors ${
              selectedTab === 'Futures' && !showChart
                ? 'bg-orange-600 text-white rounded-md' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => handleTabChange('Futures')}
          >
            Futures
          </button>
          <button 
            className={`flex-1 py-2 px-4 text-center text-sm font-medium transition-colors flex items-center justify-center ${
              showChart
                ? 'bg-orange-600 text-white rounded-md' 
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={handleChartClick}
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Chart
          </button>
        </div>
      </div>

      {/* Chart Content */}
      {showChart && (
        <div className="flex-1 overflow-y-auto bg-gray-900">
          <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 m-4">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Trading Chart</h3>
              <p className="text-gray-500">Chart will load here</p>
            </div>
          </div>
        </div>
      )}

      {/* Spot Trading Content */}
      {selectedTab === 'Spot' && !showChart && (
        <div className="flex-1 overflow-hidden">
          <MobileSpot />
        </div>
      )}

      {/* Futures Trading Content */}
      {selectedTab === 'Futures' && !showChart && (
        <div className="flex-1 overflow-hidden">
          <MobileFutures />
        </div>
      )}
    </MobileLayout>
  );
}