import React, { createContext, useContext, useEffect, useState } from 'react';

const TeamsContext = createContext();

export const TeamsProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch('/api/teams');
        const json = await res.json();
        setTeams(json.data?.data || []);
        setFilteredTeams(json.data.data.filter(team => team.national_team === true));
      } catch (err) {
        console.error('Error fetching teams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  return (
    <TeamsContext.Provider value={{ teams, filteredTeams, loading }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => useContext(TeamsContext);
