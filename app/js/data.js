// Data loading and lookup helpers for the trophy list and the roadmap.
export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

export const GRADE_LETTER = {
  platinum: 'P',
  gold: 'G',
  silver: 'S',
  bronze: 'B',
};

export async function loadGuideData() {
  const [trophiesRes, roadmapRes] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/roadmap.json'),
  ]);
  if (!trophiesRes.ok) throw new Error('Could not load data/trophies.json');
  if (!roadmapRes.ok) throw new Error('Could not load data/roadmap.json');
  const trophiesDoc = await trophiesRes.json();
  const roadmapDoc = await roadmapRes.json();
  return { trophies: trophiesDoc.trophies, sources: trophiesDoc.sources, roadmap: roadmapDoc };
}

export function trophyById(trophies, id) {
  return trophies.find((t) => t.id === id) || null;
}

export function gradeCounts(trophies) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) counts[t.grade] = (counts[t.grade] || 0) + 1;
  return counts;
}

export function formatCount(n) {
  return n.toLocaleString('en-US');
}

export function isSpoilerHidden(trophy, save) {
  return save.spoilers && trophy.hidden && !save.earned[trophy.id];
}
