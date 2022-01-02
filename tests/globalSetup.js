const Hexo = require('hexo');
const { createSandbox } = require('hexo-test-utils/core');
const path = require('path');

beforeEach(() => {
  global.sandbox = createSandbox(Hexo, {
    fixture_folder: path.join(__dirname, 'fixtures'),
    plugins: [
      require.resolve('../index.js'),
      require.resolve('hexo-renderer-ejs'),
      require.resolve('hexo-renderer-markdown-it'),
    ],
  });
});
