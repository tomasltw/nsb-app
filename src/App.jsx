import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xotytitxgpuuwqgeccih.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdHl0aXR4Z3B1dXdxZ2VjY2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTc0OTgsImV4cCI6MjA5MzA3MzQ5OH0.sGITzHaZ72OY8m5a6ulwHCpczcWWIjKmhDx2y8yJjNw"
);

const F = "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif";
const RED = "#FF0040";

const PULSE_STYLE = `
@keyframes nsb-pulse { 0%,100%{opacity:1} 50%{opacity:0.2} }
.p-red { animation: nsb-pulse 2.5s ease-in-out infinite; color: ${RED}; }
.p-orange { animation: nsb-pulse 2.8s ease-in-out infinite; color: #f97316; }
.p-green { animation: nsb-pulse 3s ease-in-out infinite; color: #22c55e; }
.p-purple { animation: nsb-pulse 3.2s ease-in-out infinite; color: #a855f7; }
.p-btn { animation: nsb-pulse 2s ease-in-out infinite; }
`;

const NSB_PLANS = [
  "NSB CROSSFIT RX","NSB CROSSFIT SCLD","NSB HÍBRIDO",
  "NSB FUNCIONAL","NSB HYROX","NSB GYM","NSB RUNNING","NSB AEROBIC"
];

const WEEKDAY_NAMES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const WEEKDAYS = ["D","L","M","M","J","V","S"];
const DAYS_ES = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
const SESSIONS_TOKENS = { 2:8, 3:12, 4:16, 5:20 };

const getDays = (d) => { if (!d) return 0; return Math.ceil((new Date(d) - new Date()) / 86400000); };
const getWeekdayFromDate = (dateStr) => WEEKDAY_NAMES[new Date(dateStr+"T12:00:00").getDay()];

