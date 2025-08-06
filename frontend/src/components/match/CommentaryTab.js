import React, { useEffect, useState, useRef } from 'react';

export default function CommentaryTab({ matchId, matchInfo }) {
  const [commentaryByTeam, setCommentaryByTeam] = useState({});
  const cacheKey = `commentary_${matchId}`;
  const cacheRef = useRef({});

  useEffect(() => {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      cacheRef.current = parsed;
      setCommentaryByTeam(parsed);
    }

    if (!matchInfo?.balls?.length) return;

    const teamMap = {};

    matchInfo.balls.forEach((ball) => {
      const teamName = ball.team?.name || 'Unknown Team';
      const over = Math.floor(ball.ball) + 1;

      if (!teamMap[teamName]) {
        teamMap[teamName] = { overs: {} };
      }

      if (!teamMap[teamName].overs[over]) {
        teamMap[teamName].overs[over] = [];
      }

      teamMap[teamName].overs[over].push(ball);
    });

    setCommentaryByTeam(teamMap);
    cacheRef.current = teamMap;
    localStorage.setItem(cacheKey, JSON.stringify(teamMap));
  }, [matchInfo]);

  if (!matchInfo) return <div>No commentary available at the moment.</div>;

  return (
    <div className="commentary-tab">
      <h3>Match Commentary</h3>
      {Object.entries(commentaryByTeam).map(([teamName, teamData]) => (
        <div key={teamName} className="team-section">
          <h4>{teamName}</h4>
          {Object.keys(teamData.overs)
            .sort((a, b) => b - a)
            .map((over) => (
              <div key={over} className="over-section">
                <strong>Over {over}</strong>
                {teamData.overs[over].map((ball) => (
                  <div key={ball.id} className="ball-line">
                    <strong>{ball.ball}</strong>:{' '}
                    {ball.bowler?.firstname} {ball.bowler?.lastname} bowling to{' '}
                    {ball.batsman?.firstname} {ball.batsman?.lastname}{' '}
                    {ball.score?.name} ({ball.score?.runs} run{ball.score?.runs !== 1 ? 's' : ''})
                  </div>
                ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
