import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ACTIVITY_LABELS, DEFAULT_REC, appendSessionOnce, elapsedSeconds, formatDuration, moodChange, niceDate, outdoorMinutes, readStorage, type ActiveSession, type Activity, type Mood, type Recommendation, type Session } from './domain';

type GlyphProps = { size?: number; strokeWidth?: number };
/** A lightweight local glyph avoids making the essential timer depend on an icon package. */
function Glyph({size=20,strokeWidth=1.8}: GlyphProps){
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M4.5 8.5c3.5 0 5.5 2.1 7.5 5.5 2-3.4 4-5.5 7.5-5.5M5 16c3 0 5-1.4 7-4 2 2.6 4 4 7 4"/></svg>;
}
const ArrowLeft=Glyph, ArrowRight=Glyph, ArrowUpRight=Glyph, BookOpen=Glyph, Check=Glyph, CheckCircle2=Glyph, Clock3=Glyph, Dog=Glyph, Footprints=Glyph, Heart=Glyph, Info=Glyph, Leaf=Glyph, LockKeyhole=Glyph, Moon=Glyph, Settings2=Glyph, ShieldCheck=Glyph, Sparkles=Glyph, Sprout=Glyph, Sun=Glyph, WandSparkles=Glyph, X=Glyph;

type Screen = 'home' | 'prepare' | 'running' | 'finish' | 'result' | 'journal' | 'about';
const API = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
const moodWords = ['','Very low','Low','Okay','Good','Great'];
const moodFaces = ['','😞','😕','😐','🙂','😊'];
const activityMeta: Record<Activity, {icon: typeof Sun; text: string; color: string}> = {
  sit:{icon:Sun,text:'A moment of stillness',color:'#e8c37d'},
  walk:{icon:Footprints,text:'Move at your own pace',color:'#a9c6a1'},
  pet:{icon:Dog,text:'Enjoy familiar company',color:'#c9b8dc'}
};

function usePersistentState<T>(key: string, initial:T): [T, (value:T | ((previous:T)=>T))=>void] {
  const [value,setValue]=useState<T>(()=>readStorage(key,initial));
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* storage may be disabled */}},[key,value]);
  return [value,setValue];
}
function SectionLabel({children}:{children:ReactNode}){return <span className="eyebrow">{children}</span>}
function activityIcon(activity:Activity, size=21){const Icon=activityMeta[activity].icon;return <Icon size={size} strokeWidth={1.8}/>}
function MoodPicker({value,onChange}:{value:Mood,onChange:(m:Mood)=>void}){
  return <div className="mood-group">{([1,2,3,4,5] as Mood[]).map(n=><button type="button" key={n} className={`mood-choice ${value===n?'selected':''}`} onClick={()=>onChange(n)} aria-label={`${n} out of 5: ${moodWords[n]}`} aria-pressed={value===n}><span>{moodFaces[n]}</span><small>{moodWords[n]}</small></button>)}</div>;
}
function ActivityChoice({value,onChange}:{value:Activity,onChange:(v:Activity)=>void}){
  return <div className="activities">{(['sit','walk','pet'] as Activity[]).map(a=><button key={a} type="button" aria-pressed={value===a} className={`activity-choice ${value===a?'selected':''}`} onClick={()=>onChange(a)}><span className="activity-symbol" style={{background:activityMeta[a].color}}>{activityIcon(a)}</span><span><strong>{ACTIVITY_LABELS[a]}</strong><small>{activityMeta[a].text}</small></span><span className="choice-indicator">{value===a?<Check size={15}/>:null}</span></button>)}</div>;
}