const tag = (c) => ({
  display:"inline-block", padding:"4px 10px", borderRadius:6, fontSize:11,
  fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:F,
  background: c==="red"?`${RED}22`:c==="green"?"#22c55e22":c==="purple"?"#a855f722":"#f9731622",
  color: c==="red"?RED:c==="green"?"#22c55e":c==="purple"?"#a855f7":"#f97316",
  border:`1px solid ${c==="red"?`${RED}44`:c==="green"?"#22c55e44":c==="purple"?"#a855f744":"#f9731644"}`
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

function MonthCalendar({ workouts=[], selectedDate, onDayClick }) {
  const today = new Date();
  const [calDate, setCalDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const year = calDate.getFullYear(), month = calDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const todayKey = today.toISOString().split("T")[0];

  return (
    <div style={{ background:"#161616", border:"1px solid #222", borderRadius:16, padding:16, marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={()=>setCalDate(new Date(year,month-1,1))} style={{ background:"none",border:"none",color:"#fff",fontSize:26,cursor:"pointer",padding:"0 8px" }}>‹</button>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontWeight:800,fontSize:20,textTransform:"uppercase",fontFamily:F }}>{MONTHS[month]}</p>
          <p style={{ color:"#555",fontSize:13,fontFamily:F }}>{year}</p>
        </div>
        <button onClick={()=>setCalDate(new Date(year,month+1,1))} style={{ background:"none",border:"none",color:"#fff",fontSize:26,cursor:"pointer",padding:"0 8px" }}>›</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:6 }}>
        {WEEKDAYS.map((d,i)=><div key={i} style={{ textAlign:"center",fontSize:11,fontWeight:700,color:"#555",fontFamily:F }}>{d}</div>)}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth}).map((_,i)=>{
          const day=i+1;
          const key=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const ws=workouts.filter(w=>w.date===key);
          const isToday=key===todayKey, isSel=key===selectedDate;
          return (
            <div key={day} onClick={()=>onDayClick(key)} style={{ textAlign:"center",padding:"6px 2px",cursor:"pointer",borderRadius:10,background:isSel?RED:isToday?`${RED}22`:"transparent" }}>
              <p style={{ fontSize:16,fontWeight:isToday||isSel?800:400,color:isSel?"#fff":isToday?RED:"#fff",fontFamily:F,lineHeight:1,marginBottom:3 }}>{day}</p>
              <div style={{ display:"flex",justifyContent:"center",gap:2,minHeight:6 }}>
                {ws.slice(0,2).map((w,wi)=><div key={wi} style={{ width:6,height:6,borderRadius:"50%",background:w.done?"#22c55e":"#f97316" }}/>)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AthleteCard({ a, onClick }) {
  const d=getDays(a.expiry);
  const typeColor=a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7";
  const typeCls=a.type==="Online"?"p-red":a.type==="Presencial"?"p-orange":"p-purple";
  return (
    <div onClick={onClick} style={{...base.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
      <div style={{ width:44,height:44,borderRadius:"50%",background:`${typeColor}22`,border:`2px solid ${typeColor}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
        <span className={typeCls} style={{ fontWeight:800,fontSize:18,fontFamily:F }}>{a.name.charAt(0)}</span>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ fontWeight:800,fontSize:16,fontFamily:F }}>{a.name}</p>
        <p style={{ color:"#666",fontSize:12,fontFamily:F }}>{a.plan||"Sin plan"} · {a.tokens||0} tokens</p>
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <span className={d<15?"p-red":d<30?"p-orange":"p-green"} style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
        <span style={{ color:"#555",fontSize:18 }}>›</span>
      </div>
    </div>
  );
}

function AthleteProfile({ ath, workouts, athletes, tokenHistory, onBack, onRefresh, user }) {
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);
  const [showWF, setShowWF] = useState(false);
  const [showTF, setShowTF] = useState(false);
  const [showComment, setShowComment] = useState(null);
  const [wForm, setWForm] = useState({ title:"", exercises:"", date:selDate, athlete_ids:[ath.id], comment:"" });
  const [tForm, setTForm] = useState({ amount:"", reason:"" });
  const [commentText, setCommentText] = useState("");

  const aw = workouts.filter(w=>w.athlete_id===ath.id);
  const dayW = aw.filter(w=>w.date===selDate);
  const d = getDays(ath.expiry);
  const athHistory = tokenHistory.filter(th=>th.athlete_id===ath.id);
  const typeColor = ath.type==="Online"?RED:ath.type==="Presencial"?"#f97316":"#a855f7";
  const otherAthletes = athletes.filter(a=>a.id!==ath.id);

  const createWorkout = async () => {
    if (!wForm.title.trim()) return;
    const exArr = wForm.exercises.split("\n").filter(e=>e.trim());
    const ids = [...new Set([ath.id, ...wForm.athlete_ids])];
    for (const aid of ids) {
      const a = athletes.find(x=>x.id===aid)||ath;
      await supabase.from("workouts").insert({ title:wForm.title, exercises:exArr, date:wForm.date, athlete_id:aid, comment:wForm.comment });
      if ((a.tokens||0)>0) {
        await supabase.from("users").update({ tokens:(a.tokens||0)-1 }).eq("id",aid);
        await supabase.from("token_history").insert({ athlete_id:aid, amount:-1, reason:`Planificación: ${wForm.title} (${wForm.date})` });
      }
    }
    setShowWF(false);
    setWForm({ title:"", exercises:"", date:selDate, athlete_ids:[ath.id], comment:"" });
    onRefresh();
  };

  const adjustTokens = async () => {
    const amt = parseInt(tForm.amount);
    if (!amt||!tForm.reason) return;
    await supabase.from("users").update({ tokens:(ath.tokens||0)+amt }).eq("id",ath.id);
    await supabase.from("token_history").insert({ athlete_id:ath.id, amount:amt, reason:tForm.reason });
    setShowTF(false); setTForm({ amount:"", reason:"" }); onRefresh();
  };

  const addComment = async (wid) => {
    if (!commentText.trim()) return;
    await supabase.from("workouts").update({ comment:commentText }).eq("id",wid);
    setShowComment(null); setCommentText(""); onRefresh();
  };

  const toggleAthlete = (id) => {
    if (id===ath.id) return;
    const ids = wForm.athlete_ids.includes(id)
      ? wForm.athlete_ids.filter(x=>x!==id)
      : [...wForm.athlete_ids, id];
    setWForm({...wForm, athlete_ids:ids});
  };

  const selectedCount = wForm.athlete_ids.filter(id=>id!==ath.id).length;

  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:RED,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:F }}>← Volver</button>
        <span style={{ color:"#666",fontSize:13,fontFamily:F }}>{user.name}</span>
      </div>
      <div style={base.main}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
          <div>
            <h1 style={{...base.h1,marginBottom:4}}>{ath.name}</h1>
            <span style={tag(ath.type==="Online"?"red":ath.type==="Presencial"?"orange":"purple")}>{ath.type}</span>
            {ath.plan && <span style={{...tag("orange"),marginLeft:6}}>{ath.plan}</span>}
          </div>
          <span className={d<15?"p-red":d<30?"p-orange":"p-green"} style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
        </div>

        <div style={base.grid2}>
          <div style={base.statCard(typeColor)}><p style={base.h3}>Sesiones</p><p style={{ fontWeight:700,fontSize:14,fontFamily:F }}>{ath.sessions_per_week||3}x/sem</p></div>
          <div style={base.statCard("#a855f7")}><p style={base.h3}>Tokens</p><p className="p-purple" style={{ fontSize:36,fontWeight:800,lineHeight:1,fontFamily:F }}>{ath.tokens||0}</p></div>
          <div style={base.statCard("#f97316")}><p style={base.h3}>Pago</p><p style={{ fontWeight:700,fontSize:13,fontFamily:F }}>{ath.payment_date||"—"}</p></div>
          <div style={base.statCard("#22c55e")}><p style={base.h3}>Hechos</p><p className="p-green" style={{ fontSize:28,fontWeight:800,lineHeight:1,fontFamily:F }}>{aw.filter(w=>w.done).length}<span style={{ fontSize:13,color:"#666" }}>/{aw.length}</span></p></div>
        </div>

        {/* Tokens */}
        <div style={base.card}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showTF?12:0 }}>
            <p style={base.h3}>Tokens</p>
            <button style={{...base.redBtn,width:"auto",padding:"6px 12px",fontSize:12}} onClick={()=>setShowTF(!showTF)}>Ajustar</button>
          </div>
          {showTF && <>
            <label style={base.label}>Cantidad (+ o -)</label>
            <input style={base.input} type="number" placeholder="Ej: 4 o -2" value={tForm.amount} onChange={e=>setTForm({...tForm,amount:e.target.value})} />
            <label style={base.label}>Motivo</label>
            <input style={base.input} placeholder="Ej: Pago mensual" value={tForm.reason} onChange={e=>setTForm({...tForm,reason:e.target.value})} />
            <button style={base.redBtn} onClick={adjustTokens}>Confirmar</button>
          </>}
          {athHistory.slice(0,5).map(h=>(
            <div key={h.id} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1a1a1a" }}>
              <div><p style={{ fontSize:13,color:"#ccc",fontFamily:F }}>{h.reason}</p><p style={{ fontSize:11,color:"#555",fontFamily:F }}>{new Date(h.created_at).toLocaleDateString()}</p></div>
              <span style={{ fontWeight:800,color:h.amount>0?"#22c55e":RED,fontFamily:F }}>{h.amount>0?"+":""}{h.amount}</span>
            </div>
          ))}
        </div>

        {/* Calendario */}
        <MonthCalendar workouts={aw} selectedDate={selDate} onDayClick={(key)=>{ setSelDate(key); setWForm(f=>({...f,date:key})); }} />

        {/* Día */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <p style={{ fontWeight:700,fontSize:14,color:"#999",fontFamily:F }}>{selDate} · {getWeekdayFromDate(selDate)}</p>
          <button style={{...base.redBtn,width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>{ setWForm({title:"",exercises:"",date:selDate,athlete_ids:[ath.id],comment:""}); setShowWF(!showWF); }}>
            {showWF?"Cerrar":"+ Agregar"}
          </button>
        </div>

        {showWF && <div style={base.card}>
          <h2 style={base.h2}>Nueva planificación</h2>
          <label style={base.label}>Fecha</label>
          <input style={base.input} type="date" value={wForm.date} onChange={e=>setWForm({...wForm,date:e.target.value})} />
          <label style={base.label}>Título</label>
          <input style={base.input} value={wForm.title} onChange={e=>setWForm({...wForm,title:e.target.value})} placeholder="Ej: Upper Body Strength" />
          <label style={base.label}>Ejercicios (uno por línea)</label>
          <textarea style={{...base.input,height:140,resize:"vertical"}} value={wForm.exercises} onChange={e=>setWForm({...wForm,exercises:e.target.value})} placeholder={"Press de banca 4x8\nRemo con barra 4x8\nPress militar 3x10"} />
          <label style={base.label}>Nota para el atleta</label>
          <input style={base.input} value={wForm.comment} onChange={e=>setWForm({...wForm,comment:e.target.value})} placeholder="Ej: Enfocarse en técnica, descanso 90s" />

          {/* Lista de atletas SIEMPRE VISIBLE */}
          {otherAthletes.length > 0 && <>
            <label style={base.label}>
              Copiar también a{selectedCount > 0 && <span style={{ color:RED,marginLeft:6 }}>({selectedCount} seleccionados)</span>}
            </label>
            <div style={{ background:"#0d0d0d",borderRadius:10,padding:"4px 12px",marginBottom:12 }}>
              {otherAthletes.map(a=>{
                const selected = wForm.athlete_ids.includes(a.id);
                const typeColor = a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7";
                return (
                  <div key={a.id} onClick={()=>toggleAthlete(a.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #1a1a1a" }}>
                    <div style={{ width:24,height:24,borderRadius:6,border:`2px solid ${selected?RED:"#444"}`,background:selected?RED:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s" }}>
                      {selected&&<span style={{ color:"#fff",fontSize:14,fontWeight:800 }}>✓</span>}
                    </div>
                    <div style={{ width:34,height:34,borderRadius:"50%",background:`${typeColor}22`,border:`2px solid ${typeColor}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ color:typeColor,fontWeight:800,fontSize:15,fontFamily:F }}>{a.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:F,fontSize:15,fontWeight:700,color:selected?"#fff":"#ccc" }}>{a.name}</p>
                      <p style={{ fontFamily:F,fontSize:11,color:"#555" }}>{a.plan||"Sin plan"} · {a.type} · {a.tokens||0} tok</p>
                    </div>
                    {selected && <span className="p-red" style={{ fontSize:18 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </>}

          <button style={base.redBtn} onClick={createWorkout}>
            {wForm.athlete_ids.length > 1
              ? `Crear para ${wForm.athlete_ids.length} atletas`
              : "Crear entrenamiento"
            }
          </button>
        </div>}

        <div style={base.card}>
          {dayW.length===0
            ? <p style={{ color:"#444",textAlign:"center",padding:16,fontFamily:F }}>Sin planificación para este día.</p>
            : dayW.map(w=>(
              <div key={w.id} style={{ marginBottom:16,paddingBottom:16,borderBottom:"1px solid #1a1a1a" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <p className="p-red" style={{ fontWeight:800,fontSize:16,textTransform:"uppercase",fontFamily:F }}>{w.title}</p>
                  <span className={w.done?"p-green":"p-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                </div>
                {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb",fontSize:14,padding:"8px 0",borderBottom:"1px solid #111",fontFamily:F }}>{String(i+1).padStart(2,"0")}. {ex}</p>)}
                {w.comment&&<p style={{ color:"#f97316",fontSize:13,marginTop:8,fontStyle:"italic",fontFamily:F }}>💬 {w.comment}</p>}
                {showComment===w.id
                  ? <div style={{ marginTop:8 }}>
                      <input style={base.input} placeholder="Agregar nota..." value={commentText} onChange={e=>setCommentText(e.target.value)} />
                      <div style={{ display:"flex",gap:8 }}>
                        <button style={{...base.redBtn,padding:"10px"}} onClick={()=>addComment(w.id)}>Guardar</button>
                        <button style={{...base.ghostBtn,flex:1}} onClick={()=>setShowComment(null)}>Cancelar</button>
                      </div>
                    </div>
                  : <button style={{...base.ghostBtn,marginTop:8,fontSize:12,width:"100%"}} onClick={()=>{ setShowComment(w.id); setCommentText(w.comment||""); }}>
                      {w.comment?"Editar nota":"+ Agregar nota"}
                    </button>
                }
              </div>
            ))
          }
        </div>

        <div style={base.card}>
          <p style={base.h3}>Información</p>
          <div style={base.grid2}>
            {[["Email",ath.email],["Clave",ath.password],["Vence",ath.expiry||"—"],["Pago",ath.payment_date||"—"]].map(([l,v])=>(
              <div key={l} style={{ background:"#0d0d0d",borderRadius:8,padding:10 }}><p style={base.h3}>{l}</p><p style={{ fontWeight:600,fontSize:13,fontFamily:F }}>{v}</p></div>
            ))}
          </div>
          <button style={{...base.ghostBtn,marginTop:12,width:"100%",fontSize:12,color:RED,borderColor:`${RED}44`}} onClick={async()=>{ await supabase.from("users").delete().eq("id",ath.id); onBack(); onRefresh(); }}>Eliminar atleta</button>
        </div>
      </div>
    </div>
  );
}

function Chat({ user, partner, messages, onBack, onRefresh }) {
  const [newMsg, setNewMsg] = useState("");
  const conv = messages.filter(m=>(m.from_id===user.id&&m.to_id===partner.id)||(m.from_id===partner.id&&m.to_id===user.id));
  const send = async () => {
    if (!newMsg.trim()) return;
    await supabase.from("messages").insert({ from_id:user.id, to_id:partner.id, text:newMsg });
    setNewMsg(""); onRefresh();
  };
  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:RED,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:F }}>← Mensajes</button>
        <span style={{ fontWeight:700,fontFamily:F }}>{partner.name}</span>
        <span style={{ width:60 }}/>
      </div>
      <div style={{...base.main,paddingBottom:120}}>
        {conv.length===0
          ? <p style={{ color:"#444",textAlign:"center",padding:40,fontFamily:F }}>Sin mensajes aún.</p>
          : conv.map(m=>(
            <div key={m.id} style={{ display:"flex",justifyContent:m.from_id===user.id?"flex-end":"flex-start",marginBottom:10 }}>
              <div style={{ maxWidth:"75%",background:m.from_id===user.id?RED:"#222",borderRadius:14,padding:"10px 14px" }}>
                <p style={{ color:"#fff",fontSize:14,fontFamily:F }}>{m.text}</p>
                <p style={{ color:m.from_id===user.id?"#ff8fa8":"#555",fontSize:10,marginTop:4,fontFamily:F }}>{new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
              </div>
            </div>
          ))
        }
      </div>
      <div style={{ position:"fixed",bottom:0,left:0,right:0,background:"#111",borderTop:"1px solid #222",padding:12,display:"flex",gap:8 }}>
        <input style={{...base.input,marginBottom:0,flex:1}} placeholder="Escribe un mensaje..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} />
        <button className="p-btn" style={{...base.redBtn,width:"auto",padding:"14px 20px",marginBottom:0}} onClick={send}>→</button>
      </div>
    </div>
  );
}

function PlanView({ plan, athletes, onSelectAthlete, onBack }) {
  const planAthletes = athletes.filter(a=>a.plan===plan);
  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:RED,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:F }}>← Online</button>
        <span style={{ fontWeight:700,fontSize:14,fontFamily:F }}>{plan}</span>
        <span style={{ width:60 }}/>
      </div>
      <div style={base.main}>
        <h1 style={{...base.h1,marginBottom:4}}>{plan}</h1>
        <p style={{ color:"#666",fontSize:14,marginBottom:16,fontFamily:F }}>{planAthletes.length} atleta{planAthletes.length!==1?"s":""}</p>
        {planAthletes.length===0
          ? <div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas en este plan.</p></div>
          : planAthletes.map(a=><AthleteCard key={a.id} a={a} onClick={()=>onSelectAthlete(a)} />)
        }
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
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [showAF, setShowAF] = useState(false);
  const [aForm, setAForm] = useState({ name:"",email:"",password:"",plan:NSB_PLANS[0],expiry:"",payment_date:"",type:"Online",sessions_per_week:3 });
  const [showSF, setShowSF] = useState(false);
  const [sForm, setSForm] = useState({ day:"Lunes",time:"",spots:4 });
  const [presDate, setPresDate] = useState(new Date().toISOString().split("T")[0]);
  const [selDate, setSelDate] = useState(new Date().toISOString().split("T")[0]);
  const [athView, setAthView] = useState("plan");

  useEffect(()=>{ const s=document.createElement("style"); s.textContent=PULSE_STYLE; document.head.appendChild(s); return()=>document.head.removeChild(s); },[]);

  const load = async (u) => {
    if (u.role==="coach") {
      const {data:a}=await supabase.from("users").select("*").eq("role","athlete"); setAthletes(a||[]);
      const {data:s}=await supabase.from("schedules").select("*, bookings(*, users(*))"); setSchedules(s||[]);
      const {data:m}=await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at"); setMessages(m||[]);
      const {data:w}=await supabase.from("workouts").select("*, users(name)").order("date"); setWorkouts(w||[]);
      const {data:th}=await supabase.from("token_history").select("*").order("created_at",{ascending:false}); setTokenHistory(th||[]);
    } else {
      const {data:s}=await supabase.from("schedules").select("*, bookings(*, users(*))"); setSchedules(s||[]);
      const {data:m}=await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages((m||[]).filter(x=>x.from_id===u.id||x.to_id===u.id));
      const {data:w}=await supabase.from("workouts").select("*").eq("athlete_id",u.id).order("date"); setWorkouts(w||[]);
      const {data:th}=await supabase.from("token_history").select("*").eq("athlete_id",u.id).order("created_at",{ascending:false}); setTokenHistory(th||[]);
    }
  };

  const login = async () => {
    setLoading(true); setErr("");
    const {data,error}=await supabase.from("users").select("*").eq("email",email).eq("password",pw).single();
    if (error||!data) setErr("Email o contraseña incorrectos");
    else { setUser(data); load(data); }
    setLoading(false);
  };

  const logout = () => { setUser(null); setEmail(""); setPw(""); setView("home"); setSelectedAthlete(null); setSelectedPlan(null); setChatPartner(null); };
  const refresh = () => { if (user) load(user); };

  const createAthlete = async () => {
    const tokens = SESSIONS_TOKENS[aForm.sessions_per_week]||12;
    await supabase.from("users").insert({...aForm,role:"athlete",tokens,sessions_per_week:parseInt(aForm.sessions_per_week)});
    setShowAF(false); setAForm({name:"",email:"",password:"",plan:NSB_PLANS[0],expiry:"",payment_date:"",type:"Online",sessions_per_week:3}); load(user);
  };

  const createSchedule = async () => {
    await supabase.from("schedules").insert({...sForm,spots:parseInt(sForm.spots)});
    setShowSF(false); setSForm({day:"Lunes",time:"",spots:4}); load(user);
  };

  const bookSlot = async (sid) => {
    const sch=schedules.find(s=>s.id===sid);
    const mine=sch?.bookings?.find(b=>b.athlete_id===user?.id);
    if (mine) await supabase.from("bookings").delete().eq("id",mine.id);
    else await supabase.from("bookings").insert({schedule_id:sid,athlete_id:user?.id});
    load(user);
  };

  const markDone = async (id) => { await supabase.from("workouts").update({done:true}).eq("id",id); load(user); };

  if (!user) return (
    <div style={{ minHeight:"100vh",background:"#0a0a0a",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"20px",fontFamily:F }}>
      <div style={{ textAlign:"center",marginBottom:4 }}>
        <img src="/nsb_sin_fondo.png" alt="NSB" style={{ width:260,marginBottom:4 }} />
        <p style={{ color:"#555",letterSpacing:"0.3em",fontSize:13,textTransform:"uppercase",fontFamily:F }}>Never Stop Building</p>
      </div>
      <div style={{ background:"#0d0d0d",borderRadius:16,padding:"24px 20px",width:"100%",maxWidth:380 }}>
        <h2 style={{ fontSize:22,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:20,color:"#fff",fontFamily:F }}>Iniciar Sesión</h2>
        <label style={base.label}>Email</label>
        <input style={base.input} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e=>e.key==="Enter"&&login()} />
        <label style={base.label}>Contraseña</label>
        <input style={{...base.input,marginBottom:20}} type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
        {err&&<p style={{ color:RED,fontSize:13,marginBottom:12,fontFamily:F }}>{err}</p>}
        <button className="p-btn" style={base.redBtn} onClick={login} disabled={loading}>{loading?"Entrando...":"Entrar"}</button>
        <p style={{ color:"#555",fontSize:16,textAlign:"center",marginTop:16,fontStyle:"italic",fontFamily:F }}>tus metas merecen un plan real.</p>
      </div>
    </div>
  );

  if (user.role==="coach") {
    if (selectedAthlete) return <AthleteProfile ath={selectedAthlete} workouts={workouts} athletes={athletes} tokenHistory={tokenHistory} onBack={()=>setSelectedAthlete(null)} onRefresh={refresh} user={user} />;
    if (selectedPlan) return <PlanView plan={selectedPlan} athletes={athletes} onSelectAthlete={(a)=>{ setSelectedAthlete(a); setSelectedPlan(null); }} onBack={()=>setSelectedPlan(null)} />;
    if (chatPartner) return <Chat user={user} partner={chatPartner} messages={messages} onBack={()=>setChatPartner(null)} onRefresh={refresh} />;

    const onlineAthletes = athletes.filter(a=>a.type==="Online"||a.type==="Mixto");
    const presAthletes = athletes.filter(a=>a.type==="Presencial"||a.type==="Mixto");
    const cv = ["home","online","presencial","mensajes","info"];
    const ci = { home:"⚡",online:"💻",presencial:"🏋️",mensajes:"💬",info:"📋" };
    const cl = { home:"Inicio",online:"Online",presencial:"Presencial",mensajes:"Mensajes",info:"Info" };
    const activePlans = NSB_PLANS.filter(p=>athletes.some(a=>a.plan===p&&(a.type==="Online"||a.type==="Mixto")));
    const noPlanOnline = onlineAthletes.filter(a=>!NSB_PLANS.includes(a.plan));
    const presWeekday = getWeekdayFromDate(presDate);
    const filteredSchedules = schedules.filter(sch=>sch.day===presWeekday);

    return (
      <div style={base.app}>
        <div style={base.topBar}>
          <img src="/nsb_sin_fondo.png" alt="NSB" style={{ height:32 }} />
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ color:"#666",fontSize:13,fontFamily:F }}>{user.name}</span>
            <button style={{...base.ghostBtn,padding:"6px 12px",fontSize:11}} onClick={logout}>Salir</button>
          </div>
        </div>
        <div style={base.main}>

          {view==="home" && <>
            <h1 style={base.h1}>Dashboard</h1>
            <p style={{ color:"#666",fontSize:14,marginBottom:16,fontFamily:F }}>Panel de control NSB</p>
            <div style={base.grid2}>
              <div style={base.statCard(RED)}><p style={base.h3}>Online</p><p className="p-red" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{onlineAthletes.length}</p></div>
              <div style={base.statCard("#f97316")}><p style={base.h3}>Presencial</p><p className="p-orange" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{presAthletes.length}</p></div>
              <div style={base.statCard("#22c55e")}><p style={base.h3}>Planes</p><p className="p-green" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{workouts.length}</p></div>
              <div style={base.statCard("#a855f7")}><p style={base.h3}>Mensajes</p><p className="p-purple" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{messages.length}</p></div>
            </div>
            <div style={base.card}>
              <h2 style={base.h2}>Atletas recientes</h2>
              {athletes.slice(0,4).map(a=><AthleteCard key={a.id} a={a} onClick={()=>setSelectedAthlete(a)} />)}
            </div>
          </>}

          {view==="online" && <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h1 style={{...base.h1,marginBottom:0}}>Online</h1>
              <button style={{...base.redBtn,width:"auto",padding:"10px 16px",fontSize:13}} onClick={()=>setShowAF(!showAF)}>+ Agregar</button>
            </div>
            {showAF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo atleta</h2>
              {[["Nombre","name","text","Nombre completo"],["Email","email","email","email@ejemplo.com"],["Contraseña","password","text","Contraseña"]].map(([l,k,t,ph])=>(
                <div key={k}><label style={base.label}>{l}</label><input style={base.input} type={t} value={aForm[k]} onChange={e=>setAForm({...aForm,[k]:e.target.value})} placeholder={ph} /></div>
              ))}
              <label style={base.label}>Plan NSB</label>
              <select style={base.input} value={aForm.plan} onChange={e=>setAForm({...aForm,plan:e.target.value})}>
                {NSB_PLANS.map(p=><option key={p}>{p}</option>)}
              </select>
              <label style={base.label}>Vencimiento</label>
              <input style={base.input} type="date" value={aForm.expiry} onChange={e=>setAForm({...aForm,expiry:e.target.value})} />
              <label style={base.label}>Fecha de pago</label>
              <input style={base.input} type="date" value={aForm.payment_date} onChange={e=>setAForm({...aForm,payment_date:e.target.value})} />
              <label style={base.label}>Sesiones por semana</label>
              <select style={base.input} value={aForm.sessions_per_week} onChange={e=>setAForm({...aForm,sessions_per_week:parseInt(e.target.value)})}>
                <option value={2}>2x semana — 8 tokens/mes</option>
                <option value={3}>3x semana — 12 tokens/mes</option>
                <option value={4}>4x semana — 16 tokens/mes</option>
                <option value={5}>5x semana — 20 tokens/mes</option>
              </select>
              <label style={base.label}>Tipo</label>
              <select style={base.input} value={aForm.type} onChange={e=>setAForm({...aForm,type:e.target.value})}>
                <option>Online</option><option>Mixto</option>
              </select>
              <button style={base.redBtn} onClick={createAthlete}>Crear atleta</button>
            </div>}
            {activePlans.map(plan=>{
              const planAthletes = onlineAthletes.filter(a=>a.plan===plan);
              return (
                <div key={plan} onClick={()=>setSelectedPlan(plan)} style={{...base.card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,borderLeft:`3px solid ${RED}`}}>
                  <div>
                    <p className="p-red" style={{ fontWeight:800,fontSize:16,fontFamily:F }}>{plan}</p>
                    <p style={{ color:"#666",fontSize:13,fontFamily:F }}>{planAthletes.length} atleta{planAthletes.length!==1?"s":""}</p>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ display:"flex",gap:3 }}>
                      {planAthletes.slice(0,4).map(a=><div key={a.id} style={{ width:8,height:8,borderRadius:"50%",background:RED }}/>)}
                    </div>
                    <span style={{ color:"#555",fontSize:20 }}>›</span>
                  </div>
                </div>
              );
            })}
            {noPlanOnline.length>0 && <>
              <p style={{ color:"#555",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F,marginBottom:8 }}>Sin plan asignado</p>
              {noPlanOnline.map(a=><AthleteCard key={a.id} a={a} onClick={()=>setSelectedAthlete(a)} />)}
            </>}
            {onlineAthletes.length===0&&!showAF&&<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas online aún.</p></div>}
          </>}

          {view==="presencial" && <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h1 style={{...base.h1,marginBottom:0}}>Presencial</h1>
              <button style={{...base.redBtn,width:"auto",padding:"10px 16px",fontSize:13}} onClick={()=>setShowAF(!showAF)}>+ Agregar</button>
            </div>
            {showAF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo atleta</h2>
              {[["Nombre","name","text","Nombre completo"],["Email","email","email","email@ejemplo.com"],["Contraseña","password","text","Contraseña"],["Plan","plan","text","Ej: NSB Presencial"]].map(([l,k,t,ph])=>(
                <div key={k}><label style={base.label}>{l}</label><input style={base.input} type={t} value={aForm[k]} onChange={e=>setAForm({...aForm,[k]:e.target.value})} placeholder={ph} /></div>
              ))}
              <label style={base.label}>Vencimiento</label>
              <input style={base.input} type="date" value={aForm.expiry} onChange={e=>setAForm({...aForm,expiry:e.target.value})} />
              <label style={base.label}>Fecha de pago</label>
              <input style={base.input} type="date" value={aForm.payment_date} onChange={e=>setAForm({...aForm,payment_date:e.target.value})} />
              <label style={base.label}>Sesiones por semana</label>
              <select style={base.input} value={aForm.sessions_per_week} onChange={e=>setAForm({...aForm,sessions_per_week:parseInt(e.target.value)})}>
                <option value={2}>2x semana — 8 tokens/mes</option>
                <option value={3}>3x semana — 12 tokens/mes</option>
                <option value={4}>4x semana — 16 tokens/mes</option>
                <option value={5}>5x semana — 20 tokens/mes</option>
              </select>
              <label style={base.label}>Tipo</label>
              <select style={base.input} value={aForm.type} onChange={e=>setAForm({...aForm,type:e.target.value})}>
                <option>Presencial</option><option>Mixto</option>
              </select>
              <button style={base.redBtn} onClick={createAthlete}>Crear atleta</button>
            </div>}
            <MonthCalendar workouts={[]} selectedDate={presDate} onDayClick={setPresDate} />
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <div>
                <p style={{ fontWeight:800,fontSize:16,color:"#fff",fontFamily:F }}>{presWeekday}</p>
                <p style={{ color:"#555",fontSize:12,fontFamily:F }}>{presDate}</p>
              </div>
              <button style={{...base.redBtn,width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>setShowSF(!showSF)}>+ Horario</button>
            </div>
            {showSF && <div style={base.card}>
              <h2 style={base.h2}>Nuevo horario</h2>
              <label style={base.label}>Día</label>
              <select style={base.input} value={sForm.day} onChange={e=>setSForm({...sForm,day:e.target.value})}>{DAYS_ES.map(d=><option key={d}>{d}</option>)}</select>
              <label style={base.label}>Hora</label>
              <input style={base.input} type="time" value={sForm.time} onChange={e=>setSForm({...sForm,time:e.target.value})} />
              <label style={base.label}>Cupos</label>
              <input style={base.input} type="number" value={sForm.spots} onChange={e=>setSForm({...sForm,spots:e.target.value})} />
              <button style={base.redBtn} onClick={createSchedule}>Crear horario</button>
            </div>}
            {filteredSchedules.length===0
              ? <div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin horarios para el {presWeekday}.</p></div>
              : filteredSchedules.map(sch=>(
                <div key={sch.id} style={base.card}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <div><p style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",fontFamily:F }}>{sch.day}</p><p className="p-red" style={{ fontSize:28,fontWeight:800,lineHeight:1,fontFamily:F }}>{sch.time}</p></div>
                    <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700,fontSize:22,fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
                  </div>
                  {sch.bookings?.length===0?<p style={{ color:"#444",fontSize:13,fontFamily:F }}>Sin reservas</p>:sch.bookings?.map(b=><p key={b.id} style={{ color:"#ccc",fontSize:14,padding:"3px 0",fontFamily:F }}>· {b.users?.name}</p>)}
                  <button style={{...base.ghostBtn,marginTop:10,width:"100%",fontSize:12,color:RED,borderColor:`${RED}44`}} onClick={async()=>{ await supabase.from("schedules").delete().eq("id",sch.id); load(user); }}>Eliminar</button>
                </div>
              ))
            }
            <div style={{ marginTop:16 }}>
              <h2 style={base.h2}>Atletas Presencial</h2>
              {presAthletes.length===0
                ? <div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas presenciales aún.</p></div>
                : presAthletes.map(a=><AthleteCard key={a.id} a={a} onClick={()=>setSelectedAthlete(a)} />)
              }
            </div>
          </>}

          {view==="mensajes" && <>
            <h1 style={{...base.h1,marginBottom:16}}>Mensajes</h1>
            {athletes.length===0
              ? <div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas aún.</p></div>
              : athletes.map(a=>{
                const conv=messages.filter(m=>(m.from_id===user.id&&m.to_id===a.id)||(m.from_id===a.id&&m.to_id===user.id));
                const last=conv[conv.length-1];
                const typeColor=a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7";
                const typeCls=a.type==="Online"?"p-red":a.type==="Presencial"?"p-orange":"p-purple";
                return (
                  <div key={a.id} onClick={()=>setChatPartner(a)} style={{...base.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                    <div style={{ width:44,height:44,borderRadius:"50%",background:`${typeColor}22`,border:`2px solid ${typeColor}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span className={typeCls} style={{ fontWeight:800,fontSize:18,fontFamily:F }}>{a.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontWeight:800,fontSize:15,fontFamily:F }}>{a.name}</p>
                      <p style={{ color:"#555",fontSize:13,fontFamily:F,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{last?last.text:"Sin mensajes aún"}</p>
                    </div>
                    <span style={{ color:"#555",fontSize:18 }}>›</span>
                  </div>
                );
              })
            }
          </>}

          {view==="info" && <>
            <h1 style={{...base.h1,marginBottom:4}}>Políticas</h1>
            <p style={{ color:"#666",fontSize:13,marginBottom:16,fontFamily:F }}>NSB Planning — Never Stop Building</p>
            {[
              { title:"Presencial",color:RED,cls:"p-red",items:["Las clases agendadas y no asistidas son recuperables, hasta 2 por mes.","Las cancelaciones deben realizarse con 24 horas de anticipación.","Si no cancelas a tiempo, la clase se descuenta del plan.","Los horarios se reservan con antelación desde la app.","El plan mensual no se congela ni se extiende por inasistencias."]},
              { title:"Online",color:"#f97316",cls:"p-orange",items:["Las planificaciones se suben semanalmente a la app.","Tienes 24 horas para consultar dudas sobre tu entrenamiento.","El seguimiento se realiza a través de la app cada semana.","Los materiales de apoyo se envían por mensaje interno."]},
              { title:"Mixto",color:"#a855f7",cls:"p-purple",items:["Combina sesiones presenciales y planificación online.","Las políticas presenciales aplican para las clases en persona.","La parte online sigue las políticas del plan online."]},
              { title:"General",color:"#22c55e",cls:"p-green",items:["El pago es mensual y debe realizarse antes del inicio del período.","El plan vence en la fecha indicada sin importar el uso.","Cada sesión subida descuenta 1 token del plan.","Los tokens se recargan al inicio de cada período pagado."]}
            ].map(sec=>(
              <div key={sec.title} style={{...base.card,borderLeft:`3px solid ${sec.color}`}}>
                <p className={sec.cls} style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",marginBottom:12,fontFamily:F }}>{sec.title}</p>
                {sec.items.map((item,i)=>(
                  <div key={i} style={{ display:"flex",gap:10,marginBottom:8 }}>
                    <span style={{ color:sec.color,fontWeight:800 }}>·</span>
                    <p style={{ color:"#ccc",fontSize:14,fontFamily:F,lineHeight:1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            ))}
          </>}

        </div>
        <div style={base.bottomNav}>
          {cv.map(v=>(
            <button key={v} style={base.navItem(view===v)} onClick={()=>{ setView(v); setSelectedAthlete(null); setSelectedPlan(null); setChatPartner(null); }}>
              <span style={{ fontSize:20,marginBottom:2 }}>{ci[v]}</span>{cl[v]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ATLETA
  const daysLeft = getDays(user.expiry);
  const isOnline = user.type==="Online";
  const isPres = user.type==="Presencial";
  const isMixto = user.type==="Mixto";
  const dayWorkouts = workouts.filter(w=>w.date===selDate);
  const athWeekday = getWeekdayFromDate(selDate);
  const athSchedules = schedules.filter(sch=>sch.day===athWeekday);

  if (chatPartner) return <Chat user={user} partner={chatPartner} messages={messages} onBack={()=>setChatPartner(null)} onRefresh={refresh} />;

  const av = isOnline?["plan","mensajes","info"]:isPres?["agendar","mensajes","info"]:["plan","agendar","mensajes","info"];
  const ai = { plan:"📋",agendar:"📅",mensajes:"💬",info:"📋" };
  const al = { plan:"Mi Plan",agendar:"Agendar",mensajes:"Mensajes",info:"Info" };

  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <img src="/nsb_sin_fondo.png" alt="NSB" style={{ height:32 }} />
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ color:"#666",fontSize:13,fontFamily:F }}>{user.name.split(" ")[0]}</span>
          <button style={{...base.ghostBtn,padding:"6px 12px",fontSize:11}} onClick={logout}>Salir</button>
        </div>
      </div>
      <div style={base.main}>

        {(athView==="plan"||athView==="agendar") && <div style={{ display:"flex",gap:8,marginBottom:12,overflowX:"auto",paddingBottom:4 }}>
          <div style={{...base.statCard("#a855f7"),minWidth:90,flexShrink:0}}><p style={base.h3}>Tokens</p><p className="p-purple" style={{ fontSize:26,fontWeight:800,lineHeight:1,fontFamily:F }}>{user.tokens||0}</p></div>
          <div style={{...base.statCard(daysLeft<15?RED:"#22c55e"),minWidth:90,flexShrink:0}}><p style={base.h3}>Vence</p><p className={daysLeft<15?"p-red":"p-green"} style={{ fontSize:26,fontWeight:800,lineHeight:1,fontFamily:F }}>{daysLeft}d</p></div>
          <div style={{...base.statCard("#f97316"),minWidth:110,flexShrink:0}}><p style={base.h3}>Pago</p><p style={{ fontWeight:700,fontSize:12,fontFamily:F }}>{user.payment_date||"—"}</p></div>
        </div>}

        {athView==="plan" && <>
          <h1 style={{...base.h1,marginBottom:16}}>Mi Planificación</h1>
          <MonthCalendar workouts={workouts} selectedDate={selDate} onDayClick={setSelDate} />
          <div style={base.card}>
            <p style={{ fontWeight:700,fontSize:14,color:"#999",marginBottom:12,fontFamily:F }}>{selDate} · {athWeekday}</p>
            {dayWorkouts.length>0 ? dayWorkouts.map(w=>(
              <div key={w.id} style={{ marginBottom:16,paddingBottom:16,borderBottom:"1px solid #1a1a1a" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <p className="p-red" style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",fontFamily:F }}>{w.title}</p>
                  <span className={w.done?"p-green":"p-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                </div>
                {w.exercises?.map((ex,i)=><p key={i} style={{ color:"#bbb",fontSize:15,padding:"10px 0",borderBottom:"1px solid #111",fontFamily:F }}>{String(i+1).padStart(2,"0")}. {ex}</p>)}
                {w.comment&&<p style={{ color:"#f97316",fontSize:13,marginTop:8,fontStyle:"italic",fontFamily:F }}>💬 {w.comment}</p>}
                {!w.done&&<button className="p-btn" style={{...base.redBtn,marginTop:14}} onClick={()=>markDone(w.id)}>Marcar completado ✓</button>}
              </div>
            )) : <p style={{ color:"#444",textAlign:"center",padding:20,fontFamily:F }}>Sin planificación para este día.</p>}
          </div>
        </>}

        {athView==="agendar" && <>
          <h1 style={{...base.h1,marginBottom:16}}>Agendar Sesión</h1>
          <MonthCalendar workouts={[]} selectedDate={selDate} onDayClick={setSelDate} />
          <div style={{ marginBottom:12 }}>
            <p style={{ fontWeight:800,fontSize:16,fontFamily:F }}>{athWeekday}</p>
            <p style={{ color:"#555",fontSize:12,fontFamily:F }}>{selDate}</p>
          </div>
          {athSchedules.length===0
            ? <div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin horarios disponibles para el {athWeekday}.</p></div>
            : athSchedules.map(sch=>{
              const isMine=sch.bookings?.some(b=>b.athlete_id===user.id);
              const isFull=(sch.bookings?.length||0)>=sch.spots;
              return <div key={sch.id} style={{...base.card,border:isMine?`1px solid ${RED}`:"1px solid #222",background:isMine?"#1a0505":"#161616"}}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <div><p style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",fontFamily:F }}>{sch.day}</p><p className="p-red" style={{ fontSize:28,fontWeight:800,lineHeight:1,fontFamily:F }}>{sch.time}</p></div>
                  <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700,fontSize:20,fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
                </div>
                <button className={isMine?"p-btn":""} style={{ ...(isMine?base.redBtn:base.ghostBtn),fontSize:13 }} onClick={()=>bookSlot(sch.id)} disabled={!isMine&&isFull}>
                  {isMine?"✓ Reservado — Cancelar":isFull?"Sin cupos disponibles":"Reservar este horario"}
                </button>
              </div>;
            })
          }
        </>}

        {athView==="mensajes" && <>
          <h1 style={{...base.h1,marginBottom:16}}>Mensajes</h1>
          {(()=>{
            const coachMsg = messages.find(m=>m.from_id!==user.id)||messages.find(m=>m.to_id!==user.id);
            const coachId = coachMsg?.from_id!==user.id?coachMsg?.from_id:coachMsg?.to_id;
            const coachName = messages.find(m=>m.from_id!==user.id)?.from?.name||"Coach NSB";
            return (
              <div onClick={()=>setChatPartner({id:coachId,name:coachName})} style={{...base.card,cursor:"pointer",display:"flex",alignItems:"center",gap:12}}>
                <div style={{ width:44,height:44,borderRadius:"50%",background:`${RED}22`,border:`2px solid ${RED}44`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  <span className="p-red" style={{ fontWeight:800,fontSize:18,fontFamily:F }}>C</span>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800,fontSize:15,fontFamily:F }}>{coachName}</p>
                  <p style={{ color:"#555",fontSize:13,fontFamily:F }}>{messages.length>0?messages[messages.length-1]?.text:"Sin mensajes aún"}</p>
                </div>
                <span style={{ color:"#555",fontSize:18 }}>›</span>
              </div>
            );
          })()}
        </>}

        {athView==="info" && <>
          <h1 style={{...base.h1,marginBottom:4}}>Políticas</h1>
          <p style={{ color:"#666",fontSize:13,marginBottom:16,fontFamily:F }}>NSB Planning — Never Stop Building</p>
          {[
            { title:"Presencial",color:RED,cls:"p-red",show:isPres||isMixto,items:["Clases no asistidas recuperables hasta 2 por mes.","Cancelaciones con 24 horas de anticipación.","Sin cancelación a tiempo, la clase se descuenta.","Horarios reservables desde la app."]},
            { title:"Online",color:"#f97316",cls:"p-orange",show:isOnline||isMixto,items:["Planificaciones subidas semanalmente a la app.","24 horas para consultar dudas de tu entrenamiento.","Seguimiento semanal a través de la app."]},
            { title:"General",color:"#22c55e",cls:"p-green",show:true,items:["Pago mensual antes del inicio del período.","El plan vence en la fecha indicada.","Cada sesión descuenta 1 token del plan.","Los tokens se recargan al inicio de cada período pagado."]}
          ].filter(s=>s.show).map(sec=>(
            <div key={sec.title} style={{...base.card,borderLeft:`3px solid ${sec.color}`}}>
              <p className={sec.cls} style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",marginBottom:12,fontFamily:F }}>{sec.title}</p>
              {sec.items.map((item,i)=>(
                <div key={i} style={{ display:"flex",gap:10,marginBottom:8 }}>
                  <span style={{ color:sec.color,fontWeight:800 }}>·</span>
                  <p style={{ color:"#ccc",fontSize:14,fontFamily:F,lineHeight:1.5 }}>{item}</p>
                </div>
              ))}
            </div>
          ))}
        </>}

      </div>
      <div style={base.bottomNav}>
        {av.map(v=>(
          <button key={v} style={base.navItem(athView===v)} onClick={()=>setAthView(v)}>
            <span style={{ fontSize:20,marginBottom:2 }}>{ai[v]}</span>{al[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
