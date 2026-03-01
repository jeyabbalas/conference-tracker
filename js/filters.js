// Filter and sort logic with UI state management

import { parseDeadline } from './utils.js';

export const state = {
  categories: new Set(),  // empty = show all
  search: '',
  sort: 'deadline',
};

export function filterConferences(conferences) {
  let result = conferences;
  if (state.categories.size > 0) {
    result = result.filter(c => state.categories.has(c.category));
  }
  if (state.search.trim()) {
    const q = state.search.trim().toLowerCase();
    result = result.filter(c =>
      c.abbreviation.toLowerCase().includes(q) ||
      c.fullName.toLowerCase().includes(q)
    );
  }
  return result;
}

export function sortConferences(conferences) {
  const sorted = [...conferences];

  switch (state.sort) {
    case 'deadline': {
      const now = Date.now();
      const upcoming = [];
      const past = [];
      const tbd = [];

      for (const c of sorted) {
        if (!c.submissionDeadline) {
          tbd.push(c);
        } else if (parseDeadline(c.submissionDeadline).getTime() >= now) {
          upcoming.push(c);
        } else {
          past.push(c);
        }
      }

      // Upcoming: soonest first
      upcoming.sort((a, b) => parseDeadline(a.submissionDeadline).getTime() - parseDeadline(b.submissionDeadline).getTime());
      // Past: most recently expired first (descending)
      past.sort((a, b) => parseDeadline(b.submissionDeadline).getTime() - parseDeadline(a.submissionDeadline).getTime());

      return [...upcoming, ...tbd, ...past];
    }
    case 'name':
      sorted.sort((a, b) => a.abbreviation.localeCompare(b.abbreviation));
      break;
    case 'date':
      sorted.sort((a, b) => {
        const da = a.conferenceDateStart ? new Date(a.conferenceDateStart).getTime() : Infinity;
        const db = b.conferenceDateStart ? new Date(b.conferenceDateStart).getTime() : Infinity;
        return da - db;
      });
      break;
  }

  return sorted;
}
