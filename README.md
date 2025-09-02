Snarky Insight Jar
===================

A Vite + React + TypeScript app styled with Tailwind CSS, animated with Framer Motion, and state managed by Zustand. Drop “coins” with snarky notes into a jar. Coins are masked to the jar, animated on drop, and persisted to localStorage.

Quickstart
----------

- npm install
- npm run dev

Open the dev server URL printed in your terminal.

Assets
------

This app expects the following files to exist and remain in place:

- /assets/jar-inside2.png
- /assets/jar-mask2.png
- /assets/tape-art2.png
- /assets/snarky-insight-speech-bubble.png
- /assets/magic_coin.mp3
- /assets/mockup-empty.png
- /assets/mockup-full.png

Do not move these assets. They are referenced as /assets/… in code.

Notes
-----

- Persistence uses localStorage key `snarkyJar.v1` for entries and `snarkyJar.v1_layout` for coin layout/visuals.
- CSV export: bottom-right download icon on the jar stage.
- Reset: text link under the main CTA; asks for confirmation.
- Accessibility: Modal traps focus, supports ESC, and buttons/links have focus rings. Animations respect prefers-reduced-motion.

