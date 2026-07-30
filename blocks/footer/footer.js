// WKND Trendsetters footer.
// Content-first: all copy, links and images come from content/footer.plain.html.
// This module fetches that fragment and builds the 4-column footer grid
// (brand + socials, then three link-list columns). No copy is hardcoded here.

/**
 * Fetch the footer fragment. Localhost/aem up serves /content/footer.plain.html;
 * DA/EDS production serves {footerPath}.plain.html.
 */
async function fetchFooter(footerPath) {
  // On aem.page/aem.live the footer doc lives at the site root (/footer.plain.html).
  // Local `aem up` serves the repo's content/ folder at /content, so the doc is
  // at /content/footer.plain.html there. Pick the right order per environment so
  // neither one fires a wasted 404; keep the other as a fallback for safety.
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const candidates = isLocal
    ? [`/content${footerPath}.plain.html`, `${footerPath}.plain.html`]
    : [`${footerPath}.plain.html`, `/content${footerPath}.plain.html`];
  let resp;
  for (let i = 0; i < candidates.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    resp = await fetch(candidates[i]);
    if (resp.ok) break;
  }
  if (!resp || !resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

export default async function decorate(block) {
  const footerPath = '/footer';
  const fragment = await fetchFooter(footerPath);
  block.textContent = '';
  if (!fragment) return;

  const grid = document.createElement('div');
  grid.className = 'footer-grid';

  const columns = [...fragment.children];

  columns.forEach((col, i) => {
    const column = document.createElement('div');
    column.className = 'footer-column';

    if (i === 0) {
      // Brand column: logo link + social icon row.
      column.classList.add('footer-brand-column');
      const brandLink = col.querySelector(':scope > p > a');
      if (brandLink) {
        const a = document.createElement('a');
        a.className = 'footer-brand-link';
        a.href = brandLink.getAttribute('href');
        const img = brandLink.querySelector('img');
        if (img) {
          const logo = document.createElement('img');
          logo.className = 'footer-logo';
          logo.src = img.getAttribute('src');
          logo.alt = img.getAttribute('alt') || '';
          logo.width = 32;
          logo.height = 32;
          a.append(logo);
        }
        column.append(a);
      }
      const socialSrc = col.querySelector(':scope > ul');
      if (socialSrc) {
        const socials = document.createElement('ul');
        socials.className = 'footer-socials';
        [...socialSrc.children].forEach((li) => {
          const link = li.querySelector('a');
          if (!link) return;
          const item = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'footer-social-link';
          a.href = link.getAttribute('href');
          const img = link.querySelector('img');
          if (img) {
            a.setAttribute('aria-label', img.getAttribute('alt') || '');
            const icon = document.createElement('img');
            icon.className = 'footer-social-icon';
            icon.src = img.getAttribute('src');
            icon.alt = img.getAttribute('alt') || '';
            icon.width = 16;
            icon.height = 16;
            a.append(icon);
          }
          item.append(a);
          socials.append(item);
        });
        column.append(socials);
      }
    } else {
      // Link-list column: heading + links.
      const heading = col.querySelector('h2, h3, h4');
      if (heading) {
        const h = document.createElement('h2');
        h.className = 'footer-heading';
        h.textContent = heading.textContent.trim();
        column.append(h);
      }
      const listSrc = col.querySelector(':scope > ul');
      if (listSrc) {
        const list = document.createElement('ul');
        list.className = 'footer-links';
        [...listSrc.children].forEach((li) => {
          const link = li.querySelector('a');
          if (!link) return;
          const item = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'footer-link';
          a.href = link.getAttribute('href');
          a.textContent = link.textContent.trim();
          item.append(a);
          list.append(item);
        });
        column.append(list);
      }
    }

    grid.append(column);
  });

  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  footer.append(grid);
  block.append(footer);
}
