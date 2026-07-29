/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-faq. Base block: accordion (xwalk container block).
 * Source: https://www.wknd-trendsetters.site/
 * Child model 'accordion-faq-item' fields: summary (text), text (richtext).
 * Structure: first row = block name; one row per item, 2 cells (summary, text).
 */
export default function parse(element, { document }) {
  // Each <details class="faq-item"> is one accordion item (validated against source.html).
  const items = Array.from(element.querySelectorAll(':scope > details.faq-item, details.faq-item'));

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    // --- Summary cell (field:summary): the question label text. ---
    const summaryFrag = document.createDocumentFragment();
    summaryFrag.appendChild(document.createComment(' field:summary '));
    const questionText = item.querySelector('.faq-question span, summary span, summary');
    summaryFrag.appendChild(document.createTextNode(questionText ? questionText.textContent.trim() : ''));

    // --- Text cell (field:text): the answer richtext. ---
    const textFrag = document.createDocumentFragment();
    textFrag.appendChild(document.createComment(' field:text '));
    const answer = item.querySelector('.faq-answer');
    if (answer) {
      Array.from(answer.childNodes).forEach((n) => textFrag.appendChild(n));
    }

    cells.push([summaryFrag, textFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
