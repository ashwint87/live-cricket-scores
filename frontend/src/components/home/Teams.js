import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeams } from './../../context/TeamsContext';
import { useFallbackImages } from './../../context/FallbackImageContext';
import './css/Teams.css';

const TeamFixtures = () => {
  const { teams, filteredTeams, loading } = useTeams();
  const { images } = useFallbackImages();
  const navigate = useNavigate();

  if (loading) return <div className="team-loading">Loading...</div>;

  return (
    <div className="home-teams-container">
      <div className="teams-header">
        <h3>Fixtures by Teams</h3>
        <a href="/teams" className="view-all-link">All</a>
      </div>

      <div className="team-horizontal-scroll">
        {filteredTeams.slice(0, 9)
          .filter(team => team.national_team)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(team => (
<div
  key={team.id}
  className="home-team-card"
  onClick={() =>
    navigate(`/teams/${team.id}/matches`, {
      state: { teamName: team.name }
    })
  }
>
  <div className="flag-circle">
    <img
      src={
        team.image_path && team.image_path.endsWith('cdn.sportmonks.com')
          ? images.flag || ''
          : team.image_path
      }
      alt={team.name}
    />
  </div>
  <span>{team.name}</span>
</div>




        ))}
      </div>
    </div>
  );
};

export default TeamFixtures;
