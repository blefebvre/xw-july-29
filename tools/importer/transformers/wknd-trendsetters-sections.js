/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters section breaks + section metadata.
 *
 * Driven entirely by payload.template.sections from page-templates.json
 * (template-agnostic; not hard-coded to the homepage). For the homepage
 * template there are 7 sections, so:
 *   - 6 <hr> section breaks are inserted (one before each non-first section)
 *   - 3 "Section Metadata" blocks are added (rc2, rc4, rc6 have style "secondary")
 *
 * Section selectors are taken verbatim from the template's section.selector
 * arrays (each entry was produced from the captured DOM under #main-content).
 * Runs in afterTransform only (section breaks/metadata are final-shape output,
 * not something that affects block parsing).
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

function findSectionElement(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (let i = 0; i < list.length; i += 1) {
    const sel = list[i];
    if (!sel) continue;
    let el = root.querySelector(sel);
    if (!el && root.ownerDocument) {
      el = root.ownerDocument.querySelector(sel);
    }
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!Array.isArray(sections) || sections.length < 2) return;

    const document = element.ownerDocument;

    // Reverse order so DOM insertions don't disturb selectors of not-yet-processed sections.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section.selector);
      if (!el) continue;

      // Add a Section Metadata block at the end of the section when a style is set.
      if (section.style) {
        const block = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        el.append(block);
      }

      // Insert a section break before every section except the first.
      if (i > 0) {
        const hr = document.createElement('hr');
        el.before(hr);
      }
    }
  }
}
