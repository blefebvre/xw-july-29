/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dianalefebvre section handling.
 *
 * Adds section breaks (<hr>) and Section Metadata blocks based on the template
 * sections defined in tools/importer/page-templates.json.
 *
 * The homepage template has 2 sections (verified in page-templates.json):
 *   - section-1 "Hero"          selector: body > header.header-wrapper  style: null
 *   - section-2 "Tabbed content" selector: body > main                   style: null
 *
 * Both sections have style === null, so no Section Metadata blocks are created.
 * One <hr> is inserted before the second section (main) to break the hero
 * section from the tabbed-content section.
 *
 * Runs in afterTransform only (block parsers run between the hooks; section
 * breaks must be inserted after parsing so parser cell extraction is unaffected).
 * Uses payload.template.sections as the source of truth.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload && payload.template && payload.template.sections;
  if (!Array.isArray(sections) || sections.length < 2) return;

  const doc = (payload && payload.document) || element.ownerDocument || document;

  // Resolve a section's first element from its selector(s). Selectors are taken
  // verbatim from page-templates.json (which were validated against the DOM).
  const findSectionElement = (section) => {
    const selectors = Array.isArray(section.selector)
      ? section.selector
      : [section.selector].filter(Boolean);
    for (const selector of selectors) {
      const el = element.querySelector(selector) || doc.querySelector(selector);
      if (el) return el;
    }
    return null;
  };

  // Process in reverse so inserted nodes never disturb earlier lookups.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    const sectionEl = findSectionElement(section);
    if (!sectionEl) continue;

    // Section Metadata block: only for sections that declare a style.
    if (section.style) {
      const style = Array.isArray(section.style)
        ? section.style.join(', ')
        : section.style;
      const block = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style },
      });
      sectionEl.before(block);
    }

    // Section break: <hr> before every non-first section that has content
    // before it in the DOM.
    if (i > 0 && sectionEl.previousElementSibling) {
      const hr = doc.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
