// Hero Intro variant
// Imported DOM is a container: one row per image (image cell + text cell),
// with the hero copy living in the first row's text cell.
// Source design is a two-column layout: left = text + CTAs, right = a
// cluster of 3 images. Restructure the rows into a text column and an
// image cluster so CSS can lay them out to match the source.
export default function decorate(block) {
  const pictures = [];
  let textCell = null;

  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic) {
        pictures.push(pic);
      } else if (cell.textContent.trim()) {
        textCell = cell;
      }
    });
  });

  // Text column
  const textCol = document.createElement('div');
  textCol.className = 'hero-intro-text';
  if (textCell) textCol.append(...textCell.childNodes);

  // Group CTA buttons into a single actions row; mark all but the first
  // as secondary (outline) to match the source (primary + secondary).
  const buttonContainers = [...textCol.querySelectorAll('.button-container')];
  if (buttonContainers.length) {
    const actions = document.createElement('div');
    actions.className = 'hero-intro-actions';
    buttonContainers.forEach((bc) => actions.append(bc));
    textCol.append(actions);
    actions.querySelectorAll('a.button').forEach((a, i) => {
      if (i > 0) a.classList.add('secondary');
    });
  }

  // Image cluster
  const imageCol = document.createElement('div');
  imageCol.className = 'hero-intro-images';
  pictures.forEach((pic) => {
    const fig = document.createElement('div');
    fig.className = 'hero-intro-image';
    fig.append(pic);
    imageCol.append(fig);
  });

  block.textContent = '';
  if (textCell) block.append(textCol);
  if (pictures.length) block.append(imageCol);
}
