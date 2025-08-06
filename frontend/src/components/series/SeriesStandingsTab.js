import React, { useEffect, useState } from 'react';
import { useTeamInfo } from './../../context/TeamInfoContext';
import axios from 'axios';

export default function SeriesStandingsTab({ seriesId }) {
  const [standings, setStandings] = useState([]);
  const [teams, setTeams] = useState({});
  const [loading, setLoading] = useState(true);
  const { getTeamInfo } = useTeamInfo();

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        const res = await axios.get(`/api/series/${seriesId}/standings`);
        const data = res.data.data.data || [];
        setStandings(data);
        const uniqueTeamIds = [...new Set(data.map(row => row.team_id))];
        const teamMap = {};

        for (const id of uniqueTeamIds) {
          const team = await getTeamInfo(id);
          teamMap[id] = team.name;
        }
        setTeams(teamMap);
      } catch (e) {
        console.error('❌ Error fetching standings:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [seriesId]);

  return (
    loading ? (
      <p>Loading standings...</p>
    ) : !standings || standings.length === 0 ? (
      <p>No standings available for the series.</p>
    ) : (
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Team</th>
            <th>Played</th>
            <th>Won</th>
            <th>Lost</th>
            <th>Points</th>
            <th>NRR</th>
          </tr>
        </thead>
        <tbody>
          {standings.map(row => (
            <tr>
              <td>{teams[row.team_id]}</td>
              <td>{row.won + row.lost + row.draw + row.noresult}</td>
              <td>{row.won}</td>
              <td>{row.lost}</td>
              <td>{row.points}</td>
              <td>{row.netto_run_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  );
}

