import js from "@eslint/js";
import globals from "globals";
import hooks from "eslint-plugin-react-hooks";
import refresh from "eslint-plugin-react-refresh";
export default [
  { ignores: ["dist/**", "node_modules/**"] },
  { files: ["src/**/*.{js,jsx}", "tests/**/*.mjs"], ...js.configs.recommended,
    languageOptions: { ecmaVersion: "latest", sourceType: "module", globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { "react-hooks": hooks, "react-refresh": refresh },
    rules: { ...hooks.configs.recommended.rules, "react-hooks/exhaustive-deps": "error", "react-refresh/only-export-components": ["error", { allowConstantExport: true }], "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^[A-Z_]" }], eqeqeq: "error", "no-console": ["error", { allow: ["error"] }] },
  },
];
