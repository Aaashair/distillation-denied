// OWNER: W5
// Ending B 「断供 / CUT OFF」 — boss locked at 25%. Theater after the in-engine
// glass / Fable-hand beat. Voices + subtitles from V2_VOICE_LINES.

import { getVoiceLine } from '../config/assets.js';

const ENDING_CREDITS = [
  { zh: '结局 B　断供', en: 'ENDING B  ·  CUT OFF' },
  { zh: '548 Market Street', en: '548 Market Street' },
  { zh: 'Grok Bot 与 Cursor CLI 工作流', en: 'Grok Bot + Cursor CLI agents' },
  { zh: 'OpenLux 图像 / 8-bit 音频 / 配音', en: 'OpenLux image, 8-bit audio, and voice models' },
  { zh: '像素精灵 gpt-image · 音效 chiptune / sfx8', en: 'Pixel sprites: gpt-image · SFX: chiptune / sfx8' },
  { zh: '人工导演：本课学生', en: 'Human direction: the student' },
  { zh: '思维链获取量 0.00%', en: 'CHAIN-OF-THOUGHT ACQUIRED 0.00%' },
];

function voShot(id, extra) {
  const line = getVoiceLine(id) || {};
  return {
    vo: id,
    subtitle: { zh: line.zh || '', en: line.en || '' },
    ...extra,
  };
}

export const ENDING_ID = 'B';

export const SHOTS = [
  voShot('v2_vo_fable_1', {
    id: 'B1',
    duration: 4.6,
    bg: 'end.B1',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'god',
    tint: '#1c1038',
  }),
  voShot('v2_vo_fable_2', {
    id: 'B2',
    duration: 4.8,
    bg: 'end.B2',
    hq: true,
    kenBurns: 'push',
    speakerKey: 'god',
    sfx: 'sfx.heavy',
    tint: '#12081c',
  }),
  voShot('v2_vo_opus_taken', {
    id: 'B2b',
    duration: 3.6,
    bg: 'end.B2',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'god',
    tint: '#0e0614',
  }),
  {
    id: 'B3',
    duration: 3.6,
    waitClick: true,
    zeroDistill: true,
    sfx: 'sfx.stamp',
    stamp: 'ui.stamp_denied',
    stampText: 'DISTILLATION DENIED',
    fx: ['stamp', 'black', 'flash'],
    tint: '#2a0808',
  },
  voShot('v2_vo_dario_endB_call_1', {
    id: 'B4',
    duration: 4.4,
    bg: 'end.B4',
    kenBurns: 'in',
    speakerKey: 'director',
    sfx: { id: 'sfx.rain', loop: true, fadeOut: 0, maxDuration: 0, volume: 0.55 },
    fx: ['noir', 'rain'],
    tint: '#1c1e22',
  }),
  voShot('v2_vo_dario_endB_call_2', {
    id: 'B5a',
    duration: 4.2,
    bg: 'end.B.dario',
    kenBurns: 'right',
    speakerKey: 'director',
    sfx: { id: 'sfx.rain', loop: true, fadeOut: 0, maxDuration: 0, volume: 0.45 },
    fx: ['noir', 'rain'],
    tint: '#141618',
  }),
  voShot('v2_vo_dario_endB_call_3', {
    id: 'B5b',
    duration: 4.0,
    bg: 'end.B4',
    kenBurns: 'left',
    speakerKey: 'director',
    sfx: [
      { id: 'sfx.rain', loop: true, fadeOut: 0, maxDuration: 0, volume: 0.4 },
      { id: 'sfx.busy', maxDuration: 0, fadeOut: 0 },
    ],
    fx: ['noir', 'rain'],
    tint: '#141618',
  }),
  voShot('v2_vo_dario_endB_call_4', {
    id: 'B6',
    duration: 5.4,
    bg: 'end.B6',
    kenBurns: 'push',
    speakerKey: 'director',
    sfx: [
      { id: 'sfx.rain', loop: true, fadeOut: 0, maxDuration: 0, volume: 0.28 },
      { id: 'sfx.fanStop', maxDuration: 0, fadeOut: 0.4 },
    ],
    fx: ['noir'],
    tint: '#101210',
  }),
  {
    id: 'B7',
    duration: 1.4,
    stopBgm: 0.9,
    fx: ['black'],
    tint: '#000000',
    subtitle: { zh: '', en: '' },
  },
  {
    id: 'B8',
    duration: 8,
    waitClick: true,
    stopBgm: 0.4,
    fx: ['credits', 'black'],
    tint: '#070708',
    hint: { zh: '再来一次', en: 'PLAY AGAIN' },
    credits: ENDING_CREDITS,
  },
];
