import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TeamInfoContext = createContext();

export const TeamInfoProvider = ({ children }) => {
  const [teamCache, setTeamCache] = useState({});

  const getTeamInfo = async (teamId) => {
    if (teamCache[teamId]) return teamCache[teamId];
    try {
      const res = await axios.get(`/api/teams/${teamId}`);
      const data = res.data.data.data;
      setTeamCache(prev => ({ ...prev, [teamId]: data }));
      return data;
    } catch {
      return { id: teamId, name: 'Unknown' };
    }
  };

  return (
    <TeamInfoContext.Provider value={{ getTeamInfo, teamCache }}>
      {children}
    </TeamInfoContext.Provider>
  );
};

export const useTeamInfo = () => useContext(TeamInfoContext);
