/**
 * PlaygroundOverlay.jsx
 * Playground tabs: Gravity Drops · Cursor Web · Spit card game
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
  { id: 'gravity',       label: 'Gravity Drops' },
  { id: 'constellation', label: 'Cursor Web'    },
  { id: 'spit',          label: 'Spit'          },
];

/* ══════════════════════════════════════════════════════════════
   1. GRAVITY DROPS
══════════════════════════════════════════════════════════════ */
const BALL_COLORS = [
  {base:'#F97316',hi:'#FED7AA'},{base:'#2D6A9F',hi:'#BAE6FD'},
  {base:'#10B981',hi:'#A7F3D0'},{base:'#8B5CF6',hi:'#DDD6FE'},
  {base:'#EC4899',hi:'#FBCFE8'},{base:'#F59E0B',hi:'#FDE68A'},
  {base:'#EF4444',hi:'#FCA5A5'},{base:'#06B6D4',hi:'#A5F3FC'},
];
function GravityDrops() {
  const cvs=useRef(null),balls=useRef([]),raf=useRef(null),mouse=useRef({x:0,y:0,down:false,downTime:0,downX:0,downY:0});
  const spawn=useCallback((x,y,vx=0,vy=0)=>{
    const c=BALL_COLORS[Math.floor(Math.random()*BALL_COLORS.length)];
    balls.current.push({x,y,vx:vx+(Math.random()-.5)*2,vy:vy+(Math.random()-.5)*2-2,r:Math.random()*18+10,base:c.base,hi:c.hi,e:.55+Math.random()*.25});
    if(balls.current.length>50)balls.current.shift();
  },[]);
  useEffect(()=>{
    const canvas=cvs.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;};
    resize();window.addEventListener('resize',resize);
    const tick=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const bs=balls.current,m=mouse.current;
      if(m.down){
        const p=Math.sin(Date.now()*.009)*.5+.5;
        ctx.beginPath();ctx.arc(m.x,m.y,16+p*10,0,Math.PI*2);ctx.strokeStyle=`rgba(249,115,22,${.15+p*.15})`;ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(m.x,m.y,4,0,Math.PI*2);ctx.fillStyle='rgba(249,115,22,.6)';ctx.fill();
        bs.forEach(b=>{const dx=m.x-b.x,dy=m.y-b.y,d=Math.hypot(dx,dy);if(d>5&&d<300){const f=.85/(d*.05+1);b.vx+=(dx/d)*f;b.vy+=(dy/d)*f;}});
      }
      for(let i=0;i<bs.length;i++)for(let j=i+1;j<bs.length;j++){
        const a=bs[i],b=bs[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),md=a.r+b.r;
        if(d<md&&d>0){const nx=dx/d,ny=dy/d,ov=(md-d)/2;a.x-=nx*ov;a.y-=ny*ov;b.x+=nx*ov;b.y+=ny*ov;
          const dot=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(dot>0){const e=(a.e+b.e)/2;a.vx-=dot*nx*e;a.vy-=dot*ny*e;b.vx+=dot*nx*e;b.vy+=dot*ny*e;}}
      }
      bs.forEach(b=>{
        b.vy+=.42;b.x+=b.vx;b.y+=b.vy;
        if(b.x-b.r<0){b.x=b.r;b.vx=Math.abs(b.vx)*b.e;}
        if(b.x+b.r>canvas.width){b.x=canvas.width-b.r;b.vx=-Math.abs(b.vx)*b.e;}
        if(b.y+b.r>canvas.height){b.y=canvas.height-b.r;b.vy=-Math.abs(b.vy)*b.e;b.vx*=.97;}
        const g=ctx.createRadialGradient(b.x-b.r*.32,b.y-b.r*.36,0,b.x,b.y,b.r);
        g.addColorStop(0,b.hi);g.addColorStop(1,b.base);
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
        ctx.beginPath();ctx.arc(b.x-b.r*.28,b.y-b.r*.3,b.r*.26,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.3)';ctx.fill();
      });
      raf.current=requestAnimationFrame(tick);
    };tick();
    const gp=e=>{const r=canvas.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top];};
    const mv=e=>{const[x,y]=gp(e);mouse.current.x=x;mouse.current.y=y;};
    const dn=e=>{const[x,y]=gp(e);mouse.current={...mouse.current,down:true,downTime:Date.now(),downX:x,downY:y,x,y};};
    const up=e=>{const[x,y]=gp(e),dt=Date.now()-mouse.current.downTime;
      if(dt<220)spawn(x,y);else{const dx=x-mouse.current.downX,dy=y-mouse.current.downY;spawn(x,y,Math.max(-16,Math.min(16,(dx/Math.max(dt,40))*10)),Math.max(-16,Math.min(16,(dy/Math.max(dt,40))*10)));}
      mouse.current.down=false;};
    canvas.addEventListener('mousemove',mv);canvas.addEventListener('mousedown',dn);canvas.addEventListener('mouseup',up);
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener('resize',resize);canvas.removeEventListener('mousemove',mv);canvas.removeEventListener('mousedown',dn);canvas.removeEventListener('mouseup',up);};
  },[spawn]);
  return <div style={{width:'100%',height:'100%',position:'relative'}}><canvas ref={cvs} style={{width:'100%',height:'100%',display:'block',cursor:'crosshair'}}/><p style={HINT}>click to drop · drag to throw · hold to attract</p></div>;
}

/* ══════════════════════════════════════════════════════════════
   2. CURSOR CONSTELLATION
══════════════════════════════════════════════════════════════ */
function CursorConstellation() {
  const cvs=useRef(null),pts=useRef([]),raf=useRef(null),last=useRef({x:0,y:0});
  useEffect(()=>{
    const canvas=cvs.current;if(!canvas)return;
    const ctx=canvas.getContext('2d');
    const resize=()=>{canvas.width=canvas.offsetWidth;canvas.height=canvas.offsetHeight;};
    resize();window.addEventListener('resize',resize);
    const add=(x,y,spd=0,burst=false)=>{
      const r=Math.round(45+spd*204),g=Math.round(106+spd*9),b=Math.round(159-spd*137);
      pts.current.push({x,y,age:0,life:burst?60:110,color:`${r},${g},${b}`,r:burst?Math.random()*2+1:2.5});
      if(pts.current.length>240)pts.current.shift();
    };
    const mv=e=>{const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;add(x,y,Math.min(Math.hypot(x-last.current.x,y-last.current.y)/28,1));last.current={x,y};};
    const cl=e=>{const rect=canvas.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2,d=Math.random()*36+8;add(x+Math.cos(a)*d,y+Math.sin(a)*d,Math.random(),true);}};
    canvas.addEventListener('mousemove',mv);canvas.addEventListener('click',cl);
    const tick=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      pts.current.forEach(p=>p.age++);pts.current=pts.current.filter(p=>p.age<p.life);
      for(let i=0;i<pts.current.length;i++)for(let j=i+1;j<pts.current.length;j++){
        const a=pts.current[i],b=pts.current[j],d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<120){ctx.strokeStyle=`rgba(${a.color},${(1-d/120)*(1-a.age/a.life)*.38})`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
      }
      pts.current.forEach(p=>{const t=1-p.age/p.life;ctx.beginPath();ctx.arc(p.x,p.y,p.r*t,0,Math.PI*2);ctx.fillStyle=`rgba(${p.color},${t*.9})`;ctx.fill();});
      raf.current=requestAnimationFrame(tick);
    };tick();
    return()=>{cancelAnimationFrame(raf.current);canvas.removeEventListener('mousemove',mv);canvas.removeEventListener('click',cl);window.removeEventListener('resize',resize);};
  },[]);
  return <div style={{width:'100%',height:'100%',position:'relative'}}><canvas ref={cvs} style={{width:'100%',height:'100%',display:'block'}}/><p style={HINT}>move cursor · click to burst</p></div>;
}

