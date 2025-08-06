import React, { useEffect, useState } from 'react';

function CountdownTimer({ startTime, offsetMs = 0 }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const matchTime = new Date(startTime).getTime();
      const targetTime = matchTime - offsetMs;
      const diff = targetTime - now;

      if (diff <= 0) {
        if (offsetMs === 0) {
          setTimeLeft('Match has started');
        } else {
          const mins = Math.floor(offsetMs / 60000);
          setTimeLeft(`Match starts in ${mins} minutes`);
        }
        return false; // Stop timer
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      return true;
    };

    updateTimer(); // 👈 run once immediately

    const interval = setInterval(() => {
      const keepRunning = updateTimer();
      if (!keepRunning) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, offsetMs]);

  return <>Match starts in {timeLeft}</>;
}

export default CountdownTimer;
