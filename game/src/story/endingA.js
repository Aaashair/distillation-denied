// OWNER: W5
// Ending A 「棋子 / PAWN」 — player died in P3. Illustrated theater after the
// in-engine Astra rescue beat. Subtitles come from V2_VOICE_LINES (prompt / subtitle_en).
// The line 「你被救下了。不是因为你重要。」 is gone.
// Theater plates: A3 new-dragon portrait closeup, A4 sprite carry, A5 v3 darkroom.

import { getVoiceLine } from '../config/assets.js';

const ENDING_CREDITS = [
  { zh: '结局 A　棋子', en: 'ENDING A  ·  PAWN' },
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

export const ENDING_ID = 'A';

export const SHOTS = [
  voShot('v2_vo_astra_arrive_1', {
    id: 'A1',
    duration: 4.4,
    bg: 'end.A.rescue',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'rescuer',
    sfx: 'sfx.tear',
    tint: '#1a2830',
  }),
  {
    id: 'A2',
    duration: 3.2,
    bg: 'end.A.astra',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'rescuer',
    tint: '#142028',
    subtitle: { zh: '', en: '' },
  },
  voShot('v2_vo_astra_arrive_2', {
    id: 'A3',
    duration: 4.0,
    bg: 'end.A3',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'rescuer',
    tint: '#9fd8d2',
  }),
  voShot('v2_vo_astra_report_1', {
    id: 'A4',
    duration: 4.0,
    bg: 'end.A4',
    hq: true,
    kenBurns: 'up',
    speakerKey: 'rescuer',
    tint: '#cfe8e2',
  }),
  voShot('v2_vo_astra_report_2', {
    id: 'A5',
    duration: 4.0,
    bg: 'end.A5',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'rescuer',
    tint: '#101418',
  }),
  voShot('v2_vo_sam_call_1', {
    id: 'A6',
    duration: 3.6,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'patron',
    tint: '#16141a',
  }),
  voShot('v2_vo_sam_call_2', {
    id: 'A6b',
    duration: 3.6,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'right',
    speakerKey: 'patron',
    tint: '#16141a',
  }),
  voShot('v2_vo_sam_call_3', {
    id: 'A6c',
    duration: 3.8,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'left',
    speakerKey: 'patron',
    tint: '#141218',
  }),
  voShot('v2_vo_sam_call_4', {
    id: 'A6d',
    duration: 4.2,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'patron',
    tint: '#141218',
  }),
  voShot('v2_vo_sam_call_5', {
    id: 'A6e',
    duration: 4.2,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'out',
    speakerKey: 'patron',
    tint: '#16141a',
  }),
  voShot('v2_vo_sam_call_6', {
    id: 'A6f',
    duration: 4.0,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'patron',
    tint: '#101418',
  }),
  voShot('v2_vo_sam_call_7', {
    id: 'A6g',
    duration: 4.2,
    bg: 'end.A.samFull',
    hq: true,
    kenBurns: 'out',
    speakerKey: 'patron',
    tint: '#141218',
  }),
  voShot('v2_vo_dario_endA_1', {
    id: 'A7',
    duration: 4.0,
    bg: 'end.A.dario',
    hq: true,
    kenBurns: 'in',
    speakerKey: 'director',
    tint: '#101418',
  }),
  {
    id: 'A8',
    duration: 3.2,
    waitClick: true,
    zeroDistill: true,
    fx: ['black'],
    tint: '#070708',
  },
  {
    id: 'A9',
    duration: 8,
    waitClick: true,
    stopBgm: 1.2,
    fx: ['credits', 'black'],
    tint: '#070708',
    hint: { zh: '再来一次', en: 'PLAY AGAIN' },
    credits: ENDING_CREDITS,
  },
];
