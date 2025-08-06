import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './css/PlayerDetails.css';

export default function PlayerDetails() {
  const { id } = useParams();
  const [playerInfo, setPlayerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const res = await fetch(`/api/player/${id}`);
        const data = await res.json();
        setPlayerInfo(data.data.data);
      } catch (err) {
        console.error('Error fetching player:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <div className="player-details">Loading...</div>;

  const { fullname, image_path, country, battingstyle, bowlingstyle, dateofbirth, position, career } = playerInfo;

  return (
    <div className="player-details">
      <div className="player-header">
        <img src={image_path} alt={fullname} />
        <div>
          <h2>{fullname}</h2>
          <p><strong>Country:</strong> {country?.name}</p>
          {position?.name && (
            <p><strong>Position:</strong> {position?.name}</p>
          )}
          {battingstyle && (
            <p><strong>Batting Style:</strong> {battingstyle}</p>
          )}
          {bowlingstyle && (
            <p><strong>Bowling Style:</strong> {bowlingstyle}</p>
          )}
          {dateofbirth && (
            <p><strong>Date of Birth:</strong> {dateofbirth}</p>
          )}
        </div>
      </div>

      {career?.length > 0 && career.some(c => c.batting) && (
        <div className="career-section">
          <h3>Batting Stats</h3>
          <table className="career-table">
            <thead>
              <tr>
                <th>Format</th>
                <th>Year</th>
                <th>Matches</th>
                <th>Innings</th>
                <th>Runs</th>
                <th>Not Outs</th>
                <th>High Score</th>
                <th>Average</th>
                <th>Strike Rate</th>
              </tr>
            </thead>
            <tbody>
              {career.map((c, i) => (
                c.batting && (
                  <tr key={i}>
                    <td>{c.type}</td>
                    <td>{c.season?.name}</td>
                    <td>{c.batting.matches}</td>
                    <td>{c.batting.innings}</td>
                    <td>{c.batting.runs_scored}</td>
                    <td>{c.batting.not_outs}</td>
                    <td>{c.batting.highest_inning_score}</td>
                    <td>{c.batting.average || '-'}</td>
                    <td>{c.batting.strike_rate || '-'}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}

      {career?.length > 0 && career.some(c => c.bowling) && (
        <div className="career-section">
          <h3>Bowling Stats</h3>
          <table className="career-table">
            <thead>
              <tr>
                <th>Format</th>
                <th>Year</th>
                <th>Matches</th>
                <th>Innings</th>
                <th>Wickets</th>
                <th>Avg</th>
                <th>Economy</th>
                <th>Strike Rate</th>
                <th>5W</th>
                <th>10W</th>
              </tr>
            </thead>
            <tbody>
              {career.map((s, i) => (
                s.bowling && (
                  <tr key={i}>
                    <td>{s.type}</td>
                    <td>{s.season?.name}</td>
                    <td>{s.bowling.matches}</td>
                    <td>{s.bowling.innings}</td>
                    <td>{s.bowling.wickets}</td>
                    <td>{s.bowling.average}</td>
                    <td>{s.bowling.econ_rate}</td>
                    <td>{s.bowling.strike_rate}</td>
                    <td>{s.bowling.five_wickets}</td>
                    <td>{s.bowling.ten_wickets}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
