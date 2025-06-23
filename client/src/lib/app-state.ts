// Global app state manager to prevent reloading features across navigation
interface AppState {
  isInitialized: boolean;
  currentUser: any;
  marketData: any;
  favoriteCoins: string[];
  preferences: any;
  chartState: {
    currentSymbol: string;
    isReady: boolean;
    widget: any;
  };
  lastUpdate: Date;
}

class AppStateManager {
  private state: AppState = {
    isInitialized: false,
    currentUser: null,
    marketData: null,
    favoriteCoins: [],
    preferences: null,
    chartState: {
      currentSymbol: 'BTCUSDT',
      isReady: false,
      widget: null
    },
    lastUpdate: new Date()
  };

  private listeners: Set<() => void> = new Set();

  // Initialize app state on first load
  init() {
    if (this.state.isInitialized) return;
    
    // Load persisted state from localStorage
    try {
      const savedFavorites = localStorage.getItem('favoriteCoins');
      if (savedFavorites) {
        this.state.favoriteCoins = JSON.parse(savedFavorites);
      }
      
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        this.state.preferences = JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.log('Failed to load persisted state:', error);
    }
    
    this.state.isInitialized = true;
    this.notifyListeners();
  }

  // Get current state
  getState(): AppState {
    return { ...this.state };
  }

  // Update specific parts of state
  updateState(updates: Partial<AppState>) {
    this.state = { ...this.state, ...updates, lastUpdate: new Date() };
    this.notifyListeners();
  }

  // Persist favorites to localStorage
  updateFavorites(favorites: string[]) {
    this.state.favoriteCoins = favorites;
    localStorage.setItem('favoriteCoins', JSON.stringify(favorites));
    this.notifyListeners();
  }

  // Persist preferences to localStorage
  updatePreferences(preferences: any) {
    this.state.preferences = preferences;
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    this.notifyListeners();
  }

  // Update market data with caching
  updateMarketData(data: any) {
    this.state.marketData = data;
    this.state.lastUpdate = new Date();
    this.notifyListeners();
  }

  // Check if market data is fresh (less than 30 seconds old)
  isMarketDataFresh(): boolean {
    if (!this.state.marketData) return false;
    const now = new Date().getTime();
    const lastUpdate = this.state.lastUpdate.getTime();
    return (now - lastUpdate) < 30000; // 30 seconds
  }

  // Chart state management
  updateChartState(chartState: Partial<AppState['chartState']>) {
    this.state.chartState = { ...this.state.chartState, ...chartState };
    this.notifyListeners();
  }

  // Subscribe to state changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Clear state on logout
  clear() {
    this.state = {
      isInitialized: false,
      currentUser: null,
      marketData: null,
      favoriteCoins: [],
      preferences: null,
      chartState: {
        currentSymbol: 'BTCUSDT',
        isReady: false,
        widget: null
      },
      lastUpdate: new Date()
    };
    this.notifyListeners();
  }
}

export const appStateManager = new AppStateManager();

// React hook to use app state
import { useState, useEffect } from 'react';

export function useAppState() {
  const [state, setState] = useState(appStateManager.getState());

  useEffect(() => {
    appStateManager.init();
    setState(appStateManager.getState());
    
    const unsubscribe = appStateManager.subscribe(() => {
      setState(appStateManager.getState());
    });

    return unsubscribe;
  }, []);

  return {
    state,
    updateState: appStateManager.updateState.bind(appStateManager),
    updateFavorites: appStateManager.updateFavorites.bind(appStateManager),
    updatePreferences: appStateManager.updatePreferences.bind(appStateManager),
    updateMarketData: appStateManager.updateMarketData.bind(appStateManager),
    isMarketDataFresh: appStateManager.isMarketDataFresh.bind(appStateManager),
    updateChartState: appStateManager.updateChartState.bind(appStateManager),
    clear: appStateManager.clear.bind(appStateManager)
  };
}