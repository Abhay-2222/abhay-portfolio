/**
 * PlaygroundOverlay.jsx
 * Playground tabs: Earworm Studio · Spit card game · Design System Builder
 */

import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DesignSystemBuilder = lazy(() => import('./playground/DesignSystemBuilder'));

const TABS = [
  { id: 'earworm', label: 'Mashup' },
  { id: 'spit',    label: 'Spit'  },
  { id: 'system',  label: 'System' },
];

/* ══════════════════════════════════════════════════════════════
   1. EARWORM STUDIO — 16-step beat sequencer
══════════════════════════════════════════════════════════════ */

const E_INST  = ['Drums','Bass','Synth','Strings','Drop','Vocals','FX','Piano','Tabla'];
const E_STEPS = 16;
const E_ROWS  = 6;

const E_COLORS = {
  Drums:   '#FF6B35',
  Bass:    '#7B2CBF',
  Synth:   '#00D9FF',
  Strings: '#FFB627',
  Drop:    '#FF006E',
  Vocals:  '#00F5A0',
  FX:      '#A4508B',
  Piano:   '#F4C95D',
  Tabla:   '#E07A5F',
};

const E_ROW_LABELS = {
  Drums:   ['KICK','SNARE','HH·C','HH·O','CLAP','TOM'],
  Bass:    ['G2','A2','B2','D3','E3','G3'],
  Synth:   ['G4','A4','B4','C5','D5','E5'],
  Strings: ['G4','A4','B4','C5','D5','E5'],
  Drop:    ['G1','A1','B1','C2','D2','E2'],
  Vocals:  ['VOC·1','VOC·2','VOC·3','VOC·4','VOC·5','VOC·6'],
  FX:      ['RISE','SWEEP','IMPCT','DRONE','NOISE','CLICK'],
  Piano:   ['C4','D4','E4','F4','G4','A4'],
  Tabla:   ['DYN·1','DYN·2','DYN·3','BYN·1','BYN·2','BYN·3'],
};
const E_FREQS = {
  Bass:    [98,110,123.47,146.83,164.81,196],
  Synth:   [392,440,493.88,523.25,587.33,659.25],
  Strings: [392,440,493.88,523.25,587.33,659.25],
  Drop:    [49,55,61.74,65.41,73.42,82.41],
  Vocals:  [392,440,493.88,523.25,587.33,659.25],
  Piano:   [261.63,293.66,329.63,349.23,392.00,440.00],
};
const E_DEMO = {
  Drums:  [[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0]],
  Bass:   [[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  Synth:  [[1,0,0,1,0,0,1,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0],[0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]],
  Strings:[[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  Drop:   [[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]],
  Vocals: Array.from({length:6},()=>Array(16).fill(0)),
  FX:     Array.from({length:6},()=>Array(16).fill(0)),
  Piano:  Array.from({length:6},()=>Array(16).fill(0)),
  Tabla:  Array.from({length:6},()=>Array(16).fill(0)),
};

/* ── Web Audio singleton ── */
let _actx = null;
function getACtx() {
  if (!_actx || _actx.state === 'closed')
    _actx = new (window.AudioContext || window.webkitAudioContext)();
  return _actx;
}

/* ── Reverb impulse response ── */
function makeReverb(ctx, dur=1.8, decay=2.2) {
  const len=ctx.sampleRate*dur, buf=ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){const d=buf.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}
  const conv=ctx.createConvolver(); conv.buffer=buf; return conv;
}

/* ── Drum synthesis ── */
function triggerDrum(ctx, row, t, dest) {
  if(row===0){// Kick
    const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);
    o.type='sine';o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(0.5,t+0.4);
    g.gain.setValueAtTime(1.3,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.4);o.start(t);o.stop(t+0.4);
  }else if(row===1){// Snare
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.2,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const n=ctx.createBufferSource();n.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=1800;
    const g=ctx.createGain();n.connect(f);f.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.8,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.18);n.start(t);n.stop(t+0.18);
    const o=ctx.createOscillator(),og=ctx.createGain();o.connect(og);og.connect(dest);
    o.type='triangle';o.frequency.value=185;og.gain.setValueAtTime(0.4,t);og.gain.exponentialRampToValueAtTime(0.01,t+0.1);o.start(t);o.stop(t+0.1);
  }else if(row===2){// Closed HH
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.05,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const n=ctx.createBufferSource();n.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=9000;
    const g=ctx.createGain();n.connect(f);f.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.4,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.05);n.start(t);n.stop(t+0.05);
  }else if(row===3){// Open HH
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.35,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const n=ctx.createBufferSource();n.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=6000;
    const g=ctx.createGain();n.connect(f);f.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.35);n.start(t);n.stop(t+0.35);
  }else if(row===4){// Clap
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.12,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(Math.exp(-i/ctx.sampleRate*45)+0.5*Math.exp(-(i/ctx.sampleRate-0.02)*45)*(i/ctx.sampleRate>0.02?1:0));
    const n=ctx.createBufferSource();n.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=1200;f.Q.value=0.5;
    const g=ctx.createGain();n.connect(f);f.connect(g);g.connect(dest);
    g.gain.setValueAtTime(1.0,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.12);n.start(t);n.stop(t+0.12);
  }else if(row===5){// Tom
    const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(dest);
    o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(35,t+0.3);
    g.gain.setValueAtTime(1.0,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.3);o.start(t);o.stop(t+0.3);
  }
}

