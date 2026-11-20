// Roadmap view: the three stages to the platinum, the missable list and the
// platinum facts, all rendered from data/roadmap.json.
export function renderRoadmap(view, roadmap, onOpenTrophy) {
  view.querySelector('#roadmapTitle').textContent = roadmap.title;
  view.querySelector('#roadmapIntro').textContent =
    'One playthrough, no online trophies, and only one thing that can be missed. Work the stages in order — the checklist below the story is where most of the hours go.';

  const stagesEl = view.querySelector('#roadmapStages');
  stagesEl.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const heading = document.createElement('h4');
    heading.textContent = `Stage ${stage.stage}: ${stage.name}`;
    const hours = document.createElement('p');
    hours.className = 'stage-hours';
    hours.textContent = stage.hours;
    const trophies = document.createElement('p');
    trophies.className = 'stage-trophies';
    trophies.textContent = stage.trophies;
    const steps = document.createElement('ul');
    for (const step of stage.steps) {
      const stepLi = document.createElement('li');
      stepLi.textContent = step;
      steps.append(stepLi);
    }
    li.append(heading, hours, trophies, steps);
    stagesEl.append(li);
  }

  const missablesEl = view.querySelector('#roadmapMissables');
  missablesEl.replaceChildren();
  for (const missable of roadmap.missables) {
    const item = document.createElement('div');
    item.className = 'missable-item';
    const title = document.createElement('strong');
    title.textContent = `${missable.name} — ${missable.risk}`;
    const detail = document.createElement('p');
    detail.textContent = missable.detail;
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'link-button';
    openBtn.textContent = 'Open its guide →';
    openBtn.addEventListener('click', () => onOpenTrophy(missable.id));
    item.append(title, detail, openBtn);
    missablesEl.append(item);
  }

  const factsEl = view.querySelector('#roadmapFacts');
  factsEl.replaceChildren();
  for (const fact of roadmap.facts) {
    const term = document.createElement('dt');
    term.textContent = fact.label;
    const def = document.createElement('dd');
    def.textContent = `${fact.value} (${fact.source})`;
    factsEl.append(term, def);
  }

  const sourcesEl = view.querySelector('#roadmapSources');
  sourcesEl.replaceChildren();
  for (const source of roadmap.sources) {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.textContent = source.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    li.append(link);
    sourcesEl.append(li);
  }
}
