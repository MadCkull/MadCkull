'use client';

import { useState, useEffect } from 'react';

export function useLoadingState() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => {
    // Check if already loaded
    if (document.readyState === 'complete') {
      setIsPageLoaded(true);
    } else {
      const handleLoad = () => setIsPageLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  return { isPageLoaded };
}
