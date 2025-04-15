// Adapted from wouter documentation for hash-based routing
// https://github.com/molefrog/wouter#customizing-the-location-hook

import { useState, useEffect, useCallback } from "react";
import type { BaseLocationHook } from "wouter";

// Hash-based location hook for wouter
export const useHashLocation: BaseLocationHook = () => {
  // Initialize with the current hash location (sans the # part)
  const [loc, setLoc] = useState(() => 
    window.location.hash.replace("#", "") || "/"
  );

  // Update the path on hash change
  useEffect(() => {
    // This fn will be called whenever hash changes
    const handleHashchange = () => {
      const path = window.location.hash.replace("#", "") || "/";
      setLoc(path);
    };

    window.addEventListener("hashchange", handleHashchange);
    // Initialize the path on first load
    handleHashchange();
    
    return () => window.removeEventListener("hashchange", handleHashchange);
  }, []);

  // The navigate function is used by wouter to manipulate history
  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return [loc, navigate];
};