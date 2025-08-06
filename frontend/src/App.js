import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Home from './components/Home';
import MatchDetail from './components/MatchDetail';
import { ScheduleProvider } from './context/ScheduleContext';
import Schedule from './components/Schedule';
import { SeriesProvider } from './context/SeriesContext';
import Series from './components/Series';
import SeriesDetail from './components/SeriesDetail';
import { RankingsProvider } from './context/RankingsContext';
import Rankings from './components/Rankings';
import { NewsProvider } from './context/NewsContext';
import News from './components/News';
import Players from './components/Players';
import PlayerDetails from './components/PlayerDetails';
import Stadiums from './components/Stadiums';
import { TeamsProvider } from './context/TeamsContext';
import { TeamsSquadProvider } from './context/TeamsSquadContext';
import { TeamInfoProvider } from './context/TeamInfoContext';
import Teams from './components/Teams';
import TeamDetails from './components/teams/TeamDetails';
import { FallbackImageProvider } from './context/FallbackImageContext';
import Contact from './components/footer/Contact';
import PrivacyPolicy from './components/footer/PrivacyPolicy';
import Terms from './components/footer/Terms';

export default function App() {
  return (
    <FallbackImageProvider>
    <ScheduleProvider>
    <SeriesProvider>
    <TeamInfoProvider>
    <TeamsSquadProvider>
    <TeamsProvider>
    <RankingsProvider>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/match/:id" element={<MatchDetail />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/series" element={<Series />} />
        <Route path="/series/:seriesId/:seasonId" element={<SeriesDetail />} />
        <Route path="/rankings" element={<Rankings />} />
        <Route path="/news" element={<News />} />
        <Route path="/player" element={<Players />} />
        <Route path="/player/:id" element={<PlayerDetails />} />
        <Route path="/stadiums" element={<Stadiums />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/teams/:id/matches" element={<TeamDetails />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Footer />
    </Router>
    </RankingsProvider>
    </TeamsProvider>
    </TeamsSquadProvider>
    </TeamInfoProvider>
    </SeriesProvider>
    </ScheduleProvider>
    </FallbackImageProvider>
  );
}
