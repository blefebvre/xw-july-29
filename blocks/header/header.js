// WKND Trendsetters header/nav.
// Content-first: all text, links and images come from content/nav.plain.html.
// This module fetches that fragment, builds the three nav groups
// (brand / sections / tools), and wires the keyboard-accessible Trends dropdown
// plus the mobile hamburger. No copy is hardcoded here.

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Localhost/aem up serves /content/nav.plain.html;
 * DA/EDS production serves {navPath}.plain.html.
 */
async function fetchNav(navPath) {
  // On aem.page/aem.live the nav doc lives at the site root (/nav.plain.html).
  // Local `aem up` serves the repo's content/ folder at /content, so the doc is
  // at /content/nav.plain.html there. Pick the right order per environment so
  // neither one fires a wasted 404; keep the other as a fallback for safety.
  const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const candidates = isLocal
    ? [`/content${navPath}.plain.html`, `${navPath}.plain.html`]
    : [`${navPath}.plain.html`, `/content${navPath}.plain.html`];
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

/** Collapse the Trends dropdown. */
function closeDropdown(trigger) {
  trigger.setAttribute('aria-expanded', 'false');
  const panel = trigger.nextElementSibling;
  if (panel) panel.hidden = true;
}

/** Expand the Trends dropdown. */
function openDropdown(trigger) {
  trigger.setAttribute('aria-expanded', 'true');
  const panel = trigger.nextElementSibling;
  if (panel) panel.hidden = false;
}

/**
 * Trailing description text of an <li> — the text after its <a> title.
 * The title link and description may sit directly in the <li> or inside a <p>
 * wrapper (published markup), so read text nodes from whichever holds the link.
 */
function directDescription(li, link) {
  const host = (link && link.parentElement && link.parentElement.tagName === 'P')
    ? link.parentElement
    : li;
  const trailing = Array.from(host.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (trailing) return trailing;
  // Fallback: strip the title text from the host's full text.
  return link ? host.textContent.replace(link.textContent, '').replace(/\s+/g, ' ').trim() : '';
}

/**
 * The own label text of an <li> — the text before any nested <ul>, tolerating
 * a <p> wrapper (the content pipeline wraps labels in <p> when published) and
 * pretty-print whitespace/newlines. Ignores nested submenu text.
 */
function ownLabel(li) {
  // Prefer an explicit <p> wrapper's text; else the li's own direct text nodes.
  const p = li.querySelector(':scope > p');
  if (p) return p.textContent.replace(/\s+/g, ' ').trim();
  const direct = Array.from(li.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
  return direct.replace(/\s+/g, ' ').trim();
}

/** The link of an <li>, whether it's a direct child or wrapped in a <p>. */
function itemLink(li) {
  return li.querySelector(':scope > a, :scope > p > a');
}

/** Build a titled entry (title + optional description) for a dropdown. */
function buildEntry(li) {
  const link = itemLink(li);
  if (!link) return null;
  const entry = document.createElement('a');
  entry.className = 'nav-dropdown-entry';
  entry.href = link.getAttribute('href');
  const title = document.createElement('span');
  title.className = 'nav-dropdown-entry-title';
  title.textContent = link.textContent.trim();
  entry.append(title);
  const desc = directDescription(li, link);
  if (desc) {
    const d = document.createElement('span');
    d.className = 'nav-dropdown-entry-desc';
    d.textContent = desc;
    entry.append(d);
  }
  return entry;
}

/**
 * Build a flyout panel from the nested <ul> the author provided.
 * Two shapes are supported, chosen from the content itself:
 *  - Mega-menu (Trends): children are category groups (<li>Label<ul>…</ul></li>),
 *    optionally followed by a loose link <li> that becomes the featured card.
 *  - Simple dropdown (Support): children are plain link <li>s (no nested <ul>),
 *    rendered as a single-column list.
 */
function buildDropdownPanel(sourceList) {
  const panel = document.createElement('div');
  panel.className = 'nav-dropdown-panel';
  panel.hidden = true;

  const children = [...sourceList.children];
  const categoryGroups = children.filter((li) => li.querySelector(':scope > ul'));
  const looseItems = children.filter((li) => !li.querySelector(':scope > ul') && itemLink(li));

  if (categoryGroups.length > 0) {
    // --- Mega-menu: category columns + optional featured card ---
    panel.classList.add('nav-dropdown-mega');
    const grid = document.createElement('div');
    grid.className = 'nav-dropdown-grid';

    categoryGroups.forEach((group) => {
      const col = document.createElement('div');
      col.className = 'nav-dropdown-category';
      const headingText = ownLabel(group);
      if (headingText) {
        const h = document.createElement('h3');
        h.className = 'nav-dropdown-category-title';
        h.textContent = headingText;
        col.append(h);
      }
      const links = document.createElement('div');
      links.className = 'nav-dropdown-category-links';
      group.querySelectorAll(':scope > ul > li').forEach((li) => {
        const entry = buildEntry(li);
        if (entry) links.append(entry);
      });
      col.append(links);
      grid.append(col);
    });

    panel.append(grid);

    // Featured card (black promo tile) from a loose link item.
    const featured = looseItems[0];
    if (featured) {
      const link = itemLink(featured);
      const card = document.createElement('a');
      card.className = 'nav-dropdown-featured';
      card.href = link.getAttribute('href');
      const title = document.createElement('span');
      title.className = 'nav-dropdown-featured-title';
      title.textContent = link.textContent.trim();
      card.append(title);
      const desc = directDescription(featured, link);
      if (desc) {
        const d = document.createElement('span');
        d.className = 'nav-dropdown-featured-desc';
        d.textContent = desc;
        card.append(d);
      }
      panel.append(card);
    }
  } else {
    // --- Simple dropdown (Support): single-column list of links ---
    panel.classList.add('nav-dropdown-simple');
    const list = document.createElement('div');
    list.className = 'nav-dropdown-list';
    looseItems.forEach((li) => {
      const link = itemLink(li);
      const a = document.createElement('a');
      a.className = 'nav-dropdown-simple-link';
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      list.append(a);
    });
    panel.append(list);
  }

  return panel;
}

/** Build the center menu cluster from the authored <ul>. */
function buildSections(listRoot) {
  const ul = document.createElement('ul');
  ul.className = 'nav-menu';

  [...listRoot.children].forEach((li) => {
    const item = document.createElement('li');
    item.className = 'nav-menu-item';

    const nestedList = li.querySelector(':scope > ul');
    const directLink = itemLink(li);

    if (nestedList) {
      // Dropdown trigger (e.g. Trends, Support) — a real <button> for keyboard/aria.
      // Label is the li's OWN text (via ownLabel), not the nested submenu text.
      item.classList.add('nav-drop');
      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'nav-menu-link nav-drop-trigger';
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.textContent = ownLabel(li);
      item.append(trigger);
      item.append(buildDropdownPanel(nestedList));
    } else if (directLink) {
      // Link item (e.g. About, Blog) — href resolved through the <p> wrapper.
      const a = document.createElement('a');
      a.className = 'nav-menu-link';
      a.href = directLink.getAttribute('href');
      a.textContent = directLink.textContent.trim();
      item.append(a);
    } else {
      // Plain label with no link and no submenu.
      const span = document.createElement('span');
      span.className = 'nav-menu-link';
      span.textContent = ownLabel(li) || li.textContent.trim();
      item.append(span);
    }
    ul.append(item);
  });

  return ul;
}

export default async function decorate(block) {
  const navPath = '/nav';
  const fragment = await fetchNav(navPath);
  block.textContent = '';
  if (!fragment) return;

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  const sourceSections = [...fragment.children]; // brand / sections / tools divs

  // --- Brand (left) ---
  // The logo mark is inlined as SVG so it never depends on a published binary
  // asset (external /icons/*.svg 404s on aem.page). Wordmark comes from content
  // when present, else falls back to "Fashion Blog".
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  const brandSrc = sourceSections[0];
  const brandLink = brandSrc ? brandSrc.querySelector('a') : null;
  const a = document.createElement('a');
  a.className = 'nav-brand-link';
  a.href = (brandLink && brandLink.getAttribute('href')) || '/';
  // Inline star/compass mark (33x33 viewBox), inherits currentColor.
  a.insertAdjacentHTML('afterbegin', '<svg class="nav-brand-logo" width="32" height="32" viewBox="0 0 33 33" aria-hidden="true" focusable="false"><path d="M28,0H5C2.24,0,0,2.24,0,5v23c0,2.76,2.24,5,5,5h23c2.76,0,5-2.24,5-5V5c0-2.76-2.24-5-5-5ZM29,17c-6.63,0-12,5.37-12,12h-1c0-6.63-5.37-12-12-12v-1c6.63,0,12-5.37,12-12h1c0,6.63,5.37,12,12,12v1Z" fill="currentColor"/></svg>');
  const text = document.createElement('span');
  text.className = 'nav-brand-text';
  const brandText = brandLink ? brandLink.textContent.replace(/\s+/g, ' ').trim() : '';
  text.textContent = brandText || 'Fashion Blog';
  a.append(text);
  brand.append(a);

  // --- Sections (center menu cluster) ---
  const sections = document.createElement('div');
  sections.className = 'nav-sections';
  const sectionsSrc = sourceSections[1];
  const listRoot = sectionsSrc ? sectionsSrc.querySelector(':scope > ul') : null;
  if (listRoot) sections.append(buildSections(listRoot));

  // --- Tools (right CTA) ---
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  const toolsSrc = sourceSections[2];
  if (toolsSrc) {
    const link = toolsSrc.querySelector('a');
    if (link) {
      const cta = document.createElement('a');
      cta.className = 'nav-cta';
      cta.href = link.getAttribute('href');
      cta.textContent = link.textContent.trim();
      tools.append(cta);
    }
  }

  // --- Hamburger (mobile) ---
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';

  const inner = document.createElement('div');
  inner.className = 'nav-inner';
  inner.append(brand, sections, tools);

  nav.append(hamburger, inner);
  block.append(nav);

  // --- Dropdown behavior (click + keyboard, not hover-only) ---
  const triggers = sections.querySelectorAll('.nav-drop-trigger');

  const closeAll = () => triggers.forEach((t) => closeDropdown(t));

  triggers.forEach((trigger) => {
    // Click / keyboard (Enter/Space activate a <button>) toggle the panel —
    // this is the primary, accessible mechanism (not hover-only).
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!isOpen) openDropdown(trigger);
    });
    // Desktop pointer enhancement: hover opens; leaving the item closes it.
    // Kept separate from click (no toggle) so the two never fight.
    const item = trigger.closest('.nav-drop');
    item.addEventListener('mouseenter', () => { if (isDesktop.matches) openDropdown(trigger); });
    item.addEventListener('mouseleave', () => { if (isDesktop.matches) closeDropdown(trigger); });
    // When the panel loses focus (keyboard tab-out), close it.
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) closeDropdown(trigger);
    });
  });

  // Close dropdowns on outside click.
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAll();
  });

  // --- Mobile hamburger toggle ---
  const toggleMobile = (force) => {
    const open = typeof force === 'boolean' ? force : nav.getAttribute('data-open') !== 'true';
    nav.setAttribute('data-open', open ? 'true' : 'false');
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.body.style.overflowY = (open && !isDesktop.matches) ? 'hidden' : '';
  };
  hamburger.addEventListener('click', () => toggleMobile());

  // Escape closes dropdowns / mobile menu.
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAll();
      if (!isDesktop.matches && nav.getAttribute('data-open') === 'true') toggleMobile(false);
    }
  });

  // Reset state when crossing the desktop/mobile breakpoint.
  isDesktop.addEventListener('change', () => {
    closeAll();
    toggleMobile(false);
    document.body.style.overflowY = '';
  });
}
