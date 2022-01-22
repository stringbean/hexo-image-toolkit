/**
 * @jest-environment jsdom
 */
/* global document, sandbox */

const { process } = require('hexo-test-utils');
const { contentFor } = require('hexo-test-utils');
const { hasRoute } = require('hexo-test-utils/routing');

function checkRenderedImage(
  figure,
  basePath,
  caption,
  alt,
  srcs,
  fallbackSrc,
  width,
  height,
) {
  expect(figure.className).toBe('image');
  expect(figure.querySelector(':scope > figcaption').textContent).toBe(caption);

  const picture = figure.querySelector('picture');

  // picture sources
  const sources = picture.querySelectorAll(':scope > source');
  expect(sources).toHaveLength(srcs.length);

  for (let i = 0; i < srcs.length; i++) {
    const expected = srcs[i];
    const source = sources[i];

    expect(source.getAttribute('srcset')).toBe(expected.src);
    expect(source.getAttribute('type')).toBe(expected.type);
  }

  // fallback image
  const img = picture.querySelector(':scope > img');

  expect(img.getAttribute('src')).toBe(fallbackSrc);
  expect(img.getAttribute('alt')).toBe(alt);
  expect(img.getAttribute('width')).toBe(width.toString());
  expect(img.getAttribute('height')).toBe(height.toString());
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
      [{ src: 'post-1/gradient.webp', type: 'image/webp' }],
      'post-1/gradient.jpg',
      1024,
      1024,
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
      [{ src: 'post-2/rect.webp', type: 'image/webp' }],
      'post-2/rect.png',
      1024,
      768,
    );

    // check correct images in routes
    verifyImageRoutes(context, 'post-2', ['rect.png', 'rect.webp']);
  });

  test('render retina image', async () => {
    const context = await processFixture();
    const container = await extractPost(context, 'retina.html');

    // extract rendered figures
    const figures = container.getElementsByTagName('figure');
    expect(figures).toHaveLength(1);
    const figure = figures[0];

    checkRenderedImage(
      figure,
      'retina',
      'Retina Rounded Rectangle',
      'A rectangle with rounded corners',
      [{ src: 'retina/rect@2x.webp 2x, retina/rect.webp', type: 'image/webp' }],
      'retina/rect.png',
      512,
      384,
    );

    // check correct images in routes
    verifyImageRoutes(context, 'retina', ['rect.png', 'rect.webp']);
  });

  test('render images with size', async () => {
    const context = await processFixture();
    const container = await extractPost(context, 'resized-1.html');

    // extract rendered figures
    const figures = container.getElementsByTagName('figure');
    expect(figures).toHaveLength(3);

    checkRenderedImage(
      figures[0],
      'resized-1',
      'Width only',
      'Width only',
      [{ src: 'resized-1/width.webp', type: 'image/webp' }],
      'resized-1/width.jpg',
      400,
      400,
    );

    checkRenderedImage(
      figures[1],
      'resized-1',
      'Height only',
      'Height only',
      [{ src: 'resized-1/height.webp', type: 'image/webp' }],
      'resized-1/height.jpg',
      200,
      200,
    );

    checkRenderedImage(
      figures[2],
      'resized-1',
      'Width and height',
      'Width and height',
      [{ src: 'resized-1/width-and-height.webp', type: 'image/webp' }],
      'resized-1/width-and-height.jpg',
      300,
      600,
    );
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
      [{ src: 'draft-1/draft.webp', type: 'image/webp' }],
      'draft-1/draft.jpg',
      1024,
      1024,
    );

    // check correct images in routes
    verifyImageRoutes(context, 'draft-1', ['draft.jpg', 'draft.webp']);
  });
});
