// Guide detail: the expandable block under a checklist row, showing one
// trophy's own-words guide, its missable warning, its sources and a button
// to mark it earned. Story trophies stay masked here while spoilers are on.
export function buildGuideDetail(trophy, hidden, earned, onToggleEarned) {
  const detail = document.createElement('div');
  detail.className = 'row-detail';

  if (trophy.missable && !hidden) {
    const warning = document.createElement('p');
    warning.className = 'guide-missable';
    warning.textContent = '⚠ Potentially missable — see the guide below before you finish Chapter 1.';
    detail.append(warning);
  }

  const heading = document.createElement('h3');
  heading.textContent = 'How to get it';
  const text = document.createElement('p');
  text.className = 'guide-text';
  text.textContent = hidden
    ? 'This is a story trophy. Its guide stays hidden while spoilers are hidden — earn it (or switch spoilers off) to read the guide.'
    : trophy.guide;
  detail.append(heading, text);

  const sourcesHeading = document.createElement('h3');
  sourcesHeading.textContent = 'Sources';
  const sources = document.createElement('ul');
  sources.className = 'source-list';
  if (hidden) {
    const li = document.createElement('li');
    li.textContent = 'Sources are hidden with this spoiler.';
    sources.append(li);
  } else {
    for (const source of trophy.sources) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = source.url;
      link.textContent = source.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      li.append(link);
      sources.append(li);
    }
  }
  detail.append(sourcesHeading, sources);

  const earnedBtn = document.createElement('button');
  earnedBtn.type = 'button';
  earnedBtn.className = 'earned-btn';
  const isEarned = earned.has(trophy.id);
  earnedBtn.textContent = isEarned ? '✓ Earned — tap to unmark' : 'Mark as earned';
  earnedBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    onToggleEarned(trophy.id, !isEarned);
  });
  detail.append(earnedBtn);
  return detail;
}
