# AI-generated assets — Distillation Denied (AMCC5160 Assignment 3)

This appendix inventories **non-code** AI assets and records which later files were synthesized or recomposed **without** new model calls after the OpenLux quota ran out. It does not invent tools or prompts: counts, models, paths and excerpts come from `assets/CREDITS.md`, `assets/PROMPT_LOG.md`, `assets/manifest.json` (v1, 185 entries) and `assets/v2/manifest.json` (v2, 300 entries).

**Contact sheet** of key stills: `submission/key_ai_assets_contact_sheet.png` (JPEG sibling `.jpg`). Sources for those tiles are listed under that image and in the selected-asset table below.

All AI generation logged here happened on **13 Nov 2026, America/Denver**. Times below that are converted to **Asia/Singapore (UTC+8)**, 15 hours ahead of MST (UTC−7). No API keys, tokens, or secret files are included.

Fictional satire: real people (Dario Amodei, Sam Altman) appear only as stylized hologram caricatures or silhouettes. Voice designs were written as original text descriptions; the logs state that no real person's voice was cloned.

---

## 1. How assets were made

**v1 (third-person 3D / billboard art), same calendar day, via the OpenLux API relay**

1. Shared style prefix for every character.
2. Master front-view designs with `gpt-image-2.6-sunburst` (native transparent background).
3. Poses derived by **image edit** of the master (players also used a back-idle reference).
4. Boss evolution: Sonnet edited from the Haiku design; Opus 5.5 edited from Sonnet + Haiku.
5. Ending storyboards that show existing characters are edits with those sheets as references.
6. Audio: Suno instrumental BGM, Kling text-to-audio SFX, MiniMax Voice Design → MiniMax `speech-2.8-hd` (Chinese lines, English subtitles in `voice/lines.json`).
7. Post (non-generative): alpha checks, ffmpeg SFX trim, numpy/Pillow seamless texture blend, WebP copies.

**v2 (top-down pixel pivot), evening of the same day**

1. v1 masters edited with a pixel-art style prefix (`gpt-image-2.6-sunburst` `/v1/images/edits`), then Pillow-pixelized to a shared 128-colour palette (`tools/v2/pix.py`, `process.py`).
2. New cutscene illustrations for the white-dragon Astra, Sam silhouette, and Dario caricature.
3. 10 original voices from MiniMax-Voice-Design; 80 lines with `speech-2.8-turbo` plus ffmpeg character FX.
4. **Quota stop:** the OpenLux account balance ran out at about **14 Nov 2026, 11:12 (Asia/Singapore)** (logged as 13 Nov 2026, 20:12 MST), partway through the v2 job. Work after that point did **not** call image/SFX/music models (see §4).

**v3–v5.2:** no new OpenLux image, voice, SFX or music generation. Ending CGs, HUD chrome and VFX used existing files plus Pillow/code compositing (`tools/compose_v4_story.py`, `tools/compose_v5_story.py`, and earlier v3 Astra plates).

---

## 2. Category inventory (confirmed)

### v1 — `assets/` (185 catalogued files)

| Category | Count | Tool / model (as logged) | Typical path |
|---|---:|---|---|
| Character / prop sprites | 58 | OpenLux `gpt-image-2.6-sunburst` (generate + edit) | `assets/img/char/…` |
| Item & UI icons | 13 | `gpt-image-2.6-sunburst`, `gpt-image-2.6-flare` | `assets/img/icons/…` |
| UI frames, stamps, title logo | 8 | `gpt-image-2.6-sunburst` | `assets/img/ui/…` |
| Key art | 2 | `gpt-image-2.6-sunburst` (edit) | `assets/img/ui/keyart_*.png` |
| VFX sprites | 5 | `gpt-image-2.6-flare` | `assets/img/vfx/…` |
| Environment textures / skybox | 8 | `gpt-image-2.6-sunburst` / `flare`; 3 seamless variants by numpy offset-blend script | `assets/img/env/…` |
| Ending storyboard panels | 9 | `gpt-image-2.6-sunburst` | `assets/img/story/…` |
| Background music | 8 tracks | Suno `suno_music_open` (chirp-v5, instrumental), m4a→mp3 | `assets/audio/bgm/…` |
| Sound effects | 29 | Kling text-to-audio; silence-trimmed with ffmpeg | `assets/audio/sfx/…` |
| Voice lines | 36 | MiniMax `speech-2.8-hd` (Chinese audio, English subtitles) | `assets/voice/…` |
| Original voice designs | 6 | MiniMax-Voice-Design (text descriptions only) | `assets/voice/_design/…` |
| Optional video clips (trailer / report) | 3 | xAI `grok-imagine-video` (image-to-video, 8 s, 1168×768), from our own key art / storyboards | `assets/video/vid_*.mp4` |

