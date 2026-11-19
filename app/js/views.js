// Views: the checklist, the trophy detail pane, the roadmap, the missables page and About.
import { KIND_LABELS, GRADE_LETTER, trophyById, formatCount, isSpoilerHidden } from './data.js';
import { earnedCount } from './store.js';

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function medalNode(grade) {
  const span = el('span', 'medal ' + grade, GRADE_LETTER[grade] || '?');
  span.title = grade;
  return span;
}

export function updateProgressHeader(trophies, save) {
  const earned = earnedCount(save);
  const total = trophies.length;
  document.getElementById('earned-count').textContent = earned + ' / ' + total;
  document.getElementById('earned-pct').textContent = Math.round((earned / total) * 100) + '%';
  document.getElementById('progress-fill').style.width = (earned / total) * 100 + '%';
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) if (save.earned[t.id]) counts[t.grade] += 1;
  document.getElementById('grade-counts').textContent =
    '1 platinum · 2 gold · 6 silver · 46 bronze · 28 hidden — earned: ' +
    counts.platinum + 'P ' + counts.gold + 'G ' + counts.silver + 'S ' + counts.bronze + 'B';
}

function trophyMatches(trophy, filters, save) {
  if (filters.kind === 'missable' && !trophy.missable) return false;
  if (filters.kind === 'online') return false; // No online trophies exist; handled by the note.
  if (filters.kind !== 'all' && filters.kind !== 'missable' && !trophy.kinds.includes(filters.kind)) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.status === 'earned' && !save.earned[trophy.id]) return false;
  if (filters.status === 'remaining' && save.earned[trophy.id]) return false;
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const hay = (trophy.name + ' ' + trophy.description).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export function renderChecklist(trophies, sources, save, filters, selectedId, callbacks) {
  const list = document.getElementById('trophy-list');
  list.innerHTML = '';
  const shown = trophies.filter((t) => trophyMatches(t, filters, save));
  const earnedShown = shown.filter((t) => save.earned[t.id]).length;
  document.getElementById('list-summary').textContent =
    'Showing ' + shown.length + ' of ' + trophies.length + ' trophies (' + earnedShown + ' earned in this view).';
  const note = document.getElementById('filter-note');
  if (filters.kind === 'online') {
    note.textContent = 'No online trophies: all 55 are single-player and offline (PowerPyx). Nothing here can expire with a server.';
  } else if (filters.kind === 'missable') {
    note.textContent = 'Only 1 trophy is flagged as possibly missable — Positive Mental Attitude. See the Missables page.';
  } else {
    note.textContent = '';
  }

  for (const trophy of shown) {
    const li = el('li', 'trophy' + (save.earned[trophy.id] ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : ''));
    li.dataset.id = trophy.id;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = !!save.earned[trophy.id];
    box.setAttribute('aria-label', 'Earned: ' + trophy.name);
    box.addEventListener('change', () => callbacks.onToggleEarned(trophy.id, box.checked));
    box.addEventListener('click', (ev) => ev.stopPropagation());
    li.appendChild(box);
    li.appendChild(medalNode(trophy.grade));

    const body = el('div');
    const masked = isSpoilerHidden(trophy, save);
    if (masked) {
      body.appendChild(el('div', 'trophy-name spoiler-mask', 'Hidden trophy — earn it to reveal'));
      body.appendChild(el('div', 'trophy-desc spoiler-mask', 'This story trophy is hidden until earned. Turn “Hide story spoilers” off to see it.'));
    } else {
      body.appendChild(el('div', 'trophy-name', trophy.name));
      body.appendChild(el('div', 'trophy-desc', trophy.description));
    }
    const tags = el('div', 'trophy-tags');
    for (const kind of trophy.kinds) tags.appendChild(el('span', 'tag', KIND_LABELS[kind] || kind));
    if (trophy.hidden) tags.appendChild(el('span', 'tag hidden-flag', 'Hidden on PSN'));
    if (trophy.missable) tags.appendChild(el('span', 'tag missable', '⚠ Possibly missable'));
    body.appendChild(tags);
    li.appendChild(body);

    const side = el('div', 'trophy-side');
    if (trophy.target) {
      const count = save.counts[trophy.id] || 0;
      const counter = el('div', 'counter', formatCount(count) + ' / ' + formatCount(trophy.target));
      side.appendChild(counter);
      const stepper = el('div', 'stepper');
      const minus = el('button', null, '−');
      minus.setAttribute('aria-label', 'Decrease count');
      minus.addEventListener('click', (ev) => { ev.stopPropagation(); callbacks.onCount(trophy.id, -1); });
      const val = el('span', 'count-val', formatCount(count));
      const plus = el('button', null, '+');
      plus.setAttribute('aria-label', 'Increase count');
      plus.addEventListener('click', (ev) => { ev.stopPropagation(); callbacks.onCount(trophy.id, 1); });
      stepper.appendChild(minus);
      stepper.appendChild(val);
      stepper.appendChild(plus);
      side.appendChild(stepper);
    }
    li.appendChild(side);

    li.addEventListener('click', () => callbacks.onSelect(trophy.id));
    list.appendChild(li);
  }

  if (shown.length === 0) {
    const empty = el('li', null, 'No trophies match these filters.');
    empty.style.cssText = 'color: var(--muted); list-style: none; padding: 12px;';
    list.appendChild(empty);
  }
}