/* ══════════════════════════════════════════════════════════════
   3. SPIT — proper rules, 5-pile pyramid, drag-to-play
══════════════════════════════════════════════════════════════ */

/* ── Card engine ── */
function _makeDeck() {
  let id=0;
  return ['♠','♥','♦','♣'].flatMap(suit=>Array.from({length:13},(_,i)=>({rank:i+1,suit,id:id++})));
}
function _shuffle(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}

// rank ±1 on center pile; ace wraps (A↔K, diff=12)
function _canCenter(card,pile){if(!pile.length)return false;const d=Math.abs(card.rank-pile[pile.length-1].rank);return d===1||d===12;}
// on tableau: empty pile accepts anything; occupied pile: ±1 rank on face-up top
function _canTableau(card,pile){
  if(!pile.length)return true;
  const top=pile[pile.length-1];
  if(!top.faceUp)return false;
  const d=Math.abs(card.rank-top.rank);
  return d===1||d===12;
}

function _buildSide(cards){
  // piles 0-4 get 1,2,3,4,5 cards; top card of each pile starts face-up
  const tableau=[];let idx=0;
  for(let sz=1;sz<=5;sz++){
    const pile=[];
    for(let j=0;j<sz;j++) pile.push({...cards[idx++],faceUp:j===sz-1});
    tableau.push(pile);
  }
  return{tableau,stock:cards.slice(idx)};// 15 in piles, 11 in stock
}

function _initGame(){
  const deck=_shuffle(_makeDeck());
  const p=_buildSide(deck.slice(0,26));
  const c=_buildSide(deck.slice(26));
  // CPU piles: flip all face-up so opponent can see them
  const cpuTab=c.tableau.map(pile=>pile.map(card=>({...card,faceUp:true})));
  return{player:p,cpu:{...c,tableau:cpuTab},center:[[],[]],phase:'idle',message:''};
}

/* ── CPU AI (tick called on a timer) ── */
function _cpuTick(state,speed){
  const cpu=state.cpu;
  // 1. Play face-up card to center pile
  for(let pi=0;pi<cpu.tableau.length;pi++){
    const pile=cpu.tableau[pi];
    if(!pile.length)continue;
    const top=pile[pile.length-1];
    if(!top.faceUp)continue;
    for(let ci=0;ci<2;ci++){
      if(_canCenter(top,state.center[ci])){
        const tab=cpu.tableau.map((p,i)=>{
          if(i!==pi)return p;
          const np=[...p];np.pop();
          if(np.length&&!np[np.length-1].faceUp)np[np.length-1]={...np[np.length-1],faceUp:true};
          return np;
        });
        const center=state.center.map((p,i)=>i===ci?[...p,top]:p);
        const done=tab.every(p=>p.length===0)&&cpu.stock.length===0;
        return{...state,cpu:{...cpu,tableau:tab},center,phase:done?'pick-pile-cpu':'playing',message:''};
      }
    }
  }
  // 2. (medium/hard) Rearrange tableau to uncover hidden cards or fill empty piles
  if(speed>=2){
    for(let from=0;from<cpu.tableau.length;from++){
      const fp=cpu.tableau[from];
      if(!fp.length)continue;
      const top=fp[fp.length-1];if(!top.faceUp)continue;
      // prefer moving if it reveals a hidden card or from a long pile
      const worthIt=fp.length>1&&!fp[fp.length-2].faceUp;
      if(!worthIt&&speed<3)continue;
      for(let to=0;to<cpu.tableau.length;to++){
        if(from===to)continue;
        if(_canTableau(top,cpu.tableau[to])){
          const tab=cpu.tableau.map((p,i)=>{
            if(i===from){const np=[...p];np.pop();if(np.length&&!np[np.length-1].faceUp)np[np.length-1]={...np[np.length-1],faceUp:true};return np;}
            if(i===to)return[...p,{...top,faceUp:true}];
            return p;
          });
          return{...state,cpu:{...cpu,tableau:tab}};
        }
      }
    }
  }
  return state;
}

/* ── Rebuild round after pile selection ──
   playerPileIdx = which center pile the PLAYER claims.
   CPU takes the other one. If either side ends up with 0 cards → true game over. */
function _rebuildRound(game, playerPileIdx) {
  const cpuPileIdx = 1 - playerPileIdx;
  const pCards = _shuffle([...game.center[playerPileIdx]]);
  const cCards = _shuffle([...game.center[cpuPileIdx]]);
  if (pCards.length === 0) return { ..._initGame(), phase:'won',  message:'You win the match!' };
  if (cCards.length === 0) return { ..._initGame(), phase:'lost', message:'CPU wins the match!' };
  const p = _buildSide(pCards);
  const c = _buildSide(cCards);
  const cpuTab = c.tableau.map(pile => pile.map(card => ({ ...card, faceUp:true })));
  return { player:p, cpu:{...c, tableau:cpuTab}, center:[[],[]], phase:'idle', message:'' };
}

/* ── Visual constants ── */
const CW=52,CH=72,STRIP=22; // card width/height, face-down strip height

/* ── PlayingCard ── */
const _RANK=n=>(['','A','2','3','4','5','6','7','8','9','10','J','Q','K'])[n]??String(n);
const _RED=s=>s==='♥'||s==='♦';

