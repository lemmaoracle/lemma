// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import functional from "eslint-plugin-functional";
import eslintConfigPrettier from "eslint-config-prettier";
import astroPlugin from "eslint-plugin-astro";
import astroParser from "astro-eslint-parser";

export default tseslint.config(
  // Base configuration for all files
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.astro/**", "**/build/**"],
  },
  // Base TypeScript configuration (excludes test files)
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: ["**/*.test.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      functional.configs.strict,
      eslintConfigPrettier,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        projectService: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      functional,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "functional/no-expression-statements": ["error", { ignoreVoid: true }],
      "functional/no-throw-statements": ["error", { allowToRejectPromises: true }],
      "functional/no-return-void": "off",
      "functional/prefer-immutable-types": "off",
      "functional/type-declaration-immutability": "off",
      "functional/no-mixed-types": "off",
    },
  },
  // Test files configuration - disable all functional and strict TS rules
  {
    files: ["**/*.test.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        projectService: false,
        allowDefaultProject: true,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      functional,
    },
    rules: {
      // Disable all functional rules
      "functional/functional-parameters": "off",
      "functional/immutable-data": "off",
      "functional/no-classes": "off",
      "functional/no-conditional-statements": "off",
      "functional/no-expression-statements": "off",
      "functional/no-let": "off",
      "functional/no-loop-statements": "off",
      "functional/no-return-void": "off",
      "functional/no-this-expressions": "off",
      "functional/no-throw-statements": "off",
      "functional/no-mixed-types": "off",
      "functional/prefer-immutable-types": "off",
      "functional/prefer-property-signatures": "off",
      "functional/prefer-tacit": "off",
      "functional/readonly-type": "off",
      "functional/type-declaration-immutability": "off",
      // Disable strict TypeScript rules that require type information
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-duplicate-type-constituents": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-for-in-array": "off",
      "@typescript-eslint/no-implied-eval": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-qualifier": "off",
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-unary-minus": "off",
      "@typescript-eslint/prefer-includes": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/prefer-promise-reject-errors": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "off",
      "@typescript-eslint/prefer-string-starts-ends-with": "off",
      "@typescript-eslint/require-array-sort-compare": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Web package specific configuration
  {
    files: ["packages/web/**/*.{ts,tsx}"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      functional.configs.strict,
      eslintConfigPrettier,
    ],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "functional/functional-parameters": "off",
      "functional/immutable-data": "off",
      "functional/no-expression-statements": "off",
      "functional/prefer-immutable-types": "off",
      "functional/type-declaration-immutability": "off",
      "functional/no-return-void": "off",
      "functional/no-conditional-statements": "off",
      "functional/no-loop-statements": "off",
      "functional/no-let": "off",
      "functional/no-mixed-types": "off",
    },
  },
  // Astro files configuration
  {
    files: ["packages/web/**/*.astro"],
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".astro"],
      },
    },
    plugins: {
      astro: astroPlugin,
    },
    rules: {
      ...astroPlugin.configs.recommended.rules,
      "functional/no-expression-statements": "off",
      "functional/no-conditional-statements": "off",
      "functional/no-let": "off",
      "functional/no-loop-statements": "off",
      "functional/functional-parameters": "off",
      "functional/immutable-data": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
);
