// RankingsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const RankingsContext = createContext();

export const RankingsProvider = ({ children }) => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch('/api/team-rankings');
        const data = await res.json();
        setRankings(data?.data || []);
      } catch (err) {
        console.error('Error fetching rankings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <RankingsContext.Provider value={{ rankings, loading }}>
      {children}
    </RankingsContext.Provider>
  );
};

export const useRankings = () => useContext(RankingsContext);