function PlayingCard({card,flipped=false,faded=false,style={}}){
  const red=!flipped&&card&&_RED(card.suit);
  return(
    <div style={{
      width:CW,height:CH,borderRadius:7,flexShrink:0,
      background:flipped?'linear-gradient(145deg,#0c1e33 0%,#183356 45%,#0c1e33 100%)':'#F9F8F3',
      border:`1px solid ${flipped?'rgba(80,140,200,0.22)':card?'rgba(0,0,0,0.13)':'rgba(255,255,255,0.09)'}`,
      boxShadow:card?'0 3px 10px rgba(0,0,0,0.50)':'none',
      opacity:faded?.35:1,
      display:'flex',flexDirection:'column',justifyContent:'space-between',padding:'4px 5px',
      overflow:'hidden',position:'relative',userSelect:'none',
      ...style,
    }}>
      {flipped&&<div style={{position:'absolute',inset:3,borderRadius:4,border:'1px solid rgba(80,140,200,0.16)',backgroundImage:'repeating-linear-gradient(45deg,rgba(80,140,200,0.07) 0,rgba(80,140,200,0.07) 1px,transparent 1px,transparent 9px)'}}/>}
      {!flipped&&card&&<>
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:10,fontWeight:700,color:red?'#B83030':'#1a1a1a',lineHeight:1.15}}>
          {_RANK(card.rank)}<br/><span style={{fontSize:9}}>{card.suit}</span>
        </div>
        <div style={{textAlign:'center',fontFamily:'"Geist Mono",monospace',fontSize:18,color:red?'#B83030':'#1a1a1a',opacity:.80,lineHeight:1}}>{card.suit}</div>
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:10,fontWeight:700,color:red?'#B83030':'#1a1a1a',lineHeight:1.15,transform:'rotate(180deg)',alignSelf:'flex-end'}}>
          {_RANK(card.rank)}<br/><span style={{fontSize:9}}>{card.suit}</span>
        </div>
      </>}
    </div>
  );
}

/* ── TableauPile — renders one column of stacked cards ── */
function TableauPile({pile,pileIdx,owner,canReceive,draggingId,onGrab,onFlip,onDropClick}){
  const pileH=pile.length===0?CH:(pile.length-1)*STRIP+CH;
  const dropId=`${owner}-${pileIdx}`;
  return(
    <div
      data-drop={dropId}
      onClick={()=>canReceive&&onDropClick(dropId)}
      style={{position:'relative',width:CW,height:pileH,minHeight:CH,flexShrink:0,cursor:canReceive?'pointer':'default'}}
    >
      {/* Empty slot */}
      {pile.length===0&&(
        <div style={{width:CW,height:CH,borderRadius:7,border:`1.5px dashed rgba(255,255,255,${canReceive?.40:.10})`,background:canReceive?'rgba(249,115,22,0.09)':'transparent',transition:'all .12s'}}/>
      )}
      {pile.map((cardObj,i)=>{
        const isTop=i===pile.length-1;
        const isGrabable=isTop&&cardObj.faceUp&&owner==='player';
        const isFlippable=isTop&&!cardObj.faceUp&&owner==='player';
        const isDragged=draggingId&&draggingId===cardObj.id;
        return(
          <div key={cardObj.id} style={{position:'absolute',top:i*STRIP,zIndex:i+1,width:CW,height:isTop?CH:STRIP,overflow:isTop?'visible':'hidden'}}>
            {cardObj.faceUp?(
              <div
                onMouseDown={isGrabable?(e)=>{e.preventDefault();e.stopPropagation();onGrab(e,cardObj,pileIdx);}:undefined}
                style={{cursor:isGrabable?'grab':'default',opacity:isDragged?.20:1,transition:'opacity .1s'}}
              >
                <PlayingCard card={cardObj}/>
              </div>
            ):(
              <div
                onClick={isFlippable?(e)=>{e.stopPropagation();onFlip(pileIdx);}:undefined}
                title={isFlippable?'Click to flip':''}
                style={{cursor:isFlippable?'pointer':'default'}}
              >
                <PlayingCard flipped/>
              </div>
            )}
          </div>
        );
      })}
      {/* Drop-zone glow ring */}
      {canReceive&&pile.length>0&&(
        <div style={{position:'absolute',top:0,left:0,right:0,bottom:0,borderRadius:7,border:'2px solid rgba(249,115,22,0.70)',boxShadow:'0 0 14px rgba(249,115,22,0.22)',pointerEvents:'none',zIndex:30}}/>
      )}
    </div>
  );
}

/* ── Center spit pile ── */
function CenterPile({pile,dropId,canDrop,onDropClick}){
  const top=pile[pile.length-1]??null;
  const red=top&&_RED(top.suit);
  return(
    <div
      data-drop={dropId}
      onClick={()=>canDrop&&onDropClick(dropId)}
      style={{
        width:74,height:100,borderRadius:10,flexShrink:0,position:'relative',
        background:top?'#F9F8F3':'rgba(255,255,255,0.04)',
        border:canDrop?'2.5px solid rgba(249,115,22,0.80)':`1.5px solid ${top?'rgba(0,0,0,0.14)':'rgba(255,255,255,0.12)'}`,
        cursor:canDrop?'pointer':'default',
        boxShadow:canDrop?'0 0 26px rgba(249,115,22,0.28),0 6px 20px rgba(0,0,0,0.6)':'0 6px 18px rgba(0,0,0,0.5)',
        display:'flex',alignItems:'center',justifyContent:'center',
        transition:'border-color .12s,box-shadow .12s',
      }}
    >
      {pile.length>1&&<div style={{position:'absolute',inset:0,borderRadius:10,zIndex:-1,background:top?'#E0DDD5':'transparent',transform:'translate(2px,3px)'}}/>}
      {top?(
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'"Geist Mono",monospace',fontSize:28,fontWeight:700,color:red?'#B83030':'#1a1a1a',lineHeight:1}}>{_RANK(top.rank)}</div>
          <div style={{fontFamily:'"Geist Mono",monospace',fontSize:20,color:red?'#B83030':'#1a1a1a',lineHeight:1.2}}>{top.suit}</div>
        </div>
      ):(
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:10,color:'rgba(255,255,255,0.22)',letterSpacing:'0.10em'}}>SPIT</div>
      )}
      {pile.length>0&&<div style={{position:'absolute',bottom:5,right:7,fontFamily:'"Geist Mono",monospace',fontSize:9,color:top?'rgba(0,0,0,0.25)':'rgba(255,255,255,0.20)'}}>{pile.length}</div>}
    </div>
  );
}

/* ── Stock pile visual ── */
function StockPile({count,label}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,flexShrink:0}}>
      <div style={{position:'relative',width:CW,height:CH}}>
        {count>1&&<div style={{position:'absolute',top:2,left:2,width:CW,height:CH,borderRadius:7,background:'linear-gradient(145deg,#0a1e34,#162d4a)',border:'1px solid rgba(80,140,200,0.16)'}}/>}
        {count>0?<PlayingCard flipped/>:<div style={{width:CW,height:CH,borderRadius:7,border:'1.5px dashed rgba(255,255,255,0.09)'}}/>}
      </div>
      <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,color:'rgba(255,255,255,0.22)',letterSpacing:'0.06em',textAlign:'center'}}>{label} · {count}</div>
    </div>
  );
}

