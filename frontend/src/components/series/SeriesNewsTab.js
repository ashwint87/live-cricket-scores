import React from 'react';
import NewsWrapper from './../NewsWrapper';

export default function SeriesNews({ seriesLabel }) {
  return (
    <NewsWrapper query={seriesLabel} />
  );
}
