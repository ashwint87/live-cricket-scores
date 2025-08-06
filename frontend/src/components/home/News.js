import React from 'react';
import NewsWrapper from './../NewsWrapper';
import './css/News.css';

export default function News() {
  return (
    <NewsWrapper query="Cricket" max={4} useCustom={true} />
  );
}
