import js from "@eslint/js";
import globals from "globals";

/** Flat config — Node.js / ESM backend. */
export default [
  {
    ignores: ["node_modules/**", "tmp/**", "src/utils/pdf/fonts/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Surface unused code without hard-failing `validate` on legacy files.
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