/* ── FX synthesis ── */
function triggerFX(ctx, row, t, dest) {
  if(row===0){// RISE
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sawtooth';o.frequency.setValueAtTime(80,t);o.frequency.exponentialRampToValueAtTime(2000,t+0.7);
    g.gain.setValueAtTime(0.25,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.7);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.7);
  }else if(row===1){// SWEEP
    const buf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*0.55),ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const n=ctx.createBufferSource();n.buffer=buf;
    const f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=2;
    f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(7000,t+0.5);
    const g=ctx.createGain();n.connect(f);f.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.5,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.5);
    n.start(t);n.stop(t+0.55);
  }else if(row===2){// IMPACT
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(80,t);o.frequency.exponentialRampToValueAtTime(18,t+0.5);
    g.gain.setValueAtTime(1.4,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.5);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.5);
  }else if(row===3){// DRONE
    const o=ctx.createOscillator();
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=280;
    const g=ctx.createGain();o.type='sawtooth';o.frequency.value=55;
    o.connect(lp);lp.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.001,t);g.gain.linearRampToValueAtTime(0.35,t+0.12);
    g.gain.exponentialRampToValueAtTime(0.01,t+0.65);o.start(t);o.stop(t+0.65);
  }else if(row===4){// NOISE burst
    const buf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*0.14),ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const n=ctx.createBufferSource();n.buffer=buf;
    const g=ctx.createGain();n.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.65,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.12);
    n.start(t);n.stop(t+0.14);
  }else if(row===5){// CLICK
    const buf=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*0.008),ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(1-i/d.length)*0.8;
    const n=ctx.createBufferSource();n.buffer=buf;
    const g=ctx.createGain();n.connect(g);g.connect(dest);
    g.gain.setValueAtTime(1.0,t);n.start(t);n.stop(t+0.01);
  }
}

/* ── Pitched synthesis ── */
function triggerPitched(ctx, inst, freq, t, dest) {
  if(inst==='Bass'){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='triangle';o.frequency.value=freq;o.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.75,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.35);o.start(t);o.stop(t+0.35);
  }else if(inst==='Synth'){
    const o1=ctx.createOscillator(),o2=ctx.createOscillator();
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2600;
    const g=ctx.createGain();
    o1.type='sawtooth';o1.frequency.value=freq;
    o2.type='sawtooth';o2.frequency.value=freq*1.005;
    o1.connect(lp);o2.connect(lp);lp.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.55,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.22);
    o1.start(t);o1.stop(t+0.22);o2.start(t);o2.stop(t+0.22);
  }else if(inst==='Strings'){
    const o=ctx.createOscillator();
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;
    const g=ctx.createGain();
    o.type='triangle';o.frequency.value=freq;o.connect(lp);lp.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.001,t);g.gain.linearRampToValueAtTime(0.5,t+0.08);
    g.gain.exponentialRampToValueAtTime(0.01,t+0.55);o.start(t);o.stop(t+0.55);
  }else if(inst==='Drop'){
    const o=ctx.createOscillator();
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=130;
    const g=ctx.createGain();
    o.type='sine';o.frequency.value=freq;o.connect(lp);lp.connect(g);g.connect(dest);
    g.gain.setValueAtTime(1.4,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.5);o.start(t);o.stop(t+0.5);
  }else if(inst==='Vocals'){
    const o=ctx.createOscillator();
    const lp=ctx.createBiquadFilter();lp.type='bandpass';lp.frequency.value=freq*1.5;lp.Q.value=4;
    const g=ctx.createGain();o.type='sine';
    o.frequency.setValueAtTime(freq*0.98,t);
    o.frequency.linearRampToValueAtTime(freq,t+0.04);
    o.frequency.setValueAtTime(freq*1.02,t+0.09);
    o.frequency.linearRampToValueAtTime(freq,t+0.16);
    o.connect(lp);lp.connect(g);g.connect(dest);
    g.gain.setValueAtTime(0.001,t);g.gain.linearRampToValueAtTime(0.65,t+0.03);
    g.gain.exponentialRampToValueAtTime(0.01,t+0.28);o.start(t);o.stop(t+0.28);
  }
}

/* ── Piano synthesis ── */
function triggerPiano(ctx,freq,t,dest){
  const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),g2=ctx.createGain();
  o.type='triangle';o.frequency.value=freq;
  o2.type='sine';o2.frequency.value=freq*2;g2.gain.value=0.25;
  o.connect(g);o2.connect(g2);g2.connect(g);g.connect(dest);
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(0.55,t+0.005);
  g.gain.exponentialRampToValueAtTime(0.22,t+0.12);
  g.gain.exponentialRampToValueAtTime(0.01,t+1.6);
  o.start(t);o.stop(t+1.6);o2.start(t);o2.stop(t+1.6);
}

/* ── Tabla synthesis ── */
function triggerTabla(ctx,row,t,dest){
  const isDayan=row<3;
  if(isDayan){
    const freqs=[360,280,440];
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type='sine';o.frequency.setValueAtTime(freqs[row%3]*1.3,t);
    o.frequency.exponentialRampToValueAtTime(freqs[row%3]*0.65,t+0.09);
    g.gain.setValueAtTime(0.75,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.28);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.3);
  }else{
    const freqs=[75,55,95];const freq=freqs[(row-3)%3];
    const o=ctx.createOscillator(),g=ctx.createGain();
    const bLen=ctx.sampleRate*0.12;const bBuf=ctx.createBuffer(1,bLen,ctx.sampleRate);
    const bData=bBuf.getChannelData(0);for(let i=0;i<bLen;i++)bData[i]=(Math.random()*2-1)*0.28;
    const noise=ctx.createBufferSource();noise.buffer=bBuf;
    const ng=ctx.createGain();ng.gain.setValueAtTime(0.35,t);ng.gain.exponentialRampToValueAtTime(0.01,t+0.12);
    noise.connect(ng);ng.connect(dest);
    o.type='sine';o.frequency.setValueAtTime(freq*1.6,t);o.frequency.exponentialRampToValueAtTime(freq,t+0.12);
    g.gain.setValueAtTime(1.0,t);g.gain.exponentialRampToValueAtTime(0.01,t+0.45);
    o.connect(g);g.connect(dest);o.start(t);o.stop(t+0.5);noise.start(t);noise.stop(t+0.15);
  }
}

