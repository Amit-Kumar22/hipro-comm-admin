import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // Relax some strict rules for development - disable all warnings
  {
    rules: {
      // Allow any type for backward compatibility
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unescaped entities in JSX for simplicity
      "react/no-unescaped-entities": "off",
      // Allow setState in effects for async operations
      "react-hooks/set-state-in-effect": "off",
      // Allow variable before declaration in some cases
      "react-hooks/immutability": "off",
      // Allow img element for external images
      "@next/next/no-img-element": "off",
      // Allow anchor tags for external links
      "@next/next/no-html-link-for-pages": "off",
      // Allow empty object types for React props
      "@typescript-eslint/no-empty-object-type": "off",
      // Allow require in test/debug files
      "@typescript-eslint/no-require-imports": "off",
      // Allow anonymous default exports
      "import/no-anonymous-default-export": "off",
      // Allow unused vars
      "@typescript-eslint/no-unused-vars": "off",
      // Disable react-hooks exhaustive deps
      "react-hooks/exhaustive-deps": "off",
      // Disable jsx-a11y alt-text
      "jsx-a11y/alt-text": "off",
      // Disable use-memo rule
      "react-hooks/use-memo": "off",
      // Disable no-unused-labels for eslint-disable
      "no-unused-labels": "off",
    },
  },
]);

export default eslintConfig;
