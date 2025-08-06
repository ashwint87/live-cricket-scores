import React from 'react';
import { useParams } from 'react-router-dom';
import MatchCard from './../MatchCard';

const TeamLiveMatches = ({ teamName, matches }) => {
  const { id } = useParams();

  return (
    <div className="team-matches">
      <h2>Live Matches</h2>

      {matches.length === 0 ? (
        <p>No live matches available.</p>
      ) : (
        <div className="match-list">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamLiveMatches;