/* ── Grid helpers ── */
function makeEmptyGrid(){return Object.fromEntries(E_INST.map(i=>[i,Array.from({length:E_ROWS},()=>Array(E_STEPS).fill(false))]));}
function applyDemo(){return Object.fromEntries(E_INST.map(i=>[i,E_DEMO[i].map(r=>r.map(v=>!!v))]));}

/* ── Duration formatter ── */
function fmtDur(s){const m=Math.floor(s/60),sec=Math.floor(s%60);return`${m}:${sec.toString().padStart(2,'0')}`;}

/* ── Mashup splash screen ── */
function MashupSplash({onEnter}){
  return(
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,scale:0.97}}
      transition={{duration:0.35,ease:[0.22,1,0.36,1]}}
      style={{position:'absolute',inset:0,zIndex:20,background:'linear-gradient(145deg,#060a0f 0%,#03050a 60%,#020304 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',fontFamily:'"Geist Mono",monospace',overflow:'hidden'}}
    >
      {/* Dot grid */}
      <div aria-hidden="true" style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',backgroundSize:'28px 28px',pointerEvents:'none'}}/>
      {/* Vignette */}
      <div aria-hidden="true" style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(0,0,0,0.60) 100%)',pointerEvents:'none'}}/>

      {/* Instrument colour bars */}
      <motion.div style={{display:'flex',gap:6,marginBottom:40,position:'relative',zIndex:1}}>
        {E_INST.map((inst,i)=>(
          <motion.div key={inst}
            initial={{scaleX:0,opacity:0}} animate={{scaleX:1,opacity:1}}
            transition={{delay:0.14+i*0.055,duration:0.45,ease:[0.22,1,0.36,1]}}
            style={{width:32,height:4,borderRadius:2,background:E_COLORS[inst],boxShadow:`0 0 12px ${E_COLORS[inst]}80`,transformOrigin:'left'}}
          />
        ))}
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{y:20,opacity:0}} animate={{y:0,opacity:1}}
        transition={{delay:0.26,duration:0.60,ease:[0.22,1,0.36,1]}}
        style={{textAlign:'center',position:'relative',zIndex:1}}
      >
        <div style={{fontSize:9,letterSpacing:'0.24em',color:'rgba(255,255,255,0.32)',textTransform:'uppercase',marginBottom:18}}>Playground · Sequencer</div>
        <div style={{fontFamily:'"Geist Sans",system-ui',fontSize:'clamp(48px,9vw,80px)',fontWeight:700,color:'#ffffff',letterSpacing:'-0.045em',lineHeight:0.95,marginBottom:20}}>Mashup</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.32)',letterSpacing:'0.08em',lineHeight:1.7}}>
          7 instruments &nbsp;·&nbsp; 16 steps &nbsp;·&nbsp; upload any audio
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        onClick={onEnter}
        initial={{y:16,opacity:0}} animate={{y:0,opacity:1}}
        transition={{delay:0.46,duration:0.50,ease:[0.22,1,0.36,1]}}
        whileHover={{scale:1.06,y:-3}} whileTap={{scale:0.94}}
        style={{marginTop:48,padding:'12px 36px',borderRadius:10,border:'1.5px solid rgba(255,255,255,0.16)',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.88)',fontFamily:'"Geist Mono",monospace',fontSize:11,fontWeight:600,letterSpacing:'0.18em',cursor:'pointer',textTransform:'uppercase',outline:'none',position:'relative',zIndex:1}}
        onFocus={e=>{e.currentTarget.style.outline='2px solid rgba(255,255,255,0.50)';e.currentTarget.style.outlineOffset='3px';}}
        onBlur={e=>{e.currentTarget.style.outline='none';}}
      >
        Make Beats →
      </motion.button>
    </motion.div>
  );
}

