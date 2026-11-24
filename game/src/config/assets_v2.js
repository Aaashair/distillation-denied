// OWNER: W5
// Stable game ids → V2_ASSETS keys. assets.js applies these OVER v1 so
// `px.*`, `pt.*`, `end.A*`/`end.B*`, `bgm.*`, `sfx.*`, and theater voices
// prefer pixel / 8-bit files when present, then fall back to v1 paths.
//
// getSprite / loadImage / getAsset live in assets.js (ARCHITECTURE: ids only).

/** Pixel sheets used by the sprite system. Prefer `_48` player sheets. */
export const V2_PIXEL = {
  'px.deepseek': 'v2_deepseek_sheet_48',
  'px.deepseek.walk': 'v2_deepseek_sheet_48',
  'px.deepseek.idle': 'v2_deepseek_idle',
  'px.deepseek.attack': 'v2_deepseek_attack',
  'px.deepseek.skill': 'v2_deepseek_skill',
  'px.deepseek.hurt': 'v2_deepseek_hurt',
  'px.kimi': 'v2_kimi_sheet_48',
  'px.kimi.walk': 'v2_kimi_sheet_48',
  'px.kimi.idle': 'v2_kimi_idle',
  'px.kimi.attack': 'v2_kimi_attack',
  'px.kimi.skill': 'v2_kimi_skill',
  'px.kimi.hurt': 'v2_kimi_hurt',
  'px.glm': 'v2_glm_sheet_48',
  'px.glm.walk': 'v2_glm_sheet_48',
  'px.glm.idle': 'v2_glm_idle',
  'px.glm.attack': 'v2_glm_attack',
  'px.glm.skill': 'v2_glm_skill',
  'px.glm.hurt': 'v2_glm_hurt',
  'px.boss.p1': 'v2_haiku_sheet',
  'px.boss.p1.idle': 'v2_haiku_idle',
  'px.boss.p1.attack': 'v2_haiku_attack',
  'px.boss.p1.cast': 'v2_haiku_cast',
  'px.boss.p1.windup': 'v2_haiku_cast',
  'px.boss.p1.hurt': 'v2_haiku_hurt',
  'px.boss.p2': 'v2_sonnet_sheet',
  'px.boss.p2.idle': 'v2_sonnet_idle',
  'px.boss.p2.attack': 'v2_sonnet_attack',
  'px.boss.p2.cast': 'v2_sonnet_cast',
  'px.boss.p2.windup': 'v2_sonnet_cast',
  'px.boss.p2.hurt': 'v2_sonnet_hurt',
  'px.boss.p3': 'v2_opus_sheet',
  'px.boss.p3.idle': 'v2_opus_idle',
  'px.boss.p3.attack': 'v2_opus_attack',
  'px.boss.p3.cast': 'v2_opus_cast',
  'px.boss.p3.windup': 'v2_opus_cast',
  'px.boss.p3.hurt': 'v2_opus_hurt',
  'px.astra': 'v2_astra_sheet',
  'px.astra.idle': 'v2_astra_idle',
  'px.astra.mature': 'v2_astra_mature_idle',
  'px.astra.mature.sheet': 'v2_astra_mature_sheet',
  'px.fable.hand': 'v2_fable_hand',
  'px.dario': 'v2_dario_holo',
  'px.dario.angry': 'v2_dario_holo_angry',
  'px.dario.flicker': 'v2_dario_holo_flicker_sheet',
};

/** Portraits / HUD busts. */
export const V2_PORTRAITS = {
  'pt.deepseek': 'v2_deepseek_idle',
  'pt.kimi': 'v2_kimi_idle',
  'pt.glm': 'v2_glm_idle',
  'pt.haiku': 'v2_haiku_idle',
  'pt.sonnet': 'v2_sonnet_idle',
  'pt.opus': 'v2_opus_idle',
  'pt.astra': 'v3_astra_portrait',
  'pt.dario': 'v2_dario_pixel',
  'pt.sam': 'v2_sam_pixel',
  'pt.dario.holo': 'v2_dario_holo',
  'pt.dario.angry': 'v2_dario_holo_angry',
};

/** Theater panels. v4 HQ CG overrides v3/v2 when files exist. */
export const V4_FILES = {
  'v4_fable_establish': 'assets/v4/fable_establishing.png',
  'v4_fable_takes_opus': 'assets/v4/fable_takes_opus.png',
  'v4_astra_establish': 'assets/v4/astra_establishing.png',
  'v4_astra_rescue': 'assets/v4/astra_rescue_cg.png',
  'v4_astra_carry': 'assets/v4/astra_carry_cg.png',
  'v4_darkroom': 'assets/v4/darkroom_cg.png',
  'v4_sam': 'assets/v4/sam_cg.png',
  'v4_phase2': 'assets/v4/phase2_cg.png',
  'v4_phase3': 'assets/v4/phase3_cg.png',
  'v4_ban': 'assets/v4/ban_cg.png',
};

