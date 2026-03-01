// All DOM construction: cards, filters, sort controls

import { formatDeadline, urgencyBadge, getUrgencyLevel } from './utils.js';
import { downloadICS, getGoogleCalendarUrl } from './calendar.js';
import { state } from './filters.js';

const CATEGORY_COLORS = {
  'Biomedical Informatics': '#3b82f6',
  'Bioinformatics': '#10b981',
  'Artificial Intelligence': '#8b5cf6',
  'Artificial Intelligence for Health': '#f59e0b',
  'Epidemiology': '#ef4444',
  'Cancer Research': '#ec4899',
};

export function renderFilterBar(categories, activeCategories, onToggle) {
  const bar = document.getElementById('filter-bar');
  bar.innerHTML = '';

  const allActive = activeCategories.size === 0;
  const allBtn = createPill('All', allActive, () => onToggle('All'));
  bar.appendChild(allBtn);

  for (const cat of categories) {
    const color = CATEGORY_COLORS[cat] || '#6b7280';
    const active = activeCategories.has(cat);
    const pill = createPill(cat, active, () => onToggle(cat), color);
    bar.appendChild(pill);
  }
}

function createPill(label, active, onClick, color) {
  const btn = document.createElement('button');
  btn.className = 'pill' + (active ? ' pill--active' : '');
  btn.textContent = label;
  btn.addEventListener('click', onClick);

  if (color) {
    btn.style.setProperty('--pill-color', color);
    if (active) {
      btn.style.backgroundColor = color;
      btn.style.borderColor = color;
      btn.style.color = '#fff';
    } else {
      btn.style.borderColor = color;
      btn.style.color = color;
    }
  }

  return btn;
}

export function renderSortControls(currentSort, onChange) {
  const select = document.getElementById('sort-select');
  select.value = currentSort;
  select.onchange = () => onChange(select.value);
}

export function renderResultsCount(count, total) {
  const el = document.getElementById('results-count');
  el.textContent = `Showing ${count} of ${total} conferences`;
}

export function renderConferenceCards(conferences) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';

  if (conferences.length === 0) {
    grid.innerHTML = '<p class="empty-state">No conferences match your filters.</p>';
    return;
  }

  let currentGroup = null;
  for (const conf of conferences) {
    if (state.sort === 'deadline') {
      const group = getUrgencyLevel(conf.submissionDeadline) === 'tbd'
        ? 'tbd'
        : getUrgencyLevel(conf.submissionDeadline) === 'closed'
          ? 'past'
          : 'upcoming';

      if (currentGroup && group !== currentGroup) {
        const sep = document.createElement('div');
        sep.className = 'card-grid__separator';
        const label = document.createElement('span');
        label.className = 'card-grid__separator-label';
        label.textContent = group === 'past' ? 'Past Deadlines' : 'Deadline TBD';
        sep.appendChild(label);
        grid.appendChild(sep);
      }
      currentGroup = group;
    }
    grid.appendChild(createCard(conf));
  }
}