/* ══ Guide overlay — 5-step walkthrough ══ */
const GUIDE_STEPS=[
  {title:'The Setup',body:'Each player has 5 piles: pile 1 has 1 card, pile 2 has 2, up to pile 5 with 5. Only the top card of each pile is face-up. The rest of your cards are your stock.',demo:'setup'},
  {title:'Press SPIT to deal',body:'Hit SPIT to flip one card from each player\'s stock onto the two center piles. Both players can then play simultaneously — no turns!',demo:'spit'},
  {title:'Drag to play',body:'Drag any face-up card from your piles onto a center pile if its rank is one higher or lower. Ace wraps around (A↔K).',demo:'drag'},
  {title:'Rearrange your piles',body:'You can also drag a face-up card to another one of your piles to uncover the hidden cards underneath. Click a face-down top card to flip it.',demo:'flip'},
  {title:'Win condition',body:'Empty all your piles and stock first to win. When both players are stuck, press SPIT again to deal fresh cards to the center.',demo:'win'},
];
function GuideOverlay({onClose}){
  const[step,setStep]=useState(0);
  const{title,body,demo}=GUIDE_STEPS[step];
  const isLast=step===GUIDE_STEPS.length-1;
  const demoCards=[{rank:7,suit:'♥',id:0},{rank:8,suit:'♠',id:1},{rank:9,suit:'♦',id:2},{rank:6,suit:'♣',id:3}];
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:'absolute',inset:0,zIndex:50,background:'rgba(5,10,8,0.90)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <motion.div initial={{scale:.88,y:18}} animate={{scale:1,y:0}} exit={{scale:.88,y:18}} transition={{duration:.28,ease:[.22,1,.36,1]}}
        style={{width:'min(500px,92%)',background:'rgba(12,22,15,0.99)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:16,padding:'32px 36px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:180,height:180,background:'radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)',pointerEvents:'none'}}/>
        {/* Progress bar */}
        <div style={{display:'flex',gap:5,marginBottom:24}}>
          {GUIDE_STEPS.map((_,i)=><div key={i} style={{height:3,flex:1,borderRadius:2,background:i<=step?'#10B981':'rgba(255,255,255,0.10)',transition:'background .3s'}}/>)}
        </div>
        {/* Demo visual */}
        <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:10,marginBottom:24,minHeight:72}}>
          {demo==='setup'&&(
            <div style={{display:'flex',gap:6}}>
              {[1,2,3].map(sz=>(
                <div key={sz} style={{position:'relative',width:CW,height:(sz-1)*STRIP+CH}}>
                  {Array.from({length:sz},(_,j)=>(
                    <div key={j} style={{position:'absolute',top:j*STRIP,height:j===sz-1?CH:STRIP,overflow:j===sz-1?'visible':'hidden'}}>
                      {j===sz-1?<PlayingCard card={demoCards[sz-1]}/>:<PlayingCard flipped/>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {demo==='spit'&&(
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <StockPile count={5} label="stock"/>
              <div style={{fontSize:20,color:'rgba(255,255,255,0.3)'}}>→</div>
              <CenterPile pile={[{rank:7,suit:'♦',id:99}]} dropId="g-c" canDrop={false} onDropClick={()=>{}}/>
            </div>
          )}
          {demo==='drag'&&(
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <PlayingCard card={{rank:8,suit:'♠',id:1}} style={{boxShadow:'0 8px 24px rgba(0,0,0,0.7)',transform:'rotate(3deg)'}}/>
              <div style={{fontSize:20,color:'rgba(249,115,22,0.7)'}}>→</div>
              <CenterPile pile={[{rank:7,suit:'♦',id:99}]} dropId="g-c2" canDrop={true} onDropClick={()=>{}}/>
            </div>
          )}
          {demo==='flip'&&(
            <div style={{display:'flex',gap:10,alignItems:'flex-end'}}>
              <div style={{position:'relative',width:CW,height:2*STRIP+CH}}>
                <div style={{position:'absolute',top:0,height:STRIP,overflow:'hidden'}}><PlayingCard flipped/></div>
                <div style={{position:'absolute',top:STRIP,height:STRIP,overflow:'hidden'}}><PlayingCard flipped/></div>
                <div style={{position:'absolute',top:2*STRIP}}><PlayingCard card={demoCards[0]}/></div>
              </div>
              <div style={{fontSize:20,color:'rgba(255,255,255,0.25)'}}>→</div>
              <div style={{position:'relative',width:CW,height:STRIP+CH}}>
                <div style={{position:'absolute',top:0,height:STRIP,overflow:'hidden'}}><PlayingCard flipped/></div>
                <div style={{position:'absolute',top:STRIP,cursor:'pointer',border:'2px solid rgba(249,115,22,0.6)',borderRadius:7}}><PlayingCard flipped/></div>
              </div>
            </div>
          )}
          {demo==='win'&&(
            <div style={{display:'flex',gap:8}}>
              {[0,0,0,0,0].map((_,i)=><div key={i} style={{width:CW,height:CH,borderRadius:7,border:'1.5px dashed rgba(16,185,129,0.30)',background:'rgba(16,185,129,0.05)'}}/>)}
            </div>
          )}
        </div>
        {/* Text */}
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',color:'#10B981',marginBottom:8}}>Step {step+1} of {GUIDE_STEPS.length}</div>
        <h2 style={{fontFamily:'"Geist Sans",system-ui',fontSize:20,fontWeight:600,color:'#F9F8F3',margin:'0 0 10px',letterSpacing:'-0.02em'}}>{title}</h2>
        <p style={{fontFamily:'"Geist Sans",system-ui',fontSize:13,color:'rgba(255,255,255,0.50)',lineHeight:1.72,margin:0}}>{body}</p>
        {/* Controls */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:28}}>
          <button onClick={()=>setStep(s=>Math.max(0,s-1))} style={{padding:'7px 16px',borderRadius:7,border:'1px solid rgba(255,255,255,0.10)',background:'transparent',color:'rgba(255,255,255,0.35)',fontFamily:'"Geist Mono",monospace',fontSize:11,letterSpacing:'0.06em',cursor:'pointer',opacity:step===0?.3:1,pointerEvents:step===0?'none':'auto'}}>← Back</button>
          {isLast
            ?<button onClick={onClose} style={{padding:'8px 22px',borderRadius:7,border:'none',background:'#10B981',color:'#fff',fontFamily:'"Geist Mono",monospace',fontSize:11,fontWeight:600,letterSpacing:'0.08em',cursor:'pointer'}}>Play →</button>
            :<button onClick={()=>setStep(s=>s+1)} style={{padding:'8px 22px',borderRadius:7,border:'none',background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.70)',fontFamily:'"Geist Mono",monospace',fontSize:11,letterSpacing:'0.08em',cursor:'pointer'}}>Next →</button>
          }
        </div>
        <button onClick={onClose} style={{position:'absolute',top:14,right:14,width:26,height:26,borderRadius:'50%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.10)',color:'rgba(255,255,255,0.40)',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
      </motion.div>
    </motion.div>
  );
}

/* ══ Lobby ══ */
const CPU_LEVELS=[
  {id:'easy',  label:'Easy',  desc:'Slow & forgiving',    delay:[1600,900],speed:1},
  {id:'medium',label:'Medium',desc:'Steady reactions',    delay:[750,450], speed:2},
  {id:'hard',  label:'Hard',  desc:'Fast & ruthless',     delay:[260,140], speed:3},
];
function Lobby({onStartCPU,onStartFriend}){
  const[mode,setMode]=useState(null);
  const[diff,setDiff]=useState('medium');
  const[link,setLink]=useState('');
  const[copied,setCopied]=useState(false);
  const handleFriend=()=>{const id=Math.random().toString(36).slice(2,8).toUpperCase();setLink(`${window.location.href.split('#')[0]}#spit-${id}`);setMode('friend');};
  const copy=()=>{navigator.clipboard.writeText(link).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(
    <div style={{width:'100%',height:'100%',position:'relative',background:'radial-gradient(ellipse at 50% 60%,#0f2018 0%,#070f0b 55%,#050806 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28}}>
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,rgba(255,255,255,0.012) 0,rgba(255,255,255,0.012) 1px,transparent 1px,transparent 4px)',pointerEvents:'none'}}/>
      {/* Title */}
      <div style={{textAlign:'center'}}>
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.16em',color:'rgba(255,255,255,0.26)',textTransform:'uppercase',marginBottom:8}}>Playground · Card Table</div>
        <h1 style={{fontFamily:'"Geist Sans",system-ui',fontSize:34,fontWeight:700,color:'#F9F8F3',margin:0,letterSpacing:'-0.03em'}}>Spit</h1>
        <p style={{fontFamily:'"Geist Sans",system-ui',fontSize:12,color:'rgba(255,255,255,0.30)',margin:'7px 0 0'}}>also known as Speed — real-time card shedding</p>
      </div>
      {/* Fanned cards */}
      <div style={{display:'flex',pointerEvents:'none',marginTop:-10}}>
        {[{r:7,s:'♥'},{r:8,s:'♠'},{r:9,s:'♦'},{r:10,s:'♣'},{r:11,s:'♥'}].map((c,i)=>{
          const rank=c.r??i+7;
          return <div key={i} style={{transform:`rotate(${(i-2)*9}deg) translateY(${Math.abs(i-2)*-6}px)`,marginRight:-18,zIndex:i}}><PlayingCard card={{rank,suit:c.s,id:i}}/></div>;
        })}
      </div>
      {/* Mode selection */}
      <AnimatePresence mode="wait">
        {!mode&&(
          <motion.div key="pick" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} style={{display:'flex',gap:12}}>
            <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:.97}} onClick={()=>setMode('cpu')}
              style={{padding:'14px 26px',borderRadius:10,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.13)',color:'#F9F8F3',fontFamily:'"Geist Sans",system-ui',fontSize:14,fontWeight:500,cursor:'pointer',textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:5}}>🤖</div>vs CPU
            </motion.button>
            <motion.button whileHover={{scale:1.04,y:-2}} whileTap={{scale:.97}} onClick={handleFriend}
              style={{padding:'14px 26px',borderRadius:10,background:'rgba(16,185,129,0.09)',border:'1px solid rgba(16,185,129,0.26)',color:'#F9F8F3',fontFamily:'"Geist Sans",system-ui',fontSize:14,fontWeight:500,cursor:'pointer',textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:5}}>🔗</div>vs Friend
            </motion.button>
          </motion.div>
        )}
        {mode==='cpu'&&(
          <motion.div key="cpu" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
            <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.12em',color:'rgba(255,255,255,0.30)',textTransform:'uppercase'}}>Select difficulty</div>
            <div style={{display:'flex',gap:10}}>
              {CPU_LEVELS.map(lvl=>(
                <motion.button key={lvl.id} whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>setDiff(lvl.id)}
                  style={{padding:'11px 18px',borderRadius:9,cursor:'pointer',background:diff===lvl.id?'rgba(249,115,22,0.14)':'rgba(255,255,255,0.05)',border:`1px solid ${diff===lvl.id?'rgba(249,115,22,0.50)':'rgba(255,255,255,0.10)'}`,color:diff===lvl.id?'#F97316':'rgba(255,255,255,0.50)',fontFamily:'"Geist Sans",system-ui',textAlign:'left',transition:'all .15s'}}>
                  <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{lvl.label}</div>
                  <div style={{fontSize:11,opacity:.65}}>{lvl.desc}</div>
                </motion.button>
              ))}
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setMode(null)} style={LOBBY_BTN}>← Back</button>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>onStartCPU(CPU_LEVELS.find(l=>l.id===diff))} style={{padding:'9px 22px',borderRadius:8,border:'none',background:'#F97316',color:'#fff',fontFamily:'"Geist Mono",monospace',fontSize:11,fontWeight:600,letterSpacing:'0.08em',cursor:'pointer'}}>Deal →</motion.button>
            </div>
          </motion.div>
        )}
        {mode==='friend'&&(
          <motion.div key="friend" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,textAlign:'center'}}>
            <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.12em',color:'rgba(16,185,129,0.65)',textTransform:'uppercase'}}>Share this link</div>
            <div style={{display:'flex',borderRadius:9,overflow:'hidden',border:'1px solid rgba(255,255,255,0.12)'}}>
              <div style={{padding:'9px 12px',fontFamily:'"Geist Mono",monospace',fontSize:10,color:'rgba(255,255,255,0.40)',background:'rgba(255,255,255,0.04)',maxWidth:240,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{link}</div>
              <button onClick={copy} style={{padding:'9px 14px',border:'none',background:copied?'rgba(16,185,129,0.22)':'rgba(255,255,255,0.07)',color:copied?'#10B981':'rgba(255,255,255,0.60)',fontFamily:'"Geist Mono",monospace',fontSize:10,cursor:'pointer',transition:'all .2s',whiteSpace:'nowrap'}}>{copied?'✓ Copied':'Copy'}</button>
            </div>
            <p style={{fontFamily:'"Geist Sans",system-ui',fontSize:12,color:'rgba(255,255,255,0.28)',margin:0,maxWidth:300,lineHeight:1.65}}>Send to a friend. Open in another tab to connect and play real-time.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setMode(null)} style={LOBBY_BTN}>← Back</button>
              <motion.button whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>onStartFriend(link)} style={{padding:'9px 22px',borderRadius:8,border:'none',background:'#10B981',color:'#fff',fontFamily:'"Geist Mono",monospace',fontSize:11,fontWeight:600,letterSpacing:'0.08em',cursor:'pointer'}}>I'm Host →</motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const LOBBY_BTN={padding:'9px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.10)',background:'transparent',color:'rgba(255,255,255,0.32)',fontFamily:'"Geist Mono",monospace',fontSize:11,cursor:'pointer',letterSpacing:'0.06em'};

/* ══ GameTable — main board with pointer-drag ══ */
function GameTable({cpuLevel,mode,roomLink,onReturnLobby}){
  const[game,setGame]=useState(()=>_initGame());
  const[showGuide,setGuide]=useState(false);

  /* ── Drag state ── */
  const dragInfoRef=useRef(null);       // {card, srcPileIdx} — read in event handlers
  const[drag,setDrag]=useState(null);   // same shape, triggers re-render for ghost
  const[dragPos,setDragPos]=useState({x:0,y:0});
  const[hovered,setHovered]=useState(null); // data-drop id under cursor

  /* BroadcastChannel for friend mode */
  const chRef=useRef(null);
  useEffect(()=>{
    if(mode!=='host'&&mode!=='guest')return;
    const roomId=roomLink?.split('#')[1];if(!roomId)return;
    const ch=new BroadcastChannel(roomId);chRef.current=ch;
    if(mode==='guest')ch.postMessage({type:'guest-joined'});
    ch.onmessage=e=>{if(e.data.type==='game-state')setGame(e.data.state);};
    return()=>ch.close();
  },[mode,roomLink]);
  const broadcast=useCallback(state=>{chRef.current?.postMessage({type:'game-state',state});});

  /* CPU AI loop */
  useEffect(()=>{
    if(game.phase!=='playing'||mode!=='cpu')return;
    const lvl=cpuLevel??CPU_LEVELS[1];
    const[mx,mn]=lvl.delay;
    const id=setTimeout(()=>{setGame(prev=>prev.phase==='playing'?_cpuTick(prev,lvl.speed):prev);},mn+Math.random()*(mx-mn));
    return()=>clearTimeout(id);
  },[game,mode,cpuLevel]);

  /* CPU auto-picks pile when it finishes first */
  useEffect(()=>{
    if(game.phase!=='pick-pile-cpu'||mode!=='cpu')return;
    const c0=game.center[0].length,c1=game.center[1].length;
    // CPU takes the smaller pile; player gets the other one
    const cpuPick=c0<=c1?0:1;
    const playerGets=1-cpuPick;
    const id=setTimeout(()=>setGame(prev=>prev.phase==='pick-pile-cpu'?_rebuildRound(prev,playerGets):prev),1400);
    return()=>clearTimeout(id);
  },[game.phase,game.center,mode]);

  const pickPile=useCallback((pileIdx)=>{
    setGame(prev=>_rebuildRound(prev,pileIdx));
  },[]);

  /* ── Drag handlers ── */
  const onGrab=useCallback((e,card,pileIdx)=>{
    if(e.button!==0)return;
    const info={card,srcPileIdx:pileIdx};
    dragInfoRef.current=info;
    setDrag(info);
    setDragPos({x:e.clientX,y:e.clientY});
  },[]);

  const onFlip=useCallback((pileIdx)=>{
    setGame(prev=>({...prev,player:{...prev.player,tableau:prev.player.tableau.map((p,i)=>{
      if(i!==pileIdx)return p;
      const np=[...p];np[np.length-1]={...np[np.length-1],faceUp:true};return np;
    })}}));
  },[]);

  const executeDrop=useCallback((info,dropId)=>{
    if(!info||!dropId)return;
    const{card,srcPileIdx}=info;
    setGame(prev=>{
      const{player,center}=prev;
      // Remove card from source, auto-flip new top
      const removeCard=tab=>tab.map((p,i)=>{
        if(i!==srcPileIdx)return p;
        const np=[...p];np.pop();
        if(np.length&&!np[np.length-1].faceUp)np[np.length-1]={...np[np.length-1],faceUp:true};
        return np;
      });
      // Drop to center pile
      if(dropId==='center-0'||dropId==='center-1'){
        const ci=dropId==='center-0'?0:1;
        if(!_canCenter(card,center[ci]))return prev;
        const tab=removeCard(player.tableau);
        const ctr=center.map((p,i)=>i===ci?[...p,card]:p);
        const done=tab.every(p=>p.length===0)&&player.stock.length===0;
        const next={...prev,player:{...player,tableau:tab},center:ctr,phase:done?'pick-pile':'playing',message:''};
        broadcast(next);return next;
      }
      // Drop to player tableau pile
      if(dropId.startsWith('player-')){
        const toPi=parseInt(dropId.split('-')[1]);
        if(toPi===srcPileIdx)return prev;
        if(!_canTableau(card,player.tableau[toPi]))return prev;
        let tab=removeCard(player.tableau);
        tab=tab.map((p,i)=>i===toPi?[...p,{...card,faceUp:true}]:p);
        const next={...prev,player:{...player,tableau:tab}};
        broadcast(next);return next;
      }
      return prev;
    });
  },[broadcast]);

  // Pointer move — update ghost + check hovered zone (pointer-events:none on ghost means e.target is underneath)
  const onPointerMove=useCallback((e)=>{
    if(!dragInfoRef.current)return;
    setDragPos({x:e.clientX,y:e.clientY});
    const zoneId=e.target?.closest?.('[data-drop]')?.getAttribute?.('data-drop')??null;
    setHovered(zoneId);
  },[]);

  const onPointerUp=useCallback((e)=>{
    const info=dragInfoRef.current;
    if(!info)return;
    const zoneId=e.target?.closest?.('[data-drop]')?.getAttribute?.('data-drop')??null;
    if(zoneId)executeDrop(info,zoneId);
    dragInfoRef.current=null;
    setDrag(null);setHovered(null);
  },[executeDrop]);

  useEffect(()=>{
    if(!drag)return;
    window.addEventListener('pointermove',onPointerMove);
    window.addEventListener('pointerup',onPointerUp);
    return()=>{window.removeEventListener('pointermove',onPointerMove);window.removeEventListener('pointerup',onPointerUp);};
  },[drag,onPointerMove,onPointerUp]);

  /* Also handle click-to-drop for accessibility */
  const[awaitingDrop,setAwaitingDrop]=useState(null);// fallback click-select mode

  const handleDropClick=useCallback((dropId)=>{
    if(drag){executeDrop(drag,dropId);dragInfoRef.current=null;setDrag(null);setHovered(null);}
  },[drag,executeDrop]);

  /* SPIT / deal / new game */
  const spit=useCallback(()=>{
    if(game.phase==='won'||game.phase==='lost'){const g=_initGame();setGame(g);broadcast(g);return;}
    if(game.phase==='pick-pile'||game.phase==='pick-pile-cpu')return;
    setGame(prev=>{
      const ctr=prev.center.map(p=>[...p]);
      const pSt=[...prev.player.stock],cSt=[...prev.cpu.stock];
      if(pSt.length)ctr[0].push(pSt.shift());
      if(cSt.length)ctr[1].push(cSt.shift());
      const next={...prev,center:ctr,player:{...prev.player,stock:pSt},cpu:{...prev.cpu,stock:cSt},phase:'playing',message:''};
      broadcast(next);return next;
    });
  },[game.phase,broadcast]);

  const{player,cpu,center,phase,message}=game;
  const ended=phase==='won'||phase==='lost';
  const dragCard=drag?.card??null;
  const cpuLabel=mode==='cpu'?(cpuLevel?.label??'CPU'):'Friend';

  // Can receive: check validity for drop zones
  const zoneCanDrop=useCallback((zoneId)=>{
    if(!drag||hovered!==zoneId)return false;
    if(zoneId==='center-0')return _canCenter(drag.card,center[0]);
    if(zoneId==='center-1')return _canCenter(drag.card,center[1]);
    if(zoneId.startsWith('player-')){
      const pi=parseInt(zoneId.split('-')[1]);
      return pi!==drag.srcPileIdx&&_canTableau(drag.card,player.tableau[pi]);
    }
    return false;
  },[drag,hovered,center,player]);

  return(
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',position:'relative',background:'radial-gradient(ellipse at 50% 44%,#0d1e12 0%,#080d08 50%,#050806 100%)',cursor:drag?'grabbing':'default'}}>
      {/* Felt texture */}
      <div style={{position:'absolute',inset:0,backgroundImage:'repeating-linear-gradient(0deg,rgba(255,255,255,0.013) 0,rgba(255,255,255,0.013) 1px,transparent 1px,transparent 4px)',pointerEvents:'none'}}/>

      {/* Top bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 16px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.06)',zIndex:10,background:'rgba(0,0,0,0.18)'}}>
        <button onClick={onReturnLobby} style={TOP_BTN}>← Lobby</button>
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:10,letterSpacing:'0.14em',color:'rgba(255,255,255,0.26)',textTransform:'uppercase'}}>Spit · vs {cpuLabel}</div>
        <button onClick={()=>setGuide(true)} style={TOP_BTN}>Guide</button>
      </div>

      {/* Board */}
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'14px 20px',overflow:'hidden',position:'relative',gap:0}}>

        {/* ── CPU zone ── */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:'100%'}}>
          <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.14em',color:'rgba(255,255,255,0.20)',textTransform:'uppercase'}}>{cpuLabel}</div>
          <div style={{display:'flex',alignItems:'flex-start',gap:12,justifyContent:'center'}}>
            <StockPile count={cpu.stock.length} label="deck"/>
            <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              {cpu.tableau.map((pile,pi)=>(
                <TableauPile key={pi} pile={pile} pileIdx={pi} owner="cpu"
                  canReceive={false} draggingId={null}
                  onGrab={()=>{}} onFlip={()=>{}} onDropClick={()=>{}}/>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center piles + SPIT ── */}
        <div style={{display:'flex',alignItems:'center',gap:24,flexShrink:0}}>
          <CenterPile pile={center[0]} dropId="center-0" canDrop={zoneCanDrop('center-0')} onDropClick={handleDropClick}/>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
            <AnimatePresence mode="wait">
              {(message||phase==='idle')&&(
                <motion.div key={message||'idle'} initial={{opacity:0,y:3}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}}
                  style={{fontFamily:'"Geist Mono",monospace',fontSize:10,letterSpacing:'0.06em',color:phase==='won'?'#10B981':phase==='lost'?'#EF4444':'rgba(255,255,255,0.36)',background:'rgba(0,0,0,0.32)',padding:'5px 11px',borderRadius:6,border:`1px solid ${phase==='won'?'rgba(16,185,129,0.25)':phase==='lost'?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.07)'}`,whiteSpace:'nowrap'}}>
                  {phase==='idle'?'Press SPIT to deal':message}
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button onClick={spit} whileHover={{scale:1.06}} whileTap={{scale:.93}}
              style={{padding:'10px 22px',borderRadius:9,background:ended?'rgba(16,185,129,0.14)':'rgba(255,255,255,0.07)',border:`1.5px solid ${ended?'rgba(16,185,129,0.48)':'rgba(255,255,255,0.17)'}`,color:ended?'#10B981':'rgba(255,255,255,0.68)',fontFamily:'"Geist Mono",monospace',fontSize:12,fontWeight:700,letterSpacing:'0.16em',cursor:'pointer'}}>
              {ended?'AGAIN':'SPIT'}
            </motion.button>
          </div>
          <CenterPile pile={center[1]} dropId="center-1" canDrop={zoneCanDrop('center-1')} onDropClick={handleDropClick}/>
        </div>

        {/* ── Player zone ── */}
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:'100%'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:12,justifyContent:'center'}}>
            <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
              {player.tableau.map((pile,pi)=>(
                <TableauPile key={pi} pile={pile} pileIdx={pi} owner="player"
                  canReceive={zoneCanDrop(`player-${pi}`)}
                  draggingId={dragCard?.id}
                  onGrab={onGrab} onFlip={onFlip}
                  onDropClick={handleDropClick}/>
              ))}
            </div>
            <StockPile count={player.stock.length} label="deck"/>
          </div>
          <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.14em',color:'rgba(255,255,255,0.20)',textTransform:'uppercase'}}>You · drag cards to play</div>
        </div>
      </div>

      {/* Ghost card — follows cursor, pointer-events:none so events pass through */}
      {drag&&(
        <div style={{position:'fixed',left:dragPos.x-CW/2,top:dragPos.y-CH/2.5,pointerEvents:'none',zIndex:9999,transform:'rotate(3deg)',filter:'drop-shadow(0 10px 24px rgba(0,0,0,0.75))'}}>
          <PlayingCard card={drag.card}/>
        </div>
      )}

      {/* Guide */}
      <AnimatePresence>{showGuide&&<GuideOverlay onClose={()=>setGuide(false)}/>}</AnimatePresence>

      {/* Pick-pile overlay — shown when a player empties their board */}
      <AnimatePresence>
        {(phase==='pick-pile'||phase==='pick-pile-cpu')&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'absolute',inset:0,zIndex:40,background:'rgba(4,9,6,0.84)',backdropFilter:'blur(5px)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:22}}>
            {/* Heading */}
            <motion.div initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:.08}} style={{textAlign:'center'}}>
              <div style={{fontFamily:'"Geist Mono",monospace',fontSize:11,letterSpacing:'0.14em',color:'rgba(255,255,255,0.38)',textTransform:'uppercase',marginBottom:8}}>
                {phase==='pick-pile'?'You emptied your board!':'CPU emptied their board…'}
              </div>
              {phase==='pick-pile'&&(
                <div style={{fontFamily:'"Geist Sans",system-ui',fontSize:13,color:'rgba(255,255,255,0.26)',lineHeight:1.6}}>
                  Pick a center pile — you'll rebuild your deck from it.<br/>
                  <span style={{color:'rgba(16,185,129,0.70)'}}>Smaller pile = fewer cards to beat = advantage.</span>
                </div>
              )}
              {phase==='pick-pile-cpu'&&(
                <motion.div animate={{opacity:[.45,1,.45]}} transition={{duration:1.3,repeat:Infinity}}
                  style={{fontFamily:'"Geist Mono",monospace',fontSize:10,color:'rgba(255,255,255,0.38)',letterSpacing:'0.12em',textTransform:'uppercase',marginTop:4}}>
                  CPU is choosing…
                </motion.div>
              )}
            </motion.div>
            {/* The two piles */}
            <div style={{display:'flex',gap:32,alignItems:'flex-start'}}>
              {center.map((pile,pi)=>{
                const isSmaller=pile.length<=center[1-pi].length;
                const topCard=pile[pile.length-1]??null;
                const canPick=phase==='pick-pile';
                return(
                  <motion.div key={pi}
                    initial={{scale:.86,opacity:0}} animate={{scale:1,opacity:phase==='pick-pile-cpu'?.40:1}} transition={{delay:.14+pi*.10}}
                    whileHover={canPick?{scale:1.07,y:-5}:{}}
                    whileTap={canPick?{scale:.96}:{}}
                    onClick={canPick?()=>pickPile(pi):undefined}
                    style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,cursor:canPick?'pointer':'default'}}
                  >
                    {/* Pile card */}
                    <div style={{
                      width:90,height:120,borderRadius:12,position:'relative',flexShrink:0,
                      background:topCard?'#F9F8F3':'rgba(255,255,255,0.06)',
                      border:`2.5px solid ${canPick&&isSmaller?'rgba(16,185,129,0.80)':'rgba(255,255,255,0.16)'}`,
                      boxShadow:canPick&&isSmaller?'0 0 30px rgba(16,185,129,0.40),0 8px 24px rgba(0,0,0,0.65)':'0 8px 22px rgba(0,0,0,0.55)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      transition:'border-color .18s,box-shadow .18s',
                    }}>
                      {topCard&&(
                        <div style={{textAlign:'center'}}>
                          <div style={{fontFamily:'"Geist Mono",monospace',fontSize:32,fontWeight:700,color:_RED(topCard.suit)?'#B83030':'#1a1a1a',lineHeight:1}}>{_RANK(topCard.rank)}</div>
                          <div style={{fontFamily:'"Geist Mono",monospace',fontSize:22,color:_RED(topCard.suit)?'#B83030':'#1a1a1a',lineHeight:1.2}}>{topCard.suit}</div>
                        </div>
                      )}
                      <div style={{position:'absolute',bottom:6,right:8,fontFamily:'"Geist Mono",monospace',fontSize:10,color:topCard?'rgba(0,0,0,0.30)':'rgba(255,255,255,0.22)'}}>{pile.length}</div>
                    </div>
                    {/* Badge */}
                    {canPick&&isSmaller?(
                      <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.12em',color:'#10B981',textTransform:'uppercase',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.30)',borderRadius:5,padding:'3px 10px'}}>
                        ✓ Smaller · {pile.length} cards
                      </div>
                    ):(
                      <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.10em',color:'rgba(255,255,255,0.28)',textTransform:'uppercase'}}>
                        {pile.length} cards
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win / Loss */}
      <AnimatePresence>
        {ended&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:'absolute',inset:0,zIndex:40,background:'rgba(4,9,6,0.80)',backdropFilter:'blur(5px)',display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
            <motion.div initial={{scale:.78,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.78,opacity:0}} transition={{type:'spring',stiffness:260,damping:20}}
              style={{textAlign:'center',pointerEvents:'auto'}}>
              <div style={{fontSize:50,marginBottom:10}}>{phase==='won'?'🎉':'💀'}</div>
              <div style={{fontFamily:'"Geist Sans",system-ui',fontSize:28,fontWeight:700,color:phase==='won'?'#10B981':'#EF4444',letterSpacing:'-0.02em',marginBottom:12}}>{phase==='won'?'You Win!':'CPU Wins'}</div>
              <motion.button whileHover={{scale:1.05}} whileTap={{scale:.95}} onClick={spit}
                style={{padding:'10px 26px',borderRadius:9,border:'none',background:phase==='won'?'#10B981':'#EF4444',color:'#fff',fontFamily:'"Geist Mono",monospace',fontSize:12,fontWeight:600,letterSpacing:'0.10em',cursor:'pointer'}}>
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const TOP_BTN={padding:'5px 11px',borderRadius:6,border:'1px solid rgba(255,255,255,0.10)',background:'transparent',color:'rgba(255,255,255,0.35)',fontFamily:'"Geist Mono",monospace',fontSize:10,cursor:'pointer',letterSpacing:'0.06em'};

/* ══ SpitGame — screen router ══ */
function SpitGame(){
  const[screen,setScreen]=useState('lobby');
  const[cpuLevel,setCpuLevel]=useState(null);
  const[gameMode,setGameMode]=useState('cpu');
  const[roomLink,setRoomLink]=useState('');
  return(
    <div style={{width:'100%',height:'100%',position:'relative'}}>
      <AnimatePresence mode="wait">
        {screen==='lobby'&&(
          <motion.div key="lobby" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0}}>
            <Lobby onStartCPU={lvl=>{setCpuLevel(lvl);setGameMode('cpu');setScreen('game');}} onStartFriend={link=>{setRoomLink(link);setGameMode('host');setScreen('game');}}/>
          </motion.div>
        )}
        {screen==='game'&&(
          <motion.div key="game" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:'absolute',inset:0}}>
            <GameTable cpuLevel={cpuLevel} mode={gameMode} roomLink={roomLink} onReturnLobby={()=>setScreen('lobby')}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Shared hint ─── */
const HINT={position:'absolute',bottom:24,left:'50%',transform:'translateX(-50%)',fontSize:11,fontFamily:'"Geist Mono",monospace',color:'rgba(0,0,0,0.28)',pointerEvents:'none',whiteSpace:'nowrap'};

/* ══════════════════════════════════════════════════════════════
   MAIN OVERLAY
══════════════════════════════════════════════════════════════ */
export default function PlaygroundOverlay({onClose}){
  const[activeTab,setActiveTab]=useState('gravity');
  useEffect(()=>{const ok=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',ok);return()=>window.removeEventListener('keydown',ok);},[onClose]);
  return(
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:.28,ease:[.22,1,.36,1]}}
      style={{position:'fixed',inset:0,zIndex:1000,background:'#fafafa',display:'flex',flexDirection:'column',fontFamily:'"Geist Sans",system-ui,sans-serif'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 20px',borderBottom:'1px solid rgba(0,0,0,0.06)',flexShrink:0,background:'rgba(255,255,255,0.80)',backdropFilter:'blur(12px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:12,fontWeight:600,color:'#1a1814',letterSpacing:'-0.01em'}}>Playground</span>
          <div style={{width:1,height:14,background:'rgba(0,0,0,0.10)'}}/>
          <div style={{display:'flex',gap:2}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} data-cursor-hover
                style={{padding:'4px 12px',borderRadius:6,border:'none',background:activeTab===t.id?'#1a1814':'transparent',color:activeTab===t.id?'#ffffff':'rgba(0,0,0,0.45)',fontSize:11,fontFamily:'"Geist Sans",system-ui',fontWeight:activeTab===t.id?500:400,cursor:'pointer',transition:'all .15s',letterSpacing:'-0.01em'}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} data-cursor-hover aria-label="Close playground"
          style={{width:26,height:26,borderRadius:'50%',background:'rgba(0,0,0,0.06)',border:'none',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',color:'rgba(0,0,0,0.45)'}}>
          ×
        </button>
      </div>
      {/* Content */}
      <div style={{flex:1,overflow:'hidden',position:'relative'}}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.18}} style={{width:'100%',height:'100%'}}>
            {activeTab==='gravity'       &&<GravityDrops/>}
            {activeTab==='constellation' &&<CursorConstellation/>}
            {activeTab==='spit'          &&<SpitGame/>}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
