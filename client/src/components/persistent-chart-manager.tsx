import { useEffect, useRef, useState } from 'react';

interface PersistentChartManagerProps {
  children: React.ReactNode;
  isActive: boolean;
  chartId: string;
}

// Global chart container management
const chartContainers = new Map<string, HTMLDivElement>();
const chartInstances = new Map<string, any>();

export function PersistentChartManager({ children, isActive, chartId }: PersistentChartManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get or create persistent container
    let persistentContainer = chartContainers.get(chartId);
    
    if (!persistentContainer) {
      // Create a new persistent container that stays in DOM
      persistentContainer = document.createElement('div');
      persistentContainer.style.width = '100%';
      persistentContainer.style.height = '100%';
      persistentContainer.style.position = 'absolute';
      persistentContainer.style.top = '0';
      persistentContainer.style.left = '0';
      persistentContainer.id = `persistent-chart-${chartId}`;
      
      // Add to body to keep it persistent
      document.body.appendChild(persistentContainer);
      chartContainers.set(chartId, persistentContainer);
    }

    // Move persistent container to current mount point
    if (isActive && persistentContainer.parentNode !== containerRef.current) {
      containerRef.current.appendChild(persistentContainer);
      persistentContainer.style.display = 'block';
      setIsInitialized(true);
    } else if (!isActive && persistentContainer.parentNode === containerRef.current) {
      // Hide but don't remove from DOM
      persistentContainer.style.display = 'none';
      document.body.appendChild(persistentContainer);
    }

    return () => {
      // Don't cleanup on unmount - keep chart persistent
    };
  }, [chartId, isActive]);

  // Cleanup on component unmount (when app closes)
  useEffect(() => {
    return () => {
      const persistentContainer = chartContainers.get(chartId);
      if (persistentContainer && persistentContainer.parentNode) {
        persistentContainer.parentNode.removeChild(persistentContainer);
        chartContainers.delete(chartId);
        chartInstances.delete(chartId);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        display: isActive ? 'block' : 'none'
      }}
    >
      {isActive && isInitialized && children}
    </div>
  );
}

// Hook to manage chart instance persistence
export function usePersistentChart(chartId: string) {
  const getInstance = () => chartInstances.get(chartId);
  const setInstance = (instance: any) => chartInstances.set(chartId, instance);
  const hasInstance = () => chartInstances.has(chartId);

  return { getInstance, setInstance, hasInstance };
}