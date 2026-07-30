/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-intro.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1, .h1-heading, h2");
    const subheading = element.querySelector(".subheading, p");
    const buttons = Array.from(element.querySelectorAll(".button-group a, a.button"));
    const images = Array.from(element.querySelectorAll("img.cover-image, img"));
    if (!heading && !subheading && images.length === 0) {
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
    images.forEach((image, i) => {
      const imageCell = makeCell("image", [image]);
      const textCell = i === 0 ? makeCell("text", [heading, subheading, ...buttons]) : "";
      cells.push([imageCell, textCell]);
    });
    if (images.length === 0) {
      cells.push([makeCell("text", [heading, subheading, ...buttons])]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-intro", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document }) {
    let columns = Array.from(element.querySelectorAll(":scope > div"));
    if (columns.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const row = columns.map((col) => {
      const cellNodes = Array.from(col.childNodes);
      return cellNodes.length ? cellNodes : col;
    });
    const cells = [row];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-gallery.js
  function parse3(element, { document }) {
    const cardEls = Array.from(element.querySelectorAll(":scope > div"));
    if (cardEls.length === 0) {
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
    cardEls.forEach((card) => {
      const image = card.querySelector("img");
      const imageCell = image ? makeCell("image", [image]) : "";
      const textCell = "";
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-testimonial.js
  function parse4(element, { document }) {
    const panes = Array.from(element.querySelectorAll(".tabs-content > .tab-pane"));
    const menuLinks = Array.from(element.querySelectorAll(".tab-menu .tab-menu-link"));
    if (panes.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    panes.forEach((pane, i) => {
      const menu = menuLinks[i];
      const titleFrag = document.createDocumentFragment();
      titleFrag.appendChild(document.createComment(" field:title "));
      const menuName = menu && menu.querySelector(".paragraph-sm strong, strong");
      const labelText = menuName ? menuName.textContent.trim() : pane.querySelector("strong") ? pane.querySelector("strong").textContent.trim() : `Tab ${i + 1}`;
      titleFrag.appendChild(document.createTextNode(labelText));
      const contentFrag = document.createDocumentFragment();
      const image = menu && menu.querySelector("img") || pane.querySelector("img");
      const nameEl = pane.querySelector(".paragraph-xl strong, strong");
      const quote = pane.querySelector("p.paragraph-xl, p");
      const infoBlock = nameEl ? nameEl.closest("div").parentElement : null;
      let roleEl = null;
      if (nameEl) {
        const nameContainer = nameEl.closest("div");
        roleEl = nameContainer && nameContainer.nextElementSibling;
      }
      if (nameEl) {
        contentFrag.appendChild(document.createComment(" field:content_heading "));
        const h3 = document.createElement("h3");
        h3.textContent = nameEl.textContent.trim();
        contentFrag.appendChild(h3);
      }
      if (image) {
        contentFrag.appendChild(document.createComment(" field:content_image "));
        contentFrag.appendChild(image);
      }
      contentFrag.appendChild(document.createComment(" field:content_richtext "));
      if (roleEl) {
        const roleP = document.createElement("p");
        roleP.textContent = roleEl.textContent.trim();
        contentFrag.appendChild(roleP);
      }
      if (quote) contentFrag.appendChild(quote);
      cells.push([titleFrag, contentFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs-testimonial", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse5(element, { document }) {
    const cardEls = Array.from(element.querySelectorAll(":scope > a.article-card, :scope > a"));
    if (cardEls.length === 0) {
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
    cardEls.forEach((card) => {
      const href = card.getAttribute("href");
      const image = card.querySelector("img");
      const imageCell = image ? makeCell("image", [image]) : "";
      const textNodes = [];
      const meta = card.querySelector(".article-card-meta");
      if (meta) textNodes.push(meta);
      const heading = card.querySelector("h3, .h4-heading, h2, h4");
      if (heading && href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = heading.textContent.trim();
        const h = document.createElement(heading.tagName.toLowerCase());
        h.appendChild(link);
        textNodes.push(h);
      } else if (heading) {
        textNodes.push(heading);
      } else if (href) {
        const link = document.createElement("a");
        link.setAttribute("href", href);
        link.textContent = href;
        textNodes.push(link);
      }
      const textCell = textNodes.length ? makeCell("text", textNodes) : "";
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse6(element, { document }) {
    const items = Array.from(element.querySelectorAll(":scope > details.faq-item, details.faq-item"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const summaryFrag = document.createDocumentFragment();
      summaryFrag.appendChild(document.createComment(" field:summary "));
      const questionText = item.querySelector(".faq-question span, summary span, summary");
      summaryFrag.appendChild(document.createTextNode(questionText ? questionText.textContent.trim() : ""));
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const answer = item.querySelector(".faq-answer");
      if (answer) {
        Array.from(answer.childNodes).forEach((n) => textFrag.appendChild(n));
      }
      cells.push([summaryFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-banner.js
  function parse7(element, { document }) {
    const image = element.querySelector("img.cover-image, img");
    const heading = element.querySelector("h1, h2, .h1-heading");
    const subheading = element.querySelector(".subheading, p");
    const buttons = Array.from(element.querySelectorAll(".button-group a, a.button"));
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
    if (image) cells.push([makeCell("image", [image])]);
    cells.push([makeCell("text", [heading, subheading, ...buttons])]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        ".skip-link",
        ".navbar",
        "footer"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.name.startsWith("data-astro-cid-")) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/wknd-trendsetters-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
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
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const sections = payload && payload.template && payload.template.sections;
      if (!Array.isArray(sections) || sections.length < 2) return;
      const document = element.ownerDocument;
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section.selector);
        if (!el) continue;
        if (section.style) {
          const block = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          el.append(block);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          el.before(hr);
        }
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-intro": parse,
    "columns-feature": parse2,
    "cards-gallery": parse3,
    "tabs-testimonial": parse4,
    "cards-article": parse5,
    "accordion-faq": parse6,
    "hero-banner": parse7
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "WKND Trendsetters fashion blog homepage with navbar, hero intro, featured story columns, image gallery cards, testimonials tabs, latest-articles cards, FAQ accordion, promo hero banner, and footer.",
    urls: [
      "https://www.wknd-trendsetters.site/"
    ],
    blocks: [
      {
        name: "hero-intro",
        instances: ["#main-content > header.section.secondary-section > div.container > div.grid-layout.tablet-1-column.grid-gap-xxl"]
      },
      {
        name: "columns-feature",
        instances: ["#main-content > section.section:nth-of-type(1) > div.container > div.grid-layout.tablet-1-column.grid-gap-lg"]
      },
      {
        name: "cards-gallery",
        instances: ["#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-sm"]
      },
      {
        name: "tabs-testimonial",
        instances: ["#main-content > section.section:nth-of-type(3) > div.container > div.tabs-wrapper"]
      },
      {
        name: "cards-article",
        instances: ["#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.grid-layout.desktop-4-column.tablet-2-column-1.mobile-portrait-1-column.grid-gap-md"]
      },
      {
        name: "accordion-faq",
        instances: ["#main-content > section.section:nth-of-type(5) .faq-list"]
      },
      {
        name: "hero-banner",
        instances: ["#main-content > section.section.inverse-section > div.container > div.grid-layout.desktop-1-column"]
      }
    ],
    sections: [
      {
        id: "rc2",
        name: "Hero intro",
        selector: ["#main-content > header.section.secondary-section"],
        style: "secondary",
        blocks: ["hero-intro"],
        defaultContent: []
      },
      {
        id: "rc3",
        name: "Featured story",
        selector: ["#main-content > section.section:nth-of-type(1)"],
        style: null,
        blocks: ["columns-feature"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "Image gallery",
        selector: ["#main-content > section.section.secondary-section:nth-of-type(2)"],
        style: "secondary",
        blocks: ["cards-gallery"],
        defaultContent: [
          "#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.utility-text-align-center.utility-margin-bottom-8rem > h2.h2-heading",
          "#main-content > section.section.secondary-section:nth-of-type(2) > div.container > div.utility-text-align-center.utility-margin-bottom-8rem > p.paragraph-lg"
        ]
      },
      {
        id: "rc5",
        name: "Testimonials",
        selector: ["#main-content > section.section:nth-of-type(3)"],
        style: null,
        blocks: ["tabs-testimonial"],
        defaultContent: []
      },
      {
        id: "rc6",
        name: "Latest articles",
        selector: ["#main-content > section.section.secondary-section:nth-of-type(4)"],
        style: "secondary",
        blocks: ["cards-article"],
        defaultContent: [
          "#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.utility-text-align-center > h2.h2-heading",
          "#main-content > section.section.secondary-section:nth-of-type(4) > div.container > div.utility-text-align-center > p.paragraph-lg"
        ]
      },
      {
        id: "rc7",
        name: "FAQ",
        selector: ["#main-content > section.section:nth-of-type(5)"],
        style: null,
        blocks: ["accordion-faq"],
        defaultContent: [
          "#main-content > section.section:nth-of-type(5) h2.h2-heading",
          "#main-content > section.section:nth-of-type(5) p.subheading"
        ]
      },
      {
        id: "rc8",
        name: "Promo banner",
        selector: ["#main-content > section.section.inverse-section"],
        style: null,
        blocks: ["hero-banner"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
