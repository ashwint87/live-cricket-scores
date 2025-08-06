// src/context/SeriesMatchListContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SeriesMatchListContext = createContext();

export const SeriesMatchListProvider = ({ seriesIds = [], children }) => {
  const [seriesMatches, setSeriesMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    if (!seriesIds.length) return;

    const fetchMatches = async () => {
      setLoadingMatches(true);
      try {
        const results = await Promise.all(
          seriesIds.map(id => axios.get(`/api/series/${id}/matches`))
        );
        const merged = results.flatMap(res => res.data?.data?.data || []);
        setSeriesMatches(merged);
      } catch (err) {
        console.error('Error fetching series matches:', err);
        setSeriesMatches([]);
      } finally {
        setLoadingMatches(false);
      }
    };

    fetchMatches();
  }, [seriesIds.join(',')]);

  return (
    <SeriesMatchListContext.Provider value={{ seriesMatches, loadingMatches }}>
      {children}
    </SeriesMatchListContext.Provider>
  );
};

export const useSeriesMatchList = () => useContext(SeriesMatchListContext);
