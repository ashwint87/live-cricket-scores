import React, { useEffect, useRef, useState } from 'react';
import { useSchedule } from './../../context/ScheduleContext';
import {
  liveStatuses,
  upcomingMatchStatuses,
  completedMatchStatuses,
} from './../../constants/matchStatusConstants';
import MatchCard from './../MatchCard';
import './css/FeaturedMatches.css';

const FeaturedMatches = () => {
  const { matches = [], loading } = useSchedule();
  const [liveMatches, setLiveMatches] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [stages, setStages] = useState([]);
  const [activeStage, setActiveStage] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef();

  useEffect(() => {
    if (loading || !Array.isArray(matches)) return;

    const now = new Date();

    const live = matches.filter(m => liveStatuses.includes(m.status));
    const upcoming = matches
      .filter(m => upcomingMatchStatuses.includes(m.status))
      .sort((a, b) => new Date(a.starting_at) - new Date(b.starting_at))
      .slice(0, 10);
    const completed = matches.filter(m => {
      const matchDate = new Date(m.starting_at);
      return (
        completedMatchStatuses.includes(m.status) &&
        now - matchDate <= 2 * 24 * 60 * 60 * 1000
      );
    });

    const allStages = Array.from(
      new Set(matches.map(m => m.stage?.name).filter(Boolean))
    );

    setLiveMatches(live);
    setUpcomingMatches(upcoming);
    setCompletedMatches(completed);
    setStages(allStages);
  }, [matches, loading]);

  const filterByStage = (match) => {
    if (!activeStage) return true;
    return match.stage?.name === activeStage;
  };

  const allFilteredMatches = [
    ...liveMatches.filter(filterByStage),
    ...upcomingMatches.filter(filterByStage),
    ...completedMatches.filter(filterByStage),
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleResize = () => {
      const totalScrollWidth = container.scrollWidth;
      const visibleWidth = container.clientWidth;
      const totalPages = Math.ceil(totalScrollWidth / visibleWidth);
      setPageCount(totalPages);
    };

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const page = Math.round(scrollLeft / container.clientWidth);
      setCurrentPage(page);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [allFilteredMatches]);

  return (
    <div className="featured-container">
      <div className="featured-tabs-row">
        <div className="featured-tabs-left">
          <span
            className={`tab ${!activeStage ? 'active-tab' : ''}`}
            onClick={() => setActiveStage(null)}
          >
            All Featured Matches
          </span>

          {stages
            .filter(stage =>
              [...liveMatches, ...upcomingMatches, ...completedMatches].some(
                m => m.stage?.name === stage
              )
            )
            .map(stage => (
              <span
                key={stage}
                className={`tab ${activeStage === stage ? 'active-tab' : ''}`}
                onClick={() => setActiveStage(stage)}
              >
                {stage}
              </span>
          ))}
        </div>
        <a href="/schedule" className="see-all-btn">All</a>
      </div>

      <div className="match-cards-scroll-wrapper" ref={scrollRef}>
        <div className={`match-cards-scroll ${allFilteredMatches.length < 3 ? 'center' : ''}`}>
          {allFilteredMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>

      <div className="pagination-dots">
        {Array.from({ length: Math.max(1, pageCount - 1) }).map((_, i) => (
          <span
            key={i}
            className={`dot ${i === currentPage ? 'active' : ''}`}
          />
        ))}
      </div>

    </div>
  );
};

export default FeaturedMatches;