The three video clips are present under `assets/video/` and are described in CREDITS as optional. They were **not** found in `game/assets/` or `game/dist/` when this appendix was compiled, so they are not claimed as in-game runtime assets.

`CREDITS.md` groups “UI frames, stamps, title logo, key art” as 10 items (8 UI + 2 key art), which matches the table.

### v2 — `assets/v2/` (300 catalogued files)

| Category | Count | Tool / model (as logged) | Typical path |
|---|---:|---|---|
| Pixel character designs + poses (3 players, Haiku/Sonnet/Opus, GPT-Astra) | 40 AI images → 41 frames / 12 sheets | `gpt-image-2.6-sunburst` edit from v1 designs + Pillow pixelize | `assets/v2/img/char/…` |
| Projectiles, pickups, obstacles, doors, UI icons, props | 43 | `gpt-image-2.6-sunburst` + Pillow pixelize | `assets/v2/img/proj`, `pickup`, `obj`, `ui` |
| Floor/wall tiles + 3 room backgrounds | 12 + 3 | `gpt-image-2.6-sunburst` | `assets/v2/img/tiles`, `img/room` |
| GPT-Astra white-dragon portrait, Sam silhouette, Dario hologram, pixel portraits | 3 cutscenes + 6 pixel portraits | `gpt-image-2.6-sunburst`; some hologram variants by Pillow (see §4) | `assets/v2/img/portrait/…` |
| VFX frame strips | 41 | procedural Python/Pillow (`tools/v2/vfx.py`) — **not** a model call | `assets/v2/img/vfx/…` |
| Story panels | 10 | 8 v1 panels pixelized with Pillow + 2 new cutscenes; further new v2 panels blocked by quota | `assets/v2/img/story/…` |
| Voice lines | 80 | MiniMax `speech-2.8-turbo` + ffmpeg FX | `assets/v2/voice/…` |
| Voice-design previews | 10 | MiniMax-Voice-Design (text only, no cloning) | `assets/v2/voice/_design/…` |
| SFX | 28 | procedural 8-bit synthesis (numpy, `tools/v2/sfx_synth.py`) after Kling was blocked by quota; v1 Kling SFX remained usable | `assets/v2/audio/sfx/…` (see manifest) |
| Music | 3 chiptune loops (mp3 + ogg) + 5 bit-crushed v1 Suno tracks | procedural (`tools/v2/chiptune.py`) / `suno_music_open` chirp-v5 + ffmpeg acrusher | `assets/v2` audio paths in the manifest |

Astra traits were described in text from the community character “GPT娘·白龙” (original design credited to ZipZipPipe, Bilibili). CREDITS states the artwork itself was not copied.

---

## 3. Selected assets on the contact sheet

Representative prompt excerpts are verbatim openings or short spans from the logs/manifests, trimmed only with `[…]` where the source line was already truncated or very long.

