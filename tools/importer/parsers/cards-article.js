/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article. Base block: cards (xwalk container block).
 * Source: https://www.wknd-trendsetters.site/
 * Child model 'card' fields: image (reference) + imageAlt (collapsed), text (richtext).
 * Structure: first row = block name; one row per card, 2 cells (image, text).
 * Each source card is an <a> wrapping an image + body (tag, date, heading).
 */
export default function parse(element, { document }) {
  // Each direct anchor is a card (validated against source.html).
  const cardEls = Array.from(element.querySelectorAll(':scope > a.article-card, :scope > a'));

  // Empty-block guard
  if (cardEls.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const makeCell = (fieldName, nodes) => {
    const frag = document.createDocumentFragment();
    if (fieldName) frag.appendChild(document.createComment(` field:${fieldName} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  };

  const cells = [];

  cardEls.forEach((card) => {
    const href = card.getAttribute('href');
    const image = card.querySelector('img');

    // Image cell (field:image); imageAlt collapsed into img alt.
    const imageCell = image ? makeCell('image', [image]) : '';

    // Text cell (field:text): meta (tag, date) + heading, kept as a link to the article.
    const textNodes = [];
    const meta = card.querySelector('.article-card-meta');
    if (meta) textNodes.push(meta);
    const heading = card.querySelector('h3, .h4-heading, h2, h4');

    if (heading && href) {
      // Wrap the heading text in a link so the CTA/article link is preserved.
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = heading.textContent.trim();
      const h = document.createElement(heading.tagName.toLowerCase());
      h.appendChild(link);
      textNodes.push(h);
    } else if (heading) {
      textNodes.push(heading);
    } else if (href) {
      const link = document.createElement('a');
      link.setAttribute('href', href);
      link.textContent = href;
      textNodes.push(link);
    }

    const textCell = textNodes.length ? makeCell('text', textNodes) : '';
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
