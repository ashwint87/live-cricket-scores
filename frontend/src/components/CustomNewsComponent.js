import React, { useEffect, useState } from 'react';
import { useNews } from './../context/NewsContext';
import './home/css/News.css';

export default function News() {
  const { articles, loading } = useNews();

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 className="news-title">Latest Cricket News</h2>
        <p>Loading News...</p>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <h2 className="news-title">Latest Cricket News</h2>
        <p>No articles at the moment.</p>
      </div>
    );
  }

  return (
    <div className="top-news-container">
      <div className="header">
        <h3>Latest Cricket News</h3>
        <a href="/news" className="news-all-btn-floating">All</a>
      </div>

      <div className="news-grid">
        {articles.map((article, index) => (
          <div key={index} className="news-card">
            <img
              src={article.image}
              alt={article.title}
              className="news-image"
            />
            <h2 className="news-heading">{article.title}</h2>
            <p className="news-meta">
              {article.source.name} •{' '}
              {new Date(article.publishedAt).toLocaleString()}
            </p>
            <p className="news-description">{article.description}</p>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="news-link"
            >
              Read more →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
