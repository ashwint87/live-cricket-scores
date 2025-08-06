import React, { useEffect, useState } from 'react';
import App from './App';

export default function AppWrapper() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div style={offlineStyle}>
        <h2>No Internet Connection</h2>
        <p>Please check your connection and try again.</p>
      </div>
    );
  }

  return <App />;
}

const offlineStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f2f2f2',
  color: '#333',
  fontFamily: 'Arial',
  textAlign: 'center',
};
