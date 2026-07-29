/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-testimonial. Base block: tabs (xwalk container block).
 * Source: https://www.wknd-trendsetters.site/
 * Child model 'tabs-testimonial-item' fields:
 *   - title (text) -> tab label, own cell.
 *   - content_heading (text) + content_headingType (collapsed select) + content_image (reference)
 *     + content_richtext (richtext) -> grouped into the second cell (same 'content_' prefix).
 * Structure: first row = block name; one row per tab, 2 cells (title, content).
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content > .tab-pane'));
  const menuLinks = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link'));

  // Empty-block guard
  if (panes.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  panes.forEach((pane, i) => {
    const menu = menuLinks[i];

    // --- Title cell (field:title): tab label = person name from the menu button. ---
    const titleFrag = document.createDocumentFragment();
    titleFrag.appendChild(document.createComment(' field:title '));
    const menuName = menu && menu.querySelector('.paragraph-sm strong, strong');
    const labelText = menuName ? menuName.textContent.trim()
      : (pane.querySelector('strong') ? pane.querySelector('strong').textContent.trim() : `Tab ${i + 1}`);
    titleFrag.appendChild(document.createTextNode(labelText));

    // --- Content cell: grouped content_* fields. ---
    const contentFrag = document.createDocumentFragment();
    const image = pane.querySelector('img');
    const nameEl = pane.querySelector('.paragraph-xl strong, strong');
    const quote = pane.querySelector('p.paragraph-xl, p');
    // role: the div following the name block
    const infoBlock = nameEl ? nameEl.closest('div').parentElement : null;
    let roleEl = null;
    if (nameEl) {
      const nameContainer = nameEl.closest('div');
      roleEl = nameContainer && nameContainer.nextElementSibling;
    }

    // content_heading (headingType h3 collapsed) - person name as heading.
    if (nameEl) {
      contentFrag.appendChild(document.createComment(' field:content_heading '));
      const h3 = document.createElement('h3');
      h3.textContent = nameEl.textContent.trim();
      contentFrag.appendChild(h3);
    }
    // content_image (field:content_image); alt collapsed into img.
    if (image) {
      contentFrag.appendChild(document.createComment(' field:content_image '));
      contentFrag.appendChild(image);
    }
    // content_richtext (field:content_richtext) - role + quote as richtext.
    contentFrag.appendChild(document.createComment(' field:content_richtext '));
    if (roleEl) {
      const roleP = document.createElement('p');
      roleP.textContent = roleEl.textContent.trim();
      contentFrag.appendChild(roleP);
    }
    if (quote) contentFrag.appendChild(quote);

    cells.push([titleFrag, contentFrag]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-testimonial', cells });
  element.replaceWith(block);
}
