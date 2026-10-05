# React + Vite

## Run the app with the real API

Start the Spring Boot app in `../Farm_CraftMarket` first. It listens on port `8082` by default and connects to the PostgreSQL database configured in `src/main/resources/application.properties`. Then start the frontend with `npm run dev` from this directory.

Vite forwards `/api` requests to `http://127.0.0.1:8082`. If the backend runs elsewhere, copy `.env.example` to `.env.local`, set `VITE_API_PROXY_TARGET` to the backend base URL, and restart Vite. The admin dashboard reports whether all, some, or none of its API sources loaded.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
