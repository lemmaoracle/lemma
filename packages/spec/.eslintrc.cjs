/* eslint-env node */
module.exports = {
  extends: ["../../eslint.base.cjs"],
  parserOptions: {
    project: ["./tsconfig.json"],
  },
  ignorePatterns: ["**/*.test.ts"],
  overrides: [
    {
      files: ["*.test.ts"],
      extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
      rules: {
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
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
      },
    },
  ],
};