export default function App(){
  const [screen,setScreen]=useState<Screen>('home');
  const [sessions,setSessions]=usePersistentState<Session[]>('outside-lab:sessions:v1',[]);
  const [active,setActive]=usePersistentState<ActiveSession | null>('outside-lab:active:v1',null);
  const [preMood,setPreMood]=useState<Mood>(3);
  const [postMood,setPostMood]=useState<Mood>(3);
  const [activity,setActivity]=useState<Activity>('sit');
  const [minutes,setMinutes]=useState(5);
  const [reportedOutdoors,setReportedOutdoors]=useState(true);
  const [note,setNote]=useState('');
  const [now,setNow]=useState(Date.now());
  const [latest,setLatest]=useState<Session|null>(null);
  const [recommendation,setRecommendation]=usePersistentState<Recommendation | null>('outside-lab:recommendation:v1',null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiError,setAiError]=useState('');
  const [keyCode,setKeyCode]=useState(()=>{try{return sessionStorage.getItem('outside-lab:code')||''}catch{return ''}});
  const [showSettings,setShowSettings]=useState(false);
  const [health,setHealth]=useState<{ai_configured:boolean;model:string;access_code_required:boolean}|null>(null);
  const [backendOnline,setBackendOnline]=useState(false);
  const rec=recommendation || DEFAULT_REC;
  const total=useMemo(()=>outdoorMinutes(sessions),[sessions]);
  const outdoorSessions=sessions.filter(s=>s.outdoorsReported);
  const positive=outdoorSessions.filter(s=>moodChange(s)>0).length;
  const meaningful=outdoorSessions.filter(s=>s.seconds>=60).length;
  const avgDelta=outdoorSessions.length? outdoorSessions.reduce((n,s)=>n+moodChange(s),0)/outdoorSessions.length:0;
  const elapsed=active?elapsedSeconds(active.startedAt,active.endedAt?Date.parse(active.endedAt):now):0;

  useEffect(()=>{const i=window.setInterval(()=>setNow(Date.now()),1000);return()=>window.clearInterval(i)},[]);
  useEffect(()=>{if(active&&screen==='home')setScreen(active.endedAt?'finish':'running');},[]); // recover after refresh
  useEffect(()=>{fetch(`${API}/api/health`).then(async r=>{if(!r.ok)throw Error('offline');return r.json()}).then(h=>{setHealth(h);setBackendOnline(true)}).catch(()=>{setHealth(null);setBackendOnline(false)})},[]);

  const go=(next:Screen)=>{setScreen(next);window.scrollTo({top:0,behavior:'smooth'});};
  const enterPrepare=()=>{if(active){go('running');return;} setActivity(rec.activity);setMinutes(rec.minutes);go('prepare')};
  const start=()=>{const item:ActiveSession={id:crypto.randomUUID(),activity,startedAt:new Date().toISOString(),moodBefore:preMood,targetMinutes:minutes};setActive(item);setNow(Date.now());go('running')};
  const stop=()=>{
    if(!active)return;
    setActive({...active,endedAt:new Date().toISOString()});
    setPostMood(active.moodBefore);setReportedOutdoors(true);setNote('');go('finish');
  };
  const saveSession=()=>{
    if(!active)return;
    const finishedAt=active.endedAt || new Date().toISOString();
    const s:Session={id:active.id,activity:active.activity,startedAt:active.startedAt,finishedAt,
      seconds:elapsedSeconds(active.startedAt,Date.parse(finishedAt)),moodBefore:active.moodBefore,moodAfter:postMood,outdoorsReported:reportedOutdoors,note:note.trim().slice(0,180)};
    setSessions(prev=>appendSessionOnce(prev,s));setRecommendation(null);setLatest(s);setActive(null);go('result');
  };
  const cancelSession=()=>{setActive(null);go('home')};
  const getAi=async()=>{
    setAiError('');setAiLoading(true);
    try{
      const res=await fetch(`${API}/api/recommend`,{method:'POST',headers:{'Content-Type':'application/json',...(keyCode?{'X-Access-Code':keyCode}:{})},
        body:JSON.stringify({currentMood:latest?.moodAfter ?? preMood,preferredActivity:activity,context:'Private safe outdoor space preferred; no public street required.',
          sessions:sessions.slice(0,20).map(s=>({activity:s.activity,seconds:s.seconds,moodBefore:s.moodBefore,moodAfter:s.moodAfter,outdoorsReported:s.outdoorsReported,note:s.note}))})});
      if(!res.ok){const data=await res.json().catch(()=>({}));throw Error(data.detail||`AI service returned ${res.status}`)}
      const obj=await res.json() as Recommendation;
      if(!obj.title||!obj.instruction||!['sit','walk','pet'].includes(obj.activity))throw Error('AI returned an incomplete experiment.');
      setRecommendation(obj);setActivity(obj.activity);setMinutes(obj.minutes);
    }catch(e){setAiError(e instanceof Error?e.message:'AI is unavailable. Please try again.');}
    finally{setAiLoading(false)}
  };
  const saveCode=(v:string)=>{setKeyCode(v);try{sessionStorage.setItem('outside-lab:code',v)}catch{/* ignored */}};

  const banner=<div className="eyebrow banner-text"><span className="eyebrow-dot"/> AN EXPERIMENT IN GETTING OUTSIDE</div>;
  return <div className="app-shell">
    <header className="topbar"><div className="wide topbar-inner"><button className="logo" onClick={()=>go(active?'running':'home')} aria-label="Outside Lab home"><span className="logo-symbol"><Sprout size={21} strokeWidth={2.3}/></span><span>outside<span className="logo-light">lab.</span></span></button><nav className="desktop-nav" aria-label="Main navigation"><button className={screen==='home'?'nav-current':''} onClick={()=>go('home')}>Overview</button><button className={screen==='journal'?'nav-current':''} onClick={()=>go('journal')}>My journal</button><button className={screen==='about'?'nav-current':''} onClick={()=>go('about')}>The idea</button></nav><div className="header-actions"><button className="icon-btn" aria-label="App settings" onClick={()=>setShowSettings(!showSettings)}><Settings2 size={19}/></button><button className="small-action" onClick={enterPrepare}>{active?'Resume session':'Start a session'} <ArrowUpRight size={16}/></button></div></div></header>
    <main className="wide">
      {screen==='home'&&<><section className="hero"><div className="hero-copy">{banner}<h1>Less screen.<br/><em>More sky.</em></h1><p>A gentle little lab for discovering what happens when you step away from your screen and spend time in the real world.</p><div className="hero-actions"><button className="primary-btn" onClick={enterPrepare}>Begin an outdoor experiment <ArrowRight size={19}/></button><span className="micro-note"><Leaf size={16}/> Your own courtyard counts.</span></div></div><div className="hero-art" aria-label="Illustration of rolling green hills under the sun" role="img"><div className="sun-disc"/><div className="cloud cloud-one"/><div className="cloud cloud-two"/><div className="hill hill-back"/><div className="hill hill-front"/><div className="plant one"><span/><span/><span/></div><div className="plant two"><span/><span/><span/></div><div className="hero-art-label"><Sun size={17}/> A little fresh perspective</div></div></section>
      <section className="dashboard-section"><div className="section-heading"><div><SectionLabel>YOUR LITTLE PROGRESS</SectionLabel><h2>Every minute counts.</h2></div><button className="text-link" onClick={()=>go('journal')}>View journal <ArrowUpRight size={16}/></button></div><div className="stat-grid"><div className="stat-card"><span className="stat-icon soft-green"><Clock3 size={20}/></span><strong>{total}<small> min</small></strong><span>Self-reported outdoor time</span></div><div className="stat-card"><span className="stat-icon soft-gold"><Sun size={20}/></span><strong>{outdoorSessions.length}</strong><span>Outdoor sessions logged</span></div><div className="stat-card"><span className="stat-icon soft-purple"><Heart size={20}/></span><strong>{positive}<small> / {outdoorSessions.length}</small></strong><span>Sessions you felt better after</span></div></div></section>
      <section className="home-lower"><div className="experiment-card"><div className="experiment-header"><span className="mini-icon"><Sparkles size={16}/></span><SectionLabel>{recommendation?'YOUR AI-PERSONALIZED EXPERIMENT':'YOUR STARTER EXPERIMENT'}</SectionLabel></div><h2>{rec.title}</h2><p>{rec.instruction}</p><div className="experiment-facts"><span><Clock3 size={16}/>{rec.minutes} minutes</span><span>{activityIcon(rec.activity,16)}{ACTIVITY_LABELS[rec.activity]}</span></div><div className="experiment-footer"><button className="primary-btn dark" onClick={enterPrepare}>Try this experiment <ArrowRight size={18}/></button><button className="link-muted" disabled={aiLoading} onClick={getAi}><WandSparkles size={17}/>{aiLoading?'Asking open AI…':'Ask open AI for an idea'}</button></div>{aiError&&<p role="alert" className="error-text">{aiError}</p>}{recommendation&&<p className="evidence-note">{recommendation.evidence_note}</p>}</div><div className="how-card"><SectionLabel>HOW IT WORKS</SectionLabel><h2>Small steps.<br/><em>Real discoveries.</em></h2><div className="how-step"><span>01</span><div><strong>Check in</strong><p>Notice how you're feeling right now.</p></div></div><div className="how-step"><span>02</span><div><strong>Go outside</strong><p>Put the phone away. The app can wait.</p></div></div><div className="how-step"><span>03</span><div><strong>Come back curious</strong><p>Share how it went and let AI suggest what's next.</p></div></div><div className="how-foot"><ShieldCheck size={17}/> No GPS tracking. No pressure.</div></div></section></>}

      {screen==='prepare'&&<section className="flow-page"><button className="back-link" onClick={()=>go('home')}><ArrowLeft size={17}/> Back to overview</button><div className="step-caption">STEP 01 OF 03 <span/> CHECK IN</div><h1>How are you <em>feeling?</em></h1><p className="lead">A quick check-in before your outdoor break. There's no right answer.</p><div className="flow-card"><div className="form-section"><label className="form-label">Your mood right now</label><MoodPicker value={preMood} onChange={setPreMood}/></div><div className="form-section"><label className="form-label">What would you like to do?</label><ActivityChoice value={activity} onChange={setActivity}/></div><div className="form-section"><label className="form-label">How long feels good?</label><div className="pills">{[3,5,10,15].map(n=><button className={n===minutes?'pill active':'pill'} key={n} onClick={()=>setMinutes(n)}>{n} min</button>)}</div></div><div className="callout"><ShieldCheck size={20}/><p>Your terrace, balcony, enclosed yard, or a safe nearby area all count. You don't need to travel anywhere.</p></div><button className="primary-btn full" onClick={start}>Start my outdoor time <ArrowRight size={19}/></button></div></section>}

      {screen==='running'&&active&&<section className="flow-page"><div className="step-caption">STEP 02 OF 03 <span/> BE OUT THERE</div><h1>This is your time <em>outside.</em></h1><p className="lead">Set your phone down. Look up. Move or sit. You don't have to accomplish anything.</p><div className="running-card"><div className="running-illustration"><div className="running-sun"><Sun size={39}/></div><span className="orbit orbit-a"/><span className="orbit orbit-b"/></div><SectionLabel>YOUR SESSION IS RUNNING</SectionLabel><div className="big-timer" aria-live="off">{formatDuration(elapsed)}</div><div className="time-sub">Suggested experiment · {active.targetMinutes} min</div><div className="session-progress"><div style={{width:`${Math.min(100,elapsed/(active.targetMinutes*60)*100)}%`}}/></div><p className="running-tip">{ACTIVITY_LABELS[active.activity]}. Keep your phone in your pocket whenever you can.</p><button className="primary-btn dark full" onClick={stop}>I'm back, finish session <ArrowRight size={19}/></button><button className="secondary-text-btn" onClick={cancelSession}>Discard this session</button></div></section>}

      {screen==='finish'&&active&&<section className="flow-page"><button className="back-link" onClick={()=>{setActive({...active,endedAt:undefined});go('running')}}><ArrowLeft size={17}/> Resume timer</button><div className="step-caption">STEP 03 OF 03 <span/> REFLECT</div><h1>Welcome <em>back.</em></h1><p className="lead">Your break lasted {formatDuration(elapsed)}. Let's capture how it felt.</p><div className="flow-card"><div className="form-section"><label className="form-label">How do you feel now?</label><MoodPicker value={postMood} onChange={setPostMood}/></div><div className="form-section"><label className="form-label" htmlFor="session-note">One thing you noticed <span className="optional">(optional)</span></label><textarea id="session-note" className="notes-input" maxLength={180} placeholder="The breeze was lovely, I felt more focused…" value={note} onChange={e=>setNote(e.target.value)} rows={3}/></div><label className="confirm-row"><input type="checkbox" checked={reportedOutdoors} onChange={e=>setReportedOutdoors(e.target.checked)}/><span>I spent this session outdoors <small>Self-reported, not sensor-verified.</small></span></label><button className="primary-btn full" onClick={saveSession}>Save my experience <ArrowRight size={19}/></button></div></section>}

      {screen==='result'&&latest&&<section className="flow-page"><div className="result-check"><CheckCircle2 size={30}/></div><div className="step-caption">EXPERIMENT COMPLETE</div><h1>You showed <em>up.</em></h1><p className="lead">You made time for the world outside your screen. Here's what you reported.</p><div className="flow-card"><div className="result-overview"><div><SectionLabel>TIME SPENT</SectionLabel><strong>{Math.round(latest.seconds/60)} <small>min</small></strong><span>{latest.outdoorsReported?'Self-reported outdoors':'Not marked as outdoors'}</span></div><div><SectionLabel>MOOD CHANGE</SectionLabel><strong>{moodChange(latest)>0?'+':''}{moodChange(latest)} <small>points</small></strong><span>From {latest.moodBefore}/5 to {latest.moodAfter}/5</span></div></div><div className="reflection-box"><Heart size={20}/><p>{moodChange(latest)>0?'You reported feeling better after this session. One experience doesn’t establish a pattern, but it’s worth exploring.':moodChange(latest)<0?'You reported feeling worse, and that matters too. Not every outdoor break feels good. We can try a different approach.':'Your mood rating stayed the same. That’s a valid result. Perhaps another activity or time would feel different.'}</p></div><div className="experiment-footer result-actions"><button className="primary-btn dark" onClick={getAi} disabled={aiLoading}><Sparkles size={18}/>{aiLoading?'Asking open AI…':'Ask AI what to try next'}</button><button className="link-muted" onClick={()=>go('journal')}>View journal <ArrowRight size={17}/></button></div>{aiError&&<p role="alert" className="error-text">{aiError}</p>}{recommendation&&<div className="ai-recommendation"><SectionLabel>OPEN-WEIGHT AI EXPERIMENT</SectionLabel><h3>{rec.title}</h3><p>{rec.instruction}</p><span>{rec.evidence_note}</span><button className="text-link" onClick={enterPrepare}>Try it <ArrowRight size={16}/></button></div>}</div></section>}

      {screen==='journal'&&<section className="journal-page"><div className="journal-intro"><SectionLabel>YOUR OUTDOOR JOURNAL</SectionLabel><h1>Every small moment <em>adds up.</em></h1><p>Real sessions, recorded by you. No fabricated history, no automatic location tracking.</p></div><div className="journal-stats"><div><strong>{total}</strong><span>Minutes outdoors</span></div><div><strong>{meaningful}</strong><span>Outdoor sessions over a minute</span></div><div><strong>{outdoorSessions.length?`${avgDelta>0?'+':''}${avgDelta.toFixed(1)}`:'—'}</strong><span>Average self-reported mood change</span></div></div>{sessions.length===0?<div className="empty-journal"><BookOpen size={32}/><h3>Your story starts outside.</h3><p>After you finish your first break, it will appear here.</p><button className="primary-btn" onClick={enterPrepare}>Try a first session <ArrowRight size={17}/></button></div>:<div className="journal-list"><div className="section-heading"><h2>Past experiments</h2><span className="count-pill">{sessions.length} saved</span></div>{sessions.map(s=><div className="journal-entry" key={s.id}><div className="journal-icon">{activityIcon(s.activity,23)}</div><div className="entry-main"><strong>{ACTIVITY_LABELS[s.activity]}</strong><span>{niceDate(s.startedAt)} · {formatDuration(s.seconds)} · {s.outdoorsReported?'Self-reported outside':'Not marked outside'}</span>{s.note&&<p>“{s.note}”</p>}</div><div className={`entry-change ${moodChange(s)>0?'better':moodChange(s)<0?'worse':'same'}`}>{moodChange(s)>0?'+':''}{moodChange(s)} <small>mood</small></div></div>)}</div>}<div className="journal-bottom"><Info size={18}/><p>Mood entries are personal reflections, not diagnoses or proof of cause and effect. Sessions stay in this browser until you clear its storage.</p></div></section>}

      {screen==='about'&&<section className="about-page"><SectionLabel>BUILT FOR THE REAL WORLD</SectionLabel><h1>An app that wants you <em>to leave it.</em></h1><p className="lead">Outside Lab is a Hacktoberfest prototype asking a simple question: can open-weight AI help us discover what makes outdoor time feel worthwhile?</p><div className="about-grid"><div><div className="about-icon"><Footprints size={26}/></div><h3>Screen time stays short</h3><p>Check in, go outside, come back. The experience happens away from the app.</p></div><div><div className="about-icon"><WandSparkles size={26}/></div><h3>AI asks better questions</h3><p>Qwen through Backboard suggests small experiments based on your actual recorded sessions.</p></div><div><div className="about-icon"><LockKeyhole size={26}/></div><h3>Private by default</h3><p>Sessions stay on-device. Only the summaries you choose to use for AI requests are sent to Backboard.</p></div></div><div className="about-footer"><h2>A prototype, not a medical device.</h2><p>Outside Lab never claims it can automatically prove outdoor presence or diagnose your mental health. This is an experiment in personal curiosity, not treatment advice.</p><button className="primary-btn" onClick={enterPrepare}>Try it for yourself <ArrowRight size={18}/></button></div></section>}
    </main>
    {showSettings&&<div className="modal-backdrop" onClick={()=>setShowSettings(false)}><div className="settings-dialog" role="dialog" aria-modal="true" aria-label="Outside Lab settings" onClick={e=>e.stopPropagation()}><div className="settings-heading"><h2><Settings2 size={21}/> App settings</h2><button className="icon-btn" onClick={()=>setShowSettings(false)} aria-label="Close settings"><X size={19}/></button></div><div className="settings-field"><label>Optional backend access code</label><input type="password" value={keyCode} onChange={e=>saveCode(e.target.value)} placeholder="Set only if your server requires it"/><small>Kept only in this browser tab. Never enter your Backboard API key here.</small></div><div className="settings-status"><span className={backendOnline?'status-dot online':'status-dot'}/><div><strong>{backendOnline?'Backend reachable':'Backend not connected'}</strong><small>{health?.ai_configured?`Backboard configured · ${health.model}`:'No verified AI connection yet. Starter sessions still work.'}</small></div></div><div className="privacy-notice"><ShieldCheck size={18}/>Session history stays in local browser storage. Tapping an AI action sends your recorded session summaries to Backboard through your backend.</div><button className="primary-btn full" onClick={()=>setShowSettings(false)}>Done <Check size={17}/></button></div></div>}
    <footer><div className="wide footer-content"><div><span className="footer-logo"><Leaf size={18}/> outside lab</span><span>Made to be used less.</span></div><nav><button onClick={()=>go('journal')}>Journal</button><button onClick={()=>go('about')}>About</button><a href="https://github.com" target="_blank" rel="noreferrer">Open source <ArrowUpRight size={13}/></a></nav><span className="footer-end"><Moon size={16}/> Have a little day outside.</span></div></footer>
  </div>;
}
