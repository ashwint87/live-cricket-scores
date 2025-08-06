import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SeriesMatchesTab from './series/SeriesMatchesTab';
import SeriesStandingsTab from './series/SeriesStandingsTab';
import SeriesSquadsTab from './series/SeriesSquadsTab';
import SeriesNewsTab from './series/SeriesNewsTab';
import { SeriesMatchListProvider } from './../context/SeriesMatchListContext';

export default function SeriesDetail() {
  const { seriesId, seasonId } = useParams();
  const location = useLocation();
  const { seriesLabel, seriesCode } = location.state || {};
  const [activeTab, setActiveTab] = useState('matches');

  const tabs = {
    matches: <SeriesMatchesTab seriesId={seriesId} seasonId={seasonId} />,
    standings: <SeriesStandingsTab seriesId={seriesId} seasonId={seasonId} />,
    squads: <SeriesSquadsTab seriesId={seriesId} seasonId={seasonId} />,
    news: <SeriesNewsTab seriesId={seriesId} seasonId={seasonId} seriesLabel={seriesLabel} />,
  };

  const stageIds = [parseInt(seriesId), parseInt(seriesId) + 1];

  return (
    <div>
      <h1>{seriesLabel}</h1>

      <div style={{ marginBottom: '20px' }}>
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <SeriesMatchListProvider seriesIds={stageIds}>
        {tabs[activeTab]}
      </SeriesMatchListProvider>
    </div>
  );
}
