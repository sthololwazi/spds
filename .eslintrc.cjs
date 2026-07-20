module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.base.json"],
    sourceType: "module"
  },
  env: {
    node: true,
    es2023: true,
    jest: true
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "import/order": ["error", { "groups": [["builtin", "external", "internal"]], "alphabetize": { "order": "asc", "caseInsensitive": true } }],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "./tsconfig.base.json"
      }
    }
  }
};
