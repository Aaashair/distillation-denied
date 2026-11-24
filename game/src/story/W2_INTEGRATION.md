# W2 → coordinator

- **Setting label** `548 Market Street` (both langs): updated in ending credits + `storyCg.js` captions. **W1** should mirror in `data/lines.js` (`UI.title` zh), `index.html` title, arena HUD if any “蒸馏圣堂” remains.
- **Ban UI** copy still from `menus.js` (W1); W2 only styles `#screen-banned` in `css/theater.css` over `#story-cg`.
- **Phase sim** unchanged (`boss.js` invuln/timer); W2 overlays `#story-cg` during `PHASE_TRANSITION_*` only.