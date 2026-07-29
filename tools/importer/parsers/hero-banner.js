/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base block: hero (xwalk).
 * Source: https://www.wknd-trendsetters.site/
 * Model fields: image (reference), imageAlt (collapsed -> img alt), text (richtext).
 * Structure (from library description): 1 column, content rows = image row, text row.
 */
export default function parse(element, { document }) {
  // --- Extraction (selectors validated against source.html) ---
  const image = element.querySelector('img.cover-image, img');
  const heading = element.querySelector('h1, h2, .h1-heading');
  const subheading = element.querySelector('.subheading, p');
  const buttons = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !subheading && !image) {
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

  // Row: image (field:image). imageAlt is collapsed into the img alt attribute.
  if (image) cells.push([makeCell('image', [image])]);

  // Row: text (field:text) - heading, subheading, CTAs as richtext.
  cells.push([makeCell('text', [heading, subheading, ...buttons])]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