function createCard(conf) {
  const article = document.createElement('article');
  article.className = 'card';

  const color = CATEGORY_COLORS[conf.category] || '#6b7280';
  article.style.borderLeftColor = color;

  const urgency = getUrgencyLevel(conf.submissionDeadline);
  if (urgency === 'closed') {
    article.classList.add('card--closed');
  }

  // Header: abbreviation link + category pill
  const header = document.createElement('div');
  header.className = 'card__header';

  const titleLink = document.createElement('a');
  titleLink.href = conf.website;
  titleLink.target = '_blank';
  titleLink.rel = 'noopener noreferrer';
  titleLink.className = 'card__title';
  titleLink.textContent = conf.abbreviation;

  const catPill = document.createElement('span');
  catPill.className = 'card__category';
  catPill.textContent = conf.category;
  catPill.style.backgroundColor = color + '18';
  catPill.style.color = color;

  header.appendChild(titleLink);
  header.appendChild(catPill);

  // Full name
  const fullName = document.createElement('p');
  fullName.className = 'card__fullname';
  fullName.textContent = conf.fullName;

  // Deadline row
  const deadlineRow = document.createElement('div');
  deadlineRow.className = 'card__row';

  const deadlineIcon = document.createElement('span');
  deadlineIcon.className = 'card__icon';
  deadlineIcon.setAttribute('aria-hidden', 'true');
  deadlineIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;

  const deadlineText = document.createElement('span');
  const badge = urgencyBadge(conf.submissionDeadline);
  if (conf.submissionDeadline) {
    deadlineText.textContent = formatDeadline(conf.submissionDeadline);
  }

  const badgeSpan = document.createElement('span');
  badgeSpan.className = `badge ${badge.cls}`;
  badgeSpan.textContent = badge.text;

  deadlineRow.appendChild(deadlineIcon);
  if (deadlineText.textContent) deadlineRow.appendChild(deadlineText);
  deadlineRow.appendChild(badgeSpan);

  // Location row
  const locRow = document.createElement('div');
  locRow.className = 'card__row';

  const locIcon = document.createElement('span');
  locIcon.className = 'card__icon';
  locIcon.setAttribute('aria-hidden', 'true');
  locIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`;

  const locText = document.createElement('span');
  locText.textContent = `${conf.location.flagEmoji} ${conf.location.raw}`;

  const locLinks = document.createElement('span');
  locLinks.className = 'card__loc-links';
  locLinks.innerHTML = `
    <a href="${conf.location.googleMapsUrl}" target="_blank" rel="noopener noreferrer" title="Google Maps" aria-label="View on Google Maps">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
    </a>
    <a href="${conf.location.unsplashUrl}" target="_blank" rel="noopener noreferrer" title="Unsplash Photos" aria-label="Photos on Unsplash">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    </a>
    <a href="${conf.location.atlasObscuraUrl}" target="_blank" rel="noopener noreferrer" title="Atlas Obscura" aria-label="Explore on Atlas Obscura">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
    </a>`;

  locRow.appendChild(locIcon);
  locRow.appendChild(locText);
  locRow.appendChild(locLinks);

  // Conference dates
  const dateRow = document.createElement('div');
  dateRow.className = 'card__row';

  const dateIcon = document.createElement('span');
  dateIcon.className = 'card__icon';
  dateIcon.setAttribute('aria-hidden', 'true');
  dateIcon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

  const dateText = document.createElement('span');
  dateText.textContent = conf.conferenceDateDisplay;

  dateRow.appendChild(dateIcon);
  dateRow.appendChild(dateText);

  // Notes
  let notesEl = null;
  if (conf.notes) {
    notesEl = document.createElement('p');
    notesEl.className = 'card__notes';
    notesEl.textContent = conf.notes;
  }

  // Calendar dropdown
  const calWrap = document.createElement('div');
  calWrap.className = 'card__calendar';

  const calBtn = document.createElement('button');
  calBtn.className = 'cal-btn';
  calBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Add to Calendar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

  const dropdown = document.createElement('div');
  dropdown.className = 'cal-dropdown';
  dropdown.hidden = true;

  const outlookOpt = document.createElement('button');
  outlookOpt.className = 'cal-dropdown__item';
  outlookOpt.textContent = 'Outlook (.ics)';
  outlookOpt.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadICS(conf);
    dropdown.hidden = true;
  });

  const googleOpt = document.createElement('a');
  googleOpt.className = 'cal-dropdown__item';
  googleOpt.href = getGoogleCalendarUrl(conf);
  googleOpt.target = '_blank';
  googleOpt.rel = 'noopener noreferrer';
  googleOpt.textContent = 'Google Calendar';
  googleOpt.addEventListener('click', () => {
    dropdown.hidden = true;
  });

  dropdown.appendChild(outlookOpt);
  dropdown.appendChild(googleOpt);

  calBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Close all other open dropdowns
    document.querySelectorAll('.cal-dropdown').forEach(d => {
      if (d !== dropdown) d.hidden = true;
    });
    dropdown.hidden = !dropdown.hidden;
  });

  calWrap.appendChild(calBtn);
  calWrap.appendChild(dropdown);

  // Assemble card
  article.appendChild(header);
  article.appendChild(fullName);
  article.appendChild(deadlineRow);
  article.appendChild(locRow);
  article.appendChild(dateRow);
  if (notesEl) article.appendChild(notesEl);
  article.appendChild(calWrap);

  return article;
}