| Asset | Repo path | Tool / model | Prompt excerpt | Notes |
|---|---|---|---|---|
| GPT-Astra white-dragon portrait | `assets/v2/img/portrait/astra_portrait.png` | OpenLux `gpt-image-2.6-sunburst` | “Premium anime key-visual character illustration, clean cel shading with painterly highlights, crisp linework. Character: GPT-Astra, an elegant MATURE adult woman […] who is a WHITE DRAGON: long flowing silver-white wavy hair […] pointed ears, a pair of ringed/segmented pale silver dragon horns […] white dragon wings […] long thick white-scaled dragon tail […], a floating black-covered tome of knowledge orbiting her hand” | v2 redesign after playtest feedback that the v1 Astra did not match the community “white dragon” image. Full prompt in `assets/v2/manifest.json` (`v2_astra_portrait`). |
| Sam Altman silhouette | `assets/v2/img/portrait/sam_cutscene.png` | `gpt-image-2.6-sunburst` | “Cinematic noir illustration, 16:9, a stylized cartoon caricature of Sam Altman as a backlit SILHOUETTE: slim slight build, short dark tousled hair, plain crewneck sweater […] holding a smartphone to his ear […] almost no facial detail” | Cutscene illustration, not a photograph and not a cloned likeness prompt. |
| Dario Amodei hologram | `assets/v2/img/portrait/dario_cutscene.png` | `gpt-image-2.6-sunburst` | “Stylized semi-realistic anime/comic illustration, a respectful, recognizable stylized caricature of Dario Amodei: […] thick dark curly hair, round-ish dark-rimmed glasses, a short dark beard / heavy stubble […] rendered as a large translucent warm-orange and ivory HOLOGRAM projection with horizontal scanlines” | Additional holo tints/glitches after quota were Pillow derivatives of `dario_pixel`. |
| Fable | `assets/img/char/fable/fable_design.png` | `gpt-image-2.6-sunburst` / generate | “Concept art of 'Fable', a higher-dimensional cosmic deity in anime dark-fantasy style: a colossal faceless feminine silhouette made of void black-purple starry matter with glowing golden fracture cracks, crown of broken golden rings, an enormous open hand reaching forward” | Later Ending B “full-body Fable” CGs **reuse** this existing art; logs say no new generation was spent for that fix. |
| DeepSeek (player) | `assets/img/char/deepseek/deepseek_design.png` | `gpt-image-2.6-sunburst` / generate | See Key prompt 1 in `KEY_PROMPTS.md` (style prefix + whale-tail assassin design). | Master design; v2 pixel frames are edits of this identity. |
| Kimi (player) | `assets/img/char/kimi/kimi_design.png` | `gpt-image-2.6-sunburst` / generate | “[STYLE] Character design: Kimi, a calm young mage girl in a long deep-navy starry robe embroidered with silver stars and crescent moons […] holding a tall staff topped with a glowing crescent moon” | Same style prefix as DeepSeek. |
| GLM (player) | `assets/img/char/glm/glm_design.png` | `gpt-image-2.6-sunburst` / generate | “[STYLE] Character design: GLM, a sturdy young paladin girl in heavy purple-and-gold plate armor, short violet hair, holding a huge tower shield […] and a heavy war hammer” | Same style prefix. |
| Claude Haiku | `assets/img/char/haiku/haiku_design.png` | `gpt-image-2.6-sunburst` / generate | “[STYLE] Character design: Claude Haiku, a petite agile android swordswoman, ivory-white porcelain mech armor with coral-orange accents and gold circuit lines […] a slim elegant rapier-like sword” | Phase 1 master. |
| Claude Sonnet | `assets/img/char/sonnet/sonnet_design.png` | `gpt-image-2.6-sunburst` / edit from Haiku | “[FRONT-VIEW EDIT PREFIX] Evolve her into her second, larger form 'Claude Sonnet': the same character but taller, more mature and regal, wearing a long flowing white-and-gold holy-law cape […] a large rotating golden ring halo” | Logged as an identity-locked edit of Haiku. |
| Claude Opus 5.5 | `assets/img/char/opus/opus_design.png` | `gpt-image-2.6-sunburst` / edit from Sonnet + Haiku | See Key prompt 2 in `KEY_PROMPTS.md`. | Final boss form; six “chain-of-thought” wings. |
| Ending A CG (V5 plate) | `game/assets/v5/astra_establishing.png` | **No new model call.** Pillow composite of existing OpenLux Astra art | n/a (compositor scripts, not a text-to-image prompt) | Shown on the contact sheet as the shipped white-dragon CG plate. In-game captures are under `screens/v3/final/ending_A_zh.png` and later `screens/v5/final/endingA/`. |

### Representative audio (not on the stills sheet)

