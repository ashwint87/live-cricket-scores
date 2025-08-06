import React, { useState, useRef, useEffect } from 'react';
import {
  completedMatchStatuses,
  upcomingMatchStatuses,
} from './../../constants/matchStatusConstants';
import { useSchedule } from './../../context/ScheduleContext';
import ScheduledMatchCard from './../ScheduledMatchCard';
import './css/ScheduledMatches.css';

const Schedule = () => {
  const { matches, loading } = useSchedule();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [activeDotIndex, setActiveDotIndex] = useState(0);

  const upcomingMatches = matches.filter(m => upcomingMatchStatuses.includes(m.status)).slice(0, 12);
  const completedMatches = matches.filter(m => completedMatchStatuses.includes(m.status)).slice(0, 12);

  const scrollRef = useRef(null);

  const tabConfig = {
    upcoming: {
      label: '🟡 Upcoming Matches',
      matches: upcomingMatches,
      emptyText: 'No upcoming matches',
    },
    completed: {
      label: '🔴 Completed Matches',
      matches: completedMatches,
      emptyText: 'No completed matches',
    },
  };

  const currentTab = tabConfig[activeTab];
  const cardsPerPage = 3;
  const totalDots = Math.ceil(currentTab.matches.length / cardsPerPage);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveDotIndex(index);
  };

  const scrollToIndex = (index) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth;
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
  };

  return (
    <div className="scheduled-matches-container">
      <div className="schedule-matches-header">
        <h3>Matches</h3>
        <a href="/schedule" className="schedule-all-btn-floating">All</a>
      </div>

      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <>
          <div className="schedule-tabs">
            {Object.keys(tabConfig).map((key) => (
              <button
                key={key}
                className={activeTab === key ? 'active' : ''}
                onClick={() => {
                  setActiveTab(key);
                  setActiveDotIndex(0);
                }}
              >
                {tabConfig[key].label}
              </button>
            ))}
          </div>

          <div
            className="schedule-scrollable-match-row"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {currentTab.matches.length > 0 ? (
              currentTab.matches.map((match) => (
                <div key={match.id} className="schedule-match-card-wrapper">
                  <ScheduledMatchCard match={match} />
                </div>
              ))
            ) : (
              <p>{currentTab.emptyText}</p>
            )}
          </div>

          {totalDots > 1 && (
            <div className="scroll-dots">
              {Array.from({ length: totalDots }).map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${activeDotIndex === idx ? 'active' : ''}`}
                  onClick={() => scrollToIndex(idx)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Schedule;
