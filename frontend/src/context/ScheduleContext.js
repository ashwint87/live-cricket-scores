import React, { createContext, useContext, useEffect, useState } from 'react';

const ScheduleContext = createContext();

export const ScheduleProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/schedule');
        const data = await res.json();
        setMatches(data?.data || []);
      } catch (err) {
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <ScheduleContext.Provider value={{ matches, loading }}>
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => useContext(ScheduleContext);
