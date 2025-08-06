import React from 'react';
import NewsWrapper from './../NewsWrapper';

export default function News({ teamName }) {
  const query = `${teamName} Cricket Team`;

  return (
    <NewsWrapper query={query} />
  );
}