export function renderDetail(trophy, sources, save) {
  const empty = document.getElementById('detail-empty');
  const body = document.getElementById('detail-body');
  if (!trophy) {
    empty.hidden = false;
    body.hidden = true;
    body.innerHTML = '';
    return;
  }
  empty.hidden = true;
  body.hidden = false;
  body.innerHTML = '';
  const masked = isSpoilerHidden(trophy, save);

  const badge = el('span', 'detail-grade', trophy.grade + (trophy.hidden ? ' · hidden on PSN' : ''));
  body.appendChild(badge);
  body.appendChild(el('h2', null, masked ? 'Hidden trophy' : trophy.name));
  if (masked) {
    body.appendChild(el('p', 'detail-desc', 'This story trophy is hidden until you earn it. Turn “Hide story spoilers” off to read its name, description and guide.'));
    return;
  }
  body.appendChild(el('p', 'detail-desc', '“' + trophy.description + '”'));
  const srcWrap = el('div', 'detail-sources');
  srcWrap.appendChild(el('h3', null, 'Sources'));
  const ul = el('ul');
  for (const key of trophy.sources) {
    const src = sources[key];
    if (!src) continue;
    const li = el('li');
    const a = document.createElement('a');
    a.href = src.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = src.name;
    li.appendChild(a);
    ul.appendChild(li);
  }
  srcWrap.appendChild(ul);
  body.appendChild(srcWrap);
  if (trophy.missable) {
    body.appendChild(el('div', 'detail-warning', '⚠ Possibly missable — see the Missables page before you play Chapter 1. This is the only trophy on the list flagged that way.'));
  }
  body.appendChild(el('p', 'detail-guide', trophy.guide));

  const meta = [];
  if (trophy.target) meta.push('PSN progress target: ' + formatCount(trophy.target));
  meta.push('Kinds: ' + trophy.kinds.map((k) => KIND_LABELS[k] || k).join(', '));
  meta.push(save.earned[trophy.id] ? 'Status: earned ✓' : 'Status: not earned yet');
  body.appendChild(el('p', 'detail-meta', meta.join(' · ')));
}

