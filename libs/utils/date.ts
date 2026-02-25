export function timeAgo(date: Date | string | number): string {
  const inputDate = new Date(date);
  const now = new Date();
  const secondsDiff = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
  const absSeconds = Math.abs(secondsDiff);
  const isFuture = secondsDiff < 0;
  const suffix = isFuture ? "from now" : "ago";

  if (absSeconds < 60) {
    const count = absSeconds;
    return count === 1 ? `1 second ${suffix}` : `${count} seconds ${suffix}`;
  }

  const minutes = Math.floor(absSeconds / 60);
  if (minutes < 60) {
    return minutes === 1 ? `1 minute ${suffix}` : `${minutes} minutes ${suffix}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return hours === 1 ? `1 hour ${suffix}` : `${hours} hours ${suffix}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return days === 1 ? `1 day ${suffix}` : `${days} days ${suffix}`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return months === 1 ? `1 month ${suffix}` : `${months} months ${suffix}`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? `1 year ${suffix}` : `${years} years ${suffix}`;
}