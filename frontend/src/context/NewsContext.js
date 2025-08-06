import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const NewsContext = createContext();

export const NewsProvider = ({ children, query, max = null }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const lastSuccessfulArticles = useRef([]);

  const toSearchQuery = (str) =>
    str.replace(/,/g, '').replace(/\s+/g, '+').replace(/[^\w+]/g, '');

  const searchQuery = toSearchQuery(query || '');

  // Load cached data on mount
  useEffect(() => {
    const cached = localStorage.getItem('cached_news');
    if (cached) {
      const parsed = JSON.parse(cached);
      lastSuccessfulArticles.current = parsed;
      setArticles(parsed); // show cached while loading
    }
  }, []);

  useEffect(() => {
    if (!searchQuery) return;

    const fetchNews = async () => {
      setLoading(true);
      try {
        let url = `/api/news?q=${searchQuery}`;
        if (max !== null) url += `&max=${max}`;

        const response = await fetch(url);
        const json = await response.json();

        if (json.articles?.length > 0) {
          setArticles(json.articles);
          lastSuccessfulArticles.current = json.articles;
          localStorage.setItem('cached_news', JSON.stringify(json.articles));
        } else {
          console.warn('API returned empty, using cached');
          setArticles(lastSuccessfulArticles.current);
        }
      } catch (error) {
        console.error('❌ News fetch failed:', error.message);
        setArticles(lastSuccessfulArticles.current);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [searchQuery, max]);

  return (
    <NewsContext.Provider value={{ articles, loading }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