/** v5 Ending A plates (registered via V3_FILES for PATHS; integrator may add V5_FILES loop). */
export const V5_FILES = {
  'v5_astra_rescue': 'assets/v5/astra_rescue_cg.png',
  'v5_astra_establish': 'assets/v5/astra_establishing.png',
  'v5_astra_arrive': 'assets/v5/astra_arrive.png',
  'v5_astra_carry': 'assets/v5/astra_carry_cg.png',
  'v5_astra_office': 'assets/v5/astra_office_cg.png',
  'v5_sam_full': 'assets/v5/sam_full_cg.png',
  'v5_dario_endA': 'assets/v5/dario_endA_cg.png',
};

/** Theater panels. v2 pixel storyboards override v1 webp `end.A*` / `end.B*`.
 *  Ending A → v5 coherent full-screen plates. Ending B / phase / ban stay on v4. */
export const V2_STORY = {
  'end.A1': 'v5_astra_rescue',
  'end.A2': 'v5_astra_establish',
  'end.A3': 'v5_astra_arrive',
  'end.A4': 'v5_astra_carry',
  'end.A5': 'v5_astra_office',
  'end.A6': 'v5_sam_full',
  'end.A.sam': 'v5_sam_full',
  'end.A.samFull': 'v5_sam_full',
  'end.A.dario': 'v5_dario_endA',
  'end.A.astra': 'v5_astra_establish',
  'end.A.rescue': 'v5_astra_rescue',
  'end.B1': 'v4_fable_establish',
  'end.B2': 'v4_fable_takes_opus',
  'end.phase.p2': 'v4_phase2',
  'end.phase.p3': 'v4_phase3',
  'end.ban': 'v4_ban',
  'end.B3': 'v2_story_endB_3_phonecall_px',
  'end.B4': 'v2_story_endB_3_phonecall_px',
  'end.B6': 'v2_story_endB_4_dossier_px',
  'end.B.dario': 'v2_story_dario_cutscene_px',
  'end.B.dossier': 'v2_story_endB_4_dossier_px',
  'ill.astra': 'v3_astra_portrait',
  'ill.sam': 'v5_sam_full',
  'ill.dario': 'v2_dario_cutscene',
};

/** bgm8_* first; chip_* is the alt bed if an 8-bit file is missing. */
export const V2_BGM = {
  'bgm.title': 'v2_bgm8_title_0',
  'bgm.p1': 'v2_bgm8_boss_0',
  'bgm.p2': 'v2_bgm8_boss_1',
  'bgm.p3': 'v2_bgm8_boss_final_0',
  'bgm.endA': 'v2_bgm8_ending_0',
  'bgm.endB': 'v2_bgm8_ending_0',
};

export const V2_BGM_ALT = {
  'bgm.title': 'v2_chip_title',
  'bgm.p1': 'v2_chip_p1',
  'bgm.p3': 'v2_chip_p3',
};

export const V2_SFX = {
  'sfx.slash': 'v2_sfx8_slash',
  'sfx.hitPlayer': 'v2_sfx8_hit_player',
  'sfx.hitBoss': 'v2_sfx8_hit_enemy',
  'sfx.heavy': 'v2_sfx8_boss_hit_heavy',
  'sfx.roll': 'v2_sfx8_dash',
  'sfx.guard': 'v2_sfx8_shield_block',
  'sfx.perfect': 'v2_sfx8_perfect_parry',
  'sfx.star': 'v2_sfx8_star_shot',
  'sfx.charge': 'v2_sfx8_beam_charge',
  'sfx.beam': 'v2_sfx8_beam_fire',
  'sfx.hammer': 'v2_sfx8_hammer_smash',
  'sfx.hurt': 'v2_sfx8_hit_player',
  'sfx.death': 'v2_sfx8_ban_hammer',
  'sfx.telegraph': 'v2_sfx8_telegraph',
  'sfx.heal': 'v2_sfx8_heal_gpu',
  'sfx.flask': 'v2_sfx8_heal_gpu',
  'sfx.b200': 'v2_sfx8_heal_b200',
  'sfx.ui': 'v2_sfx8_ui_select',
  'sfx.phase': 'v2_sfx8_phase_shift',
  'sfx.smite': 'v2_sfx8_judgment_slam',
  'sfx.stamp': 'v2_sfx8_ban_hammer',
};

