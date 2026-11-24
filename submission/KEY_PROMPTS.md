# Key prompts — Distillation Denied (AMCC5160 Assignment 3)

Five prompts actually used in production, chosen because they show the art-consistency pipeline, a playtest-driven redesign, the Cursor CLI coding workflow, and a non-image AI modality. Prompts are **verbatim** from the cited files unless a trim is marked with `[…]`. No prompt here was invented for the report.

Voice-design IDs (`ttv-voice-…`) are MiniMax voice-preset identifiers recorded in `assets/PROMPT_LOG.md`; they are not API keys.

---

## 1. Shared character style prefix and DeepSeek master design

- **Source:** `assets/PROMPT_LOG.md`, section “Key prompts” items 1–2 (also the `deepseek_design` row in the full prompt index).
- **Tool / model:** OpenLux `gpt-image-2.6-sunburst`, text-to-image.
- **When:** 13 Nov 2026 (America/Denver), v1 asset batch.
- **What it produced:** The DeepSeek master sprite `assets/img/char/deepseek/deepseek_design.png`, and the style lock reused for the other v1 character masters (Kimi, GLM, Haiku, and the later Sonnet/Opus edits). Poses were then derived by image-edit from these masters.

```
Anime-style soulslike character art, feminine personification, bright holy sky-cathedral aesthetic (white marble, polished gold filigree, soft divine rim light, pale sky-blue accents), clean cel shading with painterly highlights, crisp confident linework, premium action-RPG key-visual quality, half-human half-machine details (white porcelain armor plates with thin glowing circuit lines). One single character, full body head to toe with margin, centered, on a fully transparent background, no ground shadow, no text, no logo, no watermark. Character design: DeepSeek, a slender young assassin girl with long white-and-ocean-blue hair in a high ponytail shaped like a whale tail, sleek blue-and-white light armor with whale-fin shaped shoulder guards, a short flowing scarf, dual curved short blades (one in each hand) with glowing cyan edges, agile stance, determined eyes. Front view, standing, full body.
```

---

## 2. Claude Opus 5.5 evolved from Sonnet and Haiku

- **Source:** `assets/PROMPT_LOG.md`, “Key prompts” item 4 (full index row `opus_design`).
- **Tool / model:** OpenLux `gpt-image-2.6-sunburst`, **image edit**. References logged: `img/char/sonnet/sonnet_design.png`, `img/char/haiku/haiku_design.png`.
- **When:** 13 Nov 2026 (America/Denver), v1 asset batch.
- **What it produced:** `assets/img/char/opus/opus_design.png` (and subsequent Opus pose edits). The three boss phases read as one character growing, because Sonnet was edited from Haiku and Opus from both.

```
Same exact character as the reference image(s): identical face, hair, armor, colors, weapon, art style, line quality and proportions. Front-facing toward the viewer (she faces the camera, as a boss facing the player), full body head to toe with margin, centered, single character, fully transparent background, no text, no ground, no shadow. Pose: Evolve her into her final, most powerful form 'Claude Opus 5.5': the same character as a towering divine mecha-angel, FLOATING above the ground (feet not touching anything), six enormous radiant golden wings made of luminous linked chains of glowing nodes and light segments (chain-of-thought wings), ornate ivory-and-gold heavy mech armor with coral-orange core glowing in the chest, crown-like halo, long flowing hair, wielding a very long massive greatsword of white-gold light, golden light dust around her. Front-facing, full body including all six wings within frame.
```

---

## 3. GPT-Astra white-dragon redesign (v2, after playtest)

- **Source:** full prompt from `assets/v2/manifest.json`, entry `v2_astra_portrait` (the shorter “v2 key prompts / D” block in `assets/PROMPT_LOG.md` is the same character description without the framing/pose sentences).
- **Tool / model:** OpenLux `gpt-image-2.6-sunburst`.
- **When:** 13 Nov 2026 evening, America/Denver (v2 asset job), after Playtest Round 1 asked for a mature “GPT娘·白龙” look. Traits were described in text; CREDITS credits the community design to ZipZipPipe (Bilibili) and states that artwork was not copied.
- **What it produced:** `assets/v2/img/portrait/astra_portrait.png` — the mature white-dragon portrait later reused (Pillow composites, no new generation) for Ending A CGs in v3–v5.

