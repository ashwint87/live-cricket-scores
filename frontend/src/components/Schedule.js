import React, { useState } from 'react';
import {
  liveStatuses,
  completedMatchStatuses,
  upcomingMatchStatuses,
} from './../constants/matchStatusConstants';
import { useSchedule } from './../context/ScheduleContext';
import MatchCard from './MatchCard';
import './css/Schedule.css';

const Schedule = () => {
  const { matches, loading } = useSchedule();
  const [activeTab, setActiveTab] = useState('upcoming');

  const liveMatches = matches.filter(m => liveStatuses.includes(m.status));
  const upcomingMatches = matches.filter(m => upcomingMatchStatuses.includes(m.status));
  const completedMatches = matches.filter(m => completedMatchStatuses.includes(m.status));

  const tabConfig = {
    upcoming: {
      label: '🟡 Upcoming Matches',
      matches: upcomingMatches,
      emptyText: 'No upcoming matches',
    },
    live: {
      label: '🟢 Live Matches',
      matches: liveMatches,
      emptyText: 'No live matches',
    },
    completed: {
      label: '🔴 Completed Matches',
      matches: completedMatches,
      emptyText: 'No completed matches',
    },
  };

  const currentTab = tabConfig[activeTab];

  const renderMatchCard = (match) => {
    return (
      <div className="match-cards-row">
        <MatchCard key={match.id} match={match} />
      </div>
    );
  };

  return (
    <div className="schedule-container">
      <h2>Match Schedule</h2>

      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <>
          <div className="tabs">
            {Object.keys(tabConfig).map((key) => (
              <button
                key={key}
                className={activeTab === key ? 'active' : ''}
                onClick={() => setActiveTab(key)}
                style={{ marginRight: '10px' }}
              >
                {tabConfig[key].label}
              </button>
            ))}
          </div>

          <div className="schedule-list" style={{ marginTop: '20px' }}>
            {currentTab.matches.length > 0
              ? currentTab.matches.map(renderMatchCard)
              : <p>{currentTab.emptyText}</p>}
          </div>
        </>
      )}
    </div>
  );
}

export default Schedule;
