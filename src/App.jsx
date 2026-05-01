import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xotytitxgpuuwqgeccih.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdHl0aXR4Z3B1dXdxZ2VjY2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTc0OTgsImV4cCI6MjA5MzA3MzQ5OH0.sGITzHaZ72OY8m5a6ulwHCpczcWWIjKmhDx2y8yJjNw"
);

const F = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const RED = "#FF0040";

// Pulse animation style injected once
const PULSE_STYLE = `
@keyframes pulse-red { 0%,100%{opacity:1} 50%{opacity:0.25} }
@keyframes pulse-orange { 0%,100%{opacity:1} 50%{opacity:0.25} }
@keyframes pulse-green { 0%,100%{opacity:1} 50%{opacity:0.25} }
@keyframes pulse-purple { 0%,100%{opacity:1} 50%{opacity:0.25} }
.pulse-red { animation: pulse-red 2.5s ease-in-out infinite; }
.pulse-orange { animation: pulse-orange 2.8s ease-in-out infinite; }
.pulse-green { animation: pulse-green 3s ease-in-out infinite; }
.pulse-purple { animation: pulse-purple 3.2s ease-in-out infinite; }
.pulse-btn { animation: pulse-red 2s ease-in-out infinite; }
`;

const getDays = (d) => {
  if (!d) return 0;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS = ["D","L","M","M","J","V","S"];
const SESSIONS_TOKENS = { 2:8, 3:12, 4:16, 5:20 };

const tag = (c) => ({
  display:"inline-block", padding:"4px 10px", borderRadius:6, fontSize:11,
  fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:F,
  background: c==="red"?`${RED}22`: c==="green"?"#22c55e22":"#f9731622",
  color: c==="red"?RED: c==="green"?"#22c55e":"#f97316",
  border:`1px solid ${c==="red"?`${RED}44`: c==="green"?"#22c55e44":"#f9731644"}`
});

const base = {
  app:{ minHeight:"100vh", background:"#0a0a0a", color:"#fff", fontFamily:F, paddingBottom:80 },
  topBar:{ background:"#0d0d0d", borderBottom:"1px solid #222", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 },
  main:{ padding:16 },
  card:{ background:"#161616", border:"1px solid #222", borderRadius:14, padding:16, marginBottom:12 },
  input:{ background:"#1a1a1a", border:"1px solid #333", borderRadius:10, padding:"14px 16px", color:"#fff", fontFamily:F, fontSize:16, width:"100%", boxSizing:"border-box", outline:"none", marginBottom:12, display:"block" },
  redBtn:{ background:RED, color:"#fff", border:"none", padding:"14px 24px", borderRadius:10, cursor:"pointer", fontFamily:F, fontSize:15, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", width:"100%", display:"block" },
  ghostBtn:{ background:"transparent", color:"#999", border:"1px solid #333", padding:"10px 16px", borderRadius:10, cursor:"pointer", fontFamily:F, fontSize:13, fontWeight:600, textTransform:"uppercase" },
  label:{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", color:"#666", marginBottom:6, display:"block", fontFamily:F },
  h1:{ fontSize:28, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.02em", marginBottom:4, fontFamily:F },
  h2:{ fontSize:20, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12, fontFamily:F },
  h3:{ fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"#666", marginBottom:6, fontFamily:F },
  grid2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  statCard:(color)=>({ background:"#161616", border:`1px solid ${color}44`, borderRadius:14, padding:16, borderLeft:`3px solid ${color}` }),
  bottomNav:{ position:"fixed", bottom:0, left:0, right:0, background:"#111", borderTop:"1px solid #222", display:"flex", zIndex:100 },
  navItem:(active)=>({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"10px 0 12px", cursor:"pointer", color:active?RED:"#555", fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", border:"none", background:"transparent", fontFamily:F }),
};

function MonthCalendar({ workouts, onDayClick, selectedDate, schedules }) {
  const today = new Date();
  const [calDate, setCalDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = today.toISOString().split("T")[0];

  const getDotsForDay = (day) => {
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const ws = (workouts||[]).filter(w => w.date === key);
    return ws;
  };

  return (
    <div style={{ background:"#161616", border:"1px solid #222", borderRadius:16, padding:16, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={()=>setCalDate(new Date(year,month-1,1))} style={{ background:"none", border:"none", color:"#fff", fontSize:26, cursor:"pointer", fontFamily:F, padding:"0 8px" }}>‹</button>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontWeight:800, fontSize:20, textTransform:"uppercase", letterSpacing:"0.05em", fontFamily:F }}>{MONTHS[month]}</p>
          <p style={{ color:"#555", fontSize:13, fontFamily:F }}>{year}</p>
        </div>
        <button onClick={()=>setCalDate(new Date(year,month+1,1))} style={{ background:"none", border:"none", color:"#fff", fontSize:26, cursor:"pointer", fontFamily:F, padding:"0 8px" }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:6 }}>
        {WEEKDAYS.map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:"#555", fontFamily:F, padding:"4px 0" }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth}).map((_,i)=>{
          const day = i+1;
          const key = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const ws = getDotsForDay(day);
          const isToday = key===todayKey;
          const isSelected = key===selectedDate;
          return (
            <div key={day} onClick={()=>onDayClick(key)} style={{ textAlign:"center", padding:"6px 2px", cursor:"pointer", borderRadius:10, background:isSelected?RED:isToday?`${RED}22`:"transparent" }}>
              <p style={{ fontSize:16, fontWeight:isToday||isSelected?800:400, color:isSelected?"#fff":isToday?RED:"#fff", fontFamily:F, lineHeight:1, marginBottom:3 }}>{day}</p>
              <div style={{ display:"flex", justifyContent:"center", gap:2, minHeight:6 }}>
                {ws.slice(0,2).map((w,wi)=>(
                  <div key={wi} className={w.done?"pulse-green":"pulse-orange"} style={{ width:6, height:6, borderRadius:"50%", background:w.done?"#22c55e":"#f97316" }}/>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("home");
  const [athletes, setAthletes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selAthlete, setSelAthlete] = useState(null);
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAF, setShowAF] = useState(false);
  const [showSF, setShowSF] = useState(false);
  const [showWF, setShowWF] = useState(false);
  const [showTokenForm, setShowTokenForm] = useState(false);
  const [aForm, setAForm] = useState({ name:"", email:"", password:"", plan:"", expiry:"", type:"Online", sessions_per_week:3 });
  const [sForm, setSForm] = useState({ day:"Lunes", time:"", spots:4 });
  const [wForm, setWForm] = useState({ title:"", exercises:"", date:"", athlete_ids:[] });
  const [tokenForm, setTokenForm] = useState({ amount:"", reason:"" });
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [chatAthlete, setChatAthlete] = useState(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = PULSE_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const login = async () => {
    setLoading(true); setErr("");
    const { data, error } = await supabase.from("users").select("*").eq("email",email).eq("password",pw).single();
    if (error||!data) setErr("Email o contraseña incorrectos");
    else { setUser(data); load(data); }
    setLoading(false);
  };

  const load = async (u) => {
    if (u.role==="coach") {
      const { data:a } = await supabase.from("users").select("*").eq("role","athlete"); setAthletes(a||[]);
      const { data:s } = await supabase.from("schedules").select("*, bookings(*, users(*))"); setSchedules(s||[]);
      const { data:m } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at"); setMessages(m||[]);
      const { data:w } = await supabase.from("workouts").select("*, users(name)").order("date"); setWorkouts(w||[]);
      const { data:th } = await supabase.from("token_history").select("*, users(name)").order("created_at",{ascending:false}); setTokenHistory(th||[]);
    } else {
      const { data:s } = await supabase.from("schedules").select("*, bookings(*, users(*))"); setSchedules(s||[]);
      const { data:m } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages((m||[]).filter(x=>x.from_id===u.id||x.to_id===u.id));
      const { data:w } = await supabase.from("workouts").select("*").eq("athlete_id",u.id).order("date"); setWorkouts(w||[]);
      const { data:th } = await supabase.from("token_history").select("*").eq("athlete_id",u.id).order("created_at",{ascending:false}); setTokenHistory(th||[]);
    }
  };

  const logout = () => { setUser(null); setEmail(""); setPw(""); setView("home"); setSelectedAthlete(null); setChatAthlete(null); };

  const createAthlete = async () => {
    const tokens = SESSIONS_TOKENS[aForm.sessions_per_week] || 12;
    await supabase.from("users").insert({...aForm, role:"athlete", tokens, sessions_per_week:parseInt(aForm.sessions_per_week)});
    setShowAF(false); setAForm({ name:"", email:"", password:"", plan:"", expiry:"", type:"Online", sessions_per_week:3 }); load(user);
  };

  const delAthlete = async (id) => { await supabase.from("users").delete().eq("id",id); setSelectedAthlete(null); load(user); };

  const createSchedule = async () => {
    await supabase.from("schedules").insert({...sForm, spots:parseInt(sForm.spots)});
    setShowSF(false); setSForm({ day:"Lunes", time:"", spots:4 }); load(user);
  };
  const delSchedule = async (id) => { await supabase.from("schedules").delete().eq("id",id); load(user); };

  const createWorkout = async () => {
    const exArr = wForm.exercises.split("\n").filter(e=>e.trim());
    const ids = wForm.athlete_ids.length > 0 ? wForm.athlete_ids : (selectedAthlete ? [selectedAthlete.id] : []);
    for (const aid of ids) {
      await supabase.from("workouts").insert({ title:wForm.title, exercises:exArr, date:wForm.date, athlete_id:aid });
      // descontar token
      const ath = athletes.find(a=>a.id===aid);
      if (ath && ath.tokens > 0) {
        await supabase.from("users").update({ tokens: ath.tokens - 1 }).eq("id", aid);
        await supabase.from("token_history").insert({ athlete_id:aid, amount:-1, reason:`Planificación: ${wForm.title} (${wForm.date})` });
      }
    }
    setShowWF(false); setWForm({ title:"", exercises:"", date:selDate, athlete_ids:[] }); load(user);
  };

  const adjustTokens = async (athleteId, currentTokens) => {
    const amt = parseInt(tokenForm.amount);
    if (!amt || !tokenForm.reason) return;
    const newTokens = currentTokens + amt;
    await supabase.from("users").update({ tokens: newTokens }).eq("id", athleteId);
    await supabase.from("token_history").insert({ athlete_id:athleteId, amount:amt, reason:tokenForm.reason });
    setShowTokenForm(false); setTokenForm({ amount:"", reason:"" });
    load(user);
    // update selectedAthlete
    setSelectedAthlete(prev => prev ? {...prev, tokens: newTokens} : null);
  };

  const bookSlot = async (sid) => {
    const sch = schedules.find(s=>s.id===sid);
    const mine = sch?.bookings?.find(b=>b.athlete_id===user.id);
    if (mine) await supabase.from("bookings").delete().eq("id",mine.id);
    else await supabase.from("bookings").insert({ schedule_id:sid, athlete_id:user.id });
    load(user);
  };

  const markDone = async (id) => { await supabase.from("workouts").update({done:true}).eq("id",id); load(user); };

  const sendMsg = async (toId) => {
    if (!newMsg.trim()||!toId) return;
    await supabase.from("messages").insert({ from_id:user.id, to_id:toId, text:newMsg });
    setNewMsg(""); load(user);
  };

  // LOGIN
  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:F }}>
      <div style={{ textAlign:"center", marginBottom:4 }}>
        <img src="/nsb_sin_fondo.png" alt="NSB" style={{ width:260, marginBottom:4 }} />
        <p style={{ color:"#555", letterSpacing:"0.3em", fontSize:13, textTransform:"uppercase", fontFamily:F }}>Never Stop Building</p>
      </div>
      <div style={{ background:"#0d0d0d", borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:380 }}>
        <h2 style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:20, color:"#fff", fontFamily:F }}>Iniciar Sesión</h2>
        <label style={base.label}>Email</label>
        <input style={base.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e=>e.key==="Enter"&&login()} />
        <label style={base.label}>Contraseña</label>
        <input style={{...base.input,marginBottom:20}} type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
        {err && <p style={{ color:RED, fontSize:13, marginBottom:12, fontFamily:F }}>{err}</p>}
        <button className="pulse-btn" style={base.redBtn} onClick={login} disabled={loading}>{loading?"Entrando...":"Entrar"}</button>
        <p style={{ color:"#555", fontSize:16, textAlign:"center", marginTop:16, fontStyle:"italic", fontFamily:F }}>tus metas merecen un plan real.</p>
      </div>
    </div>
  );

  // ─── COACH ───────────────────────────────────────────────
  if (user.role==="coach") {
    const cv = ["home","atletas","horarios","mensajes","info"];
    const ci = { home:"⚡", atletas:"👥", horarios:"📅", mensajes:"💬", info:"📋" };
    const cl = { home:"Inicio", atletas:"Atletas", horarios:"Horarios", mensajes:"Mensajes", info:"Info" };

    // PERFIL ATLETA
    if (selectedAthlete) {
      const aw = workouts.filter(w=>w.athlete_id===selectedAthlete.id);
      const dayW = aw.filter(w=>w.date===selDate);
      const d = getDays(selectedAthlete.expiry);
      const ath = athletes.find(a=>a.id===selectedAthlete.id) || selectedAthlete;
      const athHistory = tokenHistory.filter(th=>th.athlete_id===selectedAthlete.id);

      return (
        <div style={base.app}>
          <div style={base.topBar}>
            <button onClick={()=>setSelectedAthlete(null)} style={{ background:"none", border:"none", color:RED, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:F }}>← Atletas</button>
            <span style={{ color:"#666", fontSize:13, fontFamily:F }}>{user.name}</span>
          </div>
          <div style={base.main}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <h1 style={{...base.h1,marginBottom:4}}>{ath.name}</h1>
                <span style={tag("orange")}>{ath.type}</span>
              </div>
              <span className={d<15?"pulse-red":d<30?"pulse-orange":"pulse-green"} style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
            </div>

            {/* Stats grid */}
            <div style={base.grid2}>
              <div style={base.statCard(RED)}>
                <p style={base.h3}>Plan</p>
                <p style={{ fontWeight:700, fontSize:14, fontFamily:F }}>{ath.plan||"Sin plan"}</p>
                <p style={{ color:"#f97316", fontSize:12, fontFamily:F }}>{ath.sessions_per_week||3}x/semana</p>
              </div>
              <div style={base.statCard("#a855f7")}>
                <p style={base.h3}>Tokens</p>
                <p className="pulse-purple" style={{ fontSize:36, fontWeight:800, color:"#a855f7", lineHeight:1, fontFamily:F }}>{ath.tokens||0}</p>
              </div>
              <div style={base.statCard("#f97316")}>
                <p style={base.h3}>Próximo pago</p>
                <p style={{ fontWeight:700, fontSize:13, fontFamily:F }}>{ath.payment_date||"—"}</p>
              </div>
              <div style={base.statCard("#22c55e")}>
                <p style={base.h3}>Completados</p>
                <p className="pulse-green" style={{ fontSize:28, fontWeight:800, color:"#22c55e", lineHeight:1, fontFamily:F }}>{aw.filter(w=>w.done).length}<span style={{ fontSize:13, color:"#666" }}>/{aw.length}</span></p>
              </div>
            </div>

            {/* Tokens control */}
            <div style={base.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={base.h3}>Gestión de tokens</p>
                <button style={{...base.redBtn, width:"auto", padding:"6px 12px", fontSize:12}} onClick={()=>setShowTokenForm(!showTokenForm)}>Ajustar</button>
              </div>
              {showTokenForm && <>
                <label style={base.label}>Cantidad (+ agregar / - quitar)</label>
                <input style={base.input} type="number" placeholder="Ej: 4 o -2" value={tokenForm.amount} onChange={e=>setTokenForm({...tokenForm,amount:e.target.value})} />
                <label style={base.label}>Motivo</label>
                <input style={base.input} placeholder="Ej: Pago mensual, recuperación..." value={tokenForm.reason} onChange={e=>setTokenForm({...tokenForm,reason:e.target.value})} />
                <button style={base.redBtn} onClick={()=>adjustTokens(ath.id, ath.tokens||0)}>Confirmar ajuste</button>
              </>}
              {athHistory.length > 0 && <>
                <p style={{...base.h3, marginTop:8}}>Historial</p>
                {athHistory.slice(0,8).map(h=>(
                  <div key={h.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid #1a1a1a" }}>
                    <div>
                      <p style={{ fontSize:13, fontFamily:F, color:"#ccc" }}>{h.reason}</p>
                      <p style={{ fontSize:11, color:"#555", fontFamily:F }}>{new Date(h.created_at).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontWeight:800, fontSize:16, color:h.amount>0?"#22c55e":RED, fontFamily:F }}>{h.amount>0?"+":""}{h.amount}</span>
                  </div>
                ))}
              </>}
            </div>

            {/* Calendario */}
            <MonthCalendar workouts={aw} selectedDate={selDate} onDayClick={(key)=>{ setSelDate(key); setWForm(f=>({...f,date:key,athlete_ids:[ath.id]})); }} />

            {/* Entrenamiento del día */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <p style={{ fontWeight:700, fontSize:14, color:"#999", fontFamily:F }}>{selDate}</p>
              <button style={{...base.redBtn, width:"auto", padding:"8px 14px", fontSize:12}} onClick={()=>{ setWForm({ title:"", exercises:"", date:selDate, athlete_ids:[ath.id] }); setShowWF(!showWF); }}>+ Agregar</button>
            </div>

            {showWF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo entrenamiento</h2>
              <label style={base.label}>Fecha</label>
              <input style={base.input} type="date" value={wForm.date} onChange={e=>setWForm({...wForm,date:e.target.value})} />
              <label style={base.label}>Título</label>
              <input style={base.input} value={wForm.title} onChange={e=>setWForm({...wForm,title:e.target.value})} placeholder="Ej: Upper Body Strength" />
              <label style={base.label}>Ejercicios (uno por línea)</label>
              <textarea style={{...base.input,height:120,resize:"vertical"}} value={wForm.exercises} onChange={e=>setWForm({...wForm,exercises:e.target.value})} placeholder={"Press de banca 4x8\nRemo con barra 4x8"} />
              <label style={base.label}>Agregar también a otros atletas</label>
              <div style={{ marginBottom:12 }}>
                {athletes.filter(a=>a.id!==ath.id).map(a=>(
                  <div key={a.id} onClick={()=>{
                    const ids = wForm.athlete_ids.includes(a.id) ? wForm.athlete_ids.filter(id=>id!==a.id) : [...wForm.athlete_ids, a.id];
                    setWForm({...wForm, athlete_ids: ids.includes(ath.id)?ids:[ath.id,...ids]});
                  }} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", cursor:"pointer", borderBottom:"1px solid #1a1a1a" }}>
                    <div style={{ width:20, height:20, borderRadius:4, border:`2px solid ${wForm.athlete_ids.includes(a.id)?RED:"#444"}`, background:wForm.athlete_ids.includes(a.id)?RED:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {wForm.athlete_ids.includes(a.id) && <span style={{ color:"#fff", fontSize:12 }}>✓</span>}
                    </div>
                    <p style={{ fontFamily:F, fontSize:15 }}>{a.name}</p>
                  </div>
                ))}
              </div>
              <button style={base.redBtn} onClick={createWorkout}>Crear entrenamiento</button>
            </div>}

            <div style={base.card}>
              {dayW.length===0
                ? <p style={{ color:"#444", textAlign:"center", padding:16, fontFamily:F }}>Sin entrenamiento para este día.</p>
                : dayW.map(w=>(
                  <div key={w.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                      <p className="pulse-red" style={{ fontWeight:800, fontSize:16, color:RED, textTransform:"uppercase", fontFamily:F }}>{w.title}</p>
                      <span className={w.done?"pulse-green":"pulse-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                    </div>
                    {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb", fontSize:14, padding:"8px 0", borderBottom:"1px solid #1a1a1a", fontFamily:F }}>{String(i+1).padStart(2,"0")}. {ex}</p>)}
                  </div>
                ))
              }
            </div>

            {/* Info atleta */}
            <div style={base.card}>
              <p style={base.h3}>Información</p>
              <div style={base.grid2}>
                {[["Email",ath.email],["Clave",ath.password],["Vence",ath.expiry||"—"],["Pago",ath.payment_date||"—"]].map(([l,v])=>(
                  <div key={l} style={{ background:"#0d0d0d", borderRadius:8, padding:10 }}><p style={base.h3}>{l}</p><p style={{ fontWeight:600, fontSize:13, fontFamily:F }}>{v}</p></div>
                ))}
              </div>
              <button style={{...base.ghostBtn,marginTop:12,width:"100%",fontSize:12,color:RED,borderColor:`${RED}44`}} onClick={()=>delAthlete(ath.id)}>Eliminar atleta</button>
            </div>
          </div>
        </div>
      );
    }

    // CHAT CON ATLETA
    if (chatAthlete) {
      const conv = messages.filter(m=>(m.from_id===user.id&&m.to_id===chatAthlete.id)||(m.from_id===chatAthlete.id&&m.to_id===user.id));
      return (
        <div style={base.app}>
          <div style={base.topBar}>
            <button onClick={()=>setChatAthlete(null)} style={{ background:"none", border:"none", color:RED, fontSize:16, fontWeight:700, cursor:"pointer", fontFamily:F }}>← Mensajes</button>
            <span style={{ fontWeight:700, fontFamily:F }}>{chatAthlete.name}</span>
            <span style={{ width:60 }}/>
          </div>
          <div style={{...base.main, paddingBottom:120}}>
            {conv.length===0
              ? <p style={{ color:"#444", textAlign:"center", padding:40, fontFamily:F }}>Sin mensajes aún.</p>
              : conv.map(m=>(
                <div key={m.id} style={{ display:"flex", justifyContent:m.from_id===user.id?"flex-end":"flex-start", marginBottom:10 }}>
                  <div style={{ maxWidth:"75%", background:m.from_id===user.id?RED:"#222", borderRadius:14, padding:"10px 14px" }}>
                    <p style={{ color:"#fff", fontSize:14, fontFamily:F }}>{m.text}</p>
                    <p style={{ color:m.from_id===user.id?"#ff8fa8":"#555", fontSize:10, marginTop:4, fontFamily:F }}>{new Date(m.created_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</p>
                  </div>
                </div>
              ))
            }
          </div>
          <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#111", borderTop:"1px solid #222", padding:12, display:"flex", gap:8 }}>
            <input style={{...base.input, marginBottom:0, flex:1}} placeholder="Escribe un mensaje..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(chatAthlete.id)} />
            <button className="pulse-btn" style={{...base.redBtn, width:"auto", padding:"14px 20px", marginBottom:0}} onClick={()=>sendMsg(chatAthlete.id)}>→</button>
          </div>
        </div>
      );
    }

    return (
      <div style={base.app}>
        <div style={base.topBar}>
          <img src="/nsb_sin_fondo.png" alt="NSB" style={{ height:32 }} />
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:"#666", fontSize:13, fontFamily:F }}>{user.name}</span>
            <button style={{...base.ghostBtn, padding:"6px 12px", fontSize:11}} onClick={logout}>Salir</button>
          </div>
        </div>
        <div style={base.main}>

          {view==="home" && <>
            <h1 style={base.h1}>Dashboard</h1>
            <p style={{ color:"#666", fontSize:14, marginBottom:16, fontFamily:F }}>Panel de control NSB</p>
            <div style={base.grid2}>
              <div style={base.statCard(RED)}><p style={base.h3}>Atletas</p><p className="pulse-red" style={{ fontSize:40, fontWeight:800, color:RED, lineHeight:1, fontFamily:F }}>{athletes.length}</p></div>
              <div style={base.statCard("#f97316")}><p style={base.h3}>Horarios</p><p className="pulse-orange" style={{ fontSize:40, fontWeight:800, color:"#f97316", lineHeight:1, fontFamily:F }}>{schedules.length}</p></div>
              <div style={base.statCard("#22c55e")}><p style={base.h3}>Planes</p><p className="pulse-green" style={{ fontSize:40, fontWeight:800, color:"#22c55e", lineHeight:1, fontFamily:F }}>{workouts.length}</p></div>
              <div style={base.statCard("#a855f7")}><p style={base.h3}>Mensajes</p><p className="pulse-purple" style={{ fontSize:40, fontWeight:800, color:"#a855f7", lineHeight:1, fontFamily:F }}>{messages.length}</p></div>
            </div>
            <div style={base.card}>
              <h2 style={base.h2}>Atletas</h2>
              {athletes.map(a=>{
                const d=getDays(a.expiry);
                return <div key={a.id} onClick={()=>{setSelectedAthlete(a);}} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #1a1a1a", cursor:"pointer" }}>
                  <div><p style={{ fontWeight:700, fontSize:16, fontFamily:F }}>{a.name}</p><p style={{ color:"#666", fontSize:13, fontFamily:F }}>{a.type} · {a.tokens||0} tokens</p></div>
                  <span className={d<15?"pulse-red":d<30?"pulse-orange":"pulse-green"} style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
                </div>;
              })}
            </div>
          </>}

          {view==="atletas" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h1 style={{...base.h1,marginBottom:0}}>Atletas</h1>
              <button style={{...base.redBtn, width:"auto", padding:"10px 16px", fontSize:13}} onClick={()=>setShowAF(!showAF)}>+ Agregar</button>
            </div>
            {showAF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo atleta</h2>
              {[["Nombre","name","text","Nombre completo"],["Email","email","email","email@ejemplo.com"],["Contraseña","password","text","Contraseña"],["Plan","plan","text","Ej: NSB Personalizado"]].map(([l,k,t,ph])=>(
                <div key={k}><label style={base.label}>{l}</label><input style={base.input} type={t} value={aForm[k]} onChange={e=>setAForm({...aForm,[k]:e.target.value})} placeholder={ph} /></div>
              ))}
              <label style={base.label}>Vencimiento</label>
              <input style={base.input} type="date" value={aForm.expiry} onChange={e=>setAForm({...aForm,expiry:e.target.value})} />
              <label style={base.label}>Fecha de pago</label>
              <input style={base.input} type="date" value={aForm.payment_date||""} onChange={e=>setAForm({...aForm,payment_date:e.target.value})} />
              <label style={base.label}>Sesiones por semana</label>
              <select style={base.input} value={aForm.sessions_per_week} onChange={e=>setAForm({...aForm,sessions_per_week:parseInt(e.target.value)})}>
                <option value={2}>2x semana — 8 tokens/mes</option>
                <option value={3}>3x semana — 12 tokens/mes</option>
                <option value={4}>4x semana — 16 tokens/mes</option>
                <option value={5}>5x semana — 20 tokens/mes</option>
              </select>
              <label style={base.label}>Tipo</label>
              <select style={base.input} value={aForm.type} onChange={e=>setAForm({...aForm,type:e.target.value})}>
                <option>Online</option><option>Presencial</option><option>Mixto</option>
              </select>
              <button style={base.redBtn} onClick={createAthlete}>Crear atleta</button>
            </div>}
            {athletes.map(a=>{
              const d=getDays(a.expiry);
              return (
                <div key={a.id} onClick={()=>setSelectedAthlete(a)} style={{...base.card, cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8}}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:`${RED}22`, border:`2px solid ${RED}44`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span className="pulse-red" style={{ color:RED, fontWeight:800, fontSize:16, fontFamily:F }}>{a.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p style={{ fontWeight:800, fontSize:16, fontFamily:F }}>{a.name}</p>
                      <p style={{ color:"#666", fontSize:12, fontFamily:F }}>{a.plan||"Sin plan"} · {a.tokens||0} tokens</p>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span className={d<15?"pulse-red":d<30?"pulse-orange":"pulse-green"} style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
                    <span style={{ color:"#555", fontSize:18 }}>›</span>
                  </div>
                </div>
              );
            })}
          </>}

          {view==="horarios" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h1 style={{...base.h1,marginBottom:0}}>Horarios</h1>
              <button style={{...base.redBtn, width:"auto", padding:"10px 16px", fontSize:13}} onClick={()=>setShowSF(!showSF)}>+ Agregar</button>
            </div>
            <MonthCalendar workouts={[]} selectedDate={selDate} onDayClick={(key)=>setSelDate(key)} />
            {showSF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo horario</h2>
              <label style={base.label}>Día</label>
              <select style={base.input} value={sForm.day} onChange={e=>setSForm({...sForm,day:e.target.value})}>{DAYS.map(d=><option key={d}>{d}</option>)}</select>
              <label style={base.label}>Hora</label>
              <input style={base.input} type="time" value={sForm.time} onChange={e=>setSForm({...sForm,time:e.target.value})} />
              <label style={base.label}>Cupos</label>
              <input style={base.input} type="number" value={sForm.spots} onChange={e=>setSForm({...sForm,spots:e.target.value})} />
              <button style={base.redBtn} onClick={createSchedule}>Crear horario</button>
            </div>}
            {schedules.map(sch=>(
              <div key={sch.id} style={base.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div><p style={{ fontWeight:800, fontSize:18, textTransform:"uppercase", fontFamily:F }}>{sch.day}</p><p className="pulse-red" style={{ color:RED, fontSize:28, fontWeight:800, lineHeight:1, fontFamily:F }}>{sch.time}</p></div>
                  <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700, fontSize:22, fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
                </div>
                {sch.bookings?.length===0?<p style={{ color:"#444", fontSize:13, fontFamily:F }}>Sin reservas</p>:sch.bookings?.map(b=><p key={b.id} style={{ color:"#ccc", fontSize:14, padding:"3px 0", fontFamily:F }}>· {b.users?.name}</p>)}
                <button style={{...base.ghostBtn,marginTop:10,width:"100%",fontSize:12,color:RED,borderColor:`${RED}44`}} onClick={()=>delSchedule(sch.id)}>Eliminar</button>
              </div>
            ))}
          </>}

          {view==="mensajes" && <>
            <h1 style={{...base.h1,marginBottom:16}}>Mensajes</h1>
            {athletes.map(a=>{
              const conv = messages.filter(m=>(m.from_id===user.id&&m.to_id===a.id)||(m.from_id===a.id&&m.to_id===user.id));
              const last = conv[conv.length-1];
              return (
                <div key={a.id} onClick={()=>setChatAthlete(a)} style={{...base.card, cursor:"pointer", display:"flex", alignItems:"center", gap:12, marginBottom:8}}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:`${RED}22`, border:`2px solid ${RED}44`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span className="pulse-red" style={{ color:RED, fontWeight:800, fontSize:18, fontFamily:F }}>{a.name.charAt(0)}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontWeight:800, fontSize:15, fontFamily:F }}>{a.name}</p>
                    <p style={{ color:"#555", fontSize:13, fontFamily:F, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{last ? last.text : "Sin mensajes aún"}</p>
                  </div>
                  <span style={{ color:"#555", fontSize:18 }}>›</span>
                </div>
              );
            })}
          </>}

          {view==="info" && <>
            <h1 style={{...base.h1,marginBottom:4}}>Políticas</h1>
            <p style={{ color:"#666", fontSize:13, marginBottom:16, fontFamily:F }}>NSB Planning — Never Stop Building</p>

            {[
              { title:"Presencial", color:RED, cls:"pulse-red", items:[
                "Las clases agendadas y no asistidas son recuperables, hasta 2 por mes.",
                "Las cancelaciones deben realizarse con 24 horas de anticipación.",
                "Si no cancelas a tiempo, la clase se descuenta del plan.",
                "Los horarios se reservan con antelación desde la app.",
                "El plan mensual no se congela ni se extiende por inasistencias."
              ]},
              { title:"Online", color:"#f97316", cls:"pulse-orange", items:[
                "Las planificaciones se suben semanalmente a la app.",
                "Tienes 24 horas para consultar dudas sobre tu entrenamiento.",
                "El seguimiento se realiza a través de la app cada semana.",
                "Los materiales de apoyo se envían por mensaje interno."
              ]},
              { title:"Mixto", color:"#a855f7", cls:"pulse-purple", items:[
                "Combina sesiones presenciales y planificación online.",
                "Las políticas presenciales aplican para las clases en persona.",
                "La parte online sigue las políticas del plan online."
              ]},
              { title:"General", color:"#22c55e", cls:"pulse-green", items:[
                "El pago es mensual y debe realizarse antes del inicio del período.",
                "El plan vence en la fecha indicada sin importar el uso.",
                "Cada sesión subida descuenta 1 token del plan del atleta.",
                "Los tokens se recargan al inicio de cada período pagado."
              ]}
            ].map(sec=>(
              <div key={sec.title} style={{...base.card, borderLeft:`3px solid ${sec.color}`}}>
                <p className={sec.cls} style={{ fontWeight:800, fontSize:18, textTransform:"uppercase", color:sec.color, marginBottom:12, fontFamily:F }}>{sec.title}</p>
                {sec.items.map((item,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                    <span style={{ color:sec.color, fontWeight:800, fontSize:14, marginTop:1 }}>·</span>
                    <p style={{ color:"#ccc", fontSize:14, fontFamily:F, lineHeight:1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            ))}
          </>}

        </div>
        <div style={base.bottomNav}>
          {cv.map(v=>(
            <button key={v} style={base.navItem(view===v)} onClick={()=>{ setView(v); setSelectedAthlete(null); setChatAthlete(null); }}>
              <span style={{ fontSize:20, marginBottom:2 }}>{ci[v]}</span>{cl[v]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── ATLETA ──────────────────────────────────────────────
  const daysLeft = getDays(user.expiry);
  const dayWorkouts = workouts.filter(w=>w.date===selDate);
  const av = ["home","plan","agendar","mensajes","info"];
  const ai = { home:"🏠", plan:"📋", agendar:"📅", mensajes:"💬", info:"📋" };
  const al = { home:"Inicio", plan:"Mi Plan", agendar:"Agendar", mensajes:"Mensajes", info:"Info" };

  if (chatAthlete===null && view==="mensajes") {
    // vista chat directo con coach para atleta
  }

  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <img src="/nsb_sin_fondo.png" alt="NSB" style={{ height:32 }} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#666", fontSize:13, fontFamily:F }}>{user.name.split(" ")[0]}</span>
          <button style={{...base.ghostBtn, padding:"6px 12px", fontSize:11}} onClick={logout}>Salir</button>
        </div>
      </div>
      <div style={base.main}>

        {view==="home" && <>
          <h1 style={base.h1}>Hola, <span className="pulse-red" style={{ color:RED }}>{user.name.split(" ")[0]}</span></h1>
          <p style={{ color:"#666", fontSize:14, marginBottom:16, fontFamily:F }}>Never Stop Building</p>
          {daysLeft<15 && <div style={{ background:"#1a0505", border:`1px solid ${RED}`, borderRadius:12, padding:14, marginBottom:12 }}>
            <p className="pulse-red" style={{ color:RED, fontWeight:700, fontSize:14, fontFamily:F }}>⚠ Tu plan vence en {daysLeft} días</p>
          </div>}
          <div style={base.grid2}>
            <div style={base.statCard(RED)}><p style={base.h3}>Plan</p><p style={{ fontWeight:700, fontSize:14, fontFamily:F }}>{user.plan||"Sin plan"}</p><p style={{ color:"#f97316", fontSize:12, fontFamily:F }}>{user.type}</p></div>
            <div style={base.statCard("#f97316")}><p style={base.h3}>Vence en</p><p className={daysLeft<15?"pulse-red":daysLeft<30?"pulse-orange":"pulse-green"} style={{ fontSize:36, fontWeight:800, color:daysLeft<15?RED:daysLeft<30?"#f97316":"#22c55e", lineHeight:1, fontFamily:F }}>{daysLeft}</p><p style={{ color:"#666", fontSize:12, fontFamily:F }}>días</p></div>
            <div style={base.statCard("#a855f7")}><p style={base.h3}>Tokens</p><p className="pulse-purple" style={{ fontSize:36, fontWeight:800, color:"#a855f7", lineHeight:1, fontFamily:F }}>{user.tokens||0}</p></div>
            <div style={base.statCard("#f97316")}><p style={base.h3}>Próximo pago</p><p style={{ fontWeight:700, fontSize:13, fontFamily:F }}>{user.payment_date||"—"}</p></div>
            <div style={{...base.statCard("#22c55e"), gridColumn:"1 / -1"}}><p style={base.h3}>Completados</p><p className="pulse-green" style={{ fontSize:36, fontWeight:800, color:"#22c55e", lineHeight:1, fontFamily:F }}>{workouts.filter(w=>w.done).length} <span style={{ fontSize:14, color:"#666" }}>/ {workouts.length}</span></p></div>
          </div>
          <div style={base.card}>
            <h2 style={base.h2}>Entrenamiento de hoy</h2>
            {dayWorkouts.length>0 ? dayWorkouts.map(w=>(
              <div key={w.id}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <p className="pulse-red" style={{ fontWeight:800, fontSize:16, color:RED, textTransform:"uppercase", fontFamily:F }}>{w.title}</p>
                  <span className={w.done?"pulse-green":"pulse-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓":"Pend."}</span>
                </div>
                {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb", fontSize:15, padding:"8px 0", borderBottom:"1px solid #1a1a1a", fontFamily:F }}>{i+1}. {ex}</p>)}
                {!w.done && <button className="pulse-btn" style={{...base.redBtn,marginTop:14}} onClick={()=>markDone(w.id)}>Marcar completado ✓</button>}
              </div>
            )) : <p style={{ color:"#444", fontFamily:F }}>Sin entrenamiento para hoy.</p>}
          </div>
          {/* Token history atleta */}
          {tokenHistory.length>0 && <div style={base.card}>
            <p style={base.h3}>Historial de tokens</p>
            {tokenHistory.slice(0,5).map(h=>(
              <div key={h.id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1a1a1a" }}>
                <p style={{ fontSize:13, color:"#ccc", fontFamily:F }}>{h.reason}</p>
                <span style={{ fontWeight:800, color:h.amount>0?"#22c55e":RED, fontFamily:F }}>{h.amount>0?"+":""}{h.amount}</span>
              </div>
            ))}
          </div>}
        </>}

        {view==="plan" && <>
          <h1 style={{...base.h1,marginBottom:16}}>Mi Planificación</h1>
          <MonthCalendar workouts={workouts} selectedDate={selDate} onDayClick={(key)=>setSelDate(key)} />
          <div style={base.card}>
            <p style={{ fontWeight:700, fontSize:14, color:"#999", marginBottom:12, fontFamily:F }}>{selDate}</p>
            {dayWorkouts.length>0 ? dayWorkouts.map(w=>(
              <div key={w.id}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <p className="pulse-red" style={{ fontWeight:800, fontSize:18, color:RED, textTransform:"uppercase", fontFamily:F }}>{w.title}</p>
                  <span className={w.done?"pulse-green":"pulse-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                </div>
                {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb", fontSize:15, padding:"10px 0", borderBottom:"1px solid #1a1a1a", fontFamily:F }}>{String(i+1).padStart(2,"0")}. {ex}</p>)}
                {!w.done && <button className="pulse-btn" style={{...base.redBtn,marginTop:14}} onClick={()=>markDone(w.id)}>Marcar completado ✓</button>}
              </div>
            )) : <p style={{ color:"#444", textAlign:"center", padding:20, fontFamily:F }}>Sin entrenamiento para este día.</p>}
          </div>
        </>}

        {view==="agendar" && <>
          <h1 style={{...base.h1,marginBottom:16}}>Agendar Sesión</h1>
          {schedules.map(sch=>{
            const isMine=sch.bookings?.some(b=>b.athlete_id===user.id);
            const isFull=(sch.bookings?.length||0)>=sch.spots;
            return <div key={sch.id} style={{...base.card, border:isMine?`1px solid ${RED}`:"1px solid #222", background:isMine?"#1a0505":"#161616"}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div><p style={{ fontWeight:800, fontSize:18, textTransform:"uppercase", fontFamily:F }}>{sch.day}</p><p className="pulse-red" style={{ color:RED, fontSize:28, fontWeight:800, lineHeight:1, fontFamily:F }}>{sch.time}</p></div>
                <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700, fontSize:20, fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
              </div>
              <button className={isMine?"pulse-btn":""} style={{ ...(isMine?base.redBtn:base.ghostBtn), fontSize:13 }} onClick={()=>bookSlot(sch.id)} disabled={!isMine&&isFull}>
                {isMine?"✓ Reservado — Cancelar":isFull?"Sin cupos disponibles":"Reservar este horario"}
              </button>
            </div>;
          })}
        </>}

        {view==="mensajes" && <>
          <h1 style={{...base.h1,marginBottom:16}}>Mensajes</h1>
          <div style={base.card}>
            <p style={base.h3}>Escribirle al coach</p>
            <textarea style={{...base.input,height:100,resize:"vertical"}} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} />
            <button className="pulse-btn" style={base.redBtn} onClick={async()=>{ const {data:c}=await supabase.from("users").select("id").eq("role","coach").single(); sendMsg(c?.id); }}>Enviar</button>
          </div>
          <div style={base.card}>
            <p style={base.h3}>Conversación</p>
            {messages.length===0?<p style={{ color:"#444", fontFamily:F }}>Sin mensajes aún.</p>:messages.slice().reverse().map(m=>(
              <div key={m.id} style={{ padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:12, color:m.from_id===user.id?"#f97316":RED, fontFamily:F }}>{m.from?.name}</span>
                  <span style={{ color:"#444", fontSize:11, fontFamily:F }}>{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color:"#bbb", fontSize:14, fontFamily:F }}>{m.text}</p>
              </div>
            ))}
          </div>
        </>}

        {view==="info" && <>
          <h1 style={{...base.h1,marginBottom:4}}>Políticas</h1>
          <p style={{ color:"#666", fontSize:13, marginBottom:16, fontFamily:F }}>NSB Planning — Never Stop Building</p>
          {[
            { title:"Presencial", color:RED, cls:"pulse-red", items:[
              "Las clases agendadas y no asistidas son recuperables, hasta 2 por mes.",
              "Las cancelaciones deben realizarse con 24 horas de anticipación.",
              "Si no cancelas a tiempo, la clase se descuenta del plan.",
              "Los horarios se reservan con antelación desde la app.",
              "El plan mensual no se congela ni se extiende por inasistencias."
            ]},
            { title:"Online", color:"#f97316", cls:"pulse-orange", items:[
              "Las planificaciones se suben semanalmente a la app.",
              "Tienes 24 horas para consultar dudas sobre tu entrenamiento.",
              "El seguimiento se realiza a través de la app cada semana.",
              "Los materiales de apoyo se envían por mensaje interno."
            ]},
            { title:"Mixto", color:"#a855f7", cls:"pulse-purple", items:[
              "Combina sesiones presenciales y planificación online.",
              "Las políticas presenciales aplican para las clases en persona.",
              "La parte online sigue las políticas del plan online."
            ]},
            { title:"General", color:"#22c55e", cls:"pulse-green", items:[
              "El pago es mensual y debe realizarse antes del inicio del período.",
              "El plan vence en la fecha indicada sin importar el uso.",
              "Cada sesión subida descuenta 1 token del plan.",
              "Los tokens se recargan al inicio de cada período pagado."
            ]}
          ].map(sec=>(
            <div key={sec.title} style={{...base.card, borderLeft:`3px solid ${sec.color}`}}>
              <p className={sec.cls} style={{ fontWeight:800, fontSize:18, textTransform:"uppercase", color:sec.color, marginBottom:12, fontFamily:F }}>{sec.title}</p>
              {sec.items.map((item,i)=>(
                <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
                  <span style={{ color:sec.color, fontWeight:800 }}>·</span>
                  <p style={{ color:"#ccc", fontSize:14, fontFamily:F, lineHeight:1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          ))}
        </>}

      </div>
      <div style={base.bottomNav}>
        {av.map(v=>(
          <button key={v} style={base.navItem(view===v)} onClick={()=>setView(v)}>
            <span style={{ fontSize:20, marginBottom:2 }}>{ai[v]}</span>{al[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
