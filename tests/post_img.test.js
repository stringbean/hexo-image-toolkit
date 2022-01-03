/**
 * @jest-environment jsdom
 */
/* global document, sandbox */

const { process } = require('hexo-test-utils');
const { contentFor } = require('hexo-test-utils');
const { hasRoute } = require('hexo-test-utils/routing');

function checkRenderedImage(figure, basePath, caption, alt, srcs, fallbackSrc) {
  expect(figure.className).toBe('image');
  expect(figure.querySelector(':scope > figcaption').textContent).toBe(caption);

  const picture = figure.querySelector('picture');

  // picture sources
  const sources = picture.querySelectorAll(':scope > source');
  expect(sources).toHaveLength(srcs.length);

  for (let i = 0; i < srcs.length; i++) {
    const expected = srcs[i];
    const source = sources[i];

    expect(source.getAttribute('srcset')).toBe(`${basePath}/${expected.src}`);
    expect(source.getAttribute('type')).toBe(expected.type);
  }

  // fallback image
  const img = picture.querySelector(':scope > img');

  expect(img.getAttribute('src')).toBe(`${basePath}/${fallbackSrc}`);
  expect(img.getAttribute('alt')).toBe(alt);
  // TODO alt text
}

async function processFixture(fixture = 'test1') {
  const ctx = await sandbox(fixture);
  return await process(ctx);
}

async function extractPost(ctx, path) {
  const content = await contentFor(ctx, path);

  const container = document.createElement('div');
  container.innerHTML = content.toString();
  return container;
}

// eslint-disable-next-line no-unused-vars
function verifyImageRoutes(ctx, basePath, images) {
  for (const image of images) {
    expect(hasRoute(ctx, `${basePath}/${image}`)).toBeTruthy();
  }
}

describe('post_img', () => {
  test('render jpeg image', async () => {
    const context = await processFixture();
    const container = await extractPost(context, 'post-1.html');

    // extract rendered figures
    const figures = container.getElementsByTagName('figure');
    expect(figures).toHaveLength(1);
    const figure = figures[0];

    checkRenderedImage(
      figure,
      'post-1',
      'Test Image',
      'Test Image',
      [{ src: 'gradient.webp', type: 'image/webp' }],
      'gradient.jpg',
    );

    // check correct images in routes
    verifyImageRoutes(context, 'post-1', ['gradient.jpg', 'gradient.webp']);
  });

  test('render png image', async () => {
    const context = await processFixture();
    const container = await extractPost(context, 'post-2.html');

    // extract rendered figures
    const figures = container.getElementsByTagName('figure');
    expect(figures).toHaveLength(1);
    const figure = figures[0];

    checkRenderedImage(
      figure,
      'post-2',
      'Rounded Rectangle',
      'A rectangle with rounded corners',
      [{ src: 'rect.webp', type: 'image/webp' }],
      'rect.png',
    );

    // check correct images in routes
    verifyImageRoutes(context, 'post-2', ['rect.png', 'rect.webp']);
  });

  test('skips assets for drafts if not rendered', async () => {
    const context = await processFixture('drafts-off');

    expect(hasRoute(context, 'draft-1/draft.jpg')).toBeFalsy();
    expect(hasRoute(context, 'draft-1/draft.webp')).toBeFalsy();
  });

  test('processes assets for drafts if rendered', async () => {
    const context = await processFixture('drafts-on');

    const container = await extractPost(context, 'draft-1.html');

    // extract rendered figures
    const figures = container.getElementsByTagName('figure');
    expect(figures).toHaveLength(1);
    const figure = figures[0];

    checkRenderedImage(
      figure,
      'draft-1',
      'Draft Image',
      'Draft Image',
      [{ src: 'draft.webp', type: 'image/webp' }],
      'draft.jpg',
    );

    // check correct images in routes
    verifyImageRoutes(context, 'draft-1', ['draft.jpg', 'draft.webp']);
  });
});
