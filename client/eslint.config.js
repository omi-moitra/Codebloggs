import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

// Flat config (ESLint 9+). Mirrors the previous .eslintrc.cjs:
// eslint:recommended + react/recommended + react/jsx-runtime +
// react-hooks/recommended + the react-refresh component-export rule.
export default [
  { ignores: ["dist"] },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "18.2" },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Match the project's original .eslintrc intent: the two classic hooks
      // rules only (react-hooks v7's "recommended" preset additionally enables
      // the stricter React Compiler rules, which this codebase never opted in
      // to). Re-enable those separately if desired.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    // Context files intentionally export a provider component alongside its
    // hook (the established AuthContext pattern), which the fast-refresh rule
    // can't model — turn it off here rather than split idiomatic files.
    files: ["src/context/**/*.{js,jsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
];
