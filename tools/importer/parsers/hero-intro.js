/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-intro. Base block: hero, restructured as an xwalk container block.
 * Source: https://www.wknd-trendsetters.site/
 * Child model 'hero-intro-item' fields: image (reference) + imageAlt (collapsed), text (richtext).
 * Structure: first row = block name; then ONE ROW PER IMAGE, 2 cells (image, text).
 * The hero copy (heading + subheading + CTAs) is placed in the FIRST row's text cell;
 * remaining image rows have an empty text cell.
 */
export default function parse(element, { document }) {
  // --- Extraction (selectors validated against source.html) ---
  const heading = element.querySelector('h1, .h1-heading, h2');
  const subheading = element.querySelector('.subheading, p');
  const buttons = Array.from(element.querySelectorAll('.button-group a, a.button'));
  const images = Array.from(element.querySelectorAll('img.cover-image, img'));

  // Empty-block guard
  if (!heading && !subheading && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Field-hinted cell helper (xwalk): comment before content in the cell.
  const makeCell = (fieldName, nodes) => {
    const frag = document.createDocumentFragment();
    if (fieldName) frag.appendChild(document.createComment(` field:${fieldName} `));
    nodes.filter(Boolean).forEach((n) => frag.appendChild(n));
    return frag;
  };

  const cells = [];

  // One row per image. Each row: image cell (field:image) + text cell (field:text).
  // imageAlt is collapsed into the img alt attribute.
  images.forEach((image, i) => {
    const imageCell = makeCell('image', [image]);
    // Hero copy lives on the first item row; other rows have an empty text cell.
    const textCell = i === 0 ? makeCell('text', [heading, subheading, ...buttons]) : '';
    cells.push([imageCell, textCell]);
  });

  // Edge case: no images but there is copy -> single row carrying just the text.
  if (images.length === 0) {
    cells.push([makeCell('text', [heading, subheading, ...buttons])]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-intro', cells });
  element.replaceWith(block);
}
