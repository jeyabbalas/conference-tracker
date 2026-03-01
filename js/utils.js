// Date formatting, timezone conversion, and urgency helpers

export function parseDeadline(deadlineStr) {
  if (!deadlineStr) return null;
  return new Date(deadlineStr + 'Z');
}

export function daysUntil(date) {
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getUrgencyLevel(deadlineStr) {
  if (!deadlineStr) return 'tbd';
  const date = parseDeadline(deadlineStr);
  const days = daysUntil(date);
  if (days < 0) return 'closed';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'open';
}

export function formatDeadline(deadlineStr) {
  if (!deadlineStr) return null;
  const date = parseDeadline(deadlineStr);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

export function urgencyBadge(deadlineStr) {
  const level = getUrgencyLevel(deadlineStr);
  const date = parseDeadline(deadlineStr);
  const days = date ? daysUntil(date) : null;

  switch (level) {
    case 'closed':
      return { text: `Closed · ${Math.abs(days)}d ago`, cls: 'badge--closed' };
    case 'urgent':
      return { text: `${days}d left`, cls: 'badge--urgent' };
    case 'soon':
      return { text: `${days}d left`, cls: 'badge--soon' };
    case 'open':
      return { text: `${days}d left`, cls: 'badge--open' };
    case 'tbd':
    default:
      return { text: 'TBD', cls: 'badge--tbd' };
  }
}

export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
