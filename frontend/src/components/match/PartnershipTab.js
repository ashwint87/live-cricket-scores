import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getTeamName, getBattingTeamIdByScoreboard } from './../../utils/matchUtils';
import './css/PartnershipTab.css';

export default function PartnershipTab({ matchId, matchInfo }) {
  const [activeInning, setActiveInning] = useState(null);
  const [innings, setInnings] = useState([]);

  const data = matchInfo || {};

useEffect(() => {
  const cacheKey = `partnership_${matchId}`;
  const cached = localStorage.getItem(cacheKey);
  if (!matchInfo?.balls?.length && cached) {
    const parsed = JSON.parse(cached);
    setInnings(parsed.innings);
    setActiveInning(parsed.active);
    return;
  }

  const scoreboards = data.scoreboards || [];
  const uniqueInnings = [...new Set(scoreboards.map(s => s.scoreboard))];
  setInnings(uniqueInnings);
  if (uniqueInnings.length > 0) {
    setActiveInning(uniqueInnings[0]);
    localStorage.setItem(cacheKey, JSON.stringify({ innings: uniqueInnings, active: uniqueInnings[0] }));
  }
}, [matchInfo]);

  useEffect(() => {
    if (innings.length > 0) {
      setActiveInning(innings[0]);
    }
  }, [innings]);

  const balls = data.balls || [];
  const batting = data.batting || [];

  const handleTabClick = (sb) => setActiveInning(sb);

  const generatePartnerships = (inningKey) => {
    const inningBalls = balls
      .filter(ball => ball.scoreboard === inningKey)
      .sort((a, b) => parseFloat(a.ball) - parseFloat(b.ball));

    const partnerships = [];
    let current = {
      batsmen: [],
      runs: 0,
      balls: 0,
      dismissal: null,
    };

    const addPartnership = () => {
      if (current.batsmen.length === 2 || current.batsmen.length === 1) {
        partnerships.push({ ...current });
      }
    };

    for (const ball of inningBalls) {
      const striker = ball.batsman?.fullname;
      if (!striker) continue;

      if (!current.batsmen.includes(striker)) {
        if (current.batsmen.length === 2) {
          addPartnership();
          current = {
            batsmen: [striker],
            runs: 0,
            balls: 0,
            dismissal: null,
          };
        } else {
          current.batsmen.push(striker);
        }
      }

      const score = parseInt(ball.score?.runs || 0);
      current.runs += score;
      current.balls += 1;

      if (ball.dismissal?.dismissal_type && ball.batsman_out_id === ball.batsman?.id) {
        current.dismissal = ball.dismissal.dismissal_type;
        addPartnership();
        current = {
          batsmen: [],
          runs: 0,
          balls: 0,
          dismissal: null,
        };
      }
    }

    // Add final ongoing partnership if any
    if (current.batsmen.length >= 1) {
      partnerships.push(current);
    }

    return partnerships;
  };

  if (!matchInfo) return <div>No partnerships available at the moment.</div>;

  return (
    <div className="partnership-tab">
      <div className="tabs">
        {innings.map(inningKey => (
          <button
            key={inningKey}
            className={activeInning === inningKey ? 'active' : ''}
            onClick={() => handleTabClick(inningKey)}
          >
            {getTeamName(getBattingTeamIdByScoreboard(inningKey, batting), data)}
          </button>
        ))}
      </div>

      {activeInning && (
        <div className="partnership-table">
          <h3>{getTeamName(getBattingTeamIdByScoreboard(activeInning, batting), data)}</h3>
          <table>
            <thead>
              <tr>
                <th>Batsmen</th>
                <th>Runs</th>
                <th>Balls</th>
              </tr>
            </thead>
            <tbody>
              {generatePartnerships(activeInning).map((p, i) => (
                <tr key={i}>
                  <td>{p.batsmen.join(' & ')}</td>
                  <td>{p.runs}</td>
                  <td>{p.balls}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

