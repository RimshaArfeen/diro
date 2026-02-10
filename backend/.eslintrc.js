module.exports = {
  parser: 'babel-eslint',
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
    'prettier'
  ],
  plugins: [
    'node'
  ],
  env: {
    node: true,
    es2021: true
  },
  rules: {
    // Custom rules
    'node/no-missing-import': [
      'error',
      {
        allowModules: [
          'dotenv'
        ]
      }
    ],
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: [
          'modules-commonjs'
        ]
      }
    ],
    'node/shebang': 'off',
    'no-console': 'warn',
    'no-process-exit': 'error',
    'node/no-deprecated-api': 'error'
  },
  overrides: [
    {
      files: [
        '**/*.test.js',
        '**/*.spec.js'
      ],
      env: {
        jest: true
      }
    }
  ]
};