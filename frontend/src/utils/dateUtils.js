export const formatDateWithSuffix = (dateStr) => {
  const date = new Date(dateStr);
  const day = date.getDate();

  const getDaySuffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const dayWithSuffix = `${day}${getDaySuffix(day)}`;
  const month = date.toLocaleString('en-GB', { month: 'long' });
  const year = date.getFullYear();

  return `${dayWithSuffix} ${month}, ${year}`;
}

export const getDaysToGo = (dateStr) => {
  const matchDate = new Date(dateStr);
  const today = new Date();
  // Reset time to 00:00:00 to calculate full days difference
  matchDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = matchDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Match Ended';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day to go';
  return `${diffDays} days to go`;
}

