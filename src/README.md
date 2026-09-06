# ACES — Association of Computer Engineering Students

Two files: `App.jsx` and `App.css`. Drop them into any existing React project (Vite or Create React App) and render `<App />`.

## Quick start with Vite

```bash
npm create vite@latest aces-site -- --template react
cd aces-site
npm install
```

Replace the generated `src/App.jsx` and `src/App.css` with the two files provided here, then run:

```bash
npm run dev
```

## Notes

- All styling is in plain CSS in `App.css` — no Tailwind, no CSS-in-JS.
- Google Fonts (Space Grotesk, Inter, IBM Plex Mono) are pulled in at the top of `App.css` via `@import`. If your project blocks external font imports, download the fonts and self-host instead.
- The recruitment form at the bottom (`#join`) currently just shows a success message on submit — it does not send data anywhere yet. Wire the `handleFormSubmit` function in `App.jsx` to your backend endpoint (fetch/axios call) or a form service to actually capture submissions.
- Team member names (President, Technical Head, etc.) are placeholder names — swap in your real committee. Utkarsha Kharade is included as Faculty Mentor per your request.
- Event dates, fees, and venues are placeholder content — update them each semester.
