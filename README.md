# Notational

A digital manuscript system for **Carnatic (South Indian classical) music notation** — built to feel like the paper manuscripts musicians have relied on for generations, with the convenience of a modern web app.

**Live app:** deploy via [Vercel](https://vercel.com) (connect this repo's `main` branch for automatic deploys on push).

## Features

- **35-talam system** — 7 base talams × 5 jathis, plus Misra/Khanda Chapu and traditional Rupaka
- **Swara + sahitya grid** — two-line cells with keyboard-driven entry, karvai (ɔ) and octave shortcuts
- **Section headings** — Pallavi, Anupallavi, Charanam, and custom labels
- **Sangathi variations** — duplicate an avarthanam as a new sangathi with one click
- **Raga overview** — melakarta, arohanam/avarohanam (auto-derived for melakarta ragas), janya parent
- **Cloud storage** — save compositions to Firebase; organize with folders on the dashboard
- **Share links** — public read-only views for any composition
- **Print-ready output** — song metadata header + notation grid
- **Undo / redo** — full edit history with coalesced typing steps
- **Six themes** — Parchment, Midnight, Forest, Ocean, Slate, Rosewood
- **JSON import/export** — backup and transfer compositions offline

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/) + TypeScript
- [Firebase](https://firebase.google.com/) (Auth + Firestore)
- [Tailwind CSS 4](https://tailwindcss.com/)

## Getting started

### Prerequisites

- Node.js 20+
- A Firebase project with **Email/Password** and **Google** auth enabled
- Firestore database with rules from `firestore.rules` deployed

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Firebase setup

Firebase config is in `src/lib/firebase.ts`. Deploy Firestore rules:

```bash
firebase deploy --only firestore:rules
```

### Build for production

```bash
npm run build
npm start
```

## Project structure

```
src/
  app/           # Next.js routes (dashboard, editor, about, tutorial, share)
  components/    # Editor UI, notation grid, metadata panel, theme picker
  context/       # Composition state + undo/redo history
  hooks/         # useTheme
  lib/           # Tala engine, Firebase, storage, types
public/          # Static assets (logo, creator photo)
```

## Branches

| Branch | Description |
|--------|-------------|
| `main` | **Current app** — Next.js + React + TypeScript (deploy this) |
| `html` | **Legacy** — original single-file `index.html` vanilla JS prototype |
| `nextjs` | Development branch (kept in sync with `main`) |

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Keyboard shortcuts (editor)

| Key | Action |
|-----|--------|
| `,` | Karvai (ɔ) in swara field |
| `m ;` / `s '` etc. | Dot below / dot above (octave markers) |
| `←` `→` | Move between cells |
| `↑` `↓` | Move between avarthanams (swara) or lyric cells (sahitya) |
| `Ctrl/Cmd Z` | Undo |
| `Ctrl/Cmd Shift Z` | Redo |
| `?` | Toggle shortcut help |

Hover an avarthanam row for gap-fill (ɔ / —), duplicate sangathi (+S), and row actions.

## Creator

Built by **Siddharth Vedam** — vocalist, mridangist, and developer. See the [About](/about) page in the app.

## License

Private project. All rights reserved.
