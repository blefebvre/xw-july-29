/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs-minimal
 * Base block: tabs (container block with repeated tabs-minimal-item children)
 * Source URL: https://www.dianalefebvre.ca/  (selector: body > main)
 * Generated: 2026-07-29
 *
 * Library convention (migration-work/block-context/tabs-minimal/library-description.txt):
 *   2 columns; first row = block name; each subsequent row = one tab:
 *     Column 1 = Tab Label (mandatory)
 *     Column 2 = Tab Content (mandatory): headings, links, images, richtext
 *
 * xwalk field hinting (model: blocks/tabs-minimal/_tabs-minimal.json, child model "tabs-minimal-item").
 *   Fields grouped by underscore prefix map to the two columns:
 *     - Column 1 (group "title"):   <!-- field:title -->            Tab label
 *     - Column 2 (group "content"): <!-- field:content_heading -->  <hN> heading (content_headingType collapsed into the tag)
 *                                   <!-- field:content_image -->    <picture>/<img> (About tab only; optional)
 *                                   <!-- field:content_richtext --> body paragraphs / list
 *   content_headingType ends in "Type" => COLLAPSED into the heading element's tag; no comment emitted.
 *
 * Validated against migration-work/block-context/tabs-minimal/source.html:
 *   - nav.tab-nav > a[href^="#"]      -> tab titles + anchors to panel headings
 *   - div.section (columns-container / visuallyhidden section) -> one panel per tab
 *   - panel h3[id]                    -> content_heading (headingType h3)
 *   - panel .columns-img-col picture  -> content_image (About tab portrait)
 *   - panel p / ul / ol, or columns text cell -> content_richtext
 */
export default function parse(element, { document }) {
  // Build a clean heading element, preserving the source heading level (defaults to h3 per model).
  const buildHeading = (headingEl) => {
    if (!headingEl) return null;
    const tag = /^h[1-6]$/i.test(headingEl.tagName) ? headingEl.tagName.toLowerCase() : 'h3';
    const h = document.createElement(tag);
    h.textContent = (headingEl.textContent || '').trim();
    return h.textContent ? h : null;
  };

  // Collect richtext body nodes for a panel: paragraphs/lists plus bare-text columns cells.
  // Excludes the heading and anything inside the image column.
  const collectRichtext = (panel) => {
    const nodes = [];
    if (!panel) return nodes;
    // Standard default-content body: paragraphs and lists (in document order).
    panel.querySelectorAll('p, ul, ol').forEach((el) => {
      if (el.closest('.columns-img-col')) return; // never pull body from the image cell
      nodes.push(el);
    });
    // Columns layout (About tab): the text lives in a bare <div> with no p/ul — wrap it in a paragraph.
    panel.querySelectorAll('.columns > div > div:not(.columns-img-col)').forEach((cell) => {
      if (cell.querySelector('p, ul, ol')) return; // already captured above
      const text = (cell.textContent || '').trim();
      if (!text) return;
      const p = document.createElement('p');
      p.innerHTML = cell.innerHTML;
      nodes.push(p);
    });
    return nodes;
  };

  // 1. Discover tabs from the nav; each link anchors to a panel heading by id.
  const nav = element.querySelector('nav.tab-nav, .tab-nav, nav');
  const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];

  const tabs = [];
  navLinks.forEach((link) => {
    const id = (link.getAttribute('href') || '').replace(/^#/, '').trim();
    const heading = id ? element.querySelector(`[id="${id}"]`) : null;
    const panel = heading ? (heading.closest('.section') || heading.parentElement) : null;
    if (!panel) return;
    tabs.push({ title: (link.textContent || '').trim(), heading, panel });
  });

  // Fallback: no usable nav — derive tabs directly from panel sections and their headings.
  if (!tabs.length) {
    element.querySelectorAll(':scope > div.section, div.section').forEach((panel) => {
      const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
      if (!heading) return;
      tabs.push({ title: (heading.textContent || '').trim(), heading, panel });
    });
  }

  // 2. Build one content row per tab: [ titleCell, contentCell ].
  const cells = [];
  tabs.forEach(({ title, heading, panel }) => {
    // Column 1: title (text field).
    const titleCell = [];
    titleCell.push(document.createComment(' field:title '));
    titleCell.push(document.createTextNode(title));

    // Column 2: grouped content_* fields.
    const contentCell = [];
    const headingClean = buildHeading(heading);
    if (headingClean) {
      contentCell.push(document.createComment(' field:content_heading '));
      contentCell.push(headingClean);
    }
    const imageEl = panel.querySelector('.columns-img-col picture, .columns-img-col img, picture, img');
    if (imageEl) {
      contentCell.push(document.createComment(' field:content_image '));
      contentCell.push(imageEl);
    }
    const richtext = collectRichtext(panel);
    if (richtext.length) {
      contentCell.push(document.createComment(' field:content_richtext '));
      richtext.forEach((n) => contentCell.push(n));
    }

    cells.push([titleCell, contentCell]);
  });

  // Empty-block guard: nothing extracted — unwrap rather than emit an empty block.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-minimal', cells });
  element.replaceWith(block);
}
