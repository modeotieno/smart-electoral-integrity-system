# SEIS Landing Page

Smart Electoral Integrity System (SEIS) modern React/Vite landing page.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Installable website (PWA)

`npm run build` generates a service worker and manifest via `vite-plugin-pwa`. The floating **Install SEIS** button is shown on every page: it triggers the browser install prompt where supported and displays manual instructions on browsers that do not expose one (for example iOS Safari). Install requires HTTPS or `localhost`.

The design includes:
- Responsive navigation
- Hero with dashboard and phone mockups
- Statistics
- About SEIS
- Dashboard preview
- Features
- How It Works
- Who We Serve
- Contact
- Footer
- React Icons
