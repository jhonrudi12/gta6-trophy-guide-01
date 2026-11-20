// Checklist rendering: one row per trophy, with filters, search and the
// spoiler setting that hides story trophies until they are earned. The
// selected row expands to show its guide, sources and earned button.
import { saveEarned } from './progress.js';
import { buildGuideDetail } from './guide.js';

export const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  side: 'Side quests & open world',
  online: 'Online',
};

export function isSpoilerHidden(trophy, earned, spoilerOn) {
  return spoilerOn && trophy.story && !earned.has(trophy.id);
}

export function trophyMatches(trophy, filters, earned) {
  if (filters.kind === 'missable' && !trophy.missable) return false;
  if (filters.kind === 'online') return false;
  if (filters.kind !== 'all' && filters.kind !== 'missable' && filters.kind !== 'online' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.status === 'earned' && !earned.has(trophy.id)) return false;
  if (filters.status === 'remaining' && earned.has(trophy.id)) return false;
  if (filters.search) {
    const needle = filters.search.toLowerCase();
    const haystack = `${trophy.name} ${trophy.description} ${trophy.target}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

function buildRow(trophy, earned, spoilerOn, isSelected, onSelect, onToggle, onToggleEarned) {
  const hidden = isSpoilerHidden(trophy, earned, spoilerOn);
  const li = document.createElement('li');
  li.className = 'trophy-row' + (earned.has(trophy.id) ? ' earned' : '');
  li.dataset.trophyId = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.id);
  box.setAttribute('aria-label', `Earned: ${hidden ? 'hidden story trophy' : trophy.name}`);
  box.addEventListener('change', () => onToggle(trophy.id, box.checked));
  box.addEventListener('click', (event) => event.stopPropagation());
  li.append(box);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade;
  li.append(badge);

  const main = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  if (hidden) {
    name.textContent = 'Hidden story trophy';
    name.classList.add('spoiler-hidden');
  } else {
    name.textContent = trophy.name;
    if (earned.has(trophy.id)) {
      const mark = document.createElement('span');
      mark.className = 'earned-mark';
      mark.textContent = ' ✓';
      name.append(mark);
    }
  }
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Story spoiler hidden — earn this trophy to reveal its name and description.' : trophy.description;
  if (hidden) desc.classList.add('spoiler-hidden');
  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  tags.append(kindTag);
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = '⚠ Missable';
    tags.append(missTag);
  }
  if (!hidden && trophy.target) {
    const targetTag = document.createElement('span');
    targetTag.className = 'tag target';
    targetTag.textContent = trophy.target;
    tags.append(targetTag);
  }
  main.append(name, desc, tags);
  li.append(main);

  const guideButton = document.createElement('button');
  guideButton.type = 'button';
  guideButton.className = 'guide-link';
  guideButton.textContent = 'Guide →';
  guideButton.addEventListener('click', (event) => {
    event.stopPropagation();
    onSelect(trophy.id);
  });
  li.append(guideButton);

  li.addEventListener('click', () => onSelect(trophy.id));
  if (isSelected) {
    li.classList.add('selected');
    li.append(buildGuideDetail(trophy, hidden, earned, onToggleEarned));
  }
  return li;
}

export function renderChecklist(listElement, trophies, filters, earned, selectedId, onSelect, onToggle, onToggleEarned) {
  const visible = trophies.filter((trophy) => trophyMatches(trophy, filters, earned));
  listElement.replaceChildren();
  for (const trophy of visible) {
    const row = buildRow(trophy, earned, filters.spoiler, trophy.id === selectedId, onSelect, onToggle, onToggleEarned);
    listElement.append(row);
  }
  return visible.length;
}

export function toggleEarned(earned, id, isEarned) {
  if (isEarned) earned.add(id);
  else earned.delete(id);
  saveEarned(earned);
  return earned;
}

export function gradeCountsText(trophies, earned) {
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  return grades
    .map((grade) => {
      const total = trophies.filter((t) => t.grade === grade).length;
      const got = trophies.filter((t) => t.grade === grade && earned.has(t.id)).length;
      return `${grade} ${got}/${total}`;
    })
    .join(' · ');
}