/** v1 vo.* ids → v2_vo_* so Dario / theater keep their old keys. */
export const V2_VOICE_ALIAS = {
  'vo.dario_fight_start_1': 'v2_vo_dario_start_1',
  'vo.dario_fight_start_2': 'v2_vo_dario_start_2',
  'vo.dario_phase2_1': 'v2_vo_dario_p2_1',
  'vo.dario_phase2_2': 'v2_vo_dario_p2_2',
  'vo.dario_phase3_1': 'v2_vo_dario_p3_1',
  'vo.dario_phase3_2': 'v2_vo_dario_p3_2',
  'vo.dario_flask_spam_1': 'v2_vo_dario_5090_1',
  'vo.dario_flask_spam_2': 'v2_vo_dario_h200_1',
  'vo.dario_b200_1': 'v2_vo_dario_b200_1',
  'vo.dario_perfect_guard_1': 'v2_vo_dario_pdodge_1',
  'vo.dario_player_death_1': 'v2_vo_dario_death_1',
  'vo.dario_player_death_2': 'v2_vo_dario_death_2',
  'vo.dario_ally_down_1': 'v2_vo_dario_allydown_1',
  'vo.dario_boss_50_1': 'v2_vo_dario_boss50_1',
  'vo.dario_judgment_1': 'v2_vo_dario_judgment_1',
  'vo.dario_judgment_2': 'v2_vo_dario_judgment_2',
  'vo.dario_ending_b_trigger': 'v2_vo_dario_endB_trigger',
  'vo.endA_astra_1': 'v2_vo_astra_report_1',
  'vo.endA_astra_2': 'v2_vo_astra_report_2',
  'vo.endA_patron_1': 'v2_vo_sam_call_2',
  'vo.endA_patron_2': 'v2_vo_sam_call_3',
  'vo.endB_dario_1': 'v2_vo_dario_endB_call_1',
  'vo.endB_dario_2': 'v2_vo_dario_endB_call_2',
  'vo.endB_dario_3': 'v2_vo_dario_endB_call_3',
  'vo.endB_dario_4': 'v2_vo_dario_endB_call_4',
  'vo.endB_dario_5': 'v2_vo_dario_endB_call_4',
  'vo.ally_deepseek_1': 'v2_vo_deepseek_bark',
  'vo.ally_kimi_1': 'v2_vo_kimi_bark',
  'vo.ally_glm_1': 'v2_vo_glm_bark',
};

export const V2_MISC = {
  'spr.dario.holo': 'v2_dario_holo',
  'spr.dario.angry': 'v2_dario_holo_angry',
  'spr.dario.smug': 'v2_dario_holo_cyan',
  'spr.astra.holo': 'v2_astra_portrait',
  'spr.astra.attack': 'v2_astra_mature_idle',
  'spr.fable.hand': 'v2_fable_hand',
  'spr.fable.handSlam': 'v2_fable_hand',
  'spr.patron.silhouette': 'v2_sam_pixel',
  'spr.deepseek.portrait': 'v2_deepseek_idle',
  'spr.deepseek.front': 'v2_deepseek_idle',
  'spr.kimi.portrait': 'v2_kimi_idle',
  'spr.kimi.front': 'v2_kimi_idle',
  'spr.glm.portrait': 'v2_glm_idle',
  'spr.glm.front': 'v2_glm_idle',
  'ui.stamp_denied': 'v2_vfx_ban_stamp',
  'ui.stamp_banned': 'v2_vfx_ban_stamp',
};

/** Composed v3 story/portrait files (Pillow, no model calls). */
export const V3_FILES = {
  'v3_astra_arrive': 'assets/v3/astra_arrive.png',
  'v3_astra_portrait': 'assets/v3/astra_portrait_closeup.png',
  'v3_astra_rescue': 'assets/v3/astra_rescue.png',
  'v3_astra_carry': 'assets/v3/astra_carry.png',
  'v3_darkroom': 'assets/v3/darkroom.png',
  'v3_sam_silhouette': 'assets/v3/sam_silhouette.png',
  ...V5_FILES,
};

/** Old angel/android story ids → v3 dragon plates (no transitional old frame). */
export const V3_FORCE_STORY = {
  'v2_story_endA_2_astra_rescue_px': 'v3_astra_rescue',
  'v2_story_endA_3_retrieved_px': 'v3_astra_carry',
  'v2_story_endA_4_darkroom_px': 'v3_darkroom',
  'v2_story_sam_cutscene_px': 'v3_sam_silhouette',
  'v2_astra_portrait': 'v3_astra_portrait',
  'm.endA_2_astra_rescue': 'v3_astra_rescue',
  'm.endA_3_retrieved': 'v3_astra_carry',
  'm.endA_4_darkroom': 'v3_darkroom',
  'm.astra_design': 'v3_astra_portrait',
  'm.astra_attack': 'v3_astra_rescue',
};

export const V2_ALIAS_TABLES = [
  V2_PIXEL, V2_PORTRAITS, V2_STORY, V2_BGM, V2_SFX, V2_VOICE_ALIAS, V2_MISC,
];
