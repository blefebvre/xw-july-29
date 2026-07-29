/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: dianalefebvre site-wide cleanup.
 *
 * Removes non-authorable site chrome so the import contains only page-level
 * authorable content. The source is itself an AEM Edge Delivery page.
 *
 * IMPORTANT — preserved (NOT removed) here:
 *   - <header class="header-wrapper">: on this source it carries the page HERO
 *     content (H1 name "Diana Norton Lefebvre, PhD RP", H2 "Counselling &
 *     Psychotherapy", decorative full-width "waves" image). It is preserved as
 *     the first content section, so it is intentionally left in place.
 *   - <main>: the tabs-minimal block content (extracted by the block parser).
 *
 * All selectors verified against migration-work/cleaned.html.
 */

const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable content verified in migration-work/cleaned.html:
    //   - <footer>: empty in the source; the target auto-populates the footer.
    //   - #franklin-svg-sprite: EDS-injected, display:none decorative <svg>
    //     sprite (rendered by the scraper as a base64 data: <img>). Not
    //     authorable; safe to strip.
    WebImporter.DOMUtils.remove(element, [
      'footer',
      '#franklin-svg-sprite',
    ]);
  }
}
