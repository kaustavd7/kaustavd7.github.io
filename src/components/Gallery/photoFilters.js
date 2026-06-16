// Pure, framework-agnostic faceted-filter helpers shared by the gallery UI.
// Filters are stored as { model: string[], lens: string[], year: string[],
// country: string[] }. Within a facet the selected values are OR'd; across
// facets they are AND'd. All comparisons are string-based so numeric facets
// (year) and text facets behave the same.

export const FACETS = [
  { key: "model", label: "Model" },
  { key: "lens", label: "Lens" },
  { key: "year", label: "Year" },
  { key: "country", label: "Country" },
];

export function emptyFilters() {
  return { model: [], lens: [], year: [], country: [] };
}

export function countActive(filters) {
  return FACETS.reduce((total, { key }) => total + (filters[key]?.length || 0), 0);
}

// Does a photo satisfy the filters? `exceptKey` lets a facet ignore its own
// selection so its option counts reflect "what would I get if I picked this".
export function photoMatches(photo, filters, exceptKey = null) {
  return FACETS.every(({ key }) => {
    if (key === exceptKey) return true;
    const selected = filters[key];
    if (!selected || selected.length === 0) return true;
    const value = photo[key];
    return value != null && selected.includes(String(value));
  });
}

export function applyFilters(photos, filters) {
  return photos.filter((photo) => photoMatches(photo, filters));
}

// Available values + counts for one facet, given the other active filters.
export function facetOptions(photos, filters, key) {
  const counts = new Map();
  for (const photo of photos) {
    if (!photoMatches(photo, filters, key)) continue;
    const value = photo[key];
    if (value == null || value === "") continue;
    const stringValue = String(value);
    counts.set(stringValue, (counts.get(stringValue) || 0) + 1);
  }
  const options = [...counts.entries()].map(([value, count]) => ({ value, count }));
  if (key === "year") {
    options.sort((a, b) => Number(b.value) - Number(a.value));
  } else {
    options.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }
  return options;
}
