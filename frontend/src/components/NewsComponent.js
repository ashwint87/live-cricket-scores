import React from 'react';
import { useNews } from './../context/NewsContext';
import './css/NewsTab.css';

const NewsComponent = () => {
  const { articles, loading } = useNews();

  if (loading) {
    return <div style={{ padding: '20px' }}><p>Loading News...</p></div>;
  }

  if (!articles || articles.length === 0) {
    return (
      <div style={{ padding: '20px' }}>
        <p>No articles at the moment.</p>
      </div>
    );
  }

  return (
    <div className="news-container">
      <div className="news-grid">
        {articles.map((article, index) => (
          <div key={index} className="news-card">
            <img src={article.image} alt={article.title} className="news-image" />
            <h2 className="news-heading">{article.title}</h2>
            <p className="news-meta">
              {article.source.name} • {new Date(article.publishedAt).toLocaleString()}
            </p>
            <p className="news-description">{article.description}</p>
            <a href={article.url} target="_blank" rel="noreferrer" className="news-link">
              Read more →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsComponent;
