import { useEffect, useRef } from 'react';
import { usePersistentChart } from './persistent-chart-manager';

export function GlobalChartContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { initializeChartState } = usePersistentChart();

  useEffect(() => {
    // Initialize chart state on app load
    initializeChartState();
  }, [initializeChartState]);

  return (
    <div 
      id="global-chart-container"
      ref={containerRef}
      className="fixed top-[-9999px] left-[-9999px] w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    >
      {/* This container holds the chart when it's not visible */}
    </div>
  );
}