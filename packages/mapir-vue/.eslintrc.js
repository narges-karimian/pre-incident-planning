module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended"],
  parser: "vue-eslint-parser", // 👈 بسیار مهم
  parserOptions: {
    parser: "@babel/eslint-parser", // 👈 برای <script>
    ecmaVersion: 2020,
    sourceType: "module",
    requireConfigFile: false,
  },
  rules: {
    "no-console": "off",
    "no-debugger": "off",
    "vue/no-multiple-template-root": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-reserved-component-names": "off",
    "vue/require-slots-as-functions": "off",
  },
};
