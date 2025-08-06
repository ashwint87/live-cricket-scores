import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getTeamName, getBattingTeamIdByScoreboard, getBowlingTeamIdByScoreboard } from './../../utils/matchUtils';
import { getPlayerName, renderPlayerNameLink } from './../../utils/playerUtils';
import { Link } from 'react-router-dom';

export default function ScorecardTab({ matchId, matchInfo }) {
  const [activeTab, setActiveTab] = useState(null);
  const [innings, setInnings] = useState([]);

  const data = matchInfo || {};

useEffect(() => {
  const cacheKey = `scorecard_${matchId}`;
  if (!matchInfo) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) setActiveTab(JSON.parse(cached).defaultTab || null);
    return;
  }

  const scoreboards = matchInfo.scoreboards || [];
  const uniqueInnings = [...new Set(scoreboards.map(s => s.scoreboard))];
  setInnings(uniqueInnings);
  if (uniqueInnings.length > 0) {
    setActiveTab(uniqueInnings[0]);
    localStorage.setItem(cacheKey, JSON.stringify({ defaultTab: uniqueInnings[0] }));
  }
}, [matchInfo]);

  useEffect(() => {
    if (innings.length > 0) {
      setActiveTab(innings[0]);
    }
  }, [innings]);

  const batting = data.batting || [];
  const bowling = data.bowling || [];
  const lineup = data.lineup || [];
  const balls = data.balls || [];
  const scoreboards = data.scoreboards || [];

  const handleTabClick = (sb) => setActiveTab(sb);

  if (!matchInfo) return <div>No scorecard available at the moment.</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {innings.map(sb => {
          const teamId = getBattingTeamIdByScoreboard(sb, batting);
          const teamName = getTeamName(teamId, data);
          const inningNumber = sb;
          return (
            <button
              key={sb}
              onClick={() => handleTabClick(sb)}
              style={{ fontWeight: activeTab === sb ? 'bold' : 'normal' }}
            >
              {teamName} – {inningNumber === 'S1' ? '1st' : inningNumber === 'S2' ? '2nd' : inningNumber === 'S3' ? '3rd' : '4th'} Innings
            </button>
          );
        })}
      </div>

      {innings.map(sb => {
        if (sb !== activeTab) return null;

        const bat = batting.filter(b => b.scoreboard === sb);
        const bowl = bowling.filter(b => b.scoreboard === sb);
        const fow = bat.filter(b => b.fow_balls !== 0);
        const extrasObj = scoreboards.find(s => s.scoreboard === sb && s.type === 'extra');
        const totalObj = scoreboards.find(s => s.scoreboard === sb && s.type === 'total');

        const bye = extrasObj?.bye || 0;
        const legBye = extrasObj?.leg_bye || 0;
        const wide = extrasObj?.wide || 0;
        const noBallRuns = extrasObj?.noball_runs || 0;
        const noBallBalls = extrasObj?.noball_balls || 0;
        const penalty = extrasObj?.penalty || 0;

        const noBall = noBallRuns + noBallBalls;
        const totalExtras = bye + legBye + wide + noBall + penalty;

        const extrasText = `B ${bye}, LB ${legBye}, W ${wide}, NB ${noBall}, Penalty ${penalty} (Total: ${totalExtras})`;

        const yetToBat = lineup.filter(p => {
          const battingTeamId = getBattingTeamIdByScoreboard(sb, batting);
          if (p.lineup.team_id !== battingTeamId) return false;
          return !bat.some(b => b.player_id === p.id);
        });

        return (
          <div key={sb}>
            <h4>{getTeamName(getBattingTeamIdByScoreboard(sb, batting), data)} Batting</h4>
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th>Batsman</th>
                  <th>Dismissal</th>
                  <th>Runs</th>
                  <th>Balls</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {bat.map(b => (
                  <tr key={b.id}>
                    <td>{renderPlayerNameLink(b.player_id, lineup)}</td>
                    <td>
                      {b.catch_stump_player_id && b.catch_stump_player_id !== b.bowling_player_id && (
                        <>c {renderPlayerNameLink(b.catch_stump_player_id, lineup)} b {renderPlayerNameLink(b.bowling_player_id, lineup)} </>
                      )}
                      {b.catch_stump_player_id && b.catch_stump_player_id === b.bowling_player_id && (
                        <>c & b {renderPlayerNameLink(b.bowling_player_id, lineup)}</>
                      )}
                      {b.fow_balls === 0 && (
                        <>not out</>
                      )}
                      {!b.catch_stump_player_id && b.fow_balls !== 0 && (
                        <>b {renderPlayerNameLink(b.bowling_player_id, lineup)}</>
                      )}
                    </td>
                    <td>{b.score}</td>
                    <td>{b.ball}</td>
                    <td>{b.four_x}</td>
                    <td>{b.six_x}</td>
                    <td>{b.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p><strong>Extras:</strong> {extrasText}</p>
            <p><strong>Total:</strong> {totalObj?.total} / {totalObj?.wickets} ({totalObj?.overs} overs)</p>

            {yetToBat.length > 0 && (
              <>
                <h4>Yet to Bat</h4>
                <ul>
                  {yetToBat.map(p => (
                    <li key={p.id}>{renderPlayerNameLink(p.id, lineup)}</li>
                  ))}
                </ul>
              </>
            )}

            <h4>Fall of Wickets</h4>
            <ul>
              {fow.map(f => (
                <li key={f.id}>
                  {renderPlayerNameLink(f.player_id, lineup)} - {f.fow_score} ({f.fow_balls})
                </li>
              ))}
            </ul>

            <h4>{getTeamName(getBowlingTeamIdByScoreboard(sb, bowling), data)} Bowling</h4>
            <table border="1" cellPadding="5">
              <thead>
                <tr>
                  <th>Bowler</th>
                  <th>O</th>
                  <th>M</th>
                  <th>R</th>
                  <th>W</th>
                  <th>NB</th>
                  <th>WD</th>
                  <th>ECO</th>
                </tr>
              </thead>
              <tbody>
                {bowl.map(b => (
                  <tr key={b.id}>
                    <td>{renderPlayerNameLink(b.player_id, lineup)}</td>
                    <td>{b.overs}</td>
                    <td>{b.medians}</td>
                    <td>{b.runs}</td>
                    <td>{b.wickets}</td>
                    <td>{b.noball}</td>
                    <td>{b.wide}</td>
                    <td>{b.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
