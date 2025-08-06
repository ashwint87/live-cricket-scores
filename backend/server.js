const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3001;

dotenv.config();

const dayjs = require('dayjs');
const advancedFormat = require('dayjs/plugin/advancedFormat');
dayjs.extend(advancedFormat);

const GITHUB_URL = 'https://raw.githubusercontent.com/ashwint87/cricket-website/master/';
const DEFAULT_IMAGES_URL = GITHUB_URL + 'live_cricket_website_default_image_urls';
const DEFAULT_PLAYER_IMAGE_URL = GITHUB_URL + 'top_players';

app.get('/api/default-player-images', async (req, res) => {
  try {
    const response = await axios.get(DEFAULT_PLAYER_IMAGE_URL);
    res.type('text/plain').send(response.data);
  } catch (err) {
    console.error('Error fetching default images:', err.message);
    res.status(500).json({ error: 'Failed to load default images' });
  }
});

app.get('/api/default-images', async (req, res) => {
  try {
    const response = await axios.get(DEFAULT_IMAGES_URL);
    res.type('text/plain').send(response.data);
  } catch (err) {
    console.error('Error fetching default images:', err.message);
    res.status(500).json({ error: 'Failed to load default player image' });
  }
});

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;
const GNEWS_BASE_URL = 'https://gnews.io/api/v4';

