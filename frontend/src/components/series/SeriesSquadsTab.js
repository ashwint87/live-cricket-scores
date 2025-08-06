import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSeriesMatchList } from './../../context/SeriesMatchListContext';

export default function SeriesSquadsTab() {
  const { seriesMatches, loadingMatches } = useSeriesMatchList();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadingMatches || !seriesMatches.length) return;

    let isMounted = true;
    const seenTeams = new Map();

    const fetchSquads = async () => {
      try {
        for (const match of seriesMatches) {
          const seasonId = match.season_id;
          const teamsToFetch = [match.localteam, match.visitorteam];

          for (const team of teamsToFetch) {
            if (!seenTeams.has(team.id)) {
              try {
                const res = await axios.get(`/api/teams/${team.id}/squad/${seasonId}`);
                const squadArray = res.data?.data?.squad || [];

                seenTeams.set(team.id, {
                  ...team,
                  squad: squadArray,
                });
              } catch {
                seenTeams.set(team.id, {
                  ...team,
                  squad: [],
                });
              }
            }
          }
        }

        if (isMounted) setTeams(Array.from(seenTeams.values()));
      } catch (err) {
        console.error('Error loading squads', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSquads();
    return () => {
      isMounted = false;
    };
  }, [seriesMatches, loadingMatches]);

  return (
    <div>
      {(loading || loadingMatches) ? (
        <p>Loading squads...</p>
      ) : (
        teams.map((team) => (
          <div key={team.id} style={{ marginBottom: '20px' }}>
            <h4>{team.name}</h4>
            {Array.isArray(team.squad) && team.squad.map((player) => (
              <div key={player.id}>– {player.fullname}</div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
