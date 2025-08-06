export const liveMatchStatuses = [
  '1st Innings', '2nd Innings', '3rd Innings', '4th Innings',
  'Stump Day 1', 'Stump Day 2', 'Stump Day 3', 'Stump Day 4',
  'Innings Break', 'Tea Break', 'Lunch', 'Dinner', 'Int.',
];

export const otherMatchStatuses = [
  'Delayed',
];

export const completedMatchStatuses = [
  'Finished', 'Cancl', 'Aban.',
];

export const upcomingMatchStatuses = [
  'NS', 'Postp.',
];

export const liveStatuses = [...liveMatchStatuses, ...otherMatchStatuses];

export const FORMAT_CODES = [
  'T20', 'T10', 'ODI', 'T20I', '4DAY', 'TEST', 'TEST/5DAY', 'LIST A',
];

export const dismissalsToShowAsW = [
  "Clean Bowled", "LBW OUT", "Catch Out", "Catch Out (Sub)",
  "Stump Out", "Run Out", "Run Out + 1", "Run Out + 2",
  "Run Out (Subs)", "Retired Out", "Hit Wicket", "Absent",
  "Absent Hurt", "Obstructing the field Out"
];