```
Premium anime key-visual character illustration, clean cel shading with painterly highlights, crisp linework. Character: GPT-Astra, an elegant MATURE adult woman (mid/late twenties look, tall, graceful, calm confident smile, slightly teasing knowing eyes) who is a WHITE DRAGON: long flowing silver-white wavy hair with a faint lavender sheen, pale amethyst-violet eyes, pointed ears, a pair of ringed/segmented pale silver dragon horns curving back from her head, a pair of white dragon wings with soft lavender membranes, a long thick white-scaled dragon tail with lavender undertones; outfit: an elegant white-and-black high-collared gown (white body with black collar, black cuffs and thin gold trim), the OpenAI-style interlocking hexagonal knot/rosette emblem as a silver brooch on her collar and woven into her hair ornament, white gloves, a floating black-covered tome of knowledge orbiting her hand; regal ancient-wise-dragon vibe, slightly tsundere pride. Full body, three-quarter view, wings spread, holding the floating black tome, soft teal-white light motes, standing heroically as a rescuer. Single character, fully transparent background, no text, no logo, no watermark.
```

---

## 4. Cursor CLI Round 0 — grey-box architecture skeleton

- **Source:** `prompts/ws0_skeleton.md` (the file sent to Cursor CLI). Process log: 13 Nov 2026 ~08:40 MST / **13 Nov 2026, 23:40 Asia/Singapore**, one agent, model `grok-4.7-xhigh-fast`.
- **Tool / model:** Cursor CLI `cursor-agent`, `grok-4.7-xhigh-fast`.
- **What it produced:** Commit `aa000e2`, 42 files / about 5,000 lines: frozen contracts, `ASSET_CONFIG`, esbuild `file://` build, a working grey-box loop (title → disclaimer → select → fight → phases → banned / Ending A / Ending B), `ARCHITECTURE.md`, and `window.__debug` so later Playwright tests could drive every state. Five parallel workstreams then filled the owned modules without touching those contracts.

The prompt is long; the text below is the complete file `prompts/ws0_skeleton.md` (not paraphrased).