/* ── Mashup component ── */
function EarwormStudio() {
  const [activeInst,setActiveInst]       = useState('Drums');
  const [grid,setGrid]                   = useState(makeEmptyGrid);
  const [playing,setPlaying]             = useState(false);
  const [tempo,setTempo]                 = useState(120);
  const [currentStep,setCurrentStep]     = useState(-1);
  const [uploadedName,setUploadedName]   = useState(null);
  const [trackDuration,setTrackDuration] = useState(null);
  const [trackVol,setTrackVol]           = useState(80);
  const [seqVol,setSeqVol]               = useState(80);
  const [hoveredCell,setHoveredCell]     = useState(null);
  const [popCell,setPopCell]             = useState(null);
  const [theme,setTheme]                 = useState(()=>{try{return localStorage.getItem('mashup-theme')||'dark';}catch(_){return'dark';}});
  const [showSplash,setShowSplash]       = useState(true);

  const gridRef      = useRef(grid);
  const tempoRef     = useRef(tempo);
  const stepRef      = useRef(0);
  const timerRef     = useRef(null);
  const playingRef   = useRef(false);
  const seqGainRef   = useRef(null);
  const trackGainRef = useRef(null);
  const uploadBuf    = useRef(null);
  const uploadSrc    = useRef(null);
  const trackVolRef  = useRef(80);
  const seqVolRef    = useRef(80);
  const cellRefs     = useRef({});

  useEffect(()=>{gridRef.current=grid;},[grid]);
  useEffect(()=>{tempoRef.current=tempo;},[tempo]);
  useEffect(()=>{trackVolRef.current=trackVol;if(trackGainRef.current)trackGainRef.current.gain.value=trackVol/100;},[trackVol]);
  useEffect(()=>{seqVolRef.current=seqVol;if(seqGainRef.current)seqGainRef.current.gain.value=seqVol/100;},[seqVol]);

  const isDark = theme==='dark';
  const T = {
    bg:         isDark?'linear-gradient(135deg,#0a0e12 0%,#050708 100%)':'#FAFAFA',
    text:       isDark?'rgba(255,255,255,0.90)':'#1A1A1A',
    textMed:    isDark?'rgba(255,255,255,0.72)':'#333',
    textDim:    isDark?'rgba(255,255,255,0.52)':'#6B6B6B',
    border:     isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.10)',
    cellBg:     isDark?'rgba(255,255,255,0.05)':'#FFFFFF',
    cellBorder: isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.10)',
    scanline:   isDark?'rgba(0,0,0,0.10)':'rgba(0,0,0,0.015)',
    btnBg:      isDark?'transparent':'rgba(0,0,0,0.03)',
    btnBorder:  isDark?'rgba(255,255,255,0.14)':'rgba(0,0,0,0.16)',
    btnText:    isDark?'rgba(255,255,255,0.60)':'rgba(0,0,0,0.65)',
    uploadBdr:  isDark?'rgba(255,255,255,0.28)':'rgba(0,0,0,0.28)',
    uploadTxt:  isDark?'rgba(255,255,255,0.60)':'rgba(0,0,0,0.65)',
    trackBg:    isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',
  };

  const toggleTheme=()=>{
    const next=isDark?'light':'dark';
    setTheme(next);
    try{localStorage.setItem('mashup-theme',next);}catch(_){}
  };

  const ensureCtx=useCallback(()=>{
    const ctx=getACtx();
    if(ctx.state==='suspended')ctx.resume();
    if(!seqGainRef.current){const sg=ctx.createGain();sg.gain.value=seqVolRef.current/100;sg.connect(ctx.destination);seqGainRef.current=sg;}
    return ctx;
  },[]);

  const tick=useCallback(()=>{
    const ctx=ensureCtx();
    const s=stepRef.current;
    setCurrentStep(s);
    const t=ctx.currentTime+0.01;
    const dest=seqGainRef.current;
    E_INST.forEach(inst=>{
      gridRef.current[inst].forEach((row,ri)=>{
        if(row[s]){
          if(inst==='Drums') triggerDrum(ctx,ri,t,dest);
          else if(inst==='FX') triggerFX(ctx,ri,t,dest);
          else if(inst==='Piano') triggerPiano(ctx,E_FREQS.Piano?.[ri]??261,t,dest);
          else if(inst==='Tabla') triggerTabla(ctx,ri,t,dest);
          else triggerPitched(ctx,inst,E_FREQS[inst]?.[ri]??440,t,dest);
        }
      });
    });
    stepRef.current=(s+1)%E_STEPS;
    timerRef.current=setTimeout(tick,(60000/tempoRef.current)/4);
  },[ensureCtx]);

  const togglePlay=useCallback(()=>{
    if(playingRef.current){
      clearTimeout(timerRef.current);
      try{uploadSrc.current?.stop();}catch(_){}
      uploadSrc.current=null;
      setPlaying(false);setCurrentStep(-1);stepRef.current=0;playingRef.current=false;
    } else {
      const ctx=ensureCtx();
      if(uploadBuf.current){
        if(!trackGainRef.current){const tg=ctx.createGain();tg.gain.value=trackVolRef.current/100;tg.connect(ctx.destination);trackGainRef.current=tg;}
        const src=ctx.createBufferSource();src.buffer=uploadBuf.current;src.loop=true;
        src.connect(trackGainRef.current);src.start();uploadSrc.current=src;
      }
      playingRef.current=true;setPlaying(true);tick();
    }
  },[tick,ensureCtx]);

  useEffect(()=>()=>clearTimeout(timerRef.current),[]);

  const toggleCell=useCallback((inst,ri,si)=>{
    setGrid(prev=>{
      const ng={...prev,[inst]:prev[inst].map((r,i)=>i!==ri?r:r.map((v,j)=>j!==si?v:!v))};
      gridRef.current=ng;return ng;
    });
  },[]);

  const handleCellClick=useCallback((inst,ri,si)=>{
    toggleCell(inst,ri,si);
    const key=`${ri}-${si}`;
    setPopCell(key);
    setTimeout(()=>setPopCell(p=>p===key?null:p),150);
  },[toggleCell]);

  const handleCellKey=useCallback((e,inst,ri,si)=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();handleCellClick(inst,ri,si);return;}
    let nr=ri,ns=si;
    if(e.key==='ArrowRight'){e.preventDefault();ns=Math.min(E_STEPS-1,si+1);}
    else if(e.key==='ArrowLeft'){e.preventDefault();ns=Math.max(0,si-1);}
    else if(e.key==='ArrowDown'){e.preventDefault();nr=Math.min(E_ROWS-1,ri+1);}
    else if(e.key==='ArrowUp'){e.preventDefault();nr=Math.max(0,ri-1);}
    else return;
    cellRefs.current[`${nr}-${ns}`]?.focus();
  },[handleCellClick]);

  const handleUpload=useCallback(async(e)=>{
    const file=e.target.files?.[0];if(!file)return;
    if(uploadSrc.current){try{uploadSrc.current.stop();}catch(_){} uploadSrc.current=null;}
    const ctx=ensureCtx();
    setUploadedName(file.name);
    const ab=await file.arrayBuffer();
    const buf=await ctx.decodeAudioData(ab);
    uploadBuf.current=buf;
    setTrackDuration(fmtDur(buf.duration));
    if(playingRef.current){
      if(!trackGainRef.current){const tg=ctx.createGain();tg.gain.value=trackVolRef.current/100;tg.connect(ctx.destination);trackGainRef.current=tg;}
      const src=ctx.createBufferSource();src.buffer=buf;src.loop=true;
      src.connect(trackGainRef.current);src.start();uploadSrc.current=src;
    }
    e.target.value='';
  },[ensureCtx]);

  const clearTrack=useCallback(()=>{
    if(uploadSrc.current){try{uploadSrc.current.stop();}catch(_){} uploadSrc.current=null;}
    if(trackGainRef.current){try{trackGainRef.current.disconnect();}catch(_){} trackGainRef.current=null;}
    uploadBuf.current=null;setUploadedName(null);setTrackDuration(null);
  },[]);

  const color  = E_COLORS[activeInst];
  const groups = [0,1,2,3];
  const beats  = [0,1,2,3];

  const focusStyle  = (c)=>({onFocus:e=>{e.currentTarget.style.outline=`2px solid ${c}`;e.currentTarget.style.outlineOffset='2px';},onBlur:e=>{e.currentTarget.style.outline='none';}});

  return(
    <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',background:T.bg,color:T.text,fontFamily:'"Geist Mono",monospace',position:'relative',overflow:'hidden'}}>
      {/* Scanlines */}
      <div aria-hidden="true" style={{position:'absolute',inset:0,backgroundImage:`repeating-linear-gradient(0deg,transparent,transparent 2px,${T.scanline} 2px,${T.scanline} 4px)`,pointerEvents:'none',zIndex:0}}/>

      {/* Splash */}
      <AnimatePresence>
        {showSplash&&<MashupSplash onEnter={()=>setShowSplash(false)}/>}
      </AnimatePresence>

      {/* ── Top bar ── */}
      <div className="earworm-topbar" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:`1px solid ${T.border}`,flexShrink:0,zIndex:2,gap:12}}>
        <div style={{flexShrink:0}}>
          <div style={{fontSize:10,letterSpacing:'0.16em',color:T.textMed,textTransform:'uppercase',fontWeight:600}}>Mashup</div>
          <div style={{fontSize:10,color:T.textDim,marginTop:1,letterSpacing:'0.04em'}}>16-step sequencer</div>
        </div>

        <div role="tablist" aria-label="Select instrument" className="earworm-inst-tabs" style={{display:'flex',gap:4,flex:1,justifyContent:'center',flexWrap:'wrap'}}>
          {E_INST.map(inst=>{
            const ic=E_COLORS[inst];const isActive=activeInst===inst;
            return(
              <button key={inst} role="tab" aria-selected={isActive} onClick={()=>setActiveInst(inst)}
                style={{padding:'5px 12px',borderRadius:5,border:`1px solid ${isActive?ic:T.btnBorder}`,background:isActive?`${ic}1A`:T.btnBg,color:isActive?ic:T.btnText,fontSize:10,letterSpacing:'0.07em',cursor:'pointer',transition:'all .12s',fontFamily:'"Geist Mono",monospace',outline:'none'}}
                onMouseEnter={e=>{if(!isActive){e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.30)':'rgba(0,0,0,0.30)';e.currentTarget.style.color=isDark?'rgba(255,255,255,0.80)':'rgba(0,0,0,0.80)';}}}
                onMouseLeave={e=>{if(!isActive){e.currentTarget.style.borderColor=T.btnBorder;e.currentTarget.style.color=T.btnText;}}}
                {...focusStyle(ic)}>
                {inst}
              </button>
            );
          })}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <label aria-label="Upload background audio track"
            style={{display:'flex',alignItems:'center',gap:5,padding:'5px 11px',borderRadius:6,border:`1px dashed ${T.uploadBdr}`,color:T.uploadTxt,fontSize:9,cursor:'pointer',transition:'border-style .12s,color .12s',letterSpacing:'0.06em',whiteSpace:'nowrap'}}
            onMouseEnter={e=>{e.currentTarget.style.borderStyle='solid';e.currentTarget.style.color=isDark?'rgba(255,255,255,0.90)':'rgba(0,0,0,0.85)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderStyle='dashed';e.currentTarget.style.color=T.uploadTxt;}}>
            + Upload Track
            <input type="file" accept=".mp3,.mp4,.wav,.ogg,.m4a,.aac,.flac,audio/*"
              onChange={handleUpload} aria-label="Select audio file" style={{display:'none'}}/>
          </label>
          <button onClick={toggleTheme} aria-label={isDark?'Switch to light mode':'Switch to dark mode'}
            style={{width:28,height:28,borderRadius:6,border:`1px solid ${T.btnBorder}`,background:T.btnBg,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .12s',outline:'none'}}
            {...focusStyle(color)}>
            {isDark?'☀️':'🌙'}
          </button>
        </div>
      </div>

      {/* ── Track info bar (shown once a file is uploaded) ── */}
      {uploadedName&&(
        <div style={{display:'flex',alignItems:'center',gap:10,padding:'7px 16px',borderBottom:`1px solid ${T.border}`,background:T.trackBg,flexShrink:0,zIndex:2}}>
          <span aria-hidden="true" style={{fontSize:12}}>🎵</span>
          <span style={{fontSize:10,color:T.textMed,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{uploadedName}</span>
          {trackDuration&&<span aria-label={`Duration: ${trackDuration}`} style={{fontSize:9,color:T.textDim,flexShrink:0,letterSpacing:'0.04em'}}>{trackDuration}</span>}
          <button onClick={clearTrack} aria-label="Remove uploaded track"
            style={{background:'none',border:`1px solid ${T.btnBorder}`,borderRadius:4,color:T.textDim,cursor:'pointer',fontSize:10,padding:'2px 7px',flexShrink:0,transition:'all .12s',outline:'none'}}
            onMouseEnter={e=>{e.currentTarget.style.color=isDark?'rgba(255,255,255,0.85)':'rgba(0,0,0,0.85)';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.30)':'rgba(0,0,0,0.30)';}}
            onMouseLeave={e=>{e.currentTarget.style.color=T.textDim;e.currentTarget.style.borderColor=T.btnBorder;}}
            onFocus={e=>{e.currentTarget.style.outline='2px solid #EF4444';e.currentTarget.style.outlineOffset='2px';}}
            onBlur={e=>{e.currentTarget.style.outline='none';}}>✕</button>
        </div>
      )}

      {/* ── Grid ── */}
      <div role="grid" aria-label="Beat sequencer" className="earworm-grid"
        style={{flex:1,display:'flex',flexDirection:'column',padding:'20px 24px 12px',gap:8,overflow:'hidden',zIndex:2}}>
        {Array.from({length:E_ROWS},(_,ri)=>(
          <div key={ri} role="row" className="earworm-grid-row" style={{display:'flex',alignItems:'stretch',gap:8,flex:1}}>
            <div aria-hidden="true" style={{width:44,textAlign:'right',fontSize:10,letterSpacing:'0.06em',color:T.textDim,textTransform:'uppercase',alignSelf:'center',flexShrink:0,fontWeight:500}}>
              {E_ROW_LABELS[activeInst][ri]}
            </div>
            {groups.map(g=>(
              <div key={g} style={{display:'flex',flex:1,gap:8}}>
                {beats.map(b=>{
                  const si=g*4+b;
                  const on=grid[activeInst][ri][si];
                  const isCur=playing&&si===currentStep;
                  const isHov=hoveredCell===`${ri}-${si}`;
                  const isPop=popCell===`${ri}-${si}`;
                  return(
                    <div key={si}
                      className="earworm-cell"
                      role="gridcell" tabIndex={0}
                      aria-label={`${E_ROW_LABELS[activeInst][ri]} step ${si+1}`}
                      aria-pressed={on}
                      ref={el=>{if(el)cellRefs.current[`${ri}-${si}`]=el;}}
                      onClick={()=>handleCellClick(activeInst,ri,si)}
                      onKeyDown={e=>handleCellKey(e,activeInst,ri,si)}
                      onMouseEnter={()=>setHoveredCell(`${ri}-${si}`)}
                      onMouseLeave={()=>setHoveredCell(null)}
                      onFocus={e=>{e.currentTarget.style.outline=`2px solid ${color}`;e.currentTarget.style.outlineOffset='2px';}}
                      onBlur={e=>{e.currentTarget.style.outline='none';}}
                      style={{
                        flex:1,borderRadius:5,cursor:'pointer',minHeight:20,
                        background:on?color:isCur?'rgba(255,255,255,0.18)':isHov?`${color}28`:T.cellBg,
                        border:`1.5px solid ${on?`${color}99`:isCur?'rgba(255,255,255,0.45)':isHov?`${color}60`:T.cellBorder}`,
                        boxShadow:on?`0 0 10px ${color}55`:isCur?'0 0 8px rgba(255,255,255,0.15)':'none',
                        transform:isPop?'scale(1.14)':'scale(1)',
                        transition:'transform 0.1s, background 0.06s, border-color 0.06s, box-shadow 0.06s',
                        outline:'none',
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
        {/* Playhead dots */}
        <div aria-hidden="true" style={{display:'flex',gap:8,paddingLeft:52,marginTop:4}}>
          {groups.map(g=>(
            <div key={g} style={{display:'flex',flex:1,gap:8}}>
              {beats.map(b=>{const si=g*4+b;return(
                <div key={si} style={{flex:1,height:3,borderRadius:2,background:playing&&si===currentStep?color:T.cellBorder,transition:'background .05s'}}/>
              );})}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom controls ── */}
      <div style={{display:'flex',flexDirection:'column',padding:'10px 16px',borderTop:`1px solid ${T.border}`,flexShrink:0,zIndex:2,gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <motion.button onClick={togglePlay} whileHover={{scale:1.10}} whileTap={{scale:.90}}
            aria-label={playing?'Pause sequencer':'Play sequencer'}
            style={{width:42,height:42,borderRadius:'50%',flexShrink:0,border:`2px solid ${playing?'#ef4444':color}`,background:playing?'rgba(239,68,68,0.14)':`${color}1E`,color:playing?'#ef4444':color,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'border-color .14s, background .14s, box-shadow .14s',boxShadow:playing?'0 0 20px rgba(239,68,68,0.35)':`0 0 20px ${color}55`,outline:'none'}}
            onFocus={e=>{e.currentTarget.style.outline=`2px solid ${playing?'#ef4444':color}`;e.currentTarget.style.outlineOffset='3px';}}
            onBlur={e=>{e.currentTarget.style.outline='none';}}>
            {playing?(
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true"><rect x="1.5" y="1" width="3.5" height="11" rx="1"/><rect x="8" y="1" width="3.5" height="11" rx="1"/></svg>
            ):(
              <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden="true"><polygon points="2.5,1 12.5,6.5 2.5,12"/></svg>
            )}
          </motion.button>
          <button aria-label="Clear all steps" onClick={()=>{const g=makeEmptyGrid();setGrid(g);gridRef.current=g;}}
            style={{padding:'6px 12px',borderRadius:6,border:`1px solid ${T.btnBorder}`,background:T.btnBg,color:T.btnText,fontSize:10,letterSpacing:'0.10em',cursor:'pointer',fontFamily:'"Geist Mono",monospace',outline:'none'}}
            {...focusStyle(color)}>CLEAR</button>
          <button aria-label="Load demo pattern" onClick={()=>{const g=applyDemo();setGrid(g);gridRef.current=g;}}
            style={{padding:'6px 12px',borderRadius:6,border:`1px solid ${T.btnBorder}`,background:T.btnBg,color:T.btnText,fontSize:10,letterSpacing:'0.10em',cursor:'pointer',fontFamily:'"Geist Mono",monospace',outline:'none'}}
            {...focusStyle(color)}>DEMO</button>
          <div style={{flex:1}}/>
          <div style={{display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontSize:8,letterSpacing:'0.14em',color:T.textDim,textTransform:'uppercase'}}>BPM</span>
            <button aria-label="Decrease tempo" onClick={()=>setTempo(t=>Math.max(60,t-5))}
              style={{width:24,height:24,borderRadius:4,border:`1px solid ${T.btnBorder}`,background:T.btnBg,color:T.btnText,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"Geist Mono",monospace',lineHeight:1,padding:0,outline:'none'}}
              {...focusStyle(color)}>−</button>
            <span aria-live="polite" aria-label={`${tempo} beats per minute`} style={{fontSize:15,fontWeight:700,color:T.text,minWidth:32,textAlign:'center',letterSpacing:'-0.02em'}}>{tempo}</span>
            <button aria-label="Increase tempo" onClick={()=>setTempo(t=>Math.min(200,t+5))}
              style={{width:24,height:24,borderRadius:4,border:`1px solid ${T.btnBorder}`,background:T.btnBg,color:T.btnText,fontSize:16,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'"Geist Mono",monospace',lineHeight:1,padding:0,outline:'none'}}
              {...focusStyle(color)}>+</button>
          </div>
        </div>

        {/* Volume sliders — only visible when a track is loaded */}
        {uploadedName&&(
          <div style={{display:'flex',gap:20,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            {[{label:'Track Vol',val:trackVol,set:setTrackVol,aria:'Track volume'},{label:'Seq Vol',val:seqVol,set:setSeqVol,aria:'Sequencer volume'}].map(({label,val,set,aria})=>(
              <div key={label} style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
                <span style={{fontSize:8,letterSpacing:'0.11em',color:T.textDim,textTransform:'uppercase',whiteSpace:'nowrap'}}>{label}</span>
                <input type="range" min={0} max={100} value={val} onChange={e=>set(+e.target.value)}
                  aria-label={aria} aria-valuetext={`${val}%`} style={{flex:1,accentColor:color,cursor:'pointer'}}/>
                <span aria-live="polite" style={{fontSize:9,color:T.textDim,minWidth:28,textAlign:'right'}}>{val}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   2. SPIT — proper rules, 5-pile pyramid, drag-to-play
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
        const done=tab.every(p=>p.length===0);
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
  // Include remaining stock from each side — they carry over to the next round
  const pCards = _shuffle([...game.center[playerPileIdx], ...game.player.stock]);
  const cCards = _shuffle([...game.center[cpuPileIdx],   ...game.cpu.stock]);
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
                onPointerDown={isGrabable?(e)=>{e.preventDefault();e.stopPropagation();onGrab(e,cardObj,pileIdx);}:undefined}
                style={{cursor:isGrabable?'grab':'default',opacity:isDragged?.20:1,transition:'opacity .1s',touchAction:'none'}}
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
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.16em',color:'rgba(255,255,255,0.55)',textTransform:'uppercase',marginBottom:8}}>Playground · Card Table</div>
        <h1 style={{fontFamily:'"Geist Sans",system-ui',fontSize:34,fontWeight:700,color:'#F9F8F3',margin:0,letterSpacing:'-0.03em'}}>Spit</h1>
        <p style={{fontFamily:'"Geist Sans",system-ui',fontSize:12,color:'rgba(255,255,255,0.60)',margin:'7px 0 0'}}>also known as Speed — real-time card shedding</p>
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
            <div style={{fontFamily:'"Geist Mono",monospace',fontSize:9,letterSpacing:'0.12em',color:'rgba(255,255,255,0.60)',textTransform:'uppercase'}}>Select difficulty</div>
            <div style={{display:'flex',gap:10}}>
              {CPU_LEVELS.map(lvl=>(
                <motion.button key={lvl.id} whileHover={{scale:1.04}} whileTap={{scale:.96}} onClick={()=>setDiff(lvl.id)}
                  style={{padding:'11px 18px',borderRadius:9,cursor:'pointer',background:diff===lvl.id?'rgba(249,115,22,0.14)':'rgba(255,255,255,0.05)',border:`1px solid ${diff===lvl.id?'rgba(249,115,22,0.50)':'rgba(255,255,255,0.20)'}`,color:diff===lvl.id?'#F97316':'rgba(255,255,255,0.80)',fontFamily:'"Geist Sans",system-ui',textAlign:'left',transition:'all .15s'}}>
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
            <p style={{fontFamily:'"Geist Sans",system-ui',fontSize:12,color:'rgba(255,255,255,0.60)',margin:0,maxWidth:300,lineHeight:1.65}}>Open this link in a second tab on the same browser to play together in real-time.</p>
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
const LOBBY_BTN={padding:'9px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,0.25)',background:'transparent',color:'rgba(255,255,255,0.80)',fontFamily:'"Geist Mono",monospace',fontSize:11,cursor:'pointer',letterSpacing:'0.06em'};

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
    if(e.pointerType!=='touch'&&e.button!==0)return;
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
        // Trigger pick-pile as soon as all tableau piles are empty (stock carries over)
        const done=tab.every(p=>p.length===0);
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

  // Pointer move — use elementFromPoint so touch works correctly (touch locks e.target to start element)
  const onPointerMove=useCallback((e)=>{
    if(!dragInfoRef.current)return;
    setDragPos({x:e.clientX,y:e.clientY});
    const el=document.elementFromPoint(e.clientX,e.clientY);
    const zoneId=el?.closest?.('[data-drop]')?.getAttribute?.('data-drop')??null;
    setHovered(zoneId);
  },[]);

  const onPointerUp=useCallback((e)=>{
    const info=dragInfoRef.current;
    if(!info)return;
    const el=document.elementFromPoint(e.clientX,e.clientY);
    const zoneId=el?.closest?.('[data-drop]')?.getAttribute?.('data-drop')??null;
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
        <div style={{fontFamily:'"Geist Mono",monospace',fontSize:10,letterSpacing:'0.14em',color:'rgba(255,255,255,0.70)',textTransform:'uppercase'}}>Spit · vs {cpuLabel}</div>
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
                      border:`2.5px solid ${canPick&&isSmaller?'rgba(16,185,129,0.90)':'rgba(255,255,255,0.16)'}`,
                      boxShadow:canPick&&isSmaller?'0 0 30px rgba(16,185,129,0.50),0 8px 24px rgba(0,0,0,0.65)':'0 8px 22px rgba(0,0,0,0.55)',
                      display:'flex',alignItems:'center',justifyContent:'center',
                      transition:'border-color .18s,box-shadow .18s',
                    }}>
                      {/* Pulsing glow ring for the smaller pile */}
                      {canPick&&isSmaller&&(
                        <motion.div
                          animate={{opacity:[0.5,1,0.5],scale:[0.92,1.10,0.92]}}
                          transition={{duration:1.1,repeat:Infinity,ease:'easeInOut'}}
                          style={{position:'absolute',inset:-6,borderRadius:16,border:'2px solid rgba(16,185,129,0.65)',pointerEvents:'none',zIndex:0}}
                        />
                      )}
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
const TOP_BTN={padding:'5px 11px',borderRadius:6,border:'1px solid rgba(255,255,255,0.25)',background:'transparent',color:'rgba(255,255,255,0.80)',fontFamily:'"Geist Mono",monospace',fontSize:10,cursor:'pointer',letterSpacing:'0.06em'};

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
  const[activeTab,setActiveTab]=useState('earworm');
  useEffect(()=>{const ok=e=>{if(e.key==='Escape')onClose();};window.addEventListener('keydown',ok);return()=>window.removeEventListener('keydown',ok);},[onClose]);
  return(
    <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:.28,ease:[.22,1,.36,1]}}
      style={{position:'fixed',inset:0,zIndex:1000,background:'#fafafa',display:'flex',flexDirection:'column',fontFamily:'"Geist Sans",system-ui,sans-serif'}}>
      {/* Nav — single row: label | pill tabs | close */}
      {(()=>{const mob=typeof window!=='undefined'&&window.innerWidth<640;return(
      <div style={{
        flexShrink:0, height:48,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding: mob ? '0 12px' : '0 24px',
        background:'rgba(255,255,255,0.92)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(0,0,0,0.06)',
        gap: 8,
      }}>
        {/* Left — label (hidden on mobile) */}
        {!mob && <span style={{
          fontFamily:'"Geist Sans",system-ui,sans-serif',
          fontSize:13, fontWeight:400, letterSpacing:'-0.01em',
          color:'rgba(0,0,0,0.40)', flexShrink:0, minWidth:80,
        }}>Playground</span>}

        {/* Centre — pill tab group */}
        <div style={{
          display:'flex', alignItems:'center', flex: mob ? 1 : 'unset',
          background:'rgba(0,0,0,0.05)', borderRadius:10, padding:3, gap:2,
        }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id)} data-cursor-hover
              style={{
                padding: mob ? '5px 0' : '5px 15px',
                flex: mob ? 1 : 'unset',
                borderRadius:7, border:'none',
                background: activeTab===t.id ? '#fff' : 'transparent',
                boxShadow: activeTab===t.id ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
                color: activeTab===t.id ? 'rgba(0,0,0,0.82)' : 'rgba(0,0,0,0.38)',
                fontSize: mob ? 12 : 13, fontFamily:'"Geist Sans",system-ui',
                fontWeight: activeTab===t.id ? 500 : 400,
                cursor:'pointer', transition:'all .15s', letterSpacing:'-0.01em',
                flexShrink: mob ? 1 : 0, lineHeight:1, textAlign:'center',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Right — close */}
        <div style={{flexShrink:0, display:'flex', justifyContent:'flex-end', minWidth: mob ? 'unset' : 80}}>
          <button onClick={onClose} data-cursor-hover aria-label="Close playground"
            style={{
              width:32, height:32,
              display:'flex', alignItems:'center', justifyContent:'center',
              borderRadius:'50%', border:'none',
              background:'rgba(0,0,0,0.06)',
              color:'rgba(0,0,0,0.50)',
              fontSize:14, lineHeight:1,
              cursor:'pointer',
              transition:'background .15s, color .15s',
              flexShrink:0,
            }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,0,0,0.12)';e.currentTarget.style.color='rgba(0,0,0,0.82)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,0,0,0.06)';e.currentTarget.style.color='rgba(0,0,0,0.50)';}}>
            ✕
          </button>
        </div>
      </div>
      );})()}
      {/* Content */}
      <div style={{flex:1,overflow:'hidden',position:'relative'}}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.18}} style={{width:'100%',height:'100%'}}>
            {activeTab==='earworm' &&<EarwormStudio/>}
            {activeTab==='spit'    &&<SpitGame/>}
            {activeTab==='system'  &&(
              <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:12,color:'rgba(0,0,0,0.4)',fontFamily:'"Geist Mono",monospace'}}>Loading System…</div>}>
                <DesignSystemBuilder/>
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
