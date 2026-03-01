// Fetch conference data and extract categories

let cached = null;

export async function fetchConferences() {
  if (cached) return cached;
  const res = await fetch('conferences.json');
  const json = await res.json();
  cached = json.conferences;
  return cached;
}

export function getCategories(conferences) {
  const seen = new Set();
  const categories = [];
  for (const c of conferences) {
    if (!seen.has(c.category)) {
      seen.add(c.category);
      categories.push(c.category);
    }
  }
  return categories.sort();
}
