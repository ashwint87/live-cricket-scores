export const getTossWinnerName = (info) => {
  if (info?.toss_won_team_id === info?.localteam?.id) {
    return info.localteam.name;
  } else if (info?.toss_won_team_id === info?.visitorteam?.id) {
    return info.visitorteam.name;
  } else {
    return '';
  }
};

export const getTossDecision = (info) => {
  if (info?.elected === 'batting') return 'bat first';
  if (info?.elected === 'bowling') return 'bowl first';
  return '';
};

export const matchYear = (info) => {
  return new Date(info?.starting_at).getFullYear();
};

export const matchStageName = (match) => {
  return match?.stage?.name + ', ' + matchYear(match);
};

export const venueName = (match) => {
  return match.venue?.name && match.venue?.city
    ? `${match.venue.name}, ${match.venue.city}`
    : 'TBD';
};

export const getTeamRuns = (match, teamId) => {
  if (!match.runs || !Array.isArray(match.runs)) return '';
  const innings = match.runs.filter(r => r.team_id === teamId);
  return innings
    .map(r => `${r.score}/${r.wickets} (${r.overs} ov)`)
    .join(' & ');
};

export const getTeamName = (teamId, data) => {
  if (teamId === data.localteam_id) return data.localteam?.name || 'Local Team';
  if (teamId === data.visitorteam_id) return data.visitorteam?.name || 'Visitor Team';
  return `Team ${teamId}`;
};

export const getBattingTeamIdByScoreboard = (scoreboardKey, batting = []) => {
  const entry = batting.find(b => b.scoreboard === scoreboardKey);
  return entry?.team_id || null;
};

export const getBowlingTeamIdByScoreboard = (scoreboardKey, bowling = []) => {
  const entry = bowling.find(b => b.scoreboard === scoreboardKey);
  return entry?.team_id || null;
};
