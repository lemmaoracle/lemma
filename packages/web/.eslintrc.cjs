/* eslint-env node */
module.exports = {
  extends: ["../../eslint.base.cjs"],
  parserOptions: {
    project: ["./tsconfig.json"],
    ecmaFeatures: { jsx: true },
  },
  overrides: [
    {
      files: ["*.astro"],
      parser: "astro-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
        extraFileExtensions: [".astro"],
      },
      plugins: ["astro"],
      extends: ["plugin:astro/recommended"],
      rules: {
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
    {
      files: ["*.ts", "*.tsx"],
      rules: {
        "functional/functional-parameters": "off",
        "functional/immutable-data": "off",
        "functional/no-expression-statements": "off",
      },
    },
  ],
};
