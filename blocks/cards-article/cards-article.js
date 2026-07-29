import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const MONTHS = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
// Matches a trailing date like "May 12" / "December 5" and captures it.
const DATE_RE = new RegExp(`\\s+((?:${MONTHS})[a-z]*\\.?\\s+\\d{1,2})\\s*$`);

/**
 * Split the card meta paragraph "Casual Cool May 12" into a category tag
 * (lime pill) + a muted date, matching the source design.
 */
function decorateMeta(body) {
  const meta = body.querySelector('p');
  if (!meta) return;
  const raw = meta.textContent.trim();
  const match = raw.match(DATE_RE);
  const category = (match ? raw.slice(0, match.index) : raw).trim();
  const date = match ? match[1].trim() : '';

  meta.className = 'cards-article-card-meta';
  meta.textContent = '';

  if (category) {
    const tag = document.createElement('span');
    tag.className = 'cards-article-tag';
    tag.textContent = category;
    meta.append(tag);
  }
  if (date) {
    const dateEl = document.createElement('span');
    dateEl.className = 'cards-article-date';
    dateEl.textContent = date;
    meta.append(dateEl);
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-article-card-image';
      else div.className = 'cards-article-card-body';
    });
    const body = li.querySelector('.cards-article-card-body');
    if (body) decorateMeta(body);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    // eager: article card covers are core visual content; loading them eagerly
    // guarantees they render in a static (non-scrolled) diff rather than waiting on lazy.
    const optimizedPic = createOptimizedPicture(img.src, img.alt, true, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
