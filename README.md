# Mountains Expeditions

Responsive React and Vite prototype for exploring Ukrainian Carpathian routes. The interface is available in Ukrainian and English.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run lint
npm run format:check
npm run test
npm run test:e2e
npm run build
```

Vitest and Testing Library cover unit tests. Cypress runs end-to-end scenarios on a separate Vite server. Husky runs lint-staged before commits, applying ESLint and Prettier to staged files.

The sign-in and booking flow is a browser-only demo. It does not authenticate users or submit reservations to a server; demo account and booking data are stored in local storage.
