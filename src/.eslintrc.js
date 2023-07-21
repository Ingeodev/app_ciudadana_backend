module.exports = {
  env: {
    node: true,
    commonjs: true,
    es6: true
  },
  extends: ["eslint:recommended", "prettier"],
  plugins: ["prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-unused-vars": "warn",
    "radix": "error",
    "no-var": "error",
    "brace-style": "error",
    "prefer-template": "error",
    "space-before-blocks": "error",
    "import/prefer-default-export": "off"
  },
};
