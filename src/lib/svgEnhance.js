const SAOKO_LAYER_CLASSES = [
  'saoko-illustration',
  'saoko-title-mid',
  'saoko-title-top',
  'saoko-detail',
  'saoko-header',
];

export function getExperienceTheme(filename) {
  const slug = filename.replace(/\.svg$/i, '').toLowerCase();

  if (slug === 'saoko') {
    return {
      slug: 'saoko',
      experienceClass: 'experience-saoko',
      fullScreen: true,
    };
  }

  return {
    slug,
    experienceClass: 'experience-generic',
    fullScreen: false,
  };
}

export function enhanceExperienceMarkup(markup, filename) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(markup, 'image/svg+xml');
  const svg = doc.documentElement;

  if (svg.querySelector('parsererror')) {
    return markup;
  }

  svg.querySelectorAll('style').forEach((node) => node.remove());

  const slug = filename.replace(/\.svg$/i, '').toLowerCase();
  svg.classList.add('experience-svg-root');

  if (slug === 'saoko') {
    const groups = [...svg.querySelectorAll(':scope > g')];
    groups.forEach((group, index) => {
      group.classList.add('experience-layer', SAOKO_LAYER_CLASSES[index] || `saoko-layer-${index}`);
    });
  } else {
    [...svg.querySelectorAll(':scope > g')].forEach((group, index) => {
      group.classList.add('experience-layer', `experience-layer-${index}`);
    });
  }

  svg.querySelectorAll('path').forEach((path) => {
    path.classList.remove('cls-1');
    path.classList.add('experience-path');
  });

  return svg.outerHTML;
}
