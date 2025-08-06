import React, { createContext, useContext, useEffect, useState } from 'react';

const FallbackImageContext = createContext();

export const FallbackImageProvider = ({ children }) => {
  const [images, setImages] = useState({});

  useEffect(() => {
    const fetchFallbackImages = async () => {
      try {
        const res = await fetch('/api/default-images');
        const text = await res.text();

        const extract = (key) => {
          const match = text.match(new RegExp(`${key}:\\s*['"]([^'"]+)['"]`));
          return match ? match[1] : null;
        };

        const result = {
          stadium: extract('stadium_url'),
          series: extract('series_url'),
          flag: extract('flag_url'),
        };

        setImages(result);
      } catch (err) {
        console.error('❌ Failed to fetch fallback images:', err);
      }
    };

    fetchFallbackImages();
  }, []);

  return (
    <FallbackImageContext.Provider value={{ images }}>
      {children}
    </FallbackImageContext.Provider>
  );
};

export const useFallbackImages = () => useContext(FallbackImageContext);
