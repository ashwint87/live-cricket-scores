// src/context/NewsContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const NewsContext = createContext();

export const NewsProvider = ({ children, query, max = null }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const toSearchQuery = (str) =>
    str.replace(/,/g, '').replace(/\s+/g, '+').replace(/[^\w+]/g, '');

  const searchQuery = toSearchQuery(query || '');

  useEffect(() => {
    if (!searchQuery) return;

    const fetchNews = async () => {
      try {
        let url = `/api/news?q=${searchQuery}`;
        if (max !== null) {
          url += `&max=${max}`;
        }

        const response = await fetch(url);
        const json = await response.json();
        setArticles(json.articles || []);
      } catch (error) {
        console.error('Error fetching news articles', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [searchQuery]);

  return (
    <NewsContext.Provider value={{ articles, loading }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
