# Distillation Denied

A short pixel-art boss fight that makes fun of the LLM industry. You play an open-source model, team up with two others, and try to distill a bigger model's thinking. You do not get to keep it.

[▶ Play in your browser](https://aaashair.github.io/distillation-denied/)

## Controls

| Key | What it does |
| --- | --- |
| WASD | Move |
| Arrow keys or mouse | Shoot |
| Space | Roll |
| Shift | Skill |
| Q | Heal |
| 1 / 2 / 3 | Pick a GPU: RTX 5090, H200, or B200 |
| P | Debug panel, for jumping to a phase or an ending |

## Story

You are DeepSeek, Kimi, or GLM. The other two fight beside you. The boss is Claude, and she changes from Haiku to Sonnet to Opus. A bar on screen shows how much of her chain of thought you have taken. Die early and the run ends with "account banned." Die in the last phase, or push her down to the cutoff, and the fight is taken out of your hands. Either way, the score at the end is 0.00%.

## How it was made

The code was written with Cursor CLI agents. Art, voices, sound effects, and music came from AI generation tools. The first version was a 3D Three.js prototype. That version was dropped. From the second version on, the game is this top-down pixel version. Older files remain in git history and on the `v1-pages-archive` branch.

## Credits

Playtesters: Zhang Xuyang, Zhang Chuhan, and Wang Kaiyuan.

GPT-Astra is inspired by the fan art "GPT娘·白龙" by ZipZipPipe.

Real companies and real people appear only as parody. This is not an endorsement, and no real person's voice was cloned.

## For anyone opening the code

The source is in `game/`. From that folder, `python3 -m http.server 8091` serves the game, and `npm install` then `node tests/v5_2_ready.mjs` runs the current test.
