import { useState, useEffect, useCallback } from 'react';

// Custom hook for hash-based routing
export function useHashLocation(): [string, (path: string) => void] {
  const [location, setLocation] = useState(() => {
    // Get initial location from hash, default to '/' if empty
    const hash = window.location.hash.slice(1); // Remove the '#'
    return hash || '/';
  });

  const navigate = useCallback((path: string) => {
    // Update the hash without triggering a page reload
    window.location.hash = path;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      setLocation(hash || '/');
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return [location, navigate];
}