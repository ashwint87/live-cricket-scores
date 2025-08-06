export const getPlayerName = (id, lineup = []) => {
  if (!id) return '';
  const player = lineup.find(p => p.id === id);
  return player?.fullname || 'Player undefined';
};

export const renderPlayerNameLink = (playerId, lineup = []) => {
  const name = getPlayerName(playerId, lineup);
  return (
    <a href={`/player/${playerId}`} target="_blank" rel="noopener noreferrer">
      {name}
    </a>
  );
};
