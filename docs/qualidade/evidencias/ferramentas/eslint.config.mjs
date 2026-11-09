import tseslint from 'typescript-eslint';
import sonarjs from 'eslint-plugin-sonarjs';
export default [{
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: { parser: tseslint.parser, parserOptions: { ecmaFeatures: { jsx: true } } },
  plugins: { sonarjs },
  rules: {
    complexity: ['warn', 10],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-params': ['warn', 4],
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1], ignoreArrayIndexes: true }],
    'sonarjs/cognitive-complexity': ['warn', 15],
    'sonarjs/no-duplicate-string': 'warn',
    'sonarjs/no-identical-functions': 'warn',
  },
}];
