module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: '2018',
  },
  plugins: ['standard', 'prettier'],
  extends: ['eslint:recommended', 'standard', 'prettier', 'prettier/standard'],
  rules: {
    quotes: ['error', 'single'],
    'comma-dangle': ['error', 'always-multiline'],
  },
};
