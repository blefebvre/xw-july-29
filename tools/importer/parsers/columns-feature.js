/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-feature. Base block: columns (xwalk).
 * Source: https://www.wknd-trendsetters.site/
 * Columns block: NO field hints (per hinting rules). Content = default content in cells.
 * Structure: first row = block name; second row = one cell per column.
 */
export default function parse(element, { document }) {
  // Direct children of the grid are the columns (validated against source.html).
  let columns = Array.from(element.querySelectorAll(':scope > div'));

  // Empty-block guard
  if (columns.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build one cell per column. Columns blocks must NOT include field hints.
  const row = columns.map((col) => {
    const cellNodes = Array.from(col.childNodes);
    return cellNodes.length ? cellNodes : col;
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-feature', cells });
  element.replaceWith(block);
}
