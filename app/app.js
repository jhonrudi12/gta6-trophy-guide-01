// Leonida Platinum — bootstrap: loads the trophy and roadmap data, wires the
// toolbar, the views and the hash routes, and keeps the checklist in sync.
import { loadEarned, saveEarned, exportProgress, parseImportedProgress, seedDemoProgress } from './progress.js';
import { renderChecklist, toggleEarned, gradeCountsText } from './checklist.js';
import { renderRoadmap } from './roadmap.js';

const listElement = document.getElementById('trophyList');
const resultLine = document.getElementById('resultLine');
const emptyNote = document.getElementById('emptyNote');
const onlineNote = document.getElementById('onlineNote');
const checklistView = document.getElementById('checklistView');
const roadmapView = document.getElementById('roadmapView');
const toolbar = document.querySelector('.toolbar');

const searchInput = document.getElementById('search');
const kindFilter = document.getElementById('kindFilter');
const gradeFilter = document.getElementById('gradeFilter');
const statusFilter = document.getElementById('statusFilter');
const spoilerToggle = document.getElementById('spoilerToggle');

const trophyData = await (await fetch('data/trophies.json')).json();
const roadmapData = await (await fetch('data/roadmap.json')).json();
const trophies = trophyData.trophies;

let earned = loadEarned();
let selectedId = null;
let view = 'checklist';

const filters = {
  search: '',
  kind: 'all',
  grade: 'all',
  status: 'all',
  spoiler: false,
};

function readShareableState() {
  const params = new URLSearchParams(location.search);
  if (params.get('demo') === '1') earned = seedDemoProgress();
  if (params.get('kind')) filters.kind = params.get('kind');
  if (params.get('grade')) filters.grade = params.get('grade');
  if (params.get('status')) filters.status = params.get('status');
  if (params.get('spoiler') === 'on') filters.spoiler = true;
  if (params.get('search')) filters.search = params.get('search');
}

function applyFiltersToControls() {
  searchInput.value = filters.search;
  kindFilter.value = filters.kind;
  gradeFilter.value = filters.grade;
  statusFilter.value = filters.status;
  spoilerToggle.checked = filters.spoiler;
}

function renderProgress() {
  document.getElementById('earnedCount').textContent = String(earned.size);
  const fill = document.getElementById('progressFill');
  fill.style.width = `${(earned.size / trophies.length) * 100}%`;
  const bar = document.getElementById('progressBar');
  bar.setAttribute('aria-valuenow', String(earned.size));
  document.getElementById('progressNote').textContent =
    earned.size === trophies.length
      ? 'Platinum! Every trophy is earned — Vice Got a Price!'
      : `${earned.size} of ${trophies.length} earned — ${trophies.length - earned.size} to go. Progress is saved in this browser.`;
  document.getElementById('gradeCounts').textContent = gradeCountsText(trophies, earned);
}

function renderAll() {
  renderProgress();
  const shown = renderChecklist(
    listElement,
    trophies,
    filters,
    earned,
    selectedId,
    selectTrophy,
    (id, isEarned) => {
      toggleEarned(earned, id, isEarned);
      renderAll();
    },
    (id, isEarned) => {
      toggleEarned(earned, id, isEarned);
      renderAll();
    },
  );
  resultLine.textContent = `Showing ${shown} of ${trophies.length} trophies`;
  emptyNote.hidden = shown !== 0 || filters.kind === 'online';
  onlineNote.hidden = filters.kind !== 'online';
  document.getElementById('viewChecklist').classList.toggle('active', view === 'checklist');
  document.getElementById('viewRoadmap').classList.toggle('active', view === 'roadmap');
  checklistView.hidden = view !== 'checklist';
  roadmapView.hidden = view !== 'roadmap';
  // The toolbar controls the checklist, so it rests while the roadmap is up.
  toolbar.hidden = view !== 'checklist';
}

function selectTrophy(id) {
  selectedId = id;
  view = 'checklist';
  if (location.hash !== `#/trophy-${id}`) history.replaceState(null, '', `#/trophy-${id}`);
  renderAll();
}

function showRoadmap() {
  view = 'roadmap';
  if (location.hash !== '#/roadmap') history.replaceState(null, '', '#/roadmap');
  renderAll();
}

function showChecklist() {
  view = 'checklist';
  if (location.hash !== '#/checklist') history.replaceState(null, '', '#/checklist');
  renderAll();
}

function readHashRoute() {
  if (location.hash === '#/roadmap') {
    view = 'roadmap';
  } else if (location.hash.startsWith('#/trophy-')) {
    const id = Number(location.hash.replace('#/trophy-', ''));
    if (Number.isInteger(id) && id >= 1 && id <= 55) selectedId = id;
    view = 'checklist';
  } else {
    view = 'checklist';
  }
}

document.getElementById('viewChecklist').addEventListener('click', showChecklist);
document.getElementById('viewRoadmap').addEventListener('click', showRoadmap);
document.getElementById('missableLink').addEventListener('click', () => selectTrophy(28));

searchInput.addEventListener('input', () => {
  filters.search = searchInput.value;
  renderAll();
});
kindFilter.addEventListener('change', () => {
  filters.kind = kindFilter.value;
  renderAll();
});
gradeFilter.addEventListener('change', () => {
  filters.grade = gradeFilter.value;
  renderAll();
});
statusFilter.addEventListener('change', () => {
  filters.status = statusFilter.value;
  renderAll();
});
spoilerToggle.addEventListener('change', () => {
  filters.spoiler = spoilerToggle.checked;
  renderAll();
});

document.getElementById('exportBtn').addEventListener('click', () => exportProgress(earned));
document.getElementById('importInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    earned = parseImportedProgress(await file.text());
    saveEarned(earned);
    renderAll();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
  event.target.value = '';
});
document.getElementById('demoBtn').addEventListener('click', () => {
  earned = seedDemoProgress();
  renderAll();
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});

window.addEventListener('hashchange', () => {
  readHashRoute();
  renderAll();
});

renderRoadmap(roadmapView, roadmapData, selectTrophy);
readShareableState();
applyFiltersToControls();
readHashRoute();
renderAll();
