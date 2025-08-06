import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { getTeamRuns, matchYear } from './../../utils/matchUtils';
import {
  completedMatchStatuses,
  upcomingMatchStatuses,
} from './../../constants/matchStatusConstants';
import { useTeamInfo } from './../../context/TeamInfoContext';
import CountdownTimer from './../CountdownTimer';
import NotificationButton from './../NotificationButton';
import LiveMatches from './TeamLiveMatches';
import News from './News';
import TeamPlayers from './TeamPlayers';
import MatchCard from './../MatchCard';
import './../css/Matches.css';

export default function Matches() {
  const { id } = useParams();
  const [matches, setMatches] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamNames, setTeamNames] = useState({});
  const [flagNames, setFlagNames] = useState({});
  const [venueData, setVenueData] = useState({});
  const [stageData, setStageData] = useState({});
  const [playerNames, setPlayerNames] = useState({});
  const [activeTab, setActiveTab] = useState('');
  const [players, setPlayers] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { teamName } = location.state || {};
  const { getTeamInfo } = useTeamInfo();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fixturesRes = await axios.get(`/api/teams/${id}/matches`);
        const allMatches = fixturesRes.data.data || [];
        setMatches(allMatches);

        const teamIds = new Set();
        const venueIds = new Set();
        const stageIds = new Set();

        allMatches.forEach(m => {
          teamIds.add(m.localteam_id);
          teamIds.add(m.visitorteam_id);
          venueIds.add(m.venue_id);
          stageIds.add(m.stage_id);
        });

        const names = {};
        const flags = {};
        await Promise.all([...teamIds].map(async (teamId) => {
          try {
            const team = await getTeamInfo(teamId);
            names[teamId] = team.name;
            flags[teamId] = team.image_path;
          } catch {
            names[teamId] = 'Unknown';
          }
        }));
        setTeamNames(names);
        setFlagNames(flags);

        const venues = {};
        await Promise.all([...venueIds].map(async (venueId) => {
          try {
            const res = await axios.get(`/api/venues/${venueId}`);
            venues[venueId] = res.data.data;
          } catch {
            venues[venueId] = {};
          }
        }));
        setVenueData(venues);

        const stages = {};
        await Promise.all([...stageIds].map(async (stageId) => {
          try {
            const res = await axios.get(`/api/stages/${stageId}`);
            stages[stageId] = res.data.data.data.name;
          } catch {
            stages[stageId] = {};
          }
        }));
        setStageData(stages);
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchManOfMatchPlayers = async () => {
      const ids = matches
        .filter(m => m.status === 'Finished' && m.man_of_match_id)
        .map(m => m.man_of_match_id);

      const uniqueIds = [...new Set(ids)];

      const names = {};
      await Promise.all(uniqueIds.map(async (id) => {
        try {
          const res = await axios.get(`/api/player-names/${id}`);
          names[id] = res.data.data.data.fullname || 'Unknown';
        } catch {
          names[id] = 'Unknown';
        }
      }));

      setPlayerNames(names);
    };

    if (!loading) fetchManOfMatchPlayers();
  }, [matches, loading]);

  useEffect(() => {
    async function fetchLiveMatches() {
      try {
        const res = await axios.get(`/api/teams/${id}/live-matches`);
        setLiveMatches(res.data.data || []);
      } catch (err) {
        console.error('Error fetching live matches:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveMatches();
  }, [id]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await axios.get(`/api/team-squads/${id}`);
        const allPlayers = res.data.data.data?.squad || [];
        const playersWithSeason = allPlayers.filter(p => p.squad?.season_id);

        const seasonIds = [...new Set(playersWithSeason.map(p => p.squad.season_id))];
        const top3Seasons = seasonIds.sort((a, b) => b - a).slice(0, 7);

        const latestSquad = playersWithSeason.filter(p => top3Seasons.includes(p.squad.season_id)).reduce((acc, player) => {
          if (!acc.some(p => p.id === player.id)) acc.push(player);
          return acc;
        }, []);

        setPlayers(latestSquad);
      } catch (err) {
        console.error(`❌ Failed fetching players for ${teamName}`, err);
      }
    }
    fetchPlayers();
  }, [id]);

  const getFlagName = (tid) => flagNames[tid] || '';
  const getTeamName = (tid) => teamNames[tid] || teamName || 'TBD';
  const getVenueName = (vid) => venueData[vid]?.name || '';
  const getVenueCity = (vid) => venueData[vid]?.city || '';
  const getStageName = (sid) => stageData[sid] || '';

  const upcomingMatches = matches.filter(m => upcomingMatchStatuses.includes(m.status));
  const completedMatches = matches.filter(m => completedMatchStatuses.includes(m.status));

  const tabData = [
    { key: 'upcoming', label: 'Upcoming', data: upcomingMatches },
    { key: 'completed', label: 'Completed', data: completedMatches },
    { key: 'live', label: 'Live', data: liveMatches },
    { key: 'players', label: 'Players', data: players },
    { key: 'news', label: 'News', data: [1] },
  ];

  const availableTabs = tabData.filter(t => t.key === 'news' || t.data.length > 0);
  const defaultTab = availableTabs.length > 0 ? availableTabs[0].key : 'completed';

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const currentMatches = tabData.find(tab => tab.key === activeTab)?.data || [];

  const seriesDefaultLabel = (match) => {
    const stageName = getStageName(match.stage_id);
    return `${stageName} ${matchYear(match)}`;
  };

  return (
    <div className="team-matches">
      <h2>{getTeamName(id)} Cricket Team</h2>

      <div className="tabs">
        {availableTabs.map(tab => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading matches...</p>
      ) : activeTab === 'players' ? (
        <TeamPlayers teamName={getTeamName(id)} teamPlayers={players} />
      ) : activeTab === 'news' ? (
        <News teamName={getTeamName(id)} />
      ) : activeTab === 'live' ? (
        <LiveMatches teamName={getTeamName(id)} matches={liveMatches}/>
      ) : (
        <>
          {currentMatches.length === 0 && (
            <p>
              No {activeTab} matches available.
            </p>
          )}

          <div className="match-list">
            {currentMatches.map((match) => (
              <div
                key={match.id}
                className="match-card"
                onClick={() => navigate(`/match/${match.id}`, { state: { from: 'Teams' } })}
              >
                <div className="match-header-top">
                  {match.type && (
                    <span className="match-type-tag">{match.type}</span>
                  )}

                  {upcomingMatchStatuses.includes(match.status) &&
                    <NotificationButton match={match} />
                  }
                </div>

                <h4>{seriesDefaultLabel(match)}</h4>

                <>                
                  <p>
                    <img src={getFlagName(match.localteam_id)} alt="" className="flag-icon" />
                    {getTeamName(match.localteam_id)} {getTeamRuns(match, match.localteam_id) && (getTeamRuns(match, match.localteam_id))}
                  </p>
                  <p>
                    <img src={getFlagName(match.visitorteam_id)} alt="" className="flag-icon" />
                    {getTeamName(match.visitorteam_id)} {getTeamRuns(match, match.visitorteam_id) && (getTeamRuns(match, match.visitorteam_id))}
                  </p>
                </>

                <p className="status">{match.note}</p>

                {match.status === 'NS' && (
                  <CountdownTimer startTime={match.starting_at} />
                )}

                {match.status === 'Finished' && (
                  <p className="status">
                    Man of the match: {match.manofmatch?.fullname || 'N/A'}
                  </p>
                )}

                <div className="match-meta">
                  {getVenueName(match.venue_id) && getVenueCity(match.venue_id) ? (
                    <span className="venue">Venue: {getVenueName(match.venue_id)}, {getVenueCity(match.venue_id)}</span>
                  ) : (
                    <span>Venue: TBD</span>
                  )}
                </div>

                <div className="notify-btn">
                  {match.id && !upcomingMatchStatuses.includes(match.status) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/match/${match.id}`);
                      }}
                    >
                      Scorecard
                    </button>
                  )}

                  {match?.id && match?.stage_id && match?.season_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/series/${match.stage_id}/${match.season_id}`, {
                          state: { seriesLabel: seriesDefaultLabel(match), seriesCode: match?.type },
                        });
                      }}
                    >
                      Series
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
