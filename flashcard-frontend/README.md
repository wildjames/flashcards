# TODO list

## Tech debt

- [x] I'm not using the SSR offered by next, so I need to migrate back to react/vite.
- [x] I have fetch statements all over the place, that should use the axios instance I made. Update them.
- [x] The logic on the flashcard page is NOT good. Refactor it!
  - [x] The "Flashcard Quiz" header is not centered, and besides it should be on the left
  - [x] The flashcards themselves have a log of styling, which should be in the assets
- [x] The registration page has a lot of styling in it. Move that to the assets
- [x] The GroupInfo page is a mess. Clean it up
- [x] Containerise this. Have react build the frontend, and serve it with flask.
- [ ] Mobile friendly styling would be nice
- [ ] Login error reporting to the user is woeful

## MVP features

- [ ] Search for and join groups
- [ ] Leave groups without deleting them!

## Bulk imports

I wanted control over bulk importing. There are a few core ones that I want:

- [x] CSV (arbitrary delimiter, including tabs)
- [x] JSON
- [ ] Confluence copy-paste (newline-delimited, user-defined number of columns)
- [ ] Google sheets live-update
- [ ] Web-scraping. Maybe via webhooks?
- [STRETCH GOAL?] Database hookup?

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
