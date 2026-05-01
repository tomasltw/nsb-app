import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xotytitxgpuuwqgeccih.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdHl0aXR4Z3B1dXdxZ2VjY2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTc0OTgsImV4cCI6MjA5MzA3MzQ5OH0.sGITzHaZ72OY8m5a6ulwHCpczcWWIjKmhDx2y8yJjNw"
);

const F = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const RED = "#FF0040";

const getDays = (d) => {
  if (!d) return 0;
  return Math.ceil((new Date(d) - new Date()) / 86400000);
};

const DAYS = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

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
  const [newMsg, setNewMsg] = useState("");
  const [selAthlete, setSelAthlete] = useState("");
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAF, setShowAF] = useState(false);
  const [showSF, setShowSF] = useState(false);
  const [showWF, setShowWF] = useState(false);
  const [aForm, setAForm] = useState({ name:"", email:"", password:"", plan:"", expiry:"", type:"Online" });
  const [sForm, setSForm] = useState({ day:"Lunes", time:"", spots:4 });
  const [wForm, setWForm] = useState({ title:"", exercises:"", date:"", athlete_id:"" });

  const login = async () => {
    setLoading(true); setErr("");
    const { data, error } = await supabase.from("users").select("*").eq("email", email).eq("password", pw).single();
    if (error || !data) setErr("Email o contraseña incorrectos");
    else { setUser(data); load(data); }
    setLoading(false);
  };

  const load = async (u) => {
    if (u.role === "coach") {
      const { data: a } = await supabase.from("users").select("*").eq("role","athlete"); setAthletes(a||[]);
      const { data: s } = await supabase.from("schedules").select("*, bookings(*, users(*))"); setSchedules(s||[]);
      const { data: m } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at"); setMessages(m||[]);
      const { data: w } = await supabase.from("workouts").select("*, users(name)").order("date"); setWorkouts(w||[]);
    } else {
      const { data: s } = await supabase.from("schedules").select("*, bookings(*, users(*))"); setSchedules(s||[]);
      const { data: m } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages((m||[]).filter(x => x.from_id===u.id || x.to_id===u.id));
      const { data: w } = await supabase.from("workouts").select("*").eq("athlete_id",u.id).order("date"); setWorkouts(w||[]);
    }
  };

  const logout = () => { setUser(null); setEmail(""); setPw(""); setView("home"); };

  const createAthlete = async () => {
    await supabase.from("users").insert({...aForm, role:"athlete"});
    setShowAF(false); setAForm({ name:"", email:"", password:"", plan:"", expiry:"", type:"Online" }); load(user);
  };
  const delAthlete = async (id) => { await supabase.from("users").delete().eq("id",id); load(user); };
  const createSchedule = async () => {
    await supabase.from("schedules").insert({...sForm, spots:parseInt(sForm.spots)});
    setShowSF(false); setSForm({ day:"Lunes", time:"", spots:4 }); load(user);
  };
  const delSchedule = async (id) => { await supabase.from("schedules").delete().eq("id",id); load(user); };
  const createWorkout = async () => {
    await supabase.from("workouts").insert({...wForm, exercises: wForm.exercises.split("\n").filter(e=>e.trim())});
    setShowWF(false); setWForm({ title:"", exercises:"", date:"", athlete_id:"" }); load(user);
  };
  const bookSlot = async (sid) => {
    const sch = schedules.find(s=>s.id===sid);
    const mine = sch?.bookings?.find(b=>b.athlete_id===user.id);
    if (mine) await supabase.from("bookings").delete().eq("id",mine.id);
    else await supabase.from("bookings").insert({ schedule_id:sid, athlete_id:user.id });
    load(user);
  };
  const markDone = async (id) => { await supabase.from("workouts").update({done:true}).eq("id",id); load(user); };
  const sendMsg = async () => {
    if (!newMsg.trim()) return;
    let toId = user.role==="coach" ? selAthlete : null;
    if (user.role!=="coach") { const { data: c } = await supabase.from("users").select("id").eq("role","coach").single(); toId=c?.id; }
    if (!toId) return;
    await supabase.from("messages").insert({ from_id:user.id, to_id:toId, text:newMsg });
    setNewMsg(""); load(user);
  };

  const weekDates = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-d.getDay()+i+1); return d;
  });

  // LOGIN
  if (!user) return (
    <div style={{ minHeight:"100vh", background:"#0a0a0a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", fontFamily:F }}>
      <div style={{ textAlign:"center", marginBottom:12 }}>
        <img src="/logo.png" alt="NSB" style={{ width:260, marginBottom:6 }} />
        <p style={{ color:"#555", letterSpacing:"0.3em", fontSize:13, textTransform:"uppercase", fontFamily:F }}>Never Stop Building</p>
      </div>
      <div style={{ background:"#0d0d0d", borderRadius:16, padding:"24px 20px", width:"100%", maxWidth:380 }}>
        <h2 style={{ fontSize:22, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:20, color:"#fff", fontFamily:F }}>Iniciar Sesión</h2>
        <label style={base.label}>Email</label>
        <input style={base.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e=>e.key==="Enter"&&login()} />
        <label style={base.label}>Contraseña</label>
        <input style={{...base.input, marginBottom:20}} type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
        {err && <p style={{ color:RED, fontSize:13, marginBottom:12, fontFamily:F }}>{err}</p>}
        <button style={base.redBtn} onClick={login} disabled={loading}>{loading?"Entrando...":"Entrar"}</button>
        <p style={{ color:"#555", fontSize:16, textAlign:"center", marginTop:16, fontStyle:"italic", fontFamily:F }}>tus metas merecen un plan real.</p>
      </div>
    </div>
  );

  // COACH
  if (user.role==="coach") {
    const cv = ["home","atletas","plan","horarios","mensajes"];
    const ci = { home:"⚡", atletas:"👥", plan:"📋", horarios:"📅", mensajes:"💬" };
    const cl = { home:"Inicio", atletas:"Atletas", plan:"Plan", horarios:"Horarios", mensajes:"Mensajes" };
    return (
      <div style={base.app}>
        <div style={base.topBar}>
          <img src="/logo.png" alt="NSB" style={{ height:32 }} />
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
              <div style={base.statCard(RED)}><p style={base.h3}>Atletas</p><p style={{ fontSize:40, fontWeight:800, color:RED, lineHeight:1, fontFamily:F }}>{athletes.length}</p></div>
              <div style={base.statCard("#f97316")}><p style={base.h3}>Horarios</p><p style={{ fontSize:40, fontWeight:800, color:"#f97316", lineHeight:1, fontFamily:F }}>{schedules.length}</p></div>
              <div style={base.statCard("#22c55e")}><p style={base.h3}>Planes</p><p style={{ fontSize:40, fontWeight:800, color:"#22c55e", lineHeight:1, fontFamily:F }}>{workouts.length}</p></div>
              <div style={base.statCard("#a855f7")}><p style={base.h3}>Mensajes</p><p style={{ fontSize:40, fontWeight:800, color:"#a855f7", lineHeight:1, fontFamily:F }}>{messages.length}</p></div>
            </div>
            <div style={base.card}>
              <h2 style={base.h2}>Atletas</h2>
              {athletes.length===0 ? <p style={{ color:"#444", fontFamily:F }}>Sin atletas aún.</p> : athletes.map(a=>{
                const d=getDays(a.expiry);
                return <div key={a.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid #1a1a1a" }}>
                  <div><p style={{ fontWeight:700, fontSize:16, fontFamily:F }}>{a.name}</p><p style={{ color:"#666", fontSize:13, fontFamily:F }}>{a.type}</p></div>
                  <span style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
                </div>;
              })}
            </div>
          </>}

          {view==="atletas" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h1 style={{...base.h1, marginBottom:0}}>Atletas</h1>
              <button style={{...base.redBtn, width:"auto", padding:"10px 16px", fontSize:13}} onClick={()=>setShowAF(!showAF)}>+ Agregar</button>
            </div>
            {showAF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo atleta</h2>
              {[["Nombre","name","text","Nombre completo"],["Email","email","email","email@ejemplo.com"],["Contraseña","password","text","Contraseña"],["Plan","plan","text","Ej: NSB Personalizado"]].map(([l,k,t,ph])=>(
                <div key={k}><label style={base.label}>{l}</label><input style={base.input} type={t} value={aForm[k]} onChange={e=>setAForm({...aForm,[k]:e.target.value})} placeholder={ph} /></div>
              ))}
              <label style={base.label}>Vencimiento</label>
              <input style={base.input} type="date" value={aForm.expiry} onChange={e=>setAForm({...aForm,expiry:e.target.value})} />
              <label style={base.label}>Tipo</label>
              <select style={base.input} value={aForm.type} onChange={e=>setAForm({...aForm,type:e.target.value})}>
                <option>Online</option><option>Presencial</option><option>Mixto</option>
              </select>
              <button style={base.redBtn} onClick={createAthlete}>Crear atleta</button>
            </div>}
            {athletes.map(a=>{
              const d=getDays(a.expiry);
              return <div key={a.id} style={base.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div><p style={{ fontWeight:800, fontSize:18, fontFamily:F }}>{a.name}</p><span style={tag("orange")}>{a.type}</span></div>
                  <span style={tag(d<15?"red":d<30?"orange":"green")}>{d} días</span>
                </div>
                <div style={base.grid2}>
                  {[["Plan",a.plan||"Sin plan"],["Vence",a.expiry||"—"],["Email",a.email],["Clave",a.password]].map(([l,v])=>(
                    <div key={l} style={{ background:"#0d0d0d", borderRadius:8, padding:10 }}><p style={base.h3}>{l}</p><p style={{ fontWeight:600, fontSize:13, fontFamily:F }}>{v}</p></div>
                  ))}
                </div>
                <button style={{...base.ghostBtn, marginTop:12, width:"100%", fontSize:12, color:RED, borderColor:`${RED}44`}} onClick={()=>delAthlete(a.id)}>Eliminar atleta</button>
              </div>;
            })}
          </>}

          {view==="plan" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h1 style={{...base.h1, marginBottom:0}}>Planificación</h1>
              <button style={{...base.redBtn, width:"auto", padding:"10px 16px", fontSize:13}} onClick={()=>setShowWF(!showWF)}>+ Agregar</button>
            </div>
            {showWF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo entrenamiento</h2>
              <label style={base.label}>Atleta</label>
              <select style={base.input} value={wForm.athlete_id} onChange={e=>setWForm({...wForm,athlete_id:e.target.value})}>
                <option value="">Seleccionar atleta</option>
                {athletes.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <label style={base.label}>Fecha</label>
              <input style={base.input} type="date" value={wForm.date} onChange={e=>setWForm({...wForm,date:e.target.value})} />
              <label style={base.label}>Título</label>
              <input style={base.input} value={wForm.title} onChange={e=>setWForm({...wForm,title:e.target.value})} placeholder="Ej: Upper Body Strength" />
              <label style={base.label}>Ejercicios (uno por línea)</label>
              <textarea style={{...base.input, height:120, resize:"vertical"}} value={wForm.exercises} onChange={e=>setWForm({...wForm,exercises:e.target.value})} placeholder={"Press de banca 4x8\nRemo con barra 4x8"} />
              <button style={base.redBtn} onClick={createWorkout}>Crear entrenamiento</button>
            </div>}
            {workouts.length===0 ? <div style={base.card}><p style={{ color:"#444", fontFamily:F }}>Sin entrenamientos aún.</p></div> : workouts.map(w=>(
              <div key={w.id} style={base.card}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <div><p style={{ fontWeight:800, fontSize:16, color:RED, textTransform:"uppercase", fontFamily:F }}>{w.title}</p><p style={{ color:"#666", fontSize:13, fontFamily:F }}>{w.users?.name} · {w.date}</p></div>
                  <span style={tag(w.done?"green":"orange")}>{w.done?"✓":"Pend."}</span>
                </div>
                {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb", fontSize:14, padding:"6px 0", borderBottom:"1px solid #1a1a1a", fontFamily:F }}>· {ex}</p>)}
              </div>
            ))}
          </>}

          {view==="horarios" && <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h1 style={{...base.h1, marginBottom:0}}>Horarios</h1>
              <button style={{...base.redBtn, width:"auto", padding:"10px 16px", fontSize:13}} onClick={()=>setShowSF(!showSF)}>+ Agregar</button>
            </div>
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
                  <div><p style={{ fontWeight:800, fontSize:18, textTransform:"uppercase", fontFamily:F }}>{sch.day}</p><p style={{ color:RED, fontSize:28, fontWeight:800, lineHeight:1, fontFamily:F }}>{sch.time}</p></div>
                  <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700, fontSize:22, fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
                </div>
                {sch.bookings?.length===0 ? <p style={{ color:"#444", fontSize:13, fontFamily:F }}>Sin reservas</p> : sch.bookings?.map(b=><p key={b.id} style={{ color:"#ccc", fontSize:14, padding:"3px 0", fontFamily:F }}>· {b.users?.name}</p>)}
                <button style={{...base.ghostBtn, marginTop:10, width:"100%", fontSize:12, color:RED, borderColor:`${RED}44`}} onClick={()=>delSchedule(sch.id)}>Eliminar</button>
              </div>
            ))}
          </>}

          {view==="mensajes" && <>
            <h1 style={{...base.h1, marginBottom:16}}>Mensajes</h1>
            <div style={base.card}>
              <label style={base.label}>Enviar a</label>
              <select style={base.input} value={selAthlete} onChange={e=>setSelAthlete(e.target.value)}>
                <option value="">Seleccionar atleta</option>
                {athletes.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <textarea style={{...base.input, height:90, resize:"vertical"}} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} />
              <button style={base.redBtn} onClick={sendMsg}>Enviar</button>
            </div>
            <div style={base.card}>
              <p style={base.h3}>Historial</p>
              {messages.slice().reverse().map(m=>(
                <div key={m.id} style={{ padding:"10px 0", borderBottom:"1px solid #1a1a1a" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontWeight:700, fontSize:12, color:RED, fontFamily:F }}>{m.from?.name} → {m.to?.name}</span>
                    <span style={{ color:"#444", fontSize:11, fontFamily:F }}>{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color:"#bbb", fontSize:14, fontFamily:F }}>{m.text}</p>
                </div>
              ))}
            </div>
          </>}
        </div>
        <div style={base.bottomNav}>
          {cv.map(v=>(
            <button key={v} style={base.navItem(view===v)} onClick={()=>setView(v)}>
              <span style={{ fontSize:20, marginBottom:2 }}>{ci[v]}</span>{cl[v]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ATLETA
  const daysLeft = getDays(user.expiry);
  const todayW = workouts.find(w=>w.date===selDate);
  const av = ["home","plan","agendar","mensajes"];
  const ai = { home:"🏠", plan:"📋", agendar:"📅", mensajes:"💬" };
  const al = { home:"Inicio", plan:"Mi Plan", agendar:"Agendar", mensajes:"Mensajes" };

  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <img src="/logo.png" alt="NSB" style={{ height:32 }} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#666", fontSize:13, fontFamily:F }}>{user.name.split(" ")[0]}</span>
          <button style={{...base.ghostBtn, padding:"6px 12px", fontSize:11}} onClick={logout}>Salir</button>
        </div>
      </div>
      <div style={base.main}>

        {view==="home" && <>
          <h1 style={base.h1}>Hola, <span style={{ color:RED }}>{user.name.split(" ")[0]}</span></h1>
          <p style={{ color:"#666", fontSize:14, marginBottom:16, fontFamily:F }}>Never Stop Building</p>
          {daysLeft<15 && <div style={{ background:"#1a0505", border:`1px solid ${RED}`, borderRadius:12, padding:14, marginBottom:12 }}>
            <p style={{ color:RED, fontWeight:700, fontSize:14, fontFamily:F }}>⚠ Tu plan vence en {daysLeft} días</p>
          </div>}
          <div style={base.grid2}>
            <div style={base.statCard(RED)}><p style={base.h3}>Plan</p><p style={{ fontWeight:700, fontSize:14, fontFamily:F }}>{user.plan||"Sin plan"}</p><p style={{ color:"#f97316", fontSize:12, fontFamily:F }}>{user.type}</p></div>
            <div style={base.statCard("#f97316")}><p style={base.h3}>Vence en</p><p style={{ fontSize:36, fontWeight:800, color:daysLeft<15?RED:daysLeft<30?"#f97316":"#22c55e", lineHeight:1, fontFamily:F }}>{daysLeft}</p><p style={{ color:"#666", fontSize:12, fontFamily:F }}>días</p></div>
            <div style={{...base.statCard("#22c55e"), gridColumn:"1 / -1"}}><p style={base.h3}>Completados</p><p style={{ fontSize:36, fontWeight:800, color:"#22c55e", lineHeight:1, fontFamily:F }}>{workouts.filter(w=>w.done).length} <span style={{ fontSize:14, color:"#666" }}>/ {workouts.length}</span></p></div>
          </div>
          <div style={base.card}>
            <h2 style={base.h2}>Entrenamiento de hoy</h2>
            {todayW ? <>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <p style={{ fontWeight:800, fontSize:16, color:RED, textTransform:"uppercase", fontFamily:F }}>{todayW.title}</p>
                <span style={tag(todayW.done?"green":"orange")}>{todayW.done?"✓":"Pend."}</span>
              </div>
              {todayW.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb", fontSize:15, padding:"8px 0", borderBottom:"1px solid #1a1a1a", fontFamily:F }}>{i+1}. {ex}</p>)}
              {!todayW.done && <button style={{...base.redBtn, marginTop:14}} onClick={()=>markDone(todayW.id)}>Marcar completado ✓</button>}
            </> : <p style={{ color:"#444", fontFamily:F }}>Sin entrenamiento para hoy.</p>}
          </div>
        </>}

        {view==="plan" && <>
          <h1 style={{...base.h1, marginBottom:16}}>Mi Planificación</h1>
          <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:8, marginBottom:16 }}>
            {weekDates.map((d,i)=>{
              const key=d.toISOString().split("T")[0];
              const w=workouts.find(ww=>ww.date===key);
              const isToday=key===new Date().toISOString().split("T")[0];
              return <div key={key} onClick={()=>setSelDate(key)} style={{ minWidth:52, background:selDate===key?"#1a0505":"#161616", border:selDate===key?`1px solid ${RED}`:isToday?`1px solid ${RED}44`:"1px solid #222", borderRadius:12, padding:"10px 6px", textAlign:"center", cursor:"pointer" }}>
                <p style={{ color:"#666", fontSize:10, textTransform:"uppercase", fontFamily:F }}>{"LunMarMiéJueViéSábDom".slice(i*3,i*3+3)}</p>
                <p style={{ fontWeight:800, fontSize:20, color:isToday?RED:"#fff", fontFamily:F }}>{d.getDate()}</p>
                <div style={{ width:8, height:8, borderRadius:"50%", background:!w?"#333":w.done?"#22c55e":"#f97316", margin:"4px auto 0" }} />
              </div>;
            })}
          </div>
          <div style={base.card}>
            {workouts.find(w=>w.date===selDate) ? (()=>{
              const w=workouts.find(ww=>ww.date===selDate);
              return <>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <p style={{ fontWeight:800, fontSize:18, color:RED, textTransform:"uppercase", fontFamily:F }}>{w.title}</p>
                  <span style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                </div>
                {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb", fontSize:15, padding:"10px 0", borderBottom:"1px solid #1a1a1a", fontFamily:F }}>{String(i+1).padStart(2,"0")}. {ex}</p>)}
                {!w.done && <button style={{...base.redBtn, marginTop:14}} onClick={()=>markDone(w.id)}>Marcar completado ✓</button>}
              </>;
            })() : <p style={{ color:"#444", textAlign:"center", padding:20, fontFamily:F }}>Sin entrenamiento para este día.</p>}
          </div>
        </>}

        {view==="agendar" && <>
          <h1 style={{...base.h1, marginBottom:16}}>Agendar Sesión</h1>
          {schedules.map(sch=>{
            const isMine=sch.bookings?.some(b=>b.athlete_id===user.id);
            const isFull=(sch.bookings?.length||0)>=sch.spots;
            return <div key={sch.id} style={{...base.card, border:isMine?`1px solid ${RED}`:"1px solid #222", background:isMine?"#1a0505":"#161616"}}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <div><p style={{ fontWeight:800, fontSize:18, textTransform:"uppercase", fontFamily:F }}>{sch.day}</p><p style={{ color:RED, fontSize:28, fontWeight:800, lineHeight:1, fontFamily:F }}>{sch.time}</p></div>
                <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700, fontSize:20, fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
              </div>
              <button style={{ ...(isMine?base.redBtn:base.ghostBtn), fontSize:13 }} onClick={()=>bookSlot(sch.id)} disabled={!isMine&&isFull}>
                {isMine?"✓ Reservado — Cancelar":isFull?"Sin cupos disponibles":"Reservar este horario"}
              </button>
            </div>;
          })}
        </>}

        {view==="mensajes" && <>
          <h1 style={{...base.h1, marginBottom:16}}>Mensajes</h1>
          <div style={base.card}>
            <p style={base.h3}>Escribirle al coach</p>
            <textarea style={{...base.input, height:100, resize:"vertical"}} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} />
            <button style={base.redBtn} onClick={sendMsg}>Enviar</button>
          </div>
          <div style={base.card}>
            <p style={base.h3}>Conversación</p>
            {messages.length===0 ? <p style={{ color:"#444", fontFamily:F }}>Sin mensajes aún.</p> : messages.slice().reverse().map(m=>(
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
