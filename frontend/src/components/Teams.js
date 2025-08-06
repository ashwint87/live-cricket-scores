import React, { useEffect, useState } from 'react';
import { useTeams } from './../context/TeamsContext';
import { useNavigate } from 'react-router-dom';
import './css/Teams.css';

const Teams = () => {
  const { teams, loading } = useTeams();
  const [activeTab, setActiveTab] = useState('international');
  const navigate = useNavigate();

  const internationalTeams = teams.filter((t) => t.national_team);
  const domesticTeams = teams.filter((t) => !t.national_team);

  const renderTeamCard = (team) => (
    <div
      key={team.id}
      className="team-card"
      onClick={() => navigate(`/teams/${team.id}/matches`, { state: { teamName: team.name } })}
    >
      <img
        src={team.image_path}
        alt={team.name}
        onError={(e) => {
          e.target.src = 'https://em-content.zobj.net/source/apple/354/white-flag_1f3f3-fe0f.png';
        }}
      />
      <p>{team.name}</p>
    </div>
  );

  const renderTabContent = () => {
    const relevantTeams = activeTab === 'international' ? internationalTeams : domesticTeams;
    return (
      <div className="teams-grid">
        {relevantTeams.map(renderTeamCard)}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="teams-page">
      <h2>🏏 Cricket Teams</h2>

      <div className="tabs">
        <button
          className={activeTab === 'international' ? 'active' : ''}
          onClick={() => setActiveTab('international')}
        >
          🌍 International Teams
        </button>
        {(domesticTeams.length > 0) && (
          <button
            className={activeTab === 'domestic' ? 'active' : ''}
            onClick={() => setActiveTab('domestic')}
          >
            🏠 Domestic & Franchise Teams
          </button>
        )}
      </div>

      {loading ? <p>Loading teams...</p> : renderTabContent()}
    </div>
  );
};

export default Teams;
