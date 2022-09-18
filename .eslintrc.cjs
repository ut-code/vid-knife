/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: "airbnb-typescript-prettier",
  rules: {
    "dot-notation": "off", // noPropertyAccessFromIndexSignature
    "no-restricted-syntax": "off", // Allow for-of loop
    "import/no-unresolved": "off", // Vite and TypeScript can do this
    "react/react-in-jsx-scope": "off", // No longer necessary with React@>=17
    "react/jsx-props-no-spreading": "off", // External libraries like react-dropzone and react-hook-form use this syntax
  },
};
