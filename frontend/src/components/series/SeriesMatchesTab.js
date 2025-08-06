import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FORMAT_CODES } from './../../constants/matchStatusConstants';
import { useSeriesMatchList } from './../../context/SeriesMatchListContext';
import MatchCard from './../MatchCard';

export default function SeriesMatchesTab() {
  const { seriesId } = useParams();  
  const { seriesMatches, loadingMatches } = useSeriesMatchList();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const processMatches = async () => {
      setLoading(true);

      try {
        const stageId = parseInt(seriesId);
        const nextStageId = stageId + 1;

        // Fetch both current and next stage metadata
        const [stageRes, nextStageRes] = await Promise.allSettled([
          axios.get(`/api/stages/${stageId}`),
          axios.get(`/api/stages/${nextStageId}`)
        ]);

        const stage = stageRes.status === 'fulfilled' ? stageRes.value.data.data.data : null;
        const nextStage = nextStageRes.status === 'fulfilled' ? nextStageRes.value.data.data.data : null;

        let stageIds = [stageId];

        const shouldIncludeNext =
          stage &&
          nextStage &&
          stage.league_id === nextStage.league_id &&
          stage.season_id === nextStage.season_id &&
          !FORMAT_CODES.includes((stage.code || '').toUpperCase());

        if (shouldIncludeNext) {
          stageIds.push(nextStageId);
        }

        const filtered = seriesMatches.filter(m => stageIds.includes(m.stage_id));
        setMatches(filtered);

        if (filtered.length > 0) {
          setStartDate(filtered[0].starting_at);

          let lastDate = new Date(filtered[filtered.length - 1].starting_at);
          let match = filtered[filtered.length - 1];
          const matchType = (match.type || '').toUpperCase();

          if (matchType === 'TEST' || matchType === 'TEST/5DAY') {
            lastDate.setDate(lastDate.getDate() + 4);
          } else if (matchType === '4DAY') {
            lastDate.setDate(lastDate.getDate() + 3);
          }
          setEndDate(lastDate.toISOString());
        }
      } catch (err) {
        console.error('Error processing matches from context:', err);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    processMatches();
  }, [seriesId, seriesMatches]);

  const formattedDate = (input) => {
    if (!input) return 'N/A';
    try {
      return new Date(input).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <>
      {loading && loadingMatches ? (
        <p>Loading matches...</p>
      ) : (
        <>
          {startDate && endDate && (
            <>
              <p><strong>Start Date:</strong> {formattedDate(startDate)}</p>
              <p><strong>End Date:</strong> {formattedDate(endDate)}</p>
            </>
          )}
          <div className="series-match-cards-row">
            {matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