```
You are the lead architect for a small browser game, "蒸馏圣堂 DISTILLATION DENIED" (AMCC5160 course assignment). Read ./DESIGN.md fully first (it is in this repo root). It is the spec, with these FINAL OVERRIDES from the user:
- Use REAL names exactly as in the design (Claude Haiku/Sonnet/Opus 5.5, Dario, GPT-Astra, Sam Altman, Fable, Jensen Huang, DeepSeek, Kimi, GLM). Keep them centralized in src/data/lines.js + ASSET_CONFIG.names. Keep the satire disclaimer card on the title flow.
- Characters are 2.5D billboard cutouts (textured planes facing camera) in a real 3D Three.js arena. Until art arrives, use procedural placeholder textures (canvas-drawn colored silhouette + name label) so it always runs.
- HARDCORE: NO story mode, NO checkpoints. Ignore those parts of DESIGN.md §1/§13. Keep the P debug panel (damage multipliers, jump to phase, trigger ending A/B, god mode, time scale).
- ALL UI text bilingual Chinese + English (e.g. "你被封号！ / ACCOUNT BANNED").
- Must run two ways: (1) dev: `npx serve .` loading ES modules via index.html (import map pointing `three` to ./vendor/three.module.js — already present, r170, zero CDN); (2) release: `node tools/build.mjs` → esbuild bundles src/main.js into dist/game.js as a single IIFE and writes dist/index.html (plain <script>, no type=module) + copies css/ and assets/ into dist/, so double-clicking dist/index.html from file:// works. Never use fetch() for anything; images via Image/TextureLoader, audio via HTMLAudioElement.

YOUR JOB (this is round 0, you alone, other agents will build features in parallel AFTER you): lay down the skeleton so that 5 parallel workers can each own separate files without conflicts. Concretely:
1. Create the full directory/file layout of DESIGN.md §10 [… modules listed: index.html, css, src/core, src/config, src/world, src/actors, src/boss, src/ui, src/story, tools/build.mjs …]. You may add small extra files if useful.
2. src/core/contracts.js: FROZEN shared contract. Export EVENTS […], GAME_STATES (title, disclaimer, select, fight, banned, theater, credits, paused), and JSDoc typedefs for the shared interfaces: the game context `ctx` […], the Actor interface […], the Boss interface […], the Telegraph API […]. Also a shared `applyHit(ctx, src, dst, dmg, opts)` helper in a non-frozen module (e.g. src/core/combat.js) that applies multipliers from debug, emits EVENTS.hit, and is what every damage source uses.
3. src/core/bus.js (tiny pub/sub), input.js […], time.js (fixed 60Hz step, timeScale, hitStop), audio.js (stub API […] with WebAudio synth fallback beep when the file is missing — owner of the real impl will be another worker).
4. src/config/assets.js: ASSET_CONFIG exactly in the spirit of DESIGN.md §10, but EVERY asset referenced by a stable string id […]. An asset helper `getAsset(id)` returns a path or null; `loadTexture(id, fallbackDrawFn)` returns a THREE texture immediately (placeholder canvas texture) and swaps in the real image when/if it loads; missing files must never throw or spam errors. […] Write tools/sync_assets.mjs […].
5. tools/build.mjs (esbuild, bundles to dist/game.js IIFE, resolves 'three' to vendor copy, writes dist/index.html, copies css/assets/vendor-free). Verify it actually runs with `node tools/build.mjs`.
6. A working GREY-BOX vertical slice wired end-to-end, minimal but real, so other workers have something to test against: main.js state machine title → disclaimer → select (3 cards) → fight in a round arena […] with an over-the-shoulder camera that looks at the boss, a player billboard that moves with WASD, a boss billboard that has HP and can be damaged by J, a simple HUD […], dying → banned screen → retry, boss phases switching at 70%/40% thresholds, entering P3 then ending A on death / ending B at 25% boss HP through stub Theater that shows text cards, P toggles a basic debug panel […]. Each module exposes `init(ctx)`/`update(ctx, dt)`/`reset(ctx)` […]. Put clear `// OWNER: WSx` header comments at the top of each file per DESIGN.md §11 ownership table.
7. Expose `window.__game = ctx` and a `window.__debug` API (e.g. __debug.startFight(charId), __debug.setPhase(n), __debug.setBossHpRatio(r), __debug.killPlayer(), __debug.triggerEnding('A'|'B'), __debug.state()) so automated Playwright tests can drive every state without input. Also support URL params ?autostart=deepseek&phase=3 for testing.
8. Write ARCHITECTURE.md (short): module map, ownership table, event list, how to run dev and build, rules (nobody edits contracts.js/bus.js/main.js wiring except the integrator; cross-module communication only through bus + ctx).
9. Verify: `node tools/build.mjs` succeeds; quickly check there are no syntax errors […]. Then `git add -A && git commit -m "skeleton: grey-box vertical slice + contracts + ASSET_CONFIG + build"`.

Keep code plain modern JS (no TypeScript, no frameworks, no other npm deps besides esbuild/three which are installed). Be thorough on contracts and interfaces, pragmatic on content. Do not push anywhere.
```

Trim note: bracketed `[…]` marks lists and interface fields that are fully present in `prompts/ws0_skeleton.md` (the file is 20 lines). Nothing in those omitted spans was rewritten.

---

## 5. Dario / director voice design (v2, after playtest)

- **Source:** `assets/PROMPT_LOG.md`, “v2 key prompts / F. Voice design prompts”, entry `dario`.
- **Tool / model:** MiniMax-Voice-Design (text description only; the log states no cloning). Logged preset id: `ttv-voice-2026111411083426-l5EandwL`.
- **When:** 13 Nov 2026 evening, America/Denver, v2 asset job, answering Playtest Round 1 (“voices […] have no character; delivery is flat”).
- **What it produced:** The original Dario/director voice used for the v2 Dario lines (example: `assets/v2/voice/dario_start_1.mp3` and the other `dario_*.mp3` files). Line *wording* was written for the project and, for Dario, paraphrased from the public record in `assets/v2/dario_sources.md`; only the voice timbre is model-generated.

```
原创角色音色：四十岁出头的男性科技公司创始人兼科学家，美式知识分子气质。语速偏快、思路密集，像在台上连续论证；吐字清晰精准，略带鼻音，语气真诚、急切又带一点居高临下的自信和冷幽默，偶尔停顿强调关键词，有轻微的紧张感和使命感。中音偏高，不粗犷，不夸张，不滑稽。
```
