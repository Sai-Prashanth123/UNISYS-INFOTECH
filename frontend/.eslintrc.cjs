module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: {
    react: { version: 'detect' }
  },
  plugins: ['react', 'react-hooks'],
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended'],
  rules: {
    // App uses React 17+ JSX transform
    'react/react-in-jsx-scope': 'off',

    // This codebase doesn't use PropTypes (and isn't TS yet)
    'react/prop-types': 'off',

    // Allow normal apostrophes in JSX text
    'react/no-unescaped-entities': 'off',

    // Keep lint non-blocking for legacy pages/components
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn'
  }
};

