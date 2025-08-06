import React from 'react';
import NewsWrapper from './../NewsWrapper';

export default function NewsTab({ matchId, matchInfo }) {
  const info = matchInfo;
  if (!info) return <div>No news available at the moment.</div>;

  const matchName = `${info?.localteam?.name} vs ${info?.visitorteam?.name}, ${info?.round}`;

  return (
    <NewsWrapper query={matchName} />
  );
}
