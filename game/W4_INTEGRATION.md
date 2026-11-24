# W4 integration notes (Claude combat text / VO)

## Landed in this worktree
- `src/data/lines_claude.js` — parodic combat caption pool (mandatory IP-ban + KYC lines).
- `src/ui/claude.js` + `css/claude.css` — DOM captions/toasts; wired from `boss.init` / `boss.update` / `clearFight` (no `main.js` edit required).
- `src/core/audio.js` — mutes `v2_vo_haiku|sonnet|opus_*` combat VO when `dd.lang.v3 === en` during fight/intro; `getPlayLog()` for tests. Dario/ally/SFX unchanged.
- `src/boss/patterns.js` — `announce()` no longer builds `#boss-callout`; `BOSS_ATTACK` drives `#claude-attack-toast`.

## DOM ids for W1 HUD layout
| Element | Id | Placement |
|---|---|---|
| Combat caption (parody lines) | `#claude-combat-caption` | `bottom: 72px`, centered — raise if W1 enlarges footer HUD |
| Attack pattern label | `#claude-attack-toast` | `top: 52px`, centered — below boss bar / top door |

Styles live in `css/claude.css` (not `css/ui.css`). Integrator: optional `<link href="css/claude.css">` in `index.html`; module also injects link at runtime.

## Integrator TODO (not W4-owned)
- `main.js` — no change required for captions; confirm `css/claude.css` copied in `tools/build.mjs` if build omits new css.
- Scene title **548 Market Street** — W1/W3.
- Story direct CG — W2.

## Test
`node tests/v4_claude.mjs` → `http://127.0.0.1:8122/`, screenshots `screens/v4/w4/combat_en.png`, `combat_zh.png`.