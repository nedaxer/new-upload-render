// Adapted from wouter documentation for hash-based routing
// https://github.com/molefrog/wouter#customizing-the-location-hook

import { useState, useEffect, useCallback } from "react";
import type { BaseLocationHook } from "wouter";

// Hash-based location hook for wouter
export const useHashLocation: BaseLocationHook = () => {
  // Initialize with the current hash location (sans the # part)
  const [loc, setLoc] = useState(() => {
    // Extract path from hash, ignoring query parameters
    const hashPath = window.location.hash.replace(/^#\/?/, "").split("?")[0] || "/";
    return hashPath;
  });

  // Update the path on hash change
  useEffect(() => {
    // This fn will be called whenever hash changes
    const handleHashchange = () => {
      // Extract path from hash, ignoring query parameters
      const hashPath = window.location.hash.replace(/^#\/?/, "").split("?")[0] || "/";
      setLoc(hashPath);
      console.log("Hash location changed to:", hashPath);
    };

    window.addEventListener("hashchange", handleHashchange);
    // Initialize the path on first load
    handleHashchange();
    
    return () => window.removeEventListener("hashchange", handleHashchange);
  }, []);

  // The navigate function is used by wouter to manipulate history
  const navigate = useCallback((to: string) => {
    // Preserve any query parameters in the hash
    const currentHash = window.location.hash;
    const questionMarkIndex = currentHash.indexOf('?');
    let queryString = '';
    
    // If we're already on a page with query params and navigating to the same page,
    // preserve those query params (handles redirecting with auth tokens, etc.)
    if (questionMarkIndex !== -1 && to === currentHash.substring(1, questionMarkIndex)) {
      queryString = currentHash.substring(questionMarkIndex);
      to = to + queryString;
    }
    
    window.location.hash = to;
  }, []);

  return [loc, navigate];
};