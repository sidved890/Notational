# Version History

All notable changes to Notational. Versions follow [Semantic Versioning](https://semver.org/) where practical.

---

## [1.4.0] — 2026-07-05

### Added
- Creator photo on About page
- Auto-derived avarohanam for melakarta (non-janya) ragas
- Left/right arrow navigation in sahitya (lyric) cells
- Karvai (ɔ) cells styled bold and smaller than regular swaras
- README and CHANGELOG; branch restructure (`main` = Next.js, `html` = legacy)

---

## [1.3.0] — 2026-06-27

### Added
- Undo / redo with edit coalescing (Ctrl/Cmd+Z, toolbar buttons)
- Duplicate avarthanam as new sangathi (+S button)
- Six color themes (Parchment, Midnight, Forest, Ocean, Slate, Rosewood)
- Per-avartanam gap-fill: karvai (ɔ) and sahitya dashes (—)
- Tutorial page (`/tutorial`)
- Dashboard folders for organizing compositions
- Portal-based sangathi dropdown (no longer clipped by grid overflow)

### Fixed
- Down arrow navigation into next avarthanam
- Delete key clears swara cell and moves left
- Cloud save timestamps and dashboard query (compositions now appear after save)
- Print header shows song name, ragam, talam, composer, and raga info

---

## [1.2.0] — 2026-06-27

### Added
- Clickable logo and Devanagari न mark
- Terminology update: avartanam → avarthanam throughout UI

---

## [1.1.0] — 2026-06-27

### Added
- About page with feature highlights and creator bio
- Cloud save fixes, print header extraction
- Arrow key and raga field fixes

---

## [1.0.0] — 2026-06-27

### Added
- **Next.js port** — full rewrite from single-file HTML to Next.js 16 + React 19 + TypeScript
- Dashboard with composition grid, auth, and cloud sync
- Public share links (`/share/[id]`)
- Raga overview panel (melakarta, arohanam, avarohanam, janya)
- Sangathi numbering and row reorder
- Section heading insert strips and presets
- Autosave to localStorage with versioned JSON format
- Firebase Firestore security rules

---

## [0.4.0] — 2026-06-27 — `html` branch

### Fixed
- NaN beat counts for special talas (Misra Chapu, Khanda Chapu, etc.)

### Added
- Full 35-tala system with visual tala picker (HTML version)

*Last release on the legacy `html` branch (single-file `index.html`).*

---

## [0.3.0] — 2026-06-27 — `html` branch

### Added
- Section headings (Pallavi, Anupallavi, Charanam, etc.)
- Sahitya auto-shrink font when text overflows
- Flat `state.rows` model with backward-compatible JSON load

### Fixed
- Firebase config variable mismatch (cloud accounts enabled)

---

## [0.2.0] — 2026-06-27 — `html` branch

### Added
- Talam beat patterns and zoom controls
- Firebase authentication (Google + email)
- Grid width fixes

---

## [0.1.0] — 2026-06-27 — `html` branch

### Added
- Initial single-file Carnatic notation app (`index.html`)
- Swara/sahitya grid with talam, kalai, and maatra configuration
- Special character keybindings (karvai, dot-below, dot-above)
- Playback simulation, JSON save/load, autosave, dark mode, print styles
