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

  // tools/importer/parsers/tabs-minimal.js
  function parse(element, { document: document2 }) {
    const buildHeading = (headingEl) => {
      if (!headingEl) return null;
      const tag = /^h[1-6]$/i.test(headingEl.tagName) ? headingEl.tagName.toLowerCase() : "h3";
      const h = document2.createElement(tag);
      h.textContent = (headingEl.textContent || "").trim();
      return h.textContent ? h : null;
    };
    const collectRichtext = (panel) => {
      const nodes = [];
      if (!panel) return nodes;
      panel.querySelectorAll("p, ul, ol").forEach((el) => {
        if (el.closest(".columns-img-col")) return;
        nodes.push(el);
      });
      panel.querySelectorAll(".columns > div > div:not(.columns-img-col)").forEach((cell) => {
        if (cell.querySelector("p, ul, ol")) return;
        const text = (cell.textContent || "").trim();
        if (!text) return;
        const p = document2.createElement("p");
        p.innerHTML = cell.innerHTML;
        nodes.push(p);
      });
      return nodes;
    };
    const nav = element.querySelector("nav.tab-nav, .tab-nav, nav");
    const navLinks = nav ? Array.from(nav.querySelectorAll('a[href^="#"]')) : [];
    const tabs = [];
    navLinks.forEach((link) => {
      const id = (link.getAttribute("href") || "").replace(/^#/, "").trim();
      const heading = id ? element.querySelector(`[id="${id}"]`) : null;
      const panel = heading ? heading.closest(".section") || heading.parentElement : null;
      if (!panel) return;
      tabs.push({ title: (link.textContent || "").trim(), heading, panel });
    });
    if (!tabs.length) {
      element.querySelectorAll(":scope > div.section, div.section").forEach((panel) => {
        const heading = panel.querySelector("h1, h2, h3, h4, h5, h6");
        if (!heading) return;
        tabs.push({ title: (heading.textContent || "").trim(), heading, panel });
      });
    }
    const cells = [];
    tabs.forEach(({ title, heading, panel }) => {
      const titleCell = [];
      titleCell.push(document2.createComment(" field:title "));
      titleCell.push(document2.createTextNode(title));
      const contentCell = [];
      const headingClean = buildHeading(heading);
      if (headingClean) {
        contentCell.push(document2.createComment(" field:content_heading "));
        contentCell.push(headingClean);
      }
      const imageEl = panel.querySelector(".columns-img-col picture, .columns-img-col img, picture, img");
      if (imageEl) {
        contentCell.push(document2.createComment(" field:content_image "));
        contentCell.push(imageEl);
      }
      const richtext = collectRichtext(panel);
      if (richtext.length) {
        contentCell.push(document2.createComment(" field:content_richtext "));
        richtext.forEach((n) => contentCell.push(n));
      }
      cells.push([titleCell, contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-minimal", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dianalefebvre-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "footer",
        "#franklin-svg-sprite"
      ]);
    }
  }

  // tools/importer/transformers/dianalefebvre-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!Array.isArray(sections) || sections.length < 2) return;
    const doc = payload && payload.document || element.ownerDocument || document;
    const findSectionElement = (section) => {
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector].filter(Boolean);
      for (const selector of selectors) {
        const el = element.querySelector(selector) || doc.querySelector(selector);
        if (el) return el;
      }
      return null;
    };
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const sectionEl = findSectionElement(section);
      if (!sectionEl) continue;
      if (section.style) {
        const style = Array.isArray(section.style) ? section.style.join(", ") : section.style;
        const block = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style }
        });
        sectionEl.before(block);
      }
      if (i > 0 && sectionEl.previousElementSibling) {
        const hr = doc.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-homepage.js
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Single-page therapist site homepage with a hero header (name, title), a tabbed content area (About, Practice, Fees, Contact sections with headings, paragraphs, and a list), and a footer.",
    urls: [
      "https://www.dianalefebvre.ca/"
    ],
    blocks: [
      {
        name: "tabs-minimal",
        instances: ["body > main"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Hero",
        selector: ["body > header.header-wrapper"],
        style: null,
        blocks: [],
        defaultContent: [
          "header .header.block h1",
          "header .header.block h2",
          "header .header-image img"
        ]
      },
      {
        id: "section-2",
        name: "Tabbed content",
        selector: ["body > main"],
        style: null,
        blocks: ["tabs-minimal"],
        defaultContent: []
      }
    ]
  };
  var parsers = {
    "tabs-minimal": parse
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
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
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
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath || "/index");
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
