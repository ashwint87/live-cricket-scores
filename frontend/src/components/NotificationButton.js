import React, { useState, useEffect } from 'react';
import './css/NotificationButton.css';

export default function NotificationButton({ match }) {
  const [enabled, setEnabled] = useState(() => {
    const list = JSON.parse(localStorage.getItem('notifiedMatches') || '[]');
    return list.includes(match.id);
  });
  const [showDialog, setShowDialog] = useState(false);

  const handleToggle = () => {
    const list = JSON.parse(localStorage.getItem('notifiedMatches') || '[]');
    let updated;

    if (enabled) {
      updated = list.filter(id => id !== match.id);
      localStorage.removeItem(`scheduled_${match.id}`);
    } else {
      updated = [...list, match.id];
      localStorage.removeItem(`scheduled_${match.id}`); // Reset if re-enabling
    }

    // Clear already sent notification keys on toggle for fresh testing
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(`notified_${match.id}_`)) {
        localStorage.removeItem(k);
      }
    });

    localStorage.setItem('notifiedMatches', JSON.stringify(updated));
    setEnabled(!enabled);
    setShowDialog(true);
  };

  useEffect(() => {
    if (Notification && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (showDialog) {
      const timer = setTimeout(() => {
        setShowDialog(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showDialog]);  useEffect(() => {
    if (!match?.starting_at) return;

    const list = JSON.parse(localStorage.getItem('notifiedMatches') || '[]');
    if (!list.includes(match.id)) return;

    const scheduledKey = `scheduled_${match.id}`;
    if (localStorage.getItem(scheduledKey)) return;

    const matchTime = new Date(match.starting_at).getTime();
    const now = Date.now();

    const times = [
      {
        offsetMs: 2200380000,
        key: '10min',
        body: 'Match starts in 10 minutes!',
      },
      {
        offsetMs: 0,
        key: 'start',
        body: 'Match has started!',
      }
    ];

    const timers = [];

    times.forEach(({ offsetMs, key, body }) => {
      const delay = matchTime - now - offsetMs;
      const notifKey = `notified_${match.id}_${key}`;

      if (delay > 0 && !localStorage.getItem(notifKey)) {
        timers.push(setTimeout(() => {
          new Notification(`${match.localteam.name} vs ${match.visitorteam.name}`, {
            body,
          });
          localStorage.setItem(notifKey, '1'); // Mark as sent
        }, delay));
      }
    });

    // Mark as scheduled
    localStorage.setItem(scheduledKey, '1');

    return () => timers.forEach(clearTimeout);
  }, [match]);

  return (
    <>
      <button
        className="notify-btn"
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
      >
        {enabled ? '🔔 On' : '🔕 Off'}
      </button>

      {showDialog && (
        <div className="notify-dialog">
          <div className="notify-dialog-content">
            <span>
              Notifications {enabled ? 'enabled' : 'disabled'} for<br />
              <strong>{match.localteam?.name} vs {match.visitorteam?.name}</strong>
            </span>
            <button className="close-btn" onClick={() => setShowDialog(false)}>×</button>
          </div>
        </div>
      )}
    </>
  );
}