// Route to fetch cricket news
app.get('/api/news', async (req, res) => {
  try {
    const q = req.query.q || 'cricket';
    const max = req.query.max || 10;

    const toSearchQuery = (str) =>
      str
        .replace(/,/g, '')               // remove commas
        .replace(/[^\w\s]/g, '')         // remove special characters except space
        .trim()
        .replace(/\s+/g, '+');           // replace spaces with +

    const cleanedQuery = toSearchQuery(q);
    const url = `${GNEWS_BASE_URL}/search?q=${cleanedQuery}&lang=en&max=${max}&apikey=${GNEWS_API_KEY}`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching cricket news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// ------------------- SPOPRTMONKS API ROUTES -------------------

const SPORTMONKS_API_KEY = process.env.SPORTMONKS_API_KEY;
const SPORTMONKS_BASE_URL = 'https://cricket.sportmonks.com/api/v2.0';

async function fetchFromSportmonks(endpoint) {
  let url = `${SPORTMONKS_BASE_URL}/${endpoint}`;
  url += endpoint.includes('?') ? `&api_token=${SPORTMONKS_API_KEY}` : `?api_token=${SPORTMONKS_API_KEY}`;
console.log(url);
  const response = await axios.get(url);
  return response.data;
}

app.get('/api/schedule', async (req, res) => {
  const targetDate = dayjs(); // current date
  const start = targetDate.subtract(10, 'day').format('YYYY-MM-DD');
  const end = targetDate.add(75, 'day').format('YYYY-MM-DD');

  const filterParam = `filter[starts_between]=${start},${end}`;

  try {
    const response = await fetchFromSportmonks(`fixtures?${filterParam}&include=localteam,visitorteam,venue,manofmatch,runs,league,stage,tosswon`);
    const fixtures = response.data || [];

    const processed = fixtures.map(match => ({
      id: match.id,
      league_id: match.league?.id,
      season_id: match.season_id,
      league: match.league,
      round: match.round,
      localteam: match.localteam,
      visitorteam: match.visitorteam,
      venue: match.venue,
      manofmatch: match.manofmatch,
      runs: match.runs,
      status: match.status,
      note: match.note,
      starting_at: match.starting_at,
      type: match.type,
      stage: match.stage,
      stage_id: match.stage_id,
      elected: match.elected,
      toss_won_team_id: match.tosswon?.id,
    }));

    res.json({ data: processed });
  } catch (err) {
    console.error('❌ Error fetching matches:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/api/match/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`fixtures/${req.params.id}?include=localteam,visitorteam,league,stage,venue,lineup,balls,scoreboards,batting,bowling,manofmatch,firstumpire,secondumpire,tvumpire,referee`);
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching matches:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get matches for a team ID
app.get('/api/teams/:id/matches', async (req, res) => {
  try {
    const { id } = req.params;
    const now = dayjs();
    const start = now.subtract(45, 'day');
    const end = now.add(75, 'day');

    const response = await fetchFromSportmonks(`teams/${id}?include=fixtures,results`);
    const teamData = response.data;

    const matches = [...(teamData.fixtures || []), ...(teamData.results || [])];

    const filteredMatches = matches.filter((match) => {
      const matchDate = dayjs(match.starting_at);
      return matchDate.isAfter(start) && matchDate.isBefore(end);
    });

    // Optional: Sort by date descending (latest first)
    filteredMatches.sort((a, b) => new Date(b.starting_at) - new Date(a.starting_at));
    res.json({ data: filteredMatches });
  } catch (err) {
    console.error('Error fetching team matches:', err);
    res.status(500).json({ error: 'Failed to fetch team matches' });
  }
});

app.get('/api/team-squads/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`teams/${req.params.id}?include=squad`);
    res.json({ data });
  } catch (err) {
    console.error('❌ Error fetching team squads for ${req.params.id}:', err);
    res.status(500).json({ error: 'Team squad not found' });
  }
});

const IGNORE_CODES = ['T20', 'T10', 'ODI', 'T20I', '4day', 'Test', 'Test/5day', 'List A'];

app.get('/api/series', async (req, res) => {
  try {
    const now = dayjs();
    const start1 = now.subtract(30, 'day').format('YYYY-MM-DDTHH:mm:ss');
    const start2 = now.format('YYYY-MM-DDTHH:mm:ss');
    const end2 = now.add(300, 'day').format('YYYY-MM-DDTHH:mm:ss');

    const [resp1, resp2] = await Promise.all([
      fetchFromSportmonks(`fixtures?filter[starts_between]=${start1},${start2}&include=stage,season,league`),
      fetchFromSportmonks(`fixtures?filter[starts_between]=${start2},${end2}&include=stage,season,league`)
    ]);

    const allFixtures = [...(resp1?.data || []), ...(resp2?.data || [])];
    const groupedSeries = {};
    const stageDateMap = {};

    for (const fixture of allFixtures) {
      const { stage, league, season, starting_at } = fixture;
      if (!stage || !league || !season) continue;
      const stageId = stage.id;
      const key = `${league.id}_${season.id}_${league.code || ''}`;
      const type = stage.type;
      const code = league.code || '';

      // Record date ranges for stages
      const startTime = dayjs(starting_at);
      if (!stageDateMap[stageId]) stageDateMap[stageId] = { start: startTime, end: startTime };
      else {
        if (startTime.isBefore(stageDateMap[stageId].start)) stageDateMap[stageId].start = startTime;
        if (startTime.isAfter(stageDateMap[stageId].end)) stageDateMap[stageId].end = startTime;
      }

      if (!groupedSeries[key]) groupedSeries[key] = {};
      if (!groupedSeries[key][stageId]) {
        groupedSeries[key][stageId] = {
          id: stageId,
          name: stage.name,
          league_id: league.id,
          league: league.name,
          season_id: season.id,
          season: season.name,
          code,
        };
      }
    }

    const finalSeries = [];

    for (const key in groupedSeries) {
      const stages = Object.values(groupedSeries[key]);

      // Handle ignored format codes (ODI/T20 etc)
      if (IGNORE_CODES.includes(stages[0]?.code)) {
        for (const s of stages) {
          s.start_date = stageDateMap[s.id]?.start.format('D MMMM YYYY');
          s.end_date = stageDateMap[s.id]?.end.format('D MMMM YYYY');
          finalSeries.push(s);
        }
        continue;
      }

      // Regular & Playoff or fallback grouping
      const byName = {};
      for (const s of stages) {
        const name = s.name.toLowerCase();
        if (name.includes('regular')) byName.regular = s;
        else if (name.includes('play off')) byName.playoff = s;
      }

      if (byName.regular) {
        const regular = byName.regular;
        const playoff = byName.playoff;

        let stageIds = [regular.id];
        if (playoff) {
          stageIds.push(playoff.id);
        } else {
          // Fallback to regular.id + 1 only if same league/season/code
          const fallbackId = regular.id + 1;
          const fallbackStage = stages.find(s =>
            s.id === fallbackId &&
            s.league_id === regular.league_id &&
            s.season_id === regular.season_id
          );
          if (fallbackStage) {
            stageIds.push(fallbackId);
          }
        }

        // Calculate start & end using reduce
        const allStarts = stageIds.map(id => stageDateMap[id]?.start).filter(Boolean);
        const allEnds = stageIds.map(id => stageDateMap[id]?.end).filter(Boolean);
        const finalStart = allStarts.reduce((a, b) => (a.isBefore(b) ? a : b));
        const finalEnd = allEnds.reduce((a, b) => (a.isAfter(b) ? a : b));
        finalSeries.push({
          id: stageIds.length > 1 ? stageIds : stageIds[0],
          name: regular.name,
          league_id: regular.league_id,
          league: regular.league,
          season_id: regular.season_id,
          season: regular.season,
          code: regular.code,
          start_date: finalStart.format('D MMMM YYYY'),
          end_date: finalEnd.format('D MMMM YYYY'),
        });
      } else {
        // Push each stage individually
        for (const s of stages) {
          s.start_date = stageDateMap[s.id]?.start.format('D MMMM YYYY');
          s.end_date = stageDateMap[s.id]?.end.format('D MMMM YYYY');
          finalSeries.push(s);
        }
      }
    }

    res.json({ data: finalSeries });
  } catch (err) {
    console.error('❌ Error fetching series:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/api/series/:id/matches', async (req, res) => {
  try {
    const stageParam = req.params.id;
    const stageIds = Array.isArray(stageParam)
      ? stageParam
      : stageParam.split(',').map(id => id.trim()).filter(Boolean);

    const allMatches = [];

    for (const stageId of stageIds) {
      const response = await fetchFromSportmonks(
        `fixtures?filter[stage_id]=${stageId}&include=localteam,visitorteam,venue,runs,tosswon,stage`
      );
      if (response?.data) {
        allMatches.push(...response.data);
      }
    }

    const sorted = allMatches.sort((a, b) =>
      new Date(a.starting_at) - new Date(b.starting_at)
    );

    res.json({ data: { data: sorted } });
  } catch (err) {
    console.error('❌ Error fetching series matches:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/api/series/:id/standings', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`standings/stage/${req.params.id}`);
    res.json({ data });
  } catch (err) {
    console.error('❌ Error fetching series standings:', err);
    res.status(500).json({ error: err.toString() });
  }
});

app.get('/api/series/:id/squads', async (req, res) => {
  try {
    const { id: seriesId } = req.params;

    const now = dayjs();
    const start = now.subtract(45, 'day').format('YYYY-MM-DD');
    const end = now.add(75, 'day').format('YYYY-MM-DD');

    const fixturesRes = await fetchFromSportmonks(`fixtures?filter[starts_between]=${start},${end}&include=stage,season,venue,localteam,visitorteam`);
    const fixtures = fixturesRes.data;

    const clickedFixture = fixtures.find(f => f.stage?.id == seriesId);
    if (!clickedFixture) return res.json({ data: [] });

    const targetName = clickedFixture.stage?.name?.toLowerCase();
    const targetCountry = clickedFixture.venue?.country?.toLowerCase();

    const clubbedFixtures = fixtures.filter(
      f =>
        f.stage?.name?.toLowerCase() === targetName &&
        f.venue?.country?.toLowerCase() === targetCountry
    );

    const uniqueTeams = new Map();

    for (const match of clubbedFixtures) {
      const seasonId = match.season?.id;
      const teams = [match.localteam, match.visitorteam];
      for (const team of teams) {
        const key = `${team.id}-${seasonId}`;
        if (!uniqueTeams.has(key)) {
          const squadRes = await fetchFromSportmonks(`teams/${team.id}/squad/${seasonId}`);
          uniqueTeams.set(key, {
            team_id: team.id,
            team_name: team.name,
            season_id: seasonId,
            squad: squadRes?.data?.squad || [],
          });
        }
      }
    }

    res.json({ data: Array.from(uniqueTeams.values()) });
  } catch (err) {
    console.error('❌ Error fetching series squads:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get team name by ID
app.get('/api/teams/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`teams/${req.params.id}`);
    res.json({ data });
  } catch (err) {
    console.error(`❌ Failed to fetch team ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Team not found' });
  }
});

// Get player name by ID
app.get('/api/player-names/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`players/${req.params.id}`);
    res.json({ data });
  } catch (err) {
    console.error(`❌ Failed to fetch player ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Player not found' });
  }
});

// Get live matches for a specific team
app.get('/api/teams/:id/live-matches', async (req, res) => {
  try {
    const liveRes = await fetchFromSportmonks(`livescores?include=localteam,visitorteam,league,venue,runs,stage`);
    const teamId = parseInt(req.params.id, 10);
    const filtered = (liveRes.data || []).filter(
      (match) => match.localteam_id === teamId || match.visitorteam_id === teamId
    );
    res.json({ data: filtered });
  } catch (err) {
    console.error(`❌ Failed to fetch live matches for team ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Live matches not found' });
  }
});

// Get team squads by ID
app.get('/api/team-squads/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`teams/${req.params.id}?include=squad`);
    res.json({ data });
  } catch (err) {
    console.error(`❌ Failed to fetch team ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Team not found' });
  }
});

app.get('/api/teams/:teamId/squad/:seasonId', async (req, res) => {
  const { teamId, seasonId } = req.params;
  try {
    const squadRes = await fetchFromSportmonks(`teams/${teamId}/squad/${seasonId}`);
    res.json({ data: squadRes.data });
  } catch (err) {
    console.error('❌ Squad fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch team squad' });
  }
});

// Get list of team rankings
app.get('/api/team-rankings', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`team-rankings`);
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching team rankings:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get list of stadiums
app.get('/api/venues', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`venues`);
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching venues:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get venue details by ID
app.get('/api/venues/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromSportmonks(`venues/${id}`);
    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching venues:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get stage name by ID
app.get('/api/stages/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`stages/${req.params.id}`);
    res.json({ data });
  } catch (err) {
    console.error(`❌ Failed to fetch stage ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Stages not found' });
  }
});

// Get list of countries
app.get('/api/countries', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`countries`);
    res.json(data);
  } catch (err) {
    console.error('Error fetching countries:', err);
    res.status(500).json({ error: err.toString() });
  }
});

// Get country name by ID
app.get('/api/countries/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`countries/${req.params.id}`);
    res.json({ data });
  } catch (err) {
    console.error(`❌ Failed to fetch country ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Country not found' });
  }
});

app.get('/api/teams', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`teams`);
    const teams = data.data || [];

    res.json({ data });
  } catch (err) {
    console.error('Error fetching teams:', err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

app.get('/api/teams/:teamId/series', async (req, res) => {
  const { teamId } = req.params;
  try {
    const teamData = await fetchFromSportmonks(`teams/${teamId}?include=fixtures`);
    const fixtures = teamData.data?.fixtures || [];

    // Get unique season_ids from the fixtures
    const uniqueSeasonIds = [...new Set(fixtures.map(f => f.season_id).filter(Boolean))];

    const seriesList = [];

    for (const seasonId of uniqueSeasonIds) {
      const seasonRes = await fetchFromSportmonks(`seasons/${seasonId}?include=league`);
      const season = seasonRes.data;

      if (!season || !season.league) continue;

      seriesList.push({
        id: season.league.id,        // League (Series) ID
        name: season.name,           // Season name (e.g., "2026 India Tour of Australia")
        league: season.league.name,  // League name (e.g., "ICC ODI Championship")
        season_id: season.id
      });
    }

    res.json({ data: seriesList });
  } catch (err) {
    console.error('Error fetching team series:', err);
    res.status(500).json({ error: 'Failed to fetch team series' });
  }
});

const playerCache = new NodeCache({ stdTTL: 3600 }); // cache for 1 hour

app.get('/api/players', async (req, res) => {
  try {
    const cacheKey = 'players_fast';
    if (playerCache.has(cacheKey)) {
      return res.json({ data: playerCache.get(cacheKey) });
    }

    const githubRes = await axios.get(`${GITHUB_URL}players.json`);
    const playerData = githubRes.data;
    playerCache.set(cacheKey, playerData);
    res.json({ data: playerData });
  } catch (err) {
    console.error('❌ Failed to fetch players', err.message);
    res.status(500).json({ error: 'Failed to load player data' });
  }
});

// Get player info by ID
app.get('/api/player/:id', async (req, res) => {
  try {
    const data = await fetchFromSportmonks(`players/${req.params.id}?include=career,country,career.season`);
    res.json({ data });
  } catch (err) {
    console.error(`❌ Failed to fetch player ${req.params.id}:`, err.message);
    res.status(500).json({ error: 'Player not found' });
  }
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
