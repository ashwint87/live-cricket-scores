import React, { useEffect, useState } from 'react';

export default function NotificationLog({ matchId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const allKeys = Object.keys(localStorage);
    const matched = allKeys
      .filter(
        (key) =>
          key.startsWith(`notified_${matchId}_`) &&
          localStorage.getItem(key) === '1'
      )
      .map((key) => {
        const suffix = key.replace(`notified_${matchId}_`, '');
        return { matchId, event: suffix };
      });
    setLogs(matched);
  }, [matchId]);

  const clearLogs = () => {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(`notified_${matchId}_`)) localStorage.removeItem(k);
    });
    setLogs([]);
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', marginTop: '1rem' }}>
      <h3>📋 Notification History for Match {matchId}</h3>
      {logs.length === 0 ? (
        <p>No notifications triggered yet.</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>→ <em>{log.event}</em></li>
          ))}
        </ul>
      )}
      <button onClick={clearLogs} style={{ marginTop: '10px' }}>
        🔄 Clear
      </button>
    </div>
  );
}
