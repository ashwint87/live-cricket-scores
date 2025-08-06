import React, { createContext, useContext, useEffect, useState } from 'react';

const SeriesContext = createContext();

export const SeriesProvider = ({ children }) => {
  const [allSeries, setSeriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch('/api/series');
        const json = await res.json();
        setSeriesList(json.data || []);
      } catch (err) {
        console.error('Error fetching series:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  return (
    <SeriesContext.Provider value={{ allSeries, loading }}>
      {children}
    </SeriesContext.Provider>
  );
};

export const useSeries = () => useContext(SeriesContext);
