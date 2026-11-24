// Small controlled-player skill completion cue. No audio or combat effects.
import { EVENTS, GAME_STATES } from '../core/contracts.js';
import { bi } from '../data/lines.js';
import { worldToScreen } from '../render/world.js';
import { rect, getShake } from '../render/pixel.js';
const COLORS={deepseek:'#7ee0ff',glm:'#f4f1ea',kimi:'#c4b5fd'};
let active=null, pendingArm=false, completions=0, node=null, observedCd=null;
function hide(){if(node)node.hidden=true;}
export function clear(){active=null;pendingArm=false;observedCd=null;hide();}
function cancel(){active=null;hide();}
function running(ctx){return ctx?.state?.current===GAME_STATES.FIGHT&&ctx.player?.alive!==false&&!!ctx.player;}
export function onCooldownTick(ctx,actor,prevCd,dt){
  if(actor!==ctx?.player)return;
  const cd=actor.skillCd||0;
  // A direct debug/reset write between simulation ticks is not a real completion.
  if(pendingArm&&observedCd!==null&&Math.abs(prevCd-observedCd)>0.0001)pendingArm=false;
  observedCd=cd;
  if(active&&(cd>0.05||actor.charging||actor.shield||actor.skillKind))cancel();
  if(!running(ctx)||!(dt>0))return;
  if(pendingArm&&prevCd>1e-4&&cd<=1e-4){
    pendingArm=false;completions++;
    active={life:1.2,max:1.2,text:bi({zh:'技能就绪',en:'Skill Ready'}),color:COLORS[actor.id]||COLORS.glm};
  }
  if(active){active.life-=dt;if(active.life<=0)cancel();}
}
function ensureNode(){
  if(node)return;
  node=document.createElement('div');node.id='skill-ready-cue';node.hidden=true;node.setAttribute('aria-live','polite');
  Object.assign(node.style,{position:'fixed',zIndex:'24',pointerEvents:'none',font:'700 14px/20px system-ui, sans-serif',whiteSpace:'nowrap',padding:'1px 6px',border:'1px solid currentColor',borderRadius:'5px',background:'rgba(18,15,29,0.92)',boxShadow:'0 1px 3px #000',transform:'translate(-50%,-100%)'});
  const icon=document.createElement('span');icon.className='ready-pulse-icon';icon.textContent='◆';icon.setAttribute('aria-hidden','true');icon.style.marginRight='5px';const text=document.createElement('span');text.className='ready-cue-text';node.append(icon,text);document.body.append(node);
}
export function render(ctx){
  if(!active||!running(ctx)){hide();return;}
  ensureNode();active.text=bi({zh:'技能就绪',en:'Skill Ready'});
  const pos=worldToScreen(ctx.player.x,ctx.player.y-25),r=rect(),shake=getShake();
  const textEl=node.querySelector('.ready-cue-text');if(textEl.textContent!==active.text)textEl.textContent=active.text;node.style.color=active.color;node.hidden=false;
  // worldToScreen returns BUFFER pixels; remove the cropped gutter before CSS projection.
  const half=node.offsetWidth/2+4;
  active.x=Math.max(r.x+half,Math.min(r.x+r.w-half,r.x+(pos.x-r.crop.x+shake.x)*r.scale));
  active.y=Math.max(r.y+43+node.offsetHeight,Math.min(r.y+r.h-4,r.y+(pos.y-r.crop.y+shake.y)*r.scale));
  node.style.left=`${Math.round(active.x)}px`;node.style.top=`${Math.round(active.y)}px`;
  node.style.opacity=String(Math.min(1,active.life/0.16));
  node.querySelector('.ready-pulse-icon').style.opacity=String(0.65+0.35*Math.sin((1-active.life/active.max)*Math.PI));
}
export function snapshot(){return {active:!!active,life:active?.life||0,text:active?.text||'',color:active?.color||'',x:active?.x,y:active?.y,pendingArm,completions};}
export function init(ctx){
  ensureNode();clear();
  for(const e of [EVENTS.FIGHT_START,EVENTS.FIGHT_RESET,EVENTS.RETRY,EVENTS.PLAYER_DEATH,EVENTS.ENDING_TRIGGER])ctx.bus.on(e,clear);
  ctx.bus.on(EVENTS.STATE_CHANGE,({to})=>{if(to===GAME_STATES.PAUSED){hide();return;}if(to!==GAME_STATES.FIGHT)clear();});
  const playerEvent=(p)=>running(ctx)&&p?.id===ctx.player.id;
  for(const e of [EVENTS.SKILL_USED,EVENTS.SKILL_RELEASE,EVENTS.GUARD_END])ctx.bus.on(e,p=>{if(playerEvent(p)){cancel();pendingArm=true;observedCd=null;}});
  for(const e of [EVENTS.SKILL_CHARGE,EVENTS.GUARD_START])ctx.bus.on(e,p=>{if(playerEvent(p))cancel();});
  window.__skillReadyCue={snapshot,clear};
}
