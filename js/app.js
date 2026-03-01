// Entry point: bootstrap, event wiring, orchestration

import { fetchConferences, getCategories } from './data.js';
import { state, filterConferences, sortConferences } from './filters.js';
import { renderFilterBar, renderSortControls, renderConferenceCards, renderResultsCount } from './render.js';

let allConferences = [];
let categories = [];

async function init() {
  allConferences = await fetchConferences();
  categories = getCategories(allConferences);

  renderSortControls(state.sort, (val) => {
    state.sort = val;
    applyAndRender();
  });

  document.getElementById('search-input').addEventListener('input', (e) => {
    state.search = e.target.value;
    applyAndRender();
  });

  applyAndRender();

  // Close calendar dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.cal-dropdown').forEach(d => d.hidden = true);
  });
}

function applyAndRender() {
  const filtered = filterConferences(allConferences);
  const sorted = sortConferences(filtered);

  renderFilterBar(categories, state.categories, (cat) => {
    if (cat === 'All') {
      state.categories.clear();
    } else if (state.categories.has(cat)) {
      state.categories.delete(cat);
    } else {
      state.categories.add(cat);
    }
    applyAndRender();
  });

  renderConferenceCards(sorted);
  renderResultsCount(sorted.length, allConferences.length);
}

init();
