// Navigation cache to prevent component reinitialization
interface NavigationState {
  currentRoute: string;
  previousRoute: string;
  componentCache: Map<string, any>;
  preservedStates: Map<string, any>;
}

class NavigationCache {
  private state: NavigationState = {
    currentRoute: '',
    previousRoute: '',
    componentCache: new Map(),
    preservedStates: new Map()
  };

  // Update current route and preserve previous state
  updateRoute(newRoute: string) {
    this.state.previousRoute = this.state.currentRoute;
    this.state.currentRoute = newRoute;
  }

  // Preserve component state
  preserveComponentState(route: string, state: any) {
    this.state.preservedStates.set(route, { ...state, timestamp: Date.now() });
  }

  // Get preserved component state
  getPreservedState(route: string): any {
    const preserved = this.state.preservedStates.get(route);
    if (preserved && (Date.now() - preserved.timestamp) < 300000) { // 5 minutes
      return preserved;
    }
    return null;
  }

  // Cache component instance
  cacheComponent(route: string, component: any) {
    this.state.componentCache.set(route, component);
  }

  // Get cached component
  getCachedComponent(route: string) {
    return this.state.componentCache.get(route);
  }

  // Clear cache for specific route
  clearRoute(route: string) {
    this.state.componentCache.delete(route);
    this.state.preservedStates.delete(route);
  }

  // Clear all cache
  clearAll() {
    this.state.componentCache.clear();
    this.state.preservedStates.clear();
    this.state.currentRoute = '';
    this.state.previousRoute = '';
  }

  // Check if returning to previous route
  isReturningToPrevious(route: string): boolean {
    return this.state.previousRoute === route;
  }
}

export const navigationCache = new NavigationCache();

// React hook for navigation cache
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

export function useNavigationCache(routeKey: string) {
  const [location] = useLocation();
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const isReturningToRoute = navigationCache.isReturningToPrevious(routeKey);
    setIsReturning(isReturningToRoute);
    navigationCache.updateRoute(routeKey);
  }, [routeKey, location]);

  const preserveState = (state: any) => {
    navigationCache.preserveComponentState(routeKey, state);
  };

  const getPreservedState = () => {
    return navigationCache.getPreservedState(routeKey);
  };

  return {
    isReturning,
    preserveState,
    getPreservedState
  };
}