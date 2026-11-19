// Save store: progress lives in localStorage, export/import move it as a file.
export const SAVE_KEY = 'gta6-trophy-guide-v1';

export function blankSave() {
  return { earned: {}, counts: {}, spoilers: false };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return blankSave();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return blankSave();
    return {
      earned: parsed.earned && typeof parsed.earned === 'object' ? parsed.earned : {},
      counts: parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {},
      spoilers: parsed.spoilers === true,
    };
  } catch (err) {
    return blankSave();
  }
}

export function persistSave(save) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (err) {
    // Storage full or unavailable (private mode): progress just does not persist.
  }
}

export function hasSave() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function earnedCount(save) {
  return Object.keys(save.earned).filter((id) => save.earned[id]).length;
}

export function downloadSave(save) {
  const blob = new Blob([JSON.stringify(save, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedSave(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a save file');
  const save = blankSave();
  if (parsed.earned && typeof parsed.earned === 'object') {
    for (const id of Object.keys(parsed.earned)) {
      if (parsed.earned[id]) save.earned[id] = true;
    }
  }
  if (parsed.counts && typeof parsed.counts === 'object') {
    for (const id of Object.keys(parsed.counts)) {
      const n = Number(parsed.counts[id]);
      if (Number.isFinite(n) && n > 0) save.counts[id] = Math.floor(n);
    }
  }
  if (parsed.spoilers === true) save.spoilers = true;
  return save;
}

// Demo progress used for screenshots and first-run previews: 13 earned, counters part-way.
// Only applied when no save exists yet, so a real player's progress is never overwritten.
export function demoSave() {
  return {
    earned: { 2: true, 3: true, 8: true, 16: true, 20: true, 21: true, 35: true, 46: true, 47: true, 52: true, 53: true, 54: true, 55: true },
    counts: { 14: 23, 15: 87, 30: 1, 31: 64, 32: 31, 42: 41 },
    spoilers: false,
  };
}
