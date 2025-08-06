import React, { useState } from 'react';
import ScorecardTab from './match/ScorecardTab';
import CommentaryTab from './match/CommentaryTab';
import SquadTab from './match/SquadTab';
import OversSummaryTab from './match/OversSummaryTab';
import PartnershipTab from './match/PartnershipTab';
import NewsTab from './match/NewsTab';

export default function MatchDetailTabs({ matchId, matchInfo }) {
  const [activeTab, setActiveTab] = useState('scorecard');

  const tabs = {
    scorecard: <ScorecardTab matchId={matchId} matchInfo={matchInfo} />,
    commentary: <CommentaryTab matchId={matchId} matchInfo={matchInfo} />,
    lineup: <SquadTab matchId={matchId} matchInfo={matchInfo} />,
    overs: <OversSummaryTab matchId={matchId} matchInfo={matchInfo} />,
    partnership: <PartnershipTab matchId={matchId} matchInfo={matchInfo} />,
    news: <NewsTab matchId={matchId} matchInfo={matchInfo} />,
  };

  return (
    Array.isArray(matchInfo.batting) && matchInfo.batting.length > 0 && (
      <div>
        <div className="tabs">
          {Object.keys(tabs).map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? 'active' : ''}
              onClick={() => setActiveTab(tab)}
              style={{ marginRight: '10px' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="tab-content" style={{ marginTop: '20px' }}>
          {tabs[activeTab]}
        </div>
      </div>
    )
  );
}
