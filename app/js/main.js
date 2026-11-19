// Boot: load the data, wire the toolbar, route between views, seed demo progress for screenshots.
import { loadGuideData, trophyById } from './data.js';
import { loadSave, persistSave, hasSave, demoSave, downloadSave, parseImportedSave } from './store.js';
import { updateProgressHeader, renderChecklist, renderDetail, renderRoadmap, renderMissables, renderAbout } from './views.js';

const params = new URLSearchParams(location.search);
const VIEWS = ['checklist', 'roadmap', 'missables', 'about'];

let trophies = [];
let sources = {};
let roadmap = null;
let save = loadSave();
let selectedId = null;
const filters = { kind: 'all', grade: 'all', status: 'all', search: '' };

function currentView() {
  const hash = (location.hash || '#/checklist').replace('#/', '');
  return VIEWS.includes(hash) ? hash : 'checklist';
}

function showView(view) {
  for (const v of VIEWS) {
    document.getElementById('nav-' + v).classList.toggle('active', v === view);
  }
  const checklist = view === 'checklist';
  document.getElementById('toolbar').style.display = checklist ? '' : 'none';
  document.getElementById('view').style.display = checklist ? '' : 'none';
  document.getElementById('roadmap-view').hidden = view !== 'roadmap';
  document.getElementById('missables-view').hidden = view !== 'missables';
  document.getElementById('about-view').hidden = view !== 'about';
  if (view === 'roadmap') renderRoadmap(roadmap, trophies, save);
  if (view === 'missables') renderMissables(roadmap, trophies, save);
  if (view === 'about') renderAbout(sources);
}

function rerender() {
  updateProgressHeader(trophies, save);
  renderChecklist(trophies, sources, save, filters, selectedId, callbacks);
  renderDetail(selectedId ? trophyById(trophies, selectedId) : null, sources, save);
  if (currentView() === 'roadmap') renderRoadmap(roadmap, trophies, save);
  if (currentView() === 'missables') renderMissables(roadmap, trophies, save);
}

const callbacks = {
  onToggleEarned(id, earned) {
    if (earned) save.earned[id] = true;
    else delete save.earned[id];
    persistSave(save);
    rerender();
  },
  onCount(id, delta) {
    const trophy = trophyById(trophies, id);
    if (!trophy || !trophy.target) return;
    const next = Math.max(0, Math.min(trophy.target, (save.counts[id] || 0) + delta));
    if (next === 0) delete save.counts[id];
    else save.counts[id] = next;
    if (next >= trophy.target) save.earned[id] = true;
    persistSave(save);
    rerender();
  },
  onSelect(id) {
    selectedId = id;
    renderChecklist(trophies, sources, save, filters, selectedId, callbacks);
    renderDetail(trophyById(trophies, id), sources, save);
    document.getElementById('detail-pane').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },
};

function wireToolbar() {
  document.getElementById('search').addEventListener('input', (ev) => {
    filters.search = ev.target.value.trim();
    rerender();
  });
  document.getElementById('kind-chips').addEventListener('click', (ev) => {
    const btn = ev.target.closest('[data-kind]');
    if (!btn) return;
    filters.kind = btn.dataset.kind;
    for (const chip of document.querySelectorAll('#kind-chips .chip')) {
      chip.classList.toggle('active', chip === btn);
    }
    rerender();
  });
  document.getElementById('grade-filter').addEventListener('change', (ev) => {
    filters.grade = ev.target.value;
    rerender();
  });
  document.getElementById('status-filter').addEventListener('change', (ev) => {
    filters.status = ev.target.value;
    rerender();
  });
  const spoilerBox = document.getElementById('spoiler-toggle');
  spoilerBox.checked = save.spoilers;
  spoilerBox.addEventListener('change', () => {
    save.spoilers = spoilerBox.checked;
    persistSave(save);
    rerender();
  });
  document.getElementById('export-btn').addEventListener('click', () => downloadSave(save));
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      save = parseImportedSave(text);
      persistSave(save);
      document.getElementById('spoiler-toggle').checked = save.spoilers;
      selectedId = null;
      rerender();
    } catch (err) {
      alert('That file is not a valid progress save.');
    }
    ev.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies and counters?')) {
      save.earned = {};
      save.counts = {};
      selectedId = null;
      persistSave(save);
      rerender();
    }
  });
  for (const btn of document.querySelectorAll('#main-nav .nav-btn')) {
    btn.addEventListener('click', () => {
      location.hash = '#/' + btn.dataset.view;
    });
  }
  window.addEventListener('hashchange', () => showView(currentView()));
}

async function boot() {
  const data = await loadGuideData();
  trophies = data.trophies;
  sources = data.sources;
  roadmap = data.roadmap;

  // Demo seed for screenshots / first look: only when no save exists yet.
  if (params.get('seed') === 'demo' && !hasSave()) {
    save = demoSave();
    persistSave(save);
  }
  if (params.get('spoilers') === 'on') {
    save.spoilers = true;
    persistSave(save);
  }
  const openId = Number(params.get('open'));
  if (openId && trophyById(trophies, openId)) selectedId = openId;
  const viewParam = params.get('view');
  if (viewParam && VIEWS.includes(viewParam)) location.hash = '#/' + viewParam;

  wireToolbar();
  document.getElementById('spoiler-toggle').checked = save.spoilers;
  rerender();
  showView(currentView());
}

boot().catch((err) => {
  document.getElementById('list-summary').textContent = 'Could not load the trophy data: ' + err.message;
});
