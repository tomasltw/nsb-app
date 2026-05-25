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
const EQUIPMENT_OPTIONS = ["Box CrossFit completo","Gym completo","Home gym con barra","Home gym básico","Sin equipamiento","Otro"];

const todayLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const getDays = (d) => {
  if (!d) return 0;
  const today = new Date(todayLocal()+"T00:00:00");
  const target = new Date(d+"T00:00:00");
  return Math.ceil((target-today)/86400000);
};
const getWeekdayFromDate = (dateStr) => WEEKDAY_NAMES[new Date(dateStr+"T12:00:00").getDay()];
const calcExpiry = (startDate) => {
  if (!startDate) return null;
  const d = new Date(startDate+"T12:00:00");
  d.setDate(d.getDate()+30);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const getPaymentDates = (startDate, monthsAhead=6) => {
  if (!startDate) return [];
  const dates = [];
  const base = new Date(startDate+"T12:00:00");
  for (let i=0; i<=monthsAhead*2; i++) {
    const d = new Date(base);
    d.setDate(d.getDate()+i*30);
    dates.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
  }
  return dates;
};
const getExercisesText = (w) => {
  if (w.exercises_raw) return w.exercises_raw;
  if (w.exercises && Array.isArray(w.exercises)) return w.exercises.join("\n");
  return "";
};
const formatTime = (secs) => {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};
const parseTime = (str) => {
  if (!str || !str.trim()) return null;
  const parts = str.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  const n = parseInt(str);
  return isNaN(n) ? null : n * 60;
};

const AFORM_ONLINE = { name:"",email:"",password:"",plan:NSB_PLANS[0],start_date:"",tipo_mixto:false,sessions_per_week:3 };
const AFORM_PRES   = { name:"",email:"",password:"",plan:"",start_date:"",tipo_mixto:false,sessions_per_week:3 };
const EMPTY_QFORM  = {
  training_days_per_week:3, equipment:"", has_running_space:false, goals:"",
  snatch:"", clean_and_jerk:"", clean:"", front_squat:"", back_squat:"",
  deadlift:"", overhead_squat:"", pull_ups:"", muscle_ups:"", handstand_pushups:"",
  time_5km:"", time_10km:"", time_21km:"", max_pushups:"", notes:""
};

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

function MonthCalendar({ workouts=[], selectedDate, onDayClick, paymentDates=[], expiryDate="" }) {
  const today = todayLocal();
  const [calDate, setCalDate] = useState(()=>{ const d=new Date(today+"T12:00:00"); return new Date(d.getFullYear(),d.getMonth(),1); });
  const year=calDate.getFullYear(), month=calDate.getMonth();
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  return (
    <div style={{ background:"#161616",border:"1px solid #222",borderRadius:16,padding:16,marginBottom:12 }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <button onClick={()=>setCalDate(new Date(year,month-1,1))} style={{ background:"none",border:"none",color:"#fff",fontSize:26,cursor:"pointer",padding:"0 8px" }}>‹</button>
        <div style={{ textAlign:"center" }}>
          <p style={{ fontWeight:800,fontSize:20,textTransform:"uppercase",fontFamily:F }}>{MONTHS[month]}</p>
          <p style={{ color:"#555",fontSize:13,fontFamily:F }}>{year}</p>
        </div>
        <button onClick={()=>setCalDate(new Date(year,month+1,1))} style={{ background:"none",border:"none",color:"#fff",fontSize:26,cursor:"pointer",padding:"0 8px" }}>›</button>
      </div>
      <div style={{ display:"flex",gap:12,marginBottom:10,flexWrap:"wrap" }}>
        <div style={{ display:"flex",alignItems:"center",gap:4 }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#f97316" }}/><span style={{ fontSize:10,color:"#666",fontFamily:F }}>Pendiente</span></div>
        <div style={{ display:"flex",alignItems:"center",gap:4 }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#22c55e" }}/><span style={{ fontSize:10,color:"#666",fontFamily:F }}>Completado</span></div>
        <div style={{ display:"flex",alignItems:"center",gap:4 }}><div style={{ width:8,height:8,borderRadius:"50%",background:"#a855f7" }}/><span style={{ fontSize:10,color:"#666",fontFamily:F }}>Pago</span></div>
        {expiryDate&&<div style={{ display:"flex",alignItems:"center",gap:4 }}><div style={{ width:8,height:8,borderRadius:2,background:RED }}/><span style={{ fontSize:10,color:"#666",fontFamily:F }}>Vence</span></div>}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6 }}>
        {WEEKDAYS.map((d,i)=><div key={i} style={{ textAlign:"center",fontSize:11,fontWeight:700,color:"#555",fontFamily:F }}>{d}</div>)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2 }}>
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth}).map((_,i)=>{
          const day=i+1;
          const key=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const ws=workouts.filter(w=>w.date===key);
          const isToday=key===today, isSel=key===selectedDate;
          const isPayment=paymentDates.includes(key), isExpiry=key===expiryDate;
          return (
            <div key={day} onClick={()=>onDayClick(key)} style={{ textAlign:"center",padding:"4px 2px",cursor:"pointer",borderRadius:10,background:isSel?RED:isToday?`${RED}22`:isExpiry?`${RED}11`:isPayment?"#a855f711":"transparent",border:isExpiry?`1px solid ${RED}44`:isPayment?"1px solid #a855f744":"1px solid transparent" }}>
              <p style={{ fontSize:15,fontWeight:isToday||isSel||isPayment||isExpiry?800:400,color:isSel?"#fff":isToday?RED:isExpiry?RED:isPayment?"#a855f7":"#fff",fontFamily:F,lineHeight:1,marginBottom:2 }}>{day}</p>
              <div style={{ display:"flex",justifyContent:"center",gap:1,minHeight:6 }}>
                {ws.slice(0,2).map((w,wi)=><div key={wi} style={{ width:5,height:5,borderRadius:"50%",background:w.done?"#22c55e":"#f97316" }}/>)}
                {isPayment&&!isSel&&<div style={{ width:5,height:5,borderRadius:"50%",background:"#a855f7" }}/>}
                {isExpiry&&!isSel&&<div style={{ width:5,height:5,borderRadius:1,background:RED }}/>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AthleteCard({ a, onClick }) {
  const expiry=a.start_date?calcExpiry(a.start_date):a.expiry;
  const d=getDays(expiry);
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
  const [selDate, setSelDate] = useState(todayLocal());
  const [showWF, setShowWF] = useState(false);
  const [showTF, setShowTF] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editW, setEditW] = useState(null);
  const [wForm, setWForm] = useState({ title:"", exercises:"", date:todayLocal(), athlete_ids:[ath.id], comment:"" });
  const [tForm, setTForm] = useState({ amount:"", reason:"" });
  const [eForm, setEForm] = useState({
    name:ath.name, email:ath.email, password:ath.password,
    plan:ath.plan||"", start_date:ath.start_date||"",
    sessions_per_week:ath.sessions_per_week||3, type:ath.type||"Online"
  });
  const [athProfile, setAthProfile] = useState(null);

  useEffect(()=>{
    supabase.from("athlete_profile").select("*").eq("athlete_id",ath.id).single().then(({data})=>{ if (data) setAthProfile(data); });
  },[ath.id]);

  const expiry=ath.start_date?calcExpiry(ath.start_date):ath.expiry;
  const paymentDates=getPaymentDates(ath.start_date,6);
  const aw=workouts.filter(w=>w.athlete_id===ath.id);
  const dayW=aw.filter(w=>w.date===selDate);
  const d=getDays(expiry);
  const athHistory=tokenHistory.filter(th=>th.athlete_id===ath.id);
  const typeColor=ath.type==="Online"?RED:ath.type==="Presencial"?"#f97316":"#a855f7";
  const otherAthletes=athletes.filter(a=>a.id!==ath.id);
  const selectedCount=wForm.athlete_ids.filter(id=>id!==ath.id).length;
  const today=todayLocal();
  const nextPayment=paymentDates.find(d=>d>=today);

  const createWorkout=async()=>{
    if (!wForm.title.trim()) return;
    const rawText=wForm.exercises;
    const exArr=rawText.split("\n").filter(e=>e.trim());
    const ids=[...new Set([ath.id,...wForm.athlete_ids])];
    for (const aid of ids) {
      const a=athletes.find(x=>x.id===aid)||ath;
      await supabase.from("workouts").insert({ title:wForm.title, exercises:exArr, exercises_raw:rawText, date:wForm.date, athlete_id:aid, comment:wForm.comment });
      if ((a.tokens||0)>0) {
        await supabase.from("users").update({ tokens:(a.tokens||0)-1 }).eq("id",aid);
        await supabase.from("token_history").insert({ athlete_id:aid, amount:-1, reason:`Planificación: ${wForm.title} (${wForm.date})` });
      }
      if (user?.id) await supabase.from("messages").insert({ from_id:user.id, to_id:aid, text:`📋 Tu planificación del ${wForm.date} está lista — ${wForm.title}` });
    }
    setShowWF(false); setWForm({ title:"", exercises:"", date:selDate, athlete_ids:[ath.id], comment:"" }); onRefresh();
  };

  const saveEditWorkout=async()=>{
    if (!editW) return;
    const rawText=editW.exercises_text;
    const exArr=rawText.split("\n").filter(e=>e.trim());
    await supabase.from("workouts").update({ title:editW.title, exercises:exArr, exercises_raw:rawText, comment:editW.comment }).eq("id",editW.id);
    if (editW.extra_ids?.length>0) {
      for (const aid of editW.extra_ids) {
        const a=athletes.find(x=>x.id===aid);
        await supabase.from("workouts").insert({ title:editW.title, exercises:exArr, exercises_raw:rawText, date:editW.date, athlete_id:aid, comment:editW.comment });
        if (a&&(a.tokens||0)>0) {
          await supabase.from("users").update({ tokens:(a.tokens||0)-1 }).eq("id",aid);
          await supabase.from("token_history").insert({ athlete_id:aid, amount:-1, reason:`Planificación: ${editW.title} (${editW.date})` });
        }
        if (user?.id) await supabase.from("messages").insert({ from_id:user.id, to_id:aid, text:`📋 Tu planificación del ${editW.date} está lista — ${editW.title}` });
      }
    }
    setEditW(null); onRefresh();
  };

  const deleteWorkout=async(id)=>{ await supabase.from("workouts").delete().eq("id",id); onRefresh(); };
  const adjustTokens=async()=>{
    const amt=parseInt(tForm.amount);
    if (!amt||!tForm.reason) return;
    await supabase.from("users").update({ tokens:(ath.tokens||0)+amt }).eq("id",ath.id);
    await supabase.from("token_history").insert({ athlete_id:ath.id, amount:amt, reason:tForm.reason });
    setShowTF(false); setTForm({ amount:"", reason:"" }); onRefresh();
  };
  const saveEditAthlete=async()=>{
    const newExpiry=calcExpiry(eForm.start_date);
    await supabase.from("users").update({
      name:eForm.name, email:eForm.email, password:eForm.password,
      plan:eForm.plan||null, start_date:eForm.start_date||null,
      expiry:newExpiry||null, payment_date:eForm.start_date||null,
      sessions_per_week:parseInt(eForm.sessions_per_week), type:eForm.type,
    }).eq("id",ath.id);
    setShowEdit(false); onRefresh();
  };
  const toggleAthlete=(id)=>{
    if (id===ath.id) return;
    setWForm({...wForm,athlete_ids:wForm.athlete_ids.includes(id)?wForm.athlete_ids.filter(x=>x!==id):[...wForm.athlete_ids,id]});
  };
  const toggleEditAthlete=(id)=>{
    const extra=editW.extra_ids||[];
    setEditW({...editW,extra_ids:extra.includes(id)?extra.filter(x=>x!==id):[...extra,id]});
  };

  return (
    <div style={base.app}>
      <div style={base.topBar}>
        <button onClick={onBack} style={{ background:"none",border:"none",color:RED,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:F }}>← Volver</button>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={()=>{ setShowProfile(!showProfile); setShowEdit(false); }} style={{ background:"none",border:"1px solid #333",color:"#ccc",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontFamily:F,fontSize:13,fontWeight:600 }}>
            {showProfile?"Cerrar":"👤 Perfil"}
          </button>
          <button onClick={()=>{ setShowEdit(!showEdit); setShowProfile(false); }} style={{ background:"none",border:"1px solid #333",color:"#ccc",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontFamily:F,fontSize:13,fontWeight:600 }}>
            {showEdit?"Cerrar":"✏️ Editar"}
          </button>
        </div>
      </div>
      <div style={base.main}>

        {/* Perfil del atleta (cuestionario visto por coach) */}
        {showProfile&&<div style={base.card}>
          <h2 style={base.h2}>Perfil de {ath.name}</h2>
          {!athProfile?<p style={{ color:"#444",fontFamily:F }}>El atleta aún no ha completado su perfil.</p>:<>
            <div style={base.grid2}>
              <div style={{ background:"#0d0d0d",borderRadius:8,padding:10 }}><p style={base.h3}>Días/semana</p><p style={{ fontWeight:800,fontSize:20,color:RED,fontFamily:F }}>{athProfile.training_days_per_week}</p></div>
              <div style={{ background:"#0d0d0d",borderRadius:8,padding:10 }}><p style={base.h3}>Lugar</p><p style={{ fontWeight:600,fontSize:13,fontFamily:F }}>{athProfile.equipment||"—"}</p></div>
              <div style={{ background:"#0d0d0d",borderRadius:8,padding:10,gridColumn:"1/-1" }}><p style={base.h3}>Objetivos</p><p style={{ fontWeight:600,fontSize:14,fontFamily:F }}>{athProfile.goals||"—"}</p></div>
            </div>
            <p style={{ ...base.h3,marginTop:12 }}>Halterofilia (kg)</p>
            <div style={base.grid2}>
              {[["Snatch","snatch"],["C&J","clean_and_jerk"],["Clean","clean"],["Frontal","front_squat"],["Trasera","back_squat"],["Peso Muerto","deadlift"],["OHS","overhead_squat"]].map(([l,k])=>(
                <div key={k} style={{ background:"#0d0d0d",borderRadius:8,padding:10 }}>
                  <p style={base.h3}>{l}</p>
                  <p style={{ fontWeight:800,fontSize:16,color:athProfile[k]?RED:"#333",fontFamily:F }}>{athProfile[k]?`${athProfile[k]}kg`:"—"}</p>
                </div>
              ))}
            </div>
            <p style={{ ...base.h3,marginTop:12 }}>Gimnásticos</p>
            <div style={base.grid2}>
              {[["Pull-ups","pull_ups"],["Muscle-ups","muscle_ups"],["HSPU","handstand_pushups"],["Push-ups","max_pushups"]].map(([l,k])=>(
                <div key={k} style={{ background:"#0d0d0d",borderRadius:8,padding:10 }}>
                  <p style={base.h3}>{l}</p>
                  <p style={{ fontWeight:800,fontSize:16,color:athProfile[k]?RED:"#333",fontFamily:F }}>{athProfile[k]?`${athProfile[k]} reps`:"—"}</p>
                </div>
              ))}
            </div>
            <p style={{ ...base.h3,marginTop:12 }}>Running</p>
            <div style={base.grid2}>
              {[["5km","time_5km"],["10km","time_10km"],["21km","time_21km"]].map(([l,k])=>(
                <div key={k} style={{ background:"#0d0d0d",borderRadius:8,padding:10 }}>
                  <p style={base.h3}>{l}</p>
                  <p style={{ fontWeight:800,fontSize:16,color:athProfile[k]?RED:"#333",fontFamily:F }}>{formatTime(athProfile[k])}</p>
                </div>
              ))}
            </div>
            {athProfile.notes&&<><p style={{ ...base.h3,marginTop:12 }}>Notas</p><p style={{ color:"#bbb",fontSize:14,fontFamily:F }}>{athProfile.notes}</p></>}
          </>}
        </div>}

        {showEdit&&<div style={base.card}>
          <h2 style={base.h2}>Editar perfil</h2>
          {[["Nombre","name","text"],["Email","email","email"],["Contraseña","password","text"]].map(([l,k,t])=>(
            <div key={k}><label style={base.label}>{l}</label><input style={base.input} type={t} value={eForm[k]} onChange={e=>setEForm(f=>({...f,[k]:e.target.value}))} /></div>
          ))}
          <label style={base.label}>Plan</label>
          <input style={base.input} value={eForm.plan} onChange={e=>setEForm(f=>({...f,plan:e.target.value}))} />
          <label style={base.label}>Fecha de inicio / pago</label>
          <input style={base.input} type="date" value={eForm.start_date} onChange={e=>setEForm(f=>({...f,start_date:e.target.value}))} />
          {eForm.start_date&&<p style={{ color:"#a855f7",fontSize:13,fontFamily:F,marginBottom:12,marginTop:-8 }}>💜 Vence el {calcExpiry(eForm.start_date)}</p>}
          <label style={base.label}>Sesiones por semana</label>
          <select style={base.input} value={eForm.sessions_per_week} onChange={e=>setEForm(f=>({...f,sessions_per_week:parseInt(e.target.value)}))}>
            <option value={2}>2x semana — 8 tokens/mes</option>
            <option value={3}>3x semana — 12 tokens/mes</option>
            <option value={4}>4x semana — 16 tokens/mes</option>
            <option value={5}>5x semana — 20 tokens/mes</option>
          </select>
          <label style={base.label}>Tipo</label>
          <select style={base.input} value={eForm.type} onChange={e=>setEForm(f=>({...f,type:e.target.value}))}>
            <option>Online</option><option>Presencial</option><option>Mixto</option>
          </select>
          <button style={base.redBtn} onClick={saveEditAthlete}>Guardar cambios</button>
        </div>}

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
          <div>
            <h1 style={{...base.h1,marginBottom:4}}>{ath.name}</h1>
            <span style={tag(ath.type==="Online"?"red":ath.type==="Presencial"?"orange":"purple")}>{ath.type}</span>
            {ath.plan&&<span style={{...tag("orange"),marginLeft:6}}>{ath.plan}</span>}
          </div>
          <span className={d<15?"p-red":d<30?"p-orange":"p-green"} style={tag(d<15?"red":d<30?"orange":"green")}>{d}d</span>
        </div>

        <div style={base.card}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showTF?12:0 }}>
            <p style={base.h3}>Tokens — <span style={{ color:"#a855f7",fontWeight:800 }}>{ath.tokens||0}</span></p>
            <button style={{...base.redBtn,width:"auto",padding:"6px 12px",fontSize:12}} onClick={()=>setShowTF(!showTF)}>Ajustar</button>
          </div>
          {showTF&&<>
            <label style={base.label}>Cantidad (+ o -)</label>
            <input style={base.input} type="number" placeholder="Ej: 4 o -2" value={tForm.amount} onChange={e=>setTForm({...tForm,amount:e.target.value})} />
            <label style={base.label}>Motivo</label>
            <input style={base.input} placeholder="Ej: Pago mensual" value={tForm.reason} onChange={e=>setTForm({...tForm,reason:e.target.value})} />
            <button style={base.redBtn} onClick={adjustTokens}>Confirmar</button>
          </>}
          {athHistory.slice(0,5).map(h=>(
            <div key={h.id} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #1a1a1a" }}>
              <div><p style={{ fontSize:13,color:"#ccc",fontFamily:F }}>{h.reason}</p><p style={{ fontSize:11,color:"#555",fontFamily:F }}>{new Date(h.created_at).toLocaleDateString()}</p></div>
              <span style={{ fontWeight:800,color:h.amount>0?"#22c55e":RED,fontFamily:F }}>{h.amount>0?"+":""}{h.amount}</span>
            </div>
          ))}
        </div>

        <MonthCalendar workouts={aw} selectedDate={selDate} onDayClick={(key)=>{ setSelDate(key); setWForm(f=>({...f,date:key})); }} paymentDates={paymentDates} expiryDate={expiry||""} />

        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
          <p style={{ fontWeight:700,fontSize:14,color:"#999",fontFamily:F }}>{selDate} · {getWeekdayFromDate(selDate)}</p>
          <button style={{...base.redBtn,width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>{ setWForm({title:"",exercises:"",date:selDate,athlete_ids:[ath.id],comment:""}); setShowWF(!showWF); setEditW(null); }}>
            {showWF?"Cerrar":"+ Agregar"}
          </button>
        </div>

        {showWF&&<div style={base.card}>
          <h2 style={base.h2}>Nueva planificación</h2>
          <label style={base.label}>Fecha</label>
          <input style={base.input} type="date" value={wForm.date} onChange={e=>setWForm({...wForm,date:e.target.value})} />
          <label style={base.label}>Título</label>
          <input style={base.input} value={wForm.title} onChange={e=>setWForm({...wForm,title:e.target.value})} placeholder="Ej: Upper Body Strength" />
          <label style={base.label}>Planificación</label>
          <textarea style={{...base.input,height:200,resize:"vertical",whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:14,lineHeight:1.6}} value={wForm.exercises} onChange={e=>setWForm({...wForm,exercises:e.target.value})} placeholder={"a) Activación y movilidad\nb) 5' aeróbico\nc) Press de banca 4x8"} />
          <label style={base.label}>Nota para el atleta</label>
          <input style={base.input} value={wForm.comment} onChange={e=>setWForm({...wForm,comment:e.target.value})} placeholder="Ej: Enfocarse en técnica" />
          {otherAthletes.length>0&&<>
            <label style={base.label}>Copiar también a{selectedCount>0&&<span style={{ color:RED,marginLeft:6 }}>({selectedCount} seleccionados)</span>}</label>
            <div style={{ background:"#0d0d0d",borderRadius:10,padding:"4px 12px",marginBottom:12 }}>
              {otherAthletes.map(a=>{
                const selected=wForm.athlete_ids.includes(a.id);
                const tc=a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7";
                return (
                  <div key={a.id} onClick={()=>toggleAthlete(a.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #1a1a1a" }}>
                    <div style={{ width:24,height:24,borderRadius:6,border:`2px solid ${selected?RED:"#444"}`,background:selected?RED:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      {selected&&<span style={{ color:"#fff",fontSize:14,fontWeight:800 }}>✓</span>}
                    </div>
                    <div style={{ width:34,height:34,borderRadius:"50%",background:`${tc}22`,border:`2px solid ${tc}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ color:tc,fontWeight:800,fontSize:15,fontFamily:F }}>{a.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontFamily:F,fontSize:15,fontWeight:700,color:selected?"#fff":"#ccc" }}>{a.name}</p>
                      <p style={{ fontFamily:F,fontSize:11,color:"#555" }}>{a.plan||"Sin plan"} · {a.type} · {a.tokens||0} tok</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>}
          <button style={base.redBtn} onClick={createWorkout}>
            {wForm.athlete_ids.length>1?`Crear para ${wForm.athlete_ids.length} atletas`:"Crear entrenamiento"}
          </button>
        </div>}

        <div style={base.card}>
          {dayW.length===0
            ?<p style={{ color:"#444",textAlign:"center",padding:16,fontFamily:F }}>Sin planificación para este día.</p>
            :dayW.map(w=>(
              <div key={w.id} style={{ marginBottom:16,paddingBottom:16,borderBottom:"1px solid #1a1a1a" }}>
                {editW?.id===w.id
                  ?<div>
                    <label style={base.label}>Título</label>
                    <input style={base.input} value={editW.title} onChange={e=>setEditW({...editW,title:e.target.value})} />
                    <label style={base.label}>Planificación</label>
                    <textarea style={{...base.input,height:200,resize:"vertical",whiteSpace:"pre-wrap",fontFamily:"monospace",fontSize:14,lineHeight:1.6}} value={editW.exercises_text} onChange={e=>setEditW({...editW,exercises_text:e.target.value})} />
                    <label style={base.label}>Nota</label>
                    <input style={base.input} value={editW.comment||""} onChange={e=>setEditW({...editW,comment:e.target.value})} />
                    {otherAthletes.length>0&&<>
                      <label style={base.label}>Copiar también a{(editW.extra_ids||[]).length>0&&<span style={{ color:RED,marginLeft:6 }}>({(editW.extra_ids||[]).length} seleccionados)</span>}</label>
                      <div style={{ background:"#0d0d0d",borderRadius:10,padding:"4px 12px",marginBottom:12 }}>
                        {otherAthletes.map(a=>{
                          const selected=(editW.extra_ids||[]).includes(a.id);
                          const tc=a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7";
                          return (
                            <div key={a.id} onClick={()=>toggleEditAthlete(a.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",borderBottom:"1px solid #1a1a1a" }}>
                              <div style={{ width:24,height:24,borderRadius:6,border:`2px solid ${selected?RED:"#444"}`,background:selected?RED:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                                {selected&&<span style={{ color:"#fff",fontSize:14,fontWeight:800 }}>✓</span>}
                              </div>
                              <div style={{ width:34,height:34,borderRadius:"50%",background:`${tc}22`,border:`2px solid ${tc}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                                <span style={{ color:tc,fontWeight:800,fontSize:15,fontFamily:F }}>{a.name.charAt(0)}</span>
                              </div>
                              <div style={{ flex:1 }}>
                                <p style={{ fontFamily:F,fontSize:15,fontWeight:700,color:selected?"#fff":"#ccc" }}>{a.name}</p>
                                <p style={{ fontFamily:F,fontSize:11,color:"#555" }}>{a.plan||"Sin plan"} · {a.type} · {a.tokens||0} tok</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>}
                    <div style={{ display:"flex",gap:8 }}>
                      <button style={{...base.redBtn,flex:1,padding:"10px"}} onClick={saveEditWorkout}>
                        {(editW.extra_ids||[]).length>0?`Guardar y copiar a ${(editW.extra_ids||[]).length} más`:"Guardar"}
                      </button>
                      <button style={{...base.ghostBtn,flex:1}} onClick={()=>setEditW(null)}>Cancelar</button>
                    </div>
                  </div>
                  :<>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                      <p className="p-red" style={{ fontWeight:800,fontSize:16,textTransform:"uppercase",fontFamily:F }}>{w.title}</p>
                      <span className={w.done?"p-green":"p-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                    </div>
                    <pre style={{ color:"#bbb",fontSize:14,fontFamily:"inherit",whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0,padding:0,lineHeight:1.7 }}>{getExercisesText(w)}</pre>
                    {w.comment&&<p style={{ color:"#f97316",fontSize:13,marginTop:8,fontStyle:"italic",fontFamily:F }}>💬 {w.comment}</p>}
                    <div style={{ display:"flex",gap:8,marginTop:10 }}>
                      <button style={{...base.ghostBtn,flex:1,fontSize:12}} onClick={()=>setEditW({ id:w.id,date:w.date,title:w.title,exercises_text:getExercisesText(w),comment:w.comment||"",extra_ids:[] })}>✏️ Editar</button>
                      <button style={{...base.ghostBtn,flex:1,fontSize:12,color:RED,borderColor:`${RED}44`}} onClick={()=>deleteWorkout(w.id)}>🗑 Eliminar</button>
                    </div>
                  </>
                }
              </div>
            ))
          }
        </div>

        <div style={{ ...base.card,marginTop:4 }}>
          <p style={{ ...base.h3,marginBottom:12 }}>Resumen</p>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {[[typeColor,"Sesiones",`${ath.sessions_per_week||3}x/sem`],["#a855f7","Tokens",ath.tokens||0],["#a855f7","Próx. pago",nextPayment||"—"],[d<15?RED:"#22c55e","Vence",expiry||"—"],["#22c55e","Completados",`${aw.filter(w=>w.done).length}/${aw.length}`]].map(([color,label,value])=>(
              <div key={label} style={{ background:"#0d0d0d",borderRadius:10,padding:"10px 14px",flex:"1 1 auto",minWidth:90,borderLeft:`3px solid ${color}` }}>
                <p style={{ fontSize:10,fontWeight:700,textTransform:"uppercase",color:"#555",fontFamily:F,marginBottom:4 }}>{label}</p>
                <p style={{ fontWeight:800,fontSize:16,color:"#fff",fontFamily:F }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={base.card}>
          <p style={base.h3}>Información</p>
          <div style={base.grid2}>
            {[["Email",ath.email],["Clave",ath.password],["Inicio",ath.start_date||"—"],["Vence",expiry||"—"]].map(([l,v])=>(
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
  const conv=messages.filter(m=>(m.from_id===user.id&&m.to_id===partner.id)||(m.from_id===partner.id&&m.to_id===user.id));
  const send=async()=>{
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
        {conv.length===0?<p style={{ color:"#444",textAlign:"center",padding:40,fontFamily:F }}>Sin mensajes aún.</p>
          :conv.map(m=>(
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
  const planAthletes=athletes.filter(a=>a.plan===plan);
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
        {planAthletes.length===0?<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas en este plan.</p></div>
          :planAthletes.map(a=><AthleteCard key={a.id} a={a} onClick={()=>onSelectAthlete(a)} />)
        }
      </div>
    </div>
  );
}

function FormAtleta({ aForm, setAForm, onSubmit, esPresencial }) {
  return (
    <div style={{ background:"#161616",border:"1px solid #222",borderRadius:14,padding:16,marginBottom:12 }}>
      <h2 style={{ fontSize:20,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12,fontFamily:F }}>Nuevo atleta {esPresencial?"presencial":"online"}</h2>
      <label style={base.label}>Nombre</label>
      <input style={base.input} type="text" value={aForm.name} onChange={e=>setAForm(f=>({...f,name:e.target.value}))} placeholder="Nombre completo" />
      <label style={base.label}>Email</label>
      <input style={base.input} type="email" value={aForm.email} onChange={e=>setAForm(f=>({...f,email:e.target.value}))} placeholder="email@ejemplo.com" />
      <label style={base.label}>Contraseña</label>
      <input style={base.input} type="text" value={aForm.password} onChange={e=>setAForm(f=>({...f,password:e.target.value}))} placeholder="Contraseña" />
      {esPresencial
        ?<><label style={base.label}>Plan (opcional)</label><input style={base.input} value={aForm.plan} onChange={e=>setAForm(f=>({...f,plan:e.target.value}))} placeholder="Ej: NSB Presencial" /></>
        :<><label style={base.label}>Plan NSB</label><select style={base.input} value={aForm.plan} onChange={e=>setAForm(f=>({...f,plan:e.target.value}))}>{NSB_PLANS.map(p=><option key={p}>{p}</option>)}</select></>
      }
      <label style={base.label}>Fecha de inicio / pago</label>
      <input style={base.input} type="date" value={aForm.start_date} onChange={e=>setAForm(f=>({...f,start_date:e.target.value}))} />
      {aForm.start_date&&<p style={{ color:"#a855f7",fontSize:13,fontFamily:F,marginBottom:12,marginTop:-8 }}>💜 Vence el {calcExpiry(aForm.start_date)}</p>}
      <label style={base.label}>Sesiones por semana</label>
      <select style={base.input} value={aForm.sessions_per_week} onChange={e=>setAForm(f=>({...f,sessions_per_week:parseInt(e.target.value)}))}>
        <option value={2}>2x semana — 8 tokens/mes</option>
        <option value={3}>3x semana — 12 tokens/mes</option>
        <option value={4}>4x semana — 16 tokens/mes</option>
        <option value={5}>5x semana — 20 tokens/mes</option>
      </select>
      <div onClick={()=>setAForm(f=>({...f,tipo_mixto:!f.tipo_mixto}))} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,cursor:"pointer" }}>
        <div style={{ width:22,height:22,borderRadius:5,border:`2px solid ${aForm.tipo_mixto?"#a855f7":"#444"}`,background:aForm.tipo_mixto?"#a855f7":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          {aForm.tipo_mixto&&<span style={{ color:"#fff",fontSize:13 }}>✓</span>}
        </div>
        <p style={{ fontFamily:F,fontSize:14,color:"#ccc" }}>Es atleta Mixto (presencial + online)</p>
      </div>
      <button style={{ background:RED,color:"#fff",border:"none",padding:"14px 24px",borderRadius:10,cursor:"pointer",fontFamily:F,fontSize:15,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",width:"100%",display:"block" }} onClick={onSubmit}>Crear atleta</button>
    </div>
  );
}

// ── CUESTIONARIO ATLETA ──
function Questionnaire({ user, existingProfile, onSave, onSkip }) {
  const [qForm, setQForm] = useState(existingProfile ? {
    training_days_per_week: existingProfile.training_days_per_week||3,
    equipment: existingProfile.equipment||"",
    has_running_space: existingProfile.has_running_space||false,
    goals: existingProfile.goals||"",
    snatch: existingProfile.snatch||"",
    clean_and_jerk: existingProfile.clean_and_jerk||"",
    clean: existingProfile.clean||"",
    front_squat: existingProfile.front_squat||"",
    back_squat: existingProfile.back_squat||"",
    deadlift: existingProfile.deadlift||"",
    overhead_squat: existingProfile.overhead_squat||"",
    pull_ups: existingProfile.pull_ups||"",
    muscle_ups: existingProfile.muscle_ups||"",
    handstand_pushups: existingProfile.handstand_pushups||"",
    time_5km: formatTime(existingProfile.time_5km),
    time_10km: formatTime(existingProfile.time_10km),
    time_21km: formatTime(existingProfile.time_21km),
    max_pushups: existingProfile.max_pushups||"",
    notes: existingProfile.notes||""
  } : {...EMPTY_QFORM});

  const save = async () => {
    const payload = {
      athlete_id: user.id,
      training_days_per_week: parseInt(qForm.training_days_per_week)||3,
      equipment: qForm.equipment,
      has_running_space: qForm.has_running_space,
      goals: qForm.goals,
      snatch: parseInt(qForm.snatch)||null,
      clean_and_jerk: parseInt(qForm.clean_and_jerk)||null,
      clean: parseInt(qForm.clean)||null,
      front_squat: parseInt(qForm.front_squat)||null,
      back_squat: parseInt(qForm.back_squat)||null,
      deadlift: parseInt(qForm.deadlift)||null,
      overhead_squat: parseInt(qForm.overhead_squat)||null,
      pull_ups: parseInt(qForm.pull_ups)||null,
      muscle_ups: parseInt(qForm.muscle_ups)||null,
      handstand_pushups: parseInt(qForm.handstand_pushups)||null,
      time_5km: parseTime(qForm.time_5km),
      time_10km: parseTime(qForm.time_10km),
      time_21km: parseTime(qForm.time_21km),
      max_pushups: parseInt(qForm.max_pushups)||null,
      notes: qForm.notes,
      updated_at: new Date().toISOString()
    };
    if (existingProfile) {
      await supabase.from("athlete_profile").update(payload).eq("athlete_id", user.id);
    } else {
      await supabase.from("athlete_profile").insert(payload);
    }
    onSave();
  };

  return (
    <div style={{...base.app, paddingBottom:20}}>
      <div style={base.topBar}>
        <img src="/nsb_sin_fondo.png" alt="NSB" style={{ height:32 }} />
        {onSkip&&<button style={{...base.ghostBtn,padding:"6px 12px",fontSize:11}} onClick={onSkip}>Omitir</button>}
      </div>
      <div style={base.main}>
        <h1 style={{...base.h1,marginBottom:4}}>Mi Perfil</h1>
        <p style={{ color:"#666",fontSize:14,marginBottom:20,fontFamily:F }}>Completa tu información para que tu coach pueda planificarte mejor.</p>

        <div style={base.card}>
          <h2 style={base.h2}>General</h2>
          <label style={base.label}>¿Cuántos días entrenas por semana?</label>
          <select style={base.input} value={qForm.training_days_per_week} onChange={e=>setQForm({...qForm,training_days_per_week:e.target.value})}>
            {[2,3,4,5,6].map(n=><option key={n} value={n}>{n} días</option>)}
          </select>
          <label style={base.label}>¿Dónde entrenas?</label>
          <select style={base.input} value={qForm.equipment} onChange={e=>setQForm({...qForm,equipment:e.target.value})}>
            <option value="">Seleccionar...</option>
            {EQUIPMENT_OPTIONS.map(o=><option key={o} value={o}>{o}</option>)}
          </select>
          <label style={base.label}>¿Tienes espacio para correr?</label>
          <select style={base.input} value={qForm.has_running_space?"si":"no"} onChange={e=>setQForm({...qForm,has_running_space:e.target.value==="si"})}>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
          <label style={base.label}>Objetivos</label>
          <textarea style={{...base.input,height:80,resize:"vertical"}} placeholder="¿Qué quieres lograr con tu entrenamiento?" value={qForm.goals} onChange={e=>setQForm({...qForm,goals:e.target.value})} />
        </div>

        <div style={base.card}>
          <h2 style={base.h2}>Halterofilia</h2>
          <p style={{ color:"#666",fontSize:13,marginBottom:12,fontFamily:F }}>Pesos máximos en kg. Deja en blanco si no aplica.</p>
          {[["Arranque (Snatch)","snatch"],["Envión (Clean & Jerk)","clean_and_jerk"],["Cargada (Clean)","clean"],["Sentadilla Frontal","front_squat"],["Sentadilla Trasera","back_squat"],["Peso Muerto","deadlift"],["Sentadilla Overhead","overhead_squat"]].map(([l,k])=>(
            <div key={k}>
              <label style={base.label}>{l} (kg)</label>
              <input style={base.input} type="number" placeholder="kg" value={qForm[k]} onChange={e=>setQForm({...qForm,[k]:e.target.value})} />
            </div>
          ))}
        </div>

        <div style={base.card}>
          <h2 style={base.h2}>Gimnásticos CrossFit</h2>
          {[["Pull-ups máx. (reps)","pull_ups"],["Muscle-ups máx. (reps)","muscle_ups"],["HSPU máx. (reps)","handstand_pushups"],["Push-ups máx. (reps)","max_pushups"]].map(([l,k])=>(
            <div key={k}>
              <label style={base.label}>{l}</label>
              <input style={base.input} type="number" placeholder="reps" value={qForm[k]} onChange={e=>setQForm({...qForm,[k]:e.target.value})} />
            </div>
          ))}
        </div>

        <div style={base.card}>
          <h2 style={base.h2}>Running</h2>
          <p style={{ color:"#666",fontSize:13,marginBottom:12,fontFamily:F }}>Formato: minutos:segundos (ej: 25:30). Deja en blanco si no aplica.</p>
          {[["5km","time_5km"],["10km","time_10km"],["21km (media maratón)","time_21km"]].map(([l,k])=>(
            <div key={k}>
              <label style={base.label}>{l}</label>
              <input style={base.input} type="text" placeholder="mm:ss" value={qForm[k]==="—"?"":qForm[k]} onChange={e=>setQForm({...qForm,[k]:e.target.value})} />
            </div>
          ))}
        </div>

        <div style={base.card}>
          <h2 style={base.h2}>Notas adicionales</h2>
          <textarea style={{...base.input,height:80,resize:"vertical"}} placeholder="Lesiones, limitaciones, material disponible, información adicional..." value={qForm.notes} onChange={e=>setQForm({...qForm,notes:e.target.value})} />
        </div>

        <button style={base.redBtn} onClick={save}>Guardar perfil</button>
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
  const [allAthletes, setAllAthletes] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [tokenHistory, setTokenHistory] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [showAF, setShowAF] = useState(false);
  const [aForm, setAForm] = useState(AFORM_ONLINE);
  const [showSF, setShowSF] = useState(false);
  const [schedDay, setSchedDay] = useState("Lunes");
  const [schedTime, setSchedTime] = useState("");
  const [schedSpots, setSchedSpots] = useState("4");
  const [presDate, setPresDate] = useState(todayLocal());
  const [selDate, setSelDate] = useState(todayLocal());
  const [athView, setAthView] = useState("inicio");
  const [paidIds, setPaidIds] = useState([]);
  const [athProfile, setAthProfile] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  useEffect(()=>{ const s=document.createElement("style"); s.textContent=PULSE_STYLE; document.head.appendChild(s); return()=>document.head.removeChild(s); },[]);

  const load=async(u)=>{
    if (u.role==="coach") {
      const {data:a}=await supabase.from("users").select("*").eq("role","athlete").eq("coach_id",u.id); setAthletes(a||[]);
      const {data:all}=await supabase.from("users").select("*, coach:coach_id(name)").eq("role","athlete"); setAllAthletes(all||[]);
      const {data:c}=await supabase.from("users").select("id,name").eq("role","coach"); setCoaches(c||[]);
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
      const {data:ap}=await supabase.from("athlete_profile").select("*").eq("athlete_id",u.id).single();
      setAthProfile(ap||null);
      if (!ap) setShowQuestionnaire(true);
    }
  };

  const login=async()=>{
    setLoading(true); setErr("");
    const {data,error}=await supabase.from("users").select("*").eq("email",email).eq("password",pw).single();
    if (error||!data) setErr("Email o contraseña incorrectos");
    else { setUser(data); load(data); }
    setLoading(false);
  };

  const logout=()=>{ setUser(null); setEmail(""); setPw(""); setView("home"); setSelectedAthlete(null); setSelectedPlan(null); setChatPartner(null); setPaidIds([]); setAthProfile(null); setShowQuestionnaire(false); };
  const refresh=()=>{ if (user) load(user); };

  const markPaid=async(a)=>{
    const pd=getPaymentDates(a.start_date,1);
    const today=todayLocal();
    const next=pd.find(d=>d>=today);
    if (!next) return;
    setPaidIds(prev=>[...prev,a.id]);
    const newExpiry=calcExpiry(next);
    const tokens=SESSIONS_TOKENS[a.sessions_per_week||3]||12;
    await supabase.from("users").update({ start_date:next, expiry:newExpiry, payment_date:next, tokens:(a.tokens||0)+tokens }).eq("id",a.id);
    await supabase.from("token_history").insert({ athlete_id:a.id, amount:tokens, reason:`Renovación pago — ${next}` });
    refresh();
  };

  const createAthlete=async()=>{
    const tokens=SESSIONS_TOKENS[aForm.sessions_per_week]||12;
    const esPres=view==="presencial";
    const tipo=aForm.tipo_mixto?"Mixto":esPres?"Presencial":"Online";
    const expiry=calcExpiry(aForm.start_date);
    const data={ name:aForm.name, email:aForm.email, password:aForm.password, plan:aForm.plan||null, start_date:aForm.start_date||null, expiry:expiry||null, payment_date:aForm.start_date||null, sessions_per_week:parseInt(aForm.sessions_per_week), role:"athlete", tokens, type:tipo, coach_id:user.id };
    const {error}=await supabase.from("users").insert(data);
    if (error) { console.error("Error:",error.message); return; }
    setShowAF(false); setAForm(esPres?{...AFORM_PRES}:{...AFORM_ONLINE}); load(user);
  };

  const createSchedule=async()=>{
    if (!schedTime) { alert("Por favor ingresa una hora"); return; }
    await supabase.from("schedules").insert({ day:schedDay, time:schedTime, spots:parseInt(schedSpots)||4 });
    setShowSF(false); setSchedDay(getWeekdayFromDate(presDate)); setSchedTime(""); setSchedSpots("4"); load(user);
  };

  const bookSlot=async(sid)=>{
    const sch=schedules.find(s=>s.id===sid);
    const mine=sch?.bookings?.find(b=>b.athlete_id===user?.id);
    if (mine) await supabase.from("bookings").delete().eq("id",mine.id);
    else await supabase.from("bookings").insert({schedule_id:sid,athlete_id:user?.id});
    load(user);
  };

  const markDone=async(id)=>{ await supabase.from("workouts").update({done:true}).eq("id",id); load(user); };

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

    const onlineAthletes=athletes.filter(a=>a.type==="Online"||a.type==="Mixto");
    const presAthletes=athletes.filter(a=>a.type==="Presencial"||a.type==="Mixto");
    const cv=["home","online","presencial","mensajes","global","info"];
    const ci={ home:"⚡",online:"💻",presencial:"🏋️",mensajes:"💬",global:"🌐",info:"📋" };
    const cl={ home:"Inicio",online:"Online",presencial:"Presencial",mensajes:"Mensajes",global:"Global",info:"Info" };
    const activePlans=NSB_PLANS.filter(p=>athletes.some(a=>a.plan===p&&(a.type==="Online"||a.type==="Mixto")));
    const noPlanOnline=onlineAthletes.filter(a=>!NSB_PLANS.includes(a.plan));
    const presWeekday=getWeekdayFromDate(presDate);
    const filteredSchedules=schedules.filter(sch=>sch.day===presWeekday);
    const today=todayLocal();
    const paymentAlerts=athletes.filter(a=>{
      if (paidIds.includes(a.id)) return false;
      const pd=getPaymentDates(a.start_date,1);
      const next=pd.find(d=>d>=today);
      if (!next) return false;
      return getDays(next)>=0&&getDays(next)<=3;
    });

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

          {view==="home"&&<>
            <h1 style={base.h1}>Dashboard</h1>
            <p style={{ color:"#666",fontSize:14,marginBottom:12,fontFamily:F }}>Mis atletas — {user.name}</p>
            <div style={base.grid2}>
              <div style={base.statCard(RED)}><p style={base.h3}>Mis Online</p><p className="p-red" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{onlineAthletes.length}</p></div>
              <div style={base.statCard("#f97316")}><p style={base.h3}>Mis Presencial</p><p className="p-orange" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{presAthletes.length}</p></div>
              <div style={base.statCard("#22c55e")}><p style={base.h3}>Planes</p><p className="p-green" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{workouts.length}</p></div>
              <div style={base.statCard("#a855f7")}><p style={base.h3}>Total global</p><p className="p-purple" style={{ fontSize:40,fontWeight:800,lineHeight:1,fontFamily:F }}>{allAthletes.length}</p></div>
            </div>
            {paymentAlerts.length>0&&<div style={{ background:"#0d0d0d",border:"1px solid #a855f744",borderRadius:14,padding:"10px 14px",marginBottom:12 }}>
              <p style={{ fontSize:11,fontWeight:700,color:"#a855f7",textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F,marginBottom:8 }}>💜 Pagos próximos</p>
              {paymentAlerts.map(a=>{
                const pd=getPaymentDates(a.start_date,1); const next=pd.find(d=>d>=today); const days=getDays(next);
                return (
                  <div key={a.id} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1a1a1a" }}>
                    <div>
                      <p style={{ fontWeight:700,fontSize:14,fontFamily:F,color:"#ccc" }}>{a.name}</p>
                      <p style={{ fontSize:11,color:"#a855f7",fontFamily:F }}>{days===0?"Hoy":days===1?"Mañana":`En ${days} días`} · {next}</p>
                    </div>
                    <button onClick={()=>markPaid(a)} style={{ background:"#a855f722",border:"1px solid #a855f744",color:"#a855f7",padding:"6px 14px",borderRadius:8,cursor:"pointer",fontFamily:F,fontSize:12,fontWeight:700,flexShrink:0 }}>✓ Pagado</button>
                  </div>
                );
              })}
            </div>}
            <div style={base.card}>
              <h2 style={base.h2}>Mis atletas recientes</h2>
              {athletes.slice(0,4).map(a=><AthleteCard key={a.id} a={a} onClick={()=>setSelectedAthlete(a)} />)}
            </div>
          </>}

          {view==="online"&&<>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h1 style={{...base.h1,marginBottom:0}}>Online</h1>
              <button style={{...base.redBtn,width:"auto",padding:"10px 16px",fontSize:13}} onClick={()=>{ setAForm({...AFORM_ONLINE}); setShowAF(!showAF); }}>+ Agregar</button>
            </div>
            {showAF&&<FormAtleta aForm={aForm} setAForm={setAForm} onSubmit={createAthlete} esPresencial={false} />}
            {activePlans.map(plan=>{
              const planAthletes=onlineAthletes.filter(a=>a.plan===plan);
              return (
                <div key={plan} onClick={()=>setSelectedPlan(plan)} style={{...base.card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,borderLeft:`3px solid ${RED}`}}>
                  <div>
                    <p className="p-red" style={{ fontWeight:800,fontSize:16,fontFamily:F }}>{plan}</p>
                    <p style={{ color:"#666",fontSize:13,fontFamily:F }}>{planAthletes.length} atleta{planAthletes.length!==1?"s":""}</p>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ display:"flex",gap:3 }}>{planAthletes.slice(0,4).map(a=><div key={a.id} style={{ width:8,height:8,borderRadius:"50%",background:RED }}/>)}</div>
                    <span style={{ color:"#555",fontSize:20 }}>›</span>
                  </div>
                </div>
              );
            })}
            {noPlanOnline.length>0&&<><p style={{ color:"#555",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",fontFamily:F,marginBottom:8 }}>Sin plan asignado</p>{noPlanOnline.map(a=><AthleteCard key={a.id} a={a} onClick={()=>setSelectedAthlete(a)} />)}</>}
            {onlineAthletes.length===0&&!showAF&&<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas online aún.</p></div>}
          </>}

          {view==="presencial"&&<>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h1 style={{...base.h1,marginBottom:0}}>Presencial</h1>
              <button style={{...base.redBtn,width:"auto",padding:"10px 16px",fontSize:13}} onClick={()=>{ setAForm({...AFORM_PRES}); setShowAF(!showAF); }}>+ Agregar</button>
            </div>
            {showAF&&<FormAtleta aForm={aForm} setAForm={setAForm} onSubmit={createAthlete} esPresencial={true} />}
            <MonthCalendar workouts={[]} selectedDate={presDate} onDayClick={(key)=>{ setPresDate(key); setSchedDay(getWeekdayFromDate(key)); }} />
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
              <div>
                <p style={{ fontWeight:800,fontSize:16,color:"#fff",fontFamily:F }}>{presWeekday}</p>
                <p style={{ color:"#555",fontSize:12,fontFamily:F }}>{presDate}</p>
              </div>
              <button style={{...base.redBtn,width:"auto",padding:"8px 14px",fontSize:12}} onClick={()=>setShowSF(!showSF)}>+ Horario</button>
            </div>
            {showSF&&<div style={base.card}>
              <h2 style={base.h2}>Nuevo horario</h2>
              <label style={base.label}>Día</label>
              <select style={base.input} value={schedDay} onChange={e=>setSchedDay(e.target.value)}>{DAYS_ES.map(d=><option key={d}>{d}</option>)}</select>
              <label style={base.label}>Hora</label>
              <input style={base.input} type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)} />
              {schedTime&&<p style={{ color:"#22c55e",fontSize:13,fontFamily:F,marginBottom:12,marginTop:-8 }}>✓ {schedTime}</p>}
              <label style={base.label}>Cupos</label>
              <input style={base.input} type="number" value={schedSpots} onChange={e=>setSchedSpots(e.target.value)} />
              <button style={base.redBtn} onClick={createSchedule}>Crear horario</button>
            </div>}
            {filteredSchedules.length===0
              ?<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin horarios para el {presWeekday}.</p></div>
              :filteredSchedules.map(sch=>(
                <div key={sch.id} style={base.card}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <div>
                      <p style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",fontFamily:F }}>{sch.day}</p>
                      <p className="p-red" style={{ fontSize:28,fontWeight:800,lineHeight:1,fontFamily:F }}>{sch.time||"Sin hora"}</p>
                    </div>
                    <div style={{ textAlign:"right" }}><p style={base.h3}>Cupos</p><p style={{ fontWeight:700,fontSize:22,fontFamily:F }}>{sch.bookings?.length||0}/{sch.spots}</p></div>
                  </div>
                  {sch.bookings?.length===0?<p style={{ color:"#444",fontSize:13,fontFamily:F }}>Sin reservas</p>:sch.bookings?.map(b=><p key={b.id} style={{ color:"#ccc",fontSize:14,padding:"3px 0",fontFamily:F }}>· {b.users?.name}</p>)}
                  <button style={{...base.ghostBtn,marginTop:10,width:"100%",fontSize:12,color:RED,borderColor:`${RED}44`}} onClick={async()=>{ await supabase.from("schedules").delete().eq("id",sch.id); load(user); }}>Eliminar</button>
                </div>
              ))
            }
            <div style={{ marginTop:16 }}>
              <h2 style={base.h2}>Mis atletas presencial</h2>
              {presAthletes.length===0?<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas presenciales aún.</p></div>
                :presAthletes.map(a=><AthleteCard key={a.id} a={a} onClick={()=>setSelectedAthlete(a)} />)
              }
            </div>
          </>}

          {view==="mensajes"&&<>
            <h1 style={{...base.h1,marginBottom:16}}>Mensajes</h1>
            {athletes.length===0?<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin atletas aún.</p></div>
              :athletes.map(a=>{
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

          {view==="global"&&<>
            <h1 style={base.h1}>Vista Global</h1>
            <p style={{ color:"#666",fontSize:14,marginBottom:12,fontFamily:F }}>Todos los atletas · {allAthletes.length} total</p>
            <div style={{ display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4 }}>
              {coaches.map(c=>{
                const cnt=allAthletes.filter(a=>a.coach_id===c.id).length;
                return <div key={c.id} style={{ background:"#161616",border:"1px solid #333",borderRadius:12,padding:"12px 16px",flexShrink:0,minWidth:120 }}>
                  <p style={{ fontSize:11,fontWeight:700,color:"#666",textTransform:"uppercase",fontFamily:F,marginBottom:4 }}>{c.name}</p>
                  <p style={{ fontSize:28,fontWeight:800,color:RED,fontFamily:F,lineHeight:1 }}>{cnt}</p>
                  <p style={{ fontSize:11,color:"#555",fontFamily:F }}>atletas</p>
                </div>;
              })}
            </div>
            {NSB_PLANS.map(plan=>{
              const planAthletes=allAthletes.filter(a=>a.plan===plan);
              if (planAthletes.length===0) return null;
              return <div key={plan} style={base.card}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <p className="p-red" style={{ fontWeight:800,fontSize:16,fontFamily:F }}>{plan}</p>
                  <span style={tag("red")}>{planAthletes.length}</span>
                </div>
                {planAthletes.map(a=>(
                  <div key={a.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #111" }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:`${a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7"}22`,border:`2px solid ${a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7"}44`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ fontWeight:800,fontSize:14,color:a.type==="Online"?RED:a.type==="Presencial"?"#f97316":"#a855f7",fontFamily:F }}>{a.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700,fontSize:14,fontFamily:F }}>{a.name}</p>
                      <p style={{ fontSize:11,color:"#555",fontFamily:F }}>{a.type} · {a.coach?.name||"Sin coach"}</p>
                    </div>
                    <span style={tag(a.type==="Online"?"red":a.type==="Presencial"?"orange":"purple")}>{a.type}</span>
                  </div>
                ))}
              </div>;
            })}
            {(()=>{ const sinPlan=allAthletes.filter(a=>!NSB_PLANS.includes(a.plan)); if (!sinPlan.length) return null;
              return <div style={base.card}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <p style={{ fontWeight:800,fontSize:16,fontFamily:F,color:"#f97316" }}>PRESENCIAL / OTROS</p>
                  <span style={tag("orange")}>{sinPlan.length}</span>
                </div>
                {sinPlan.map(a=>(
                  <div key={a.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #111" }}>
                    <div style={{ width:32,height:32,borderRadius:"50%",background:"#f9731622",border:"2px solid #f9731644",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ fontWeight:800,fontSize:14,color:"#f97316",fontFamily:F }}>{a.name.charAt(0)}</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700,fontSize:14,fontFamily:F }}>{a.name}</p>
                      <p style={{ fontSize:11,color:"#555",fontFamily:F }}>{a.plan||"Sin plan"} · {a.coach?.name||"Sin coach"}</p>
                    </div>
                    <span style={tag("orange")}>{a.type}</span>
                  </div>
                ))}
              </div>;
            })()}
          </>}

          {view==="info"&&<>
            <h1 style={{...base.h1,marginBottom:4}}>Políticas</h1>
            <p style={{ color:"#666",fontSize:13,marginBottom:16,fontFamily:F }}>NSB Planning — Never Stop Building</p>
            {[
              { title:"Presencial",color:RED,cls:"p-red",items:["Las clases agendadas y no asistidas son recuperables, hasta 2 por mes.","Las cancelaciones deben realizarse con 24 horas de anticipación.","Si no cancelas a tiempo, la clase se descuenta del plan.","Los horarios se reservan con antelación desde la app."]},
              { title:"Online",color:"#f97316",cls:"p-orange",items:["Las planificaciones se suben semanalmente a la app.","Tienes 24 horas para consultar dudas sobre tu entrenamiento.","El seguimiento se realiza a través de la app cada semana."]},
              { title:"Mixto",color:"#a855f7",cls:"p-purple",items:["Combina sesiones presenciales y planificación online.","Las políticas presenciales aplican para las clases en persona."]},
              { title:"General",color:"#22c55e",cls:"p-green",items:["El pago se renueva cada 30 días desde la fecha de inicio.","El plan vence automáticamente al cumplirse los 30 días.","Cada sesión subida descuenta 1 token del plan.","Los tokens se recargan al renovar el período."]}
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
            <button key={v} style={base.navItem(view===v)} onClick={()=>{ setView(v); setSelectedAthlete(null); setSelectedPlan(null); setChatPartner(null); setShowAF(false); }}>
              <span style={{ fontSize:18,marginBottom:2 }}>{ci[v]}</span>
              <span style={{ fontSize:9 }}>{cl[v]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── ATLETA ──
  if (showQuestionnaire) return (
    <Questionnaire
      user={user}
      existingProfile={athProfile}
      onSave={()=>{ setShowQuestionnaire(false); load(user); }}
      onSkip={athProfile?()=>setShowQuestionnaire(false):null}
    />
  );

  const daysLeft=getDays(user.start_date?calcExpiry(user.start_date):user.expiry);
  const isOnline=user.type==="Online";
  const isPres=user.type==="Presencial";
  const isMixto=user.type==="Mixto";
  const today=todayLocal();
  const userPaymentDates=getPaymentDates(user.start_date,6);
  const userExpiry=user.start_date?calcExpiry(user.start_date):user.expiry;
  const nextPayment=userPaymentDates.find(d=>d>=today);
  const daysToPayment=nextPayment?getDays(nextPayment):null;
  const athWeekday=getWeekdayFromDate(selDate);
  const athSchedules=schedules.filter(sch=>sch.day===athWeekday);
  const dayWorkouts=workouts.filter(w=>w.date===selDate);

  if (chatPartner) return <Chat user={user} partner={chatPartner} messages={messages} onBack={()=>setChatPartner(null)} onRefresh={refresh} />;

  const navItems = isOnline
    ? [["plan","📋","Mi Plan"],["mensajes","💬","Mensajes"],["info","📋","Info"],["progreso","📈","Progreso"]]
    : isPres
    ? [["inicio","📅","Inicio"],["mensajes","💬","Mensajes"],["info","📋","Info"],["progreso","📈","Progreso"]]
    : [["plan","📋","Mi Plan"],["inicio","📅","Clases"],["mensajes","💬","Mensajes"],["progreso","📈","Progreso"]];

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

        {(athView==="plan"||athView==="inicio")&&<>
          {daysToPayment!==null&&daysToPayment<=3&&(
            <div style={{ background:"#0d0d0d",border:"1px solid #a855f744",borderRadius:12,padding:"10px 14px",marginBottom:12 }}>
              <p className="p-purple" style={{ fontWeight:700,fontSize:14,fontFamily:F }}>
                💜 {daysToPayment===0?"Tu pago vence hoy":daysToPayment===1?"Tu pago vence mañana":`Tu pago vence en ${daysToPayment} días`} — {nextPayment}
              </p>
            </div>
          )}
          <div style={{ display:"flex",gap:8,marginBottom:12,overflowX:"auto",paddingBottom:4 }}>
            <div style={{...base.statCard("#a855f7"),minWidth:90,flexShrink:0}}><p style={base.h3}>Tokens</p><p className="p-purple" style={{ fontSize:26,fontWeight:800,lineHeight:1,fontFamily:F }}>{user.tokens||0}</p></div>
            <div style={{...base.statCard(daysLeft<15?RED:"#22c55e"),minWidth:90,flexShrink:0}}><p style={base.h3}>Vence</p><p className={daysLeft<15?"p-red":"p-green"} style={{ fontSize:26,fontWeight:800,lineHeight:1,fontFamily:F }}>{daysLeft}d</p></div>
            <div style={{...base.statCard("#a855f7"),minWidth:110,flexShrink:0}}><p style={base.h3}>Pago</p><p style={{ fontWeight:700,fontSize:12,color:"#a855f7",fontFamily:F }}>{nextPayment||"—"}</p></div>
          </div>
        </>}

        {athView==="inicio"&&<>
          <h1 style={{...base.h1,marginBottom:16}}>Clases</h1>
          <MonthCalendar workouts={[]} selectedDate={selDate} onDayClick={setSelDate} paymentDates={userPaymentDates} expiryDate={userExpiry||""} />
          <div style={{ marginBottom:12 }}>
            <p style={{ fontWeight:800,fontSize:18,fontFamily:F }}>{athWeekday}</p>
            <p style={{ color:"#555",fontSize:12,fontFamily:F }}>{selDate}</p>
          </div>
          {athSchedules.length===0
            ?<div style={base.card}><p style={{ color:"#444",fontFamily:F }}>Sin horarios disponibles para el {athWeekday}.</p><p style={{ color:"#666",fontSize:12,fontFamily:F,marginTop:4 }}>Selecciona otro día en el calendario.</p></div>
            :athSchedules.map(sch=>{
              const isMine=sch.bookings?.some(b=>b.athlete_id===user.id);
              const isFull=(sch.bookings?.length||0)>=sch.spots;
              return <div key={sch.id} style={{...base.card,border:isMine?`2px solid ${RED}`:"1px solid #222",background:isMine?"#1a0505":"#161616",marginBottom:10}}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <div>
                    <p className="p-red" style={{ fontSize:32,fontWeight:800,lineHeight:1,fontFamily:F }}>{sch.time||"—"}</p>
                    <p style={{ color:"#555",fontSize:12,fontFamily:F,marginTop:2 }}>{sch.day} · {sch.bookings?.length||0}/{sch.spots} cupos</p>
                  </div>
                  {isMine&&<span style={tag("red")}>✓ Reservado</span>}
                </div>
                <button className={isMine?"p-btn":""} style={{ ...(isMine?base.redBtn:{...base.ghostBtn,width:"100%",display:"block"}),fontSize:14 }} onClick={()=>bookSlot(sch.id)} disabled={!isMine&&isFull}>
                  {isMine?"Cancelar reserva":isFull?"Sin cupos disponibles":"Reservar esta clase"}
                </button>
              </div>;
            })
          }
        </>}

        {athView==="plan"&&<>
          <h1 style={{...base.h1,marginBottom:16}}>Mi Planificación</h1>
          <MonthCalendar workouts={workouts} selectedDate={selDate} onDayClick={setSelDate} paymentDates={userPaymentDates} expiryDate={userExpiry||""} />
          <div style={base.card}>
            <p style={{ fontWeight:700,fontSize:14,color:"#999",marginBottom:12,fontFamily:F }}>{selDate} · {athWeekday}</p>
            {dayWorkouts.length>0?dayWorkouts.map(w=>(
              <div key={w.id} style={{ marginBottom:16,paddingBottom:16,borderBottom:"1px solid #1a1a1a" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <p className="p-red" style={{ fontWeight:800,fontSize:18,textTransform:"uppercase",fontFamily:F }}>{w.title}</p>
                  <span className={w.done?"p-green":"p-orange"} style={tag(w.done?"green":"orange")}>{w.done?"✓ Listo":"Pendiente"}</span>
                </div>
                <pre style={{ color:"#bbb",fontSize:15,fontFamily:"inherit",whiteSpace:"pre-wrap",wordBreak:"break-word",margin:0,padding:0,lineHeight:1.7 }}>{getExercisesText(w)}</pre>
                {w.comment&&<p style={{ color:"#f97316",fontSize:13,marginTop:8,fontStyle:"italic",fontFamily:F }}>💬 {w.comment}</p>}
                {!w.done&&<button className="p-btn" style={{...base.redBtn,marginTop:14}} onClick={()=>markDone(w.id)}>Marcar completado ✓</button>}
              </div>
            )):<p style={{ color:"#444",textAlign:"center",padding:20,fontFamily:F }}>Sin planificación para este día.</p>}
          </div>
        </>}

        {athView==="mensajes"&&<>
          <h1 style={{...base.h1,marginBottom:16}}>Mensajes</h1>
          {(()=>{
            const coachMsg=messages.find(m=>m.from_id!==user.id)||messages.find(m=>m.to_id!==user.id);
            const coachId=coachMsg?.from_id!==user.id?coachMsg?.from_id:coachMsg?.to_id;
            const coachName=messages.find(m=>m.from_id!==user.id)?.from?.name||"Coach NSB";
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

        {athView==="info"&&<>
          <h1 style={{...base.h1,marginBottom:4}}>Políticas</h1>
          <p style={{ color:"#666",fontSize:13,marginBottom:16,fontFamily:F }}>NSB Planning — Never Stop Building</p>
          {[
            { title:"Presencial",color:RED,cls:"p-red",show:isPres||isMixto,items:["Clases no asistidas recuperables hasta 2 por mes.","Cancelaciones con 24 horas de anticipación.","Sin cancelación a tiempo, la clase se descuenta.","Horarios reservables desde la app."]},
            { title:"Online",color:"#f97316",cls:"p-orange",show:isOnline||isMixto,items:["Planificaciones subidas semanalmente a la app.","24 horas para consultar dudas de tu entrenamiento.","Seguimiento semanal a través de la app."]},
            { title:"General",color:"#22c55e",cls:"p-green",show:true,items:["El pago se renueva cada 30 días desde tu fecha de inicio.","El plan vence automáticamente al cumplirse los 30 días.","Cada sesión descuenta 1 token del plan.","Los tokens se recargan al renovar el período."]}
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

        {athView==="progreso"&&<>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <h1 style={{...base.h1,marginBottom:0}}>Mi Progreso</h1>
            <button style={{...base.redBtn,width:"auto",padding:"10px 16px",fontSize:13}} onClick={()=>setShowQuestionnaire(true)}>✏️ Editar</button>
          </div>

          {!athProfile?<>
            <div style={base.card}>
              <p style={{ color:"#ccc",fontSize:15,fontFamily:F,marginBottom:16 }}>Aún no has completado tu perfil. Hazlo para que tu coach pueda planificarte mejor.</p>
              <button style={base.redBtn} onClick={()=>setShowQuestionnaire(true)}>Completar mi perfil</button>
            </div>
          </>:<>
            {/* Resumen entrenamientos */}
            <div style={base.card}>
              <h2 style={base.h2}>Resumen</h2>
              <div style={base.grid2}>
                <div style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}><p style={base.h3}>Completados</p><p className="p-green" style={{ fontWeight:800,fontSize:28,fontFamily:F }}>{workouts.filter(w=>w.done).length}</p></div>
                <div style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}><p style={base.h3}>Total sesiones</p><p style={{ fontWeight:800,fontSize:28,color:"#fff",fontFamily:F }}>{workouts.length}</p></div>
                <div style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}><p style={base.h3}>Días/semana</p><p className="p-red" style={{ fontWeight:800,fontSize:28,fontFamily:F }}>{athProfile.training_days_per_week}</p></div>
                <div style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}><p style={base.h3}>Lugar</p><p style={{ fontWeight:600,fontSize:13,color:"#ccc",fontFamily:F }}>{athProfile.equipment||"—"}</p></div>
              </div>
              {athProfile.goals&&<div style={{ background:"#0d0d0d",borderRadius:8,padding:12,marginTop:10 }}>
                <p style={base.h3}>Objetivos</p>
                <p style={{ color:"#ccc",fontSize:14,fontFamily:F }}>{athProfile.goals}</p>
              </div>}
            </div>

            {/* Halterofilia */}
            <div style={base.card}>
              <h2 style={base.h2}>Halterofilia</h2>
              <div style={base.grid2}>
                {[["Snatch","snatch"],["C&J","clean_and_jerk"],["Clean","clean"],["Frontal","front_squat"],["Trasera","back_squat"],["Peso Muerto","deadlift"],["OHS","overhead_squat"]].map(([l,k])=>(
                  <div key={k} style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}>
                    <p style={base.h3}>{l}</p>
                    <p className={athProfile[k]?"p-red":""} style={{ fontWeight:800,fontSize:22,color:athProfile[k]?RED:"#333",fontFamily:F }}>{athProfile[k]?`${athProfile[k]}kg`:"—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gimnásticos */}
            <div style={base.card}>
              <h2 style={base.h2}>Gimnásticos</h2>
              <div style={base.grid2}>
                {[["Pull-ups","pull_ups"],["Muscle-ups","muscle_ups"],["HSPU","handstand_pushups"],["Push-ups","max_pushups"]].map(([l,k])=>(
                  <div key={k} style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}>
                    <p style={base.h3}>{l}</p>
                    <p className={athProfile[k]?"p-red":""} style={{ fontWeight:800,fontSize:22,color:athProfile[k]?RED:"#333",fontFamily:F }}>{athProfile[k]?`${athProfile[k]} reps`:"—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Running */}
            <div style={base.card}>
              <h2 style={base.h2}>Running</h2>
              <div style={base.grid2}>
                {[["5km","time_5km"],["10km","time_10km"],["21km","time_21km"]].map(([l,k])=>(
                  <div key={k} style={{ background:"#0d0d0d",borderRadius:8,padding:12 }}>
                    <p style={base.h3}>{l}</p>
                    <p className={athProfile[k]?"p-red":""} style={{ fontWeight:800,fontSize:22,color:athProfile[k]?RED:"#333",fontFamily:F }}>{formatTime(athProfile[k])}</p>
                  </div>
                ))}
              </div>
            </div>

            {athProfile.notes&&<div style={base.card}>
              <h2 style={base.h2}>Notas</h2>
              <p style={{ color:"#bbb",fontSize:14,fontFamily:F }}>{athProfile.notes}</p>
            </div>}
          </>}
        </>}

      </div>
      <div style={base.bottomNav}>
        {navItems.map(([v,icon,label])=>(
          <button key={v} style={base.navItem(athView===v)} onClick={()=>setAthView(v)}>
            <span style={{ fontSize:20,marginBottom:2 }}>{icon}</span>
            <span style={{ fontSize:9 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}