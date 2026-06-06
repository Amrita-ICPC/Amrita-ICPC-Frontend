import { fixupConfigRules } from "@eslint/compat";
import nextVitals from "eslint-config-next/core-web-vitals";
import unusedImports from "eslint-plugin-unused-imports";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import eslintConfigPrettier from "eslint-config-prettier";

const eslintConfig = [
  {

    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "*.config.mjs",
      "src/api/generated/**",
    ],
  },
  ...fixupConfigRules(nextVitals),
  {
    plugins:{
      "unused-imports":unusedImports,
      "simple-import-sort":simpleImportSort
    },
    rules:{
      //remove unused imports
      "unused-imports/no-unused-imports": "error",

      //warn unused vars
      "unused-imports/no-unused-vars": [
                "warn",
                {
                    vars: "all",
                    varsIgnorePattern: "^_",
                    args: "after-used",
                    argsIgnorePattern: "^_",
                },
            ],
            
        // sort imports automatically
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
    }
  },
  //prettier
  eslintConfigPrettier
];

export default eslintConfig;
