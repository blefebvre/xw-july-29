/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-gallery. Base block: cards (xwalk container block).
 * Source: https://www.wknd-trendsetters.site/
 * Child model 'card' fields: image (reference) + imageAlt (collapsed), text (richtext).
 * Structure: first row = block name; one row per card, 2 cells (image, text).
 * These gallery cards are image-only; the text cell is left empty (still present).
 */
export default function parse(element, { document }) {
  // Each direct child div is a card (validated against source.html).
  const cardEls = Array.from(element.querySelectorAll(':scope > div'));

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
    const image = card.querySelector('img');
    // Image cell (field:image); imageAlt collapsed into img alt.
    const imageCell = image ? makeCell('image', [image]) : '';
    // Text cell: no text content in gallery cards -> empty cell, no hint.
    const textCell = '';
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-gallery', cells });
  element.replaceWith(block);
}
