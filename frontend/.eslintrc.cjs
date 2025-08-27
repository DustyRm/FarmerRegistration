module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  ignorePatterns: ['.next/', 'node_modules/', 'dist/', 'build/', 'coverage/'],
  rules: {
    'react/jsx-key': 'warn',
    'react/self-closing-comp': 'warn',
  },
};
