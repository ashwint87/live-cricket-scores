import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTeams } from './../../context/TeamsContext';
import { useTeamsSquad } from './../../context/TeamsSquadContext';
import './css/Players.css';

export default function TopPlayers() {
  const { filteredTeams, loading: teamsLoading } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const { getTeamsSquad } = useTeamsSquad();

  const DEFAULT_TEAM_ID = 10; // India

  // Sort teams with DEFAULT first, then limit to 13
  const sortedTeams = filteredTeams.length > 0
    ? [
        ...filteredTeams.filter(t => t.id === DEFAULT_TEAM_ID),
        ...filteredTeams.filter(t => t.id !== DEFAULT_TEAM_ID),
      ].slice(0, 13)
    : [];

  useEffect(() => {
    if (sortedTeams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(sortedTeams[0].id);
    }
  }, [sortedTeams]);

  useEffect(() => {
    if (!selectedTeamId) return;

    async function fetchPlayers() {
      try {
        setLoadingPlayers(true);
        const squad = await getTeamsSquad(selectedTeamId);

        const withSeasons = squad.filter(p => p.squad?.season_id);
        const topSeasons = [...new Set(withSeasons.map(p => p.squad.season_id))]
          .sort((a, b) => b - a)
          .slice(0, 2); // latest 2 seasons

        const latestSquad = withSeasons
          .filter(p => topSeasons.includes(p.squad.season_id))
          .reduce((acc, player) => {
            if (!acc.some(p => p.id === player.id)) acc.push(player);
            return acc;
          }, [])
          .slice(0, 6); // ✅ limit to 6 players

        setPlayers(latestSquad);
      } catch (err) {
        console.error('Failed to fetch players:', err);
      } finally {
        setLoadingPlayers(false);
      }
    }

    fetchPlayers();
  }, [selectedTeamId]);

  return (
    <div className="top-players-container">

      <div className="top-players-header">
        <h2>Players to Watch</h2>
        <a href="/player" className="player-view-all-btn">All</a>
      </div>

      <div className="team-pill-row">
        {sortedTeams.map(team => (
          <button
            key={team.id}
            className={`pill ${team.id === selectedTeamId ? 'active' : ''}`}
            onClick={() => setSelectedTeamId(team.id)}
          >
            <img src={team.image_path} alt={team.name} className="flag" />
            {team.name}
          </button>
        ))}
      </div>

      {loadingPlayers ? (
        <p className="top-players-loading">Loading players...</p>
      ) : (
        <div className="player-list">
          {players.map(player => (
            <Link to={`/player/${player.id}`} className="player-item" key={player.id} target="_blank">
              <img
                src={player.image_path || 'https://i.imgur.com/O1RmJDa.jpg'}
                alt={player.fullname}
                className="player-img"
              />
              <button className="player-name-btn">{player.fullname}</button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
