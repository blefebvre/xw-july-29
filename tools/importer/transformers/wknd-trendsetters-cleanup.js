/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND Trendsetters site-wide cleanup.
 *
 * Removes non-authorable site chrome and strips build-tool attributes.
 * Every selector below was verified against migration-work/cleaned.html.
 *
 * Non-authorable elements confirmed in the captured DOM (all live OUTSIDE
 * <main id="main-content">, so removing them does not affect the block
 * instance / section selectors, which are all scoped to #main-content):
 *   - <a class="skip-link">Skip to main content</a>   (accessibility skip link)
 *   - <div class="navbar"> ... </div>                  (site header, nav, mega menu)
 *   - <footer class="footer inverse-footer"> ... </footer> (site footer + footer nav)
 *
 * Note: the <div class="breadcrumbs"> on the Featured story section is NOT
 * removed here — it is content inside the columns-feature block region, not
 * site-level breadcrumb navigation, and is left for the block parser to handle.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable site chrome (selectors from cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      '.skip-link',
      '.navbar',
      'footer',
    ]);

    // Strip Astro build attributes (data-astro-cid-*) found on <body> and inline SVGs.
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (attr.name.startsWith('data-astro-cid-')) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
