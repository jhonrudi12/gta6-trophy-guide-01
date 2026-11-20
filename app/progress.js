// Progress storage for the Leonida Platinum tracker: earned trophy ids live
// in localStorage, and can be exported to a file and imported back.
export const STORAGE_KEY = 'leonida-platinum-progress-v1';
export const DEMO_EARNED = [2, 3, 4, 5, 8, 15, 16, 20, 21, 35, 51, 53];

export function loadEarned() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55));
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function exportProgress(earned) {
  const payload = {
    app: 'Leonida Platinum — GTA VI Trophy Guide & Tracker',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-platinum-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('not a progress file');
  const ids = list.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55);
  if (ids.length === 0 && list.length > 0) throw new Error('no valid trophy ids');
  return new Set(ids);
}

export function seedDemoProgress() {
  const earned = new Set(DEMO_EARNED);
  saveEarned(earned);
  return earned;
}
