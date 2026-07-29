// keep track globally of the number of tab blocks on the page
let tabBlockCnt = 0;

export default async function decorate(block) {
  tabBlockCnt += 1;
  const rows = [...block.children];

  const tablist = document.createElement('div');
  tablist.className = 'tabs-testimonial-list';
  tablist.setAttribute('role', 'tablist');
  tablist.id = `tablist-${tabBlockCnt}`;

  rows.forEach((row, i) => {
    const id = `tabpanel-${tabBlockCnt}-tab-${i + 1}`;
    const cells = [...row.children];
    const titleCell = cells[0];
    const contentCell = cells[1] || cells[0];

    // gather content pieces from the content cell
    const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
    const picture = contentCell.querySelector('picture');
    const paras = [...contentCell.querySelectorAll('p')]
      .filter((p) => !p.querySelector('picture'));
    const roleText = paras[0];
    const quoteText = paras[1];

    const name = (titleCell.textContent || (heading && heading.textContent) || '').trim();
    const role = roleText ? roleText.textContent.trim() : '';

    // --- build panel (image + testimonial text) ---
    row.className = 'tabs-testimonial-panel';
    row.id = id;
    row.setAttribute('aria-hidden', i !== 0 ? 'true' : 'false');
    row.setAttribute('aria-labelledby', `tab-${id}`);
    row.setAttribute('role', 'tabpanel');
    row.innerHTML = '';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'tabs-testimonial-image';
    if (picture) imageWrap.append(picture);

    const textWrap = document.createElement('div');
    textWrap.className = 'tabs-testimonial-text';

    const nameEl = document.createElement('p');
    nameEl.className = 'tabs-testimonial-name';
    nameEl.textContent = name;
    textWrap.append(nameEl);

    if (roleText) {
      roleText.className = 'tabs-testimonial-role';
      textWrap.append(roleText);
    }
    if (quoteText) {
      quoteText.className = 'tabs-testimonial-quote';
      textWrap.append(quoteText);
    }

    row.append(imageWrap, textWrap);

    // --- build avatar tab button ---
    const button = document.createElement('button');
    button.className = 'tabs-testimonial-tab';
    button.id = `tab-${id}`;
    button.setAttribute('aria-controls', id);
    button.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');

    const avatar = document.createElement('span');
    avatar.className = 'tabs-testimonial-avatar';
    const srcImg = picture && picture.querySelector('img');
    if (srcImg) {
      const clone = document.createElement('img');
      clone.src = srcImg.src;
      clone.alt = name;
      clone.loading = 'lazy';
      clone.width = 48;
      clone.height = 48;
      avatar.append(clone);
    }

    const btnText = document.createElement('span');
    btnText.className = 'tabs-testimonial-tab-text';
    const btnName = document.createElement('span');
    btnName.className = 'tabs-testimonial-tab-name';
    btnName.textContent = name;
    const btnRole = document.createElement('span');
    btnRole.className = 'tabs-testimonial-tab-role';
    btnRole.textContent = role;
    btnText.append(btnName, btnRole);

    button.append(avatar, btnText);

    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', 'true');
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', 'false');
      });
      row.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-selected', 'true');
    });

    tablist.append(button);
  });

  // panels stay on top, tab menu below (matches source order)
  block.append(tablist);
}
