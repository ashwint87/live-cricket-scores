import React, { createContext, useContext, useEffect, useState } from 'react';

const TeamsSquadContext = createContext();

export const TeamsSquadProvider = ({ children }) => {
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTeamsSquad = async (selectedTeamId) => {
    try {
      const res = await fetch(`/api/team-squads/${selectedTeamId}`);
      const json = await res.json();
      const squadData = json?.data?.data.squad || [];
      return squadData; // ✅ Return squad
    } catch (err) {
      console.error('Error fetching team squads:', err);
      return []; // in case of error
    }
  };

  return (
    <TeamsSquadContext.Provider value={{ getTeamsSquad, loading }}>
      {children}
    </TeamsSquadContext.Provider>
  );
};

export const useTeamsSquad = () => useContext(TeamsSquadContext);