export function renderRoadmap(roadmap, trophies, save) {
  const view = document.getElementById('roadmap-view');
  view.innerHTML = '';
  view.appendChild(el('h2', null, roadmap.title || 'Road to the Platinum'));
  view.appendChild(el('p', 'section-intro', roadmap.intro || ''));
  const est = el('p', 'section-intro');
  est.innerHTML = '';
  const strong = el('strong', null, 'Estimate: ' + (roadmap.estimate || ''));
  est.appendChild(strong);
  view.appendChild(est);

  const before = el('div', 'stage');
  before.appendChild(el('h3', null, 'Before you start'));
  const bl = el('ul');
  for (const tip of roadmap.beforeYouStart || []) bl.appendChild(el('li', null, tip));
  before.appendChild(bl);
  view.appendChild(before);

  for (const stage of roadmap.stages || []) {
    const box = el('div', 'stage');
    box.appendChild(el('span', 'stage-time', 'Stage ' + stage.n + ' · ' + stage.time));
    box.appendChild(el('h3', null, stage.title));
    box.appendChild(el('p', null, stage.body));
    const ids = stage.trophyIds || [];
    const done = ids.filter((id) => save.earned[id]).length;
    box.appendChild(el('p', 'stage-count', done + ' of ' + ids.length + ' trophies in this stage earned.'));
    const chips = el('div', 'stage-trophies');
    for (const id of ids) {
      const t = trophyById(trophies, id);
      if (!t) continue;
      chips.appendChild(el('span', save.earned[id] ? 'done' : '', (save.earned[id] ? '✓ ' : '') + t.name));
    }
    box.appendChild(chips);
    view.appendChild(box);
  }
}

export function renderMissables(roadmap, trophies, save) {
  const view = document.getElementById('missables-view');
  view.innerHTML = '';
  view.appendChild(el('h2', null, 'Missable trophies'));
  const m = roadmap.missables || {};
  const callout = el('div', 'callout');
  callout.appendChild(el('h3', null, m.headline || ''));
  callout.appendChild(el('p', null, m.body || ''));
  view.appendChild(callout);
  const flagged = trophies.filter((t) => t.missable);
  for (const t of flagged) {
    const box = el('div', 'stage');
    box.appendChild(el('h3', null, '⚠ ' + t.name + ' — ' + t.grade));
    box.appendChild(el('p', null, '“' + t.description + '”'));
    box.appendChild(el('p', null, t.guide));
    box.appendChild(el('p', 'stage-count', save.earned[t.id] ? 'Status: earned ✓' : 'Status: not earned yet'));
    view.appendChild(box);
  }
  view.appendChild(el('h3', null, 'What is safe'));
  const ul = el('ul', 'safe-list');
  for (const item of m.safeList || []) ul.appendChild(el('li', null, item));
  view.appendChild(ul);
}

export function renderAbout(sources) {
  const view = document.getElementById('about-view');
  view.innerHTML = '';
  view.appendChild(el('h2', null, 'About & sources'));
  view.appendChild(el('p', 'section-intro', 'This guide was written for the make.fun GTA 6 trophy guide bounty. It is an unofficial fan guide, not affiliated with Rockstar Games, and it uses no Rockstar logo, artwork or game screenshots. The trophy names, descriptions and grades are PlayStation’s, as listed by Exophase and PSNProfiles on 19 November 2026; every guide below them is this guide’s own words. Where a step is not yet confirmed by any real guide, the guide says so honestly instead of inventing a location.'));
  const table = document.createElement('table');
  table.className = 'source-table';
  const head = document.createElement('tr');
  head.appendChild(el('th', null, 'Source'));
  head.appendChild(el('th', null, 'What it is used for'));
  table.appendChild(head);
  const rows = [
    ['exophase', 'Official trophy names, descriptions and grades.'],
    ['psnprofiles', 'PSN progress counts (the “0 / 250” targets PlayStation tracks).'],
    ['powerpyx', 'How-to steps, the roadmap, the missable warning and the 100% checklist details.'],
    ['gtazone', 'The visible / hidden split of the 55 trophies and the unconfirmed triggers.'],
    ['youtube-tank', 'Video showing the tank location for Challenging Tank.'],
  ];
  for (const [key, use] of rows) {
    const src = sources[key];
    if (!src) continue;
    const tr = document.createElement('tr');
    const td1 = document.createElement('td');
    const a = document.createElement('a');
    a.href = src.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = src.name;
    td1.appendChild(a);
    tr.appendChild(td1);
    tr.appendChild(el('td', null, use));
    table.appendChild(tr);
  }
  view.appendChild(table);
  view.appendChild(el('p', 'section-intro', 'Your progress never leaves this browser: it is saved in localStorage, and the Export button downloads it as a file you can import back. This guide makes no network requests at run time — every file it loads lives in its own folder.'));
}
