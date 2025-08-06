import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSeries } from './../context/SeriesContext';
import { FORMAT_CODES } from './../constants/matchStatusConstants';
import { format } from 'date-fns';
import './css/Series.css';

export default function Series() {
  const { allSeries, loading } = useSeries();
  const [search, setSearch] = useState('');

  const uniqueSeriesMap = new Map();

  allSeries.forEach((s) => {
    const baseKey = `${s.league_id}_${s.season_id}_${s.code}_${s.league}_${s.season}`;
    const key = `${baseKey}_${s.start_date}_${s.end_date}`;

    // Check if another entry with same baseKey exists whose stage_id is +1 or -1 of current
    const existingEntry = Array.from(uniqueSeriesMap.entries()).find(([k, val]) => {
      const [ek] = k.split(`_${val.start_date}_${val.end_date}`);
      const isSameBase = ek === baseKey;
      const stageMatch = Array.isArray(val.id) && Array.isArray(s.id)
        ? val.id.some((id1) => s.id.some((id2) => Math.abs(id1 - id2) === 1))
        : Math.abs((Array.isArray(val.id) ? val.id[0] : val.id) - (Array.isArray(s.id) ? s.id[0] : s.id)) === 1;

      return isSameBase && stageMatch;
    });

    if (!existingEntry) {
      uniqueSeriesMap.set(key, s);
    }
  });

  const uniqueSeries = Array.from(uniqueSeriesMap.values());

  const filtered = uniqueSeries.filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) || s.league?.toLowerCase().includes(search.toLowerCase())
  );

  const seriesName = (series) => {
    const code = (series?.code || '').toUpperCase().trim();

    if (FORMAT_CODES.includes(code)) {
      return `${series?.name || ''} ${series?.season || ''}`.trim();
    } else {
      return `${series?.league || ''} ${series?.season || ''}`.trim();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return format(d, 'dd MMM yyyy');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="series-container">
      <h1>All Series</h1>
      <input
        type="text"
        placeholder="Search series..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="series-search"
      />

      <div className="series-grid">
        {filtered.map(series => {
          let adjustedEndDate = new Date(series.end_date);
          if (series.code === 'TEST' || series.code === 'TEST/5DAY') {
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 4);
          } else if (series.code === '4DAY') {
            adjustedEndDate.setDate(adjustedEndDate.getDate() + 3);
          }

          return (
            <Link
              key={series.id}
              to={`/series/${series.id}/${series.season_id}`}
              state={{
                seriesLabel: seriesName(series),
                seriesCode: series.code,
                stageIds: series.stage_ids
              }}
              className="series-card"
            >
              <div className="series-info">
                {series?.code && (
                  <span className="series-type-tag">{series.code}</span>
                )}
                <h4>{seriesName(series)}</h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
