/*
 * Accordion FAQ Block
 * Vertical list of expandable Q&A items (native <details>/<summary>).
 * https://www.hlx.live/developer/block-collection/accordion
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // question (summary label)
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';

    const labelText = document.createElement('span');
    labelText.className = 'accordion-faq-item-label-text';
    labelText.textContent = label.textContent.trim();

    const icon = document.createElement('span');
    icon.className = 'accordion-faq-item-icon';
    icon.setAttribute('aria-hidden', 'true');

    summary.append(labelText, icon);

    // answer (body)
    const body = row.children[1];
    body.className = 'accordion-faq-item-body';

    // item
    const details = document.createElement('details');
    moveInstrumentation(row, details);
    details.className = 'accordion-faq-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
