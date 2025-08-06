import React from 'react';
import { useRankings } from './../../context/RankingsContext';
import './css/Rankings.css';

const Rankings = () => {
  const { rankings, loading } = useRankings();

  const getFormatData = (type) =>
    rankings.find(r => r.type === type)?.team
      ?.filter(t => t.ranking)
      ?.sort((a, b) => a.ranking.position - b.ranking.position)
      ?.slice(0, 5) || [];

  const getFormatBg = (type) => {
    switch (type) {
      case 'TEST': return 'url("https://i.imgur.com/kUKrkEc.jpg")';
      case 'ODI': return 'url("https://i.imgur.com/y4mQReS.jpg")';
      case 'T20I': return 'url("https://i.imgur.com/8Gz6WYN.jpg")';
      default: return '#333';
    }
  };

  const renderFormatTable = (formatLabel, type) => {
    const teams = getFormatData(type);
    const topTeam = teams[0];
    const otherTeams = teams.slice(1);

    return (
      <div className="ranking-column">
        <div
          className="ranking-banner"
        >
          <div className="ranking-format-badge">{formatLabel}</div>
          <div className="top-team-row">
            <img src={topTeam.image_path} alt={topTeam.name} className="top-flag" />
            <div>
              <div className="top-team-name">{topTeam.name}</div>
              <div className="top-team-rating">{topTeam.ranking.points} Points</div>
            </div>
          </div>
        </div>

        {otherTeams.map((team, index) => (
          <div key={team.id} className="ranking-row">
            <span className="pos">{index + 2}</span>
            <span className="team-name">
              <img src={team.image_path} alt={team.name} className="flag" />
              {team.name}
            </span>
            <span className="rating">{team.ranking.points}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="icc-ranking-section">
      <div className="ranking-header">
        <h3>ICC Team Rankings</h3>
        <a href="/rankings" className="view-all-btn-floating">All</a>
      </div>

      <div className="ranking-columns">
        {renderFormatTable('TEST', 'TEST')}
        {renderFormatTable('ODI', 'ODI')}
        {renderFormatTable('T20', 'T20I')}
      </div>
    </div>
  );
};

export default Rankings;