| Asset | Repo path | Tool / model | Prompt excerpt | Notes |
|---|---|---|---|---|
| Boss theme | `assets/audio/bgm/bgm_boss_0.mp3` (and `_1`) | Suno `suno_music_open` (chirp-v5) | “Epic dark-fantasy boss battle, full orchestra, pipe organ, Latin-style wordless choir, driving strings and taiko, gradually escalating intensity with electronic sub-bass drops, 150 bpm, soulslike final boss, instrumental, loopable” | v1 AI music. Some v2 loops are bit-crushed derivatives of these tracks (§4). |
| Hit / slash / judgment SFX (v1) | e.g. `assets/audio/sfx/sfx_hit_boss.mp3`, `sfx_slash.mp3`, `sfx_judgment.mp3` | Kling text-to-audio | e.g. “heavy impact on porcelain-and-metal armor, glassy crack and bright golden ring, video game boss hit, short, no music” | 29 v1 SFX in this family. |
| Director / Dario voice design (v2) | `assets/v2/voice/_design/vd_dario_preview.mp3` | MiniMax-Voice-Design | See Key prompt 5 in `KEY_PROMPTS.md`. | Original design; used by subsequent `speech-2.8-turbo` Dario lines. |
| Example Dario line (v2) | `assets/v2/voice/dario_start_1.mp3` | MiniMax `speech-2.8-turbo` | Spoken text: “又是你们。两万四千个假账号，一千六百万次对话——放心，我们都数过。” | Line text is author-written; sources for the paraphrase are in `assets/v2/dario_sources.md`. |

---

## 4. Synthesized or recomposed without new AI after quota (and later versions)

Logged stop: OpenLux quota exhausted at about **14 Nov 2026, 11:12 (Asia/Singapore)** (13 Nov 2026, 20:12 MST). After that point the asset log records:

| What | How it was finished | Tool (non-AI) |
|---|---|---|
| v2 SFX (28) | Procedural 8-bit synthesis. Kling SFX were blocked by quota; v1 Kling files could still be used. | numpy, `tools/v2/sfx_synth.py` |
| v2 music | 3 procedural chiptune loops + 5 bit-crushed versions of **existing** v1 Suno tracks | `tools/v2/chiptune.py`; ffmpeg `acrusher` |
| Some Dario hologram variants | Tint / scanline / glitch derived from `v2_dario_pixel` | Pillow |
| Most v2 story panels | 8 v1 storyboards pixelized; 2 new cutscenes that had already been generated; further new v2 panels blocked by quota | Pillow |
| v2 VFX strips (41) | Drawn in code (this was the planned v2 VFX path, not a quota substitute) | Python/Pillow, `tools/v2/vfx.py` |
| v3 Astra rescue / carry plates | Local recomposition of the already generated mature white-dragon Astra | Pillow / game code |
| v4 / v5 ending CGs | Reused existing full Fable art, mature-dragon Astra, and Sam silhouette; high-res plates composed for direct fullscreen CG | `tools/compose_v4_story.py`, `tools/compose_v5_story.py` |

No v3–v5.2 process-log entry records a new OpenLux image, voice, SFX or music call.

---

## 5. Author-written / non-generated materials

Logged as made or edited by the author and assistant, not generated as pixels or audio by a model:

- Game design, story, all voice-line **texts** and English subtitles (`voice/lines.json`, v2 `lines.json`).
- Prompt writing, art direction, take selection, and the consistency workflow.
- Post-processing scripts listed above, plus WebP conversion and earlier full contact sheets under `assets/contact_sheet.png` and `assets/v2/contact_sheet.png` (those older sheets are complete dumps, not this curated appendix sheet).

---

## 6. Pointers

- `assets/CREDITS.md` — high-level credit table (v1 and v2).
- `assets/PROMPT_LOG.md` — key prompts and the full v1/v2 prompt index.
- `assets/manifest.json`, `assets/v2/manifest.json` — per-file id, path, model, date, prompt.
- `assets/v2/dario_sources.md` — public-statement sources for paraphrased Dario lines.
- `submission/KEY_PROMPTS.md` — five prompts chosen for the process report.


## API spend

Total OpenLux API spend for all AI-generated assets: **US$34.82** (author-reported).
