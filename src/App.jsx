import { useState, useEffect } from "react";
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

const formatTime = (secs) => {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const parseTime = (str) => {
  if (!str) return null;
  const parts = str.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(str) * 60;
};

const tag = (c) => ({
  display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 11,
  fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: F,
  background: c === "red" ? `${RED}22` : c === "green" ? "#22c55e22" : "#f9731622",
  color: c === "red" ? RED : c === "green" ? "#22c55e" : "#f97316",
  border: `1px solid ${c === "red" ? `${RED}44` : c === "green" ? "#22c55e44" : "#f9731644"}`
});

const s = {
  app: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: F, paddingBottom: 80 },
  topBar: { background: "#0d0d0d", borderBottom: "1px solid #222", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 },
  main: { padding: 16 },
  card: { background: "#161616", border: "1px solid #222", borderRadius: 14, padding: 16, marginBottom: 12 },
  input: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: "14px 16px", color: "#fff", fontFamily: F, fontSize: 16, width: "100%", boxSizing: "border-box", outline: "none", marginBottom: 12, display: "block" },
  redBtn: { background: RED, color: "#fff", border: "none", padding: "14px 24px", borderRadius: 10, cursor: "pointer", fontFamily: F, fontSize: 15, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", width: "100%", display: "block" },
  ghostBtn: { background: "transparent", color: "#999", border: "1px solid #333", padding: "10px 16px", borderRadius: 10, cursor: "pointer", fontFamily: F, fontSize: 13, fontWeight: 600, textTransform: "uppercase" },
  label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", marginBottom: 6, display: "block", fontFamily: F },
  h1: { fontSize: 28, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 4, fontFamily: F },
  h2: { fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12, fontFamily: F },
  h3: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", marginBottom: 6, fontFamily: F },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  statCard: (color) => ({ background: "#161616", border: `1px solid ${color}44`, borderRadius: 14, padding: 16, borderLeft: `3px solid ${color}` }),
  bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#111", borderTop: "1px solid #222", display: "flex", zIndex: 100 },
  navItem: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0 12px", cursor: "pointer", color: active ? RED : "#555", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", border: "none", background: "transparent", fontFamily: F }),
};

const EQUIPMENT_OPTIONS = ["Box CrossFit", "Gym completo", "Home gym", "Solo barra y pesas", "Sin equipamiento"];

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
  const [trainingDays, setTrainingDays] = useState([]);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [selAthlete, setSelAthlete] = useState("");
  const [showAF, setShowAF] = useState(false);
  const [showSF, setShowSF] = useState(false);
  const [showDayForm, setShowDayForm] = useState(false);
  const [aForm, setAForm] = useState({ name: "", email: "", password: "", plan: "", expiry: "", type: "Online", training_days_per_week: 3 });
  const [sForm, setSForm] = useState({ day: "Lunes", time: "", spots: 4 });
  const [dayForm, setDayForm] = useState({ day_number: 1, title: "", exercises: "", week_start: "", notes: "", athlete_id: "" });
  const [athleteProfile, setAthleteProfile] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [qForm, setQForm] = useState({
    training_days_per_week: 3, equipment: "", has_running_space: false, goals: "",
    snatch: "", clean_and_jerk: "", clean: "", front_squat: "", back_squat: "",
    deadlift: "", overhead_squat: "", pull_ups: "", muscle_ups: "", handstand_pushups: "",
    time_5km: "", time_10km: "", time_21km: "", max_pushups: "", notes: ""
  });

  const login = async () => {
    setLoading(true); setErr("");
    const { data, error } = await supabase.from("users").select("*").eq("email", email).eq("password", pw).single();
    if (error || !data) setErr("Email o contraseña incorrectos");
    else { setUser(data); loadData(data); }
    setLoading(false);
  };

  const loadData = async (u) => {
    if (u.role === "coach") {
      const { data: a } = await supabase.from("users").select("*").eq("role", "athlete").order("name");
      setAthletes(a || []);
      const { data: sch } = await supabase.from("schedules").select("*, bookings(*, users(*))");
      setSchedules(sch || []);
      const { data: m } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages(m || []);
      const { data: td } = await supabase.from("training_days").select("*, users(name)").order("athlete_id, week_start, day_number");
      setTrainingDays(td || []);
    } else {
      const { data: sch } = await supabase.from("schedules").select("*, bookings(*, users(*))");
      setSchedules(sch || []);
      const { data: m } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages((m || []).filter(x => x.from_id === u.id || x.to_id === u.id));
      const { data: td } = await supabase.from("training_days").select("*").eq("athlete_id", u.id).order("week_start, day_number");
      setTrainingDays(td || []);
      const { data: ap } = await supabase.from("athlete_profile").select("*").eq("athlete_id", u.id).single();
      setAthleteProfile(ap);
      if (!ap) setShowQuestionnaire(true);
    }
  };

  const logout = () => { setUser(null); setEmail(""); setPw(""); setView("home"); setSelectedAthlete(null); };

  const createAthlete = async () => {
    await supabase.from("users").insert({ ...aForm, role: "athlete" });
    setShowAF(false);
    setAForm({ name: "", email: "", password: "", plan: "", expiry: "", type: "Online", training_days_per_week: 3 });
    loadData(user);
  };

  const delAthlete = async (id) => {
    if (window.confirm("¿Eliminar este atleta?")) {
      await supabase.from("users").delete().eq("id", id);
      setSelectedAthlete(null);
      loadData(user);
    }
  };

  const createSchedule = async () => {
    await supabase.from("schedules").insert({ ...sForm, spots: parseInt(sForm.spots) });
    setShowSF(false); setSForm({ day: "Lunes", time: "", spots: 4 }); loadData(user);
  };

  const delSchedule = async (id) => { await supabase.from("schedules").delete().eq("id", id); loadData(user); };

  const createTrainingDay = async () => {
    await supabase.from("training_days").insert({
      ...dayForm,
      exercises: dayForm.exercises.split("\n").filter(e => e.trim()),
      day_number: parseInt(dayForm.day_number)
    });
    setShowDayForm(false);
    setDayForm({ day_number: 1, title: "", exercises: "", week_start: "", notes: "", athlete_id: "" });
    loadData(user);
  };

  const delTrainingDay = async (id) => {
    await supabase.from("training_days").delete().eq("id", id);
    setSelectedDay(null);
    loadData(user);
  };

  const markDone = async (id, done) => {
    await supabase.from("training_days").update({ done: !done }).eq("id", id);
    loadData(user);
  };

  const bookSlot = async (sid) => {
    const sch = schedules.find(sc => sc.id === sid);
    const mine = sch?.bookings?.find(b => b.athlete_id === user.id);
    if (mine) await supabase.from("bookings").delete().eq("id", mine.id);
    else await supabase.from("bookings").insert({ schedule_id: sid, athlete_id: user.id });
    loadData(user);
  };

  const sendMsg = async () => {
    if (!newMsg.trim()) return;
    let toId = user.role === "coach" ? selAthlete : null;
    if (user.role !== "coach") {
      const { data: c } = await supabase.from("users").select("id").eq("role", "coach").single();
      toId = c?.id;
    }
    if (!toId) return;
    await supabase.from("messages").insert({ from_id: user.id, to_id: toId, text: newMsg });
    setNewMsg(""); loadData(user);
  };

  const saveQuestionnaire = async () => {
    const payload = {
      athlete_id: user.id,
      training_days_per_week: parseInt(qForm.training_days_per_week),
      equipment: qForm.equipment,
      has_running_space: qForm.has_running_space,
      goals: qForm.goals,
      snatch: parseInt(qForm.snatch) || null,
      clean_and_jerk: parseInt(qForm.clean_and_jerk) || null,
      clean: parseInt(qForm.clean) || null,
      front_squat: parseInt(qForm.front_squat) || null,
      back_squat: parseInt(qForm.back_squat) || null,
      deadlift: parseInt(qForm.deadlift) || null,
      overhead_squat: parseInt(qForm.overhead_squat) || null,
      pull_ups: parseInt(qForm.pull_ups) || null,
      muscle_ups: parseInt(qForm.muscle_ups) || null,
      handstand_pushups: parseInt(qForm.handstand_pushups) || null,
      time_5km: parseTime(qForm.time_5km),
      time_10km: parseTime(qForm.time_10km),
      time_21km: parseTime(qForm.time_21km),
      max_pushups: parseInt(qForm.max_pushups) || null,
      notes: qForm.notes,
      updated_at: new Date().toISOString()
    };
    if (athleteProfile) {
      await supabase.from("athlete_profile").update(payload).eq("athlete_id", user.id);
    } else {
      await supabase.from("athlete_profile").insert(payload);
    }
    setShowQuestionnaire(false);
    loadData(user);
  };

  const getAthleteTrainingDays = (athleteId) => trainingDays.filter(td => td.athlete_id === athleteId);

  const getWeekLabel = (weekStart) => {
    if (!weekStart) return "";
    const d = new Date(weekStart + "T00:00:00");
    return `Semana del ${d.getDate()}/${d.getMonth() + 1}`;
  };

  const groupByWeek = (days) => {
    const groups = {};
    days.forEach(d => {
      const key = d.week_start || "sin-semana";
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return groups;
  };

  // LOGIN
  if (!user) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", paddingTop: 40, padding: "40px 20px 20px", fontFamily: F }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img src="/logo.png" alt="NSB" style={{ width: 180, marginBottom: 8 }} />
        <p style={{ color: "#555", letterSpacing: "0.3em", fontSize: 10, textTransform: "uppercase", fontFamily: F }}>Never Stop Building</p>
      </div>
      <div style={{ background: "#0d0d0d", border: "none", borderRadius: 16, padding: "24px 20px", width: "100%", maxWidth: 380 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 20, color: "#fff", fontFamily: F }}>Iniciar Sesión</h2>
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e => e.key === "Enter" && login()} />
        <label style={s.label}>Contraseña</label>
        <input style={{ ...s.input, marginBottom: 20 }} type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        {err && <p style={{ color: RED, fontSize: 13, marginBottom: 12, fontFamily: F }}>{err}</p>}
        <button style={s.redBtn} onClick={login} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 16, fontStyle: "italic", fontFamily: F }}>tus metas merecen un plan real.</p>
      </div>
    </div>
  );

  // QUESTIONNAIRE
  if (showQuestionnaire) return (
    <div style={{ ...s.app, paddingBottom: 20 }}>
      <div style={s.topBar}>
        <img src="/logo.png" alt="NSB" style={{ height: 32 }} />
        <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 11 }} onClick={() => setShowQuestionnaire(false)}>Cerrar</button>
      </div>
      <div style={s.main}>
        <h1 style={{ ...s.h1, marginBottom: 4 }}>Tu Perfil</h1>
        <p style={{ color: "#666", fontSize: 14, marginBottom: 20, fontFamily: F }}>Completa tu información para que tu coach pueda planificarte mejor.</p>

        <div style={s.card}>
          <h2 style={s.h2}>General</h2>
          <label style={s.label}>¿Cuántos días entrenas por semana?</label>
          <select style={s.input} value={qForm.training_days_per_week} onChange={e => setQForm({ ...qForm, training_days_per_week: e.target.value })}>
            {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} días</option>)}
          </select>
          <label style={s.label}>¿Dónde entrenas?</label>
          <select style={s.input} value={qForm.equipment} onChange={e => setQForm({ ...qForm, equipment: e.target.value })}>
            <option value="">Seleccionar...</option>
            {EQUIPMENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <label style={s.label}>¿Tienes espacio para correr?</label>
          <select style={s.input} value={qForm.has_running_space ? "si" : "no"} onChange={e => setQForm({ ...qForm, has_running_space: e.target.value === "si" })}>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
          <label style={s.label}>Objetivos</label>
          <textarea style={{ ...s.input, height: 80, resize: "vertical" }} placeholder="¿Qué quieres lograr?" value={qForm.goals} onChange={e => setQForm({ ...qForm, goals: e.target.value })} />
        </div>

        <div style={s.card}>
          <h2 style={s.h2}>Halterofilia (kg)</h2>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 12, fontFamily: F }}>Deja en blanco si no sabes o no aplica.</p>
          {[["Arranque (Snatch)", "snatch"], ["Envión (C&J)", "clean_and_jerk"], ["Cargada (Clean)", "clean"], ["Sentadilla Frontal", "front_squat"], ["Sentadilla Trasera", "back_squat"], ["Peso Muerto", "deadlift"], ["Sentadilla Overhead", "overhead_squat"]].map(([l, k]) => (
            <div key={k}>
              <label style={s.label}>{l}</label>
              <input style={s.input} type="number" placeholder="kg" value={qForm[k]} onChange={e => setQForm({ ...qForm, [k]: e.target.value })} />
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h2 style={s.h2}>Gimnásticos CrossFit</h2>
          {[["Pull-ups máx.", "pull_ups"], ["Muscle-ups máx.", "muscle_ups"], ["HSPU máx.", "handstand_pushups"], ["Push-ups máx.", "max_pushups"]].map(([l, k]) => (
            <div key={k}>
              <label style={s.label}>{l} (reps)</label>
              <input style={s.input} type="number" placeholder="reps" value={qForm[k]} onChange={e => setQForm({ ...qForm, [k]: e.target.value })} />
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h2 style={s.h2}>Running</h2>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 12, fontFamily: F }}>Formato: minutos:segundos (ej: 25:30)</p>
          {[["5km", "time_5km"], ["10km", "time_10km"], ["21km (media)", "time_21km"]].map(([l, k]) => (
            <div key={k}>
              <label style={s.label}>{l}</label>
              <input style={s.input} type="text" placeholder="mm:ss" value={qForm[k]} onChange={e => setQForm({ ...qForm, [k]: e.target.value })} />
            </div>
          ))}
        </div>

        <div style={s.card}>
          <h2 style={s.h2}>Notas adicionales</h2>
          <textarea style={{ ...s.input, height: 80, resize: "vertical" }} placeholder="Lesiones, limitaciones, información adicional..." value={qForm.notes} onChange={e => setQForm({ ...qForm, notes: e.target.value })} />
        </div>

        <button style={s.redBtn} onClick={saveQuestionnaire}>Guardar perfil</button>
      </div>
    </div>
  );

  // COACH
  if (user.role === "coach") {
    const cv = ["home", "atletas", "horarios", "mensajes"];
    const ci = { home: "⚡", atletas: "👥", horarios: "📅", mensajes: "💬" };
    const cl = { home: "Inicio", atletas: "Atletas", horarios: "Horarios", mensajes: "Mensajes" };

    // ATHLETE DETAIL VIEW
    if (selectedAthlete) {
      const athDays = getAthleteTrainingDays(selectedAthlete.id);
      const weekGroups = groupByWeek(athDays);
      const weeks = Object.keys(weekGroups).sort();
      const done = athDays.filter(d => d.done).length;

      return (
        <div style={s.app}>
          <div style={s.topBar}>
            <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 13 }} onClick={() => setSelectedAthlete(null)}>← Volver</button>
            <span style={{ fontWeight: 800, fontSize: 16, fontFamily: F }}>{selectedAthlete.name}</span>
            <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 11, color: RED, borderColor: `${RED}44` }} onClick={() => delAthlete(selectedAthlete.id)}>Eliminar</button>
          </div>
          <div style={s.main}>
            {/* Info */}
            <div style={s.grid2}>
              <div style={s.statCard(RED)}><p style={s.h3}>Plan</p><p style={{ fontWeight: 700, fontSize: 14, fontFamily: F }}>{selectedAthlete.plan || "Sin plan"}</p></div>
              <div style={s.statCard("#f97316")}><p style={s.h3}>Vence en</p><p style={{ fontWeight: 800, fontSize: 28, color: "#f97316", lineHeight: 1, fontFamily: F }}>{getDays(selectedAthlete.expiry)}d</p></div>
              <div style={s.statCard("#22c55e")}><p style={s.h3}>Completados</p><p style={{ fontWeight: 800, fontSize: 28, color: "#22c55e", lineHeight: 1, fontFamily: F }}>{done}</p></div>
              <div style={s.statCard("#a855f7")}><p style={s.h3}>Total días</p><p style={{ fontWeight: 800, fontSize: 28, color: "#a855f7", lineHeight: 1, fontFamily: F }}>{athDays.length}</p></div>
            </div>

            {/* Add day button */}
            <button style={{ ...s.redBtn, marginBottom: 12 }} onClick={() => { setShowDayForm(!showDayForm); setDayForm({ ...dayForm, athlete_id: selectedAthlete.id }); }}>
              + Agregar entrenamiento
            </button>

            {showDayForm && (
              <div style={s.card}>
                <h2 style={s.h2}>Nuevo entrenamiento</h2>
                <label style={s.label}>Semana (fecha del lunes)</label>
                <input style={s.input} type="date" value={dayForm.week_start} onChange={e => setDayForm({ ...dayForm, week_start: e.target.value })} />
                <label style={s.label}>Día #</label>
                <select style={s.input} value={dayForm.day_number} onChange={e => setDayForm({ ...dayForm, day_number: e.target.value })}>
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>Día {n}</option>)}
                </select>
                <label style={s.label}>Título</label>
                <input style={s.input} value={dayForm.title} onChange={e => setDayForm({ ...dayForm, title: e.target.value })} placeholder="Ej: Fuerza + Metcon" />
                <label style={s.label}>Ejercicios (uno por línea)</label>
                <textarea style={{ ...s.input, height: 140, resize: "vertical" }} value={dayForm.exercises} onChange={e => setDayForm({ ...dayForm, exercises: e.target.value })} placeholder={"Back Squat 5x5 @ 80%\nMetcon 20min AMRAP\n3 Pull-ups\n6 Push-ups\n9 Squats"} />
                <label style={s.label}>Notas para el atleta</label>
                <textarea style={{ ...s.input, height: 60, resize: "vertical" }} value={dayForm.notes} onChange={e => setDayForm({ ...dayForm, notes: e.target.value })} placeholder="Observaciones, indicaciones..." />
                <button style={s.redBtn} onClick={createTrainingDay}>Crear entrenamiento</button>
              </div>
            )}

            {/* Training days by week */}
            {weeks.length === 0 ? (
              <div style={s.card}><p style={{ color: "#444", fontFamily: F }}>Sin entrenamientos aún. Agrega el primero.</p></div>
            ) : weeks.map(week => (
              <div key={week}>
                <p style={{ ...s.h3, marginBottom: 8, marginTop: 8 }}>{getWeekLabel(week)}</p>
                {weekGroups[week].sort((a, b) => a.day_number - b.day_number).map(td => (
                  <div key={td.id} style={{ ...s.card, border: td.done ? "1px solid #22c55e44" : "1px solid #222", cursor: "pointer" }} onClick={() => setSelectedDay(selectedDay?.id === td.id ? null : td)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 18, color: RED, fontFamily: F }}>Día {td.day_number}</p>
                        <p style={{ fontWeight: 600, fontSize: 14, fontFamily: F }}>{td.title}</p>
                        <p style={{ color: "#555", fontSize: 12, fontFamily: F }}>{td.exercises?.length} ejercicios</p>
                      </div>
                      <span style={tag(td.done ? "green" : "orange")}>{td.done ? "✓ Listo" : "Pendiente"}</span>
                    </div>
                    {selectedDay?.id === td.id && (
                      <div style={{ marginTop: 12, borderTop: "1px solid #2a2a2a", paddingTop: 12 }}>
                        {td.exercises?.map((ex, i) => <p key={i} style={{ color: "#bbb", fontSize: 14, padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontFamily: F }}>· {ex}</p>)}
                        {td.notes && <p style={{ color: "#666", fontSize: 13, marginTop: 8, fontStyle: "italic", fontFamily: F }}>📝 {td.notes}</p>}
                        <button style={{ ...s.ghostBtn, marginTop: 12, width: "100%", fontSize: 12, color: RED, borderColor: `${RED}44` }} onClick={(e) => { e.stopPropagation(); delTrainingDay(td.id); }}>Eliminar día</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div style={s.app}>
        <div style={s.topBar}>
          <img src="/logo.png" alt="NSB" style={{ height: 32 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#666", fontSize: 13, fontFamily: F }}>{user.name}</span>
            <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 11 }} onClick={logout}>Salir</button>
          </div>
        </div>
        <div style={s.main}>

          {view === "home" && <>
            <h1 style={s.h1}>Dashboard</h1>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 16, fontFamily: F }}>{new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>
            <div style={s.grid2}>
              <div style={s.statCard(RED)}><p style={s.h3}>Atletas</p><p style={{ fontSize: 40, fontWeight: 800, color: RED, lineHeight: 1, fontFamily: F }}>{athletes.length}</p></div>
              <div style={s.statCard("#f97316")}><p style={s.h3}>Horarios</p><p style={{ fontSize: 40, fontWeight: 800, color: "#f97316", lineHeight: 1, fontFamily: F }}>{schedules.length}</p></div>
              <div style={s.statCard("#22c55e")}><p style={s.h3}>Días creados</p><p style={{ fontSize: 40, fontWeight: 800, color: "#22c55e", lineHeight: 1, fontFamily: F }}>{trainingDays.length}</p></div>
              <div style={s.statCard("#a855f7")}><p style={s.h3}>Completados</p><p style={{ fontSize: 40, fontWeight: 800, color: "#a855f7", lineHeight: 1, fontFamily: F }}>{trainingDays.filter(t => t.done).length}</p></div>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Atletas</h2>
              {athletes.map(a => {
                const d = getDays(a.expiry);
                const athDays = getAthleteTrainingDays(a.id);
                const done = athDays.filter(x => x.done).length;
                return <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a1a", cursor: "pointer" }} onClick={() => { setSelectedAthlete(a); setView("atletas"); }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16, fontFamily: F }}>{a.name}</p>
                    <p style={{ color: "#666", fontSize: 13, fontFamily: F }}>{done}/{athDays.length} días · {a.type}</p>
                  </div>
                  <span style={tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d}d</span>
                </div>;
              })}
            </div>
          </>}

          {view === "atletas" && <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ ...s.h1, marginBottom: 0 }}>Atletas</h1>
              <button style={{ ...s.redBtn, width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setShowAF(!showAF)}>+ Agregar</button>
            </div>
            {showAF && <div style={s.card}>
              <h2 style={s.h2}>Nuevo atleta</h2>
              {[["Nombre", "name", "text", "Nombre completo"], ["Email", "email", "email", "email@ejemplo.com"], ["Contraseña", "password", "text", "Contraseña"], ["Plan", "plan", "text", "Ej: NSB Personalizado"]].map(([l, k, t, ph]) => (
                <div key={k}><label style={s.label}>{l}</label><input style={s.input} type={t} value={aForm[k]} onChange={e => setAForm({ ...aForm, [k]: e.target.value })} placeholder={ph} /></div>
              ))}
              <label style={s.label}>Vencimiento</label>
              <input style={s.input} type="date" value={aForm.expiry} onChange={e => setAForm({ ...aForm, expiry: e.target.value })} />
              <label style={s.label}>Tipo</label>
              <select style={s.input} value={aForm.type} onChange={e => setAForm({ ...aForm, type: e.target.value })}>
                <option>Online</option><option>Presencial</option><option>Mixto</option>
              </select>
              <label style={s.label}>Días por semana</label>
              <select style={s.input} value={aForm.training_days_per_week} onChange={e => setAForm({ ...aForm, training_days_per_week: e.target.value })}>
                {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} días</option>)}
              </select>
              <button style={s.redBtn} onClick={createAthlete}>Crear atleta</button>
            </div>}
            {athletes.map(a => {
              const d = getDays(a.expiry);
              const athDays = getAthleteTrainingDays(a.id);
              const done = athDays.filter(x => x.done).length;
              return <div key={a.id} style={{ ...s.card, cursor: "pointer" }} onClick={() => setSelectedAthlete(a)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 18, fontFamily: F }}>{a.name}</p>
                    <span style={tag("orange")}>{a.type}</span>
                  </div>
                  <span style={tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d}d</span>
                </div>
                <div style={s.grid2}>
                  <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Días completados</p><p style={{ fontWeight: 800, fontSize: 22, color: "#22c55e", fontFamily: F }}>{done}/{athDays.length}</p></div>
                  <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Plan</p><p style={{ fontWeight: 600, fontSize: 13, fontFamily: F }}>{a.plan || "Sin plan"}</p></div>
                </div>
                <p style={{ color: "#555", fontSize: 12, marginTop: 8, fontFamily: F }}>Toca para ver planificación →</p>
              </div>;
            })}
          </>}

          {view === "horarios" && <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h1 style={{ ...s.h1, marginBottom: 0 }}>Horarios</h1>
              <button style={{ ...s.redBtn, width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setShowSF(!showSF)}>+ Agregar</button>
            </div>
            {showSF && <div style={s.card}>
              <h2 style={s.h2}>Nuevo horario</h2>
              <label style={s.label}>Día</label>
              <select style={s.input} value={sForm.day} onChange={e => setSForm({ ...sForm, day: e.target.value })}>
                {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map(d => <option key={d}>{d}</option>)}
              </select>
              <label style={s.label}>Hora</label>
              <input style={s.input} type="time" value={sForm.time} onChange={e => setSForm({ ...sForm, time: e.target.value })} />
              <label style={s.label}>Cupos</label>
              <input style={s.input} type="number" value={sForm.spots} onChange={e => setSForm({ ...sForm, spots: e.target.value })} />
              <button style={s.redBtn} onClick={createSchedule}>Crear horario</button>
            </div>}
            {schedules.map(sch => (
              <div key={sch.id} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div><p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase", fontFamily: F }}>{sch.day}</p><p style={{ color: RED, fontSize: 28, fontWeight: 800, lineHeight: 1, fontFamily: F }}>{sch.time}</p></div>
                  <div style={{ textAlign: "right" }}><p style={s.h3}>Cupos</p><p style={{ fontWeight: 700, fontSize: 22, fontFamily: F }}>{sch.bookings?.length || 0}/{sch.spots}</p></div>
                </div>
                {sch.bookings?.length === 0 ? <p style={{ color: "#444", fontSize: 13, fontFamily: F }}>Sin reservas</p> : sch.bookings?.map(b => <p key={b.id} style={{ color: "#ccc", fontSize: 14, padding: "3px 0", fontFamily: F }}>· {b.users?.name}</p>)}
                <button style={{ ...s.ghostBtn, marginTop: 10, width: "100%", fontSize: 12, color: RED, borderColor: `${RED}44` }} onClick={() => delSchedule(sch.id)}>Eliminar</button>
              </div>
            ))}
          </>}

          {view === "mensajes" && <>
            <h1 style={{ ...s.h1, marginBottom: 16 }}>Mensajes</h1>
            <div style={s.card}>
              <label style={s.label}>Enviar a</label>
              <select style={s.input} value={selAthlete} onChange={e => setSelAthlete(e.target.value)}>
                <option value="">Seleccionar atleta</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <textarea style={{ ...s.input, height: 90, resize: "vertical" }} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
              <button style={s.redBtn} onClick={sendMsg}>Enviar</button>
            </div>
            <div style={s.card}>
              <p style={s.h3}>Historial</p>
              {messages.slice().reverse().map(m => (
                <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: RED, fontFamily: F }}>{m.from?.name} → {m.to?.name}</span>
                    <span style={{ color: "#444", fontSize: 11, fontFamily: F }}>{new Date(m.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: "#bbb", fontSize: 14, fontFamily: F }}>{m.text}</p>
                </div>
              ))}
            </div>
          </>}
        </div>
        <div style={s.bottomNav}>
          {cv.map(v => (
            <button key={v} style={s.navItem(view === v)} onClick={() => { setView(v); setSelectedAthlete(null); }}>
              <span style={{ fontSize: 20, marginBottom: 2 }}>{ci[v]}</span>{cl[v]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ATLETA
  const daysLeft = getDays(user.expiry);
  const myDays = trainingDays;
  const weekGroups = groupByWeek(myDays);
  const weeks = Object.keys(weekGroups).sort();
  const currentWeek = weeks[weeks.length - 1];
  const currentWeekDays = currentWeek ? weekGroups[currentWeek].sort((a, b) => a.day_number - b.day_number) : [];
  const totalDone = myDays.filter(d => d.done).length;
  const av = ["home", "plan", "agendar", "perfil"];
  const ai = { home: "🏠", plan: "📋", agendar: "📅", perfil: "👤" };
  const al = { home: "Inicio", plan: "Mi Plan", agendar: "Agendar", perfil: "Perfil" };

  return (
    <div style={s.app}>
      <div style={s.topBar}>
        <img src="/logo.png" alt="NSB" style={{ height: 32 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#666", fontSize: 13, fontFamily: F }}>{user.name.split(" ")[0]}</span>
          <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 11 }} onClick={logout}>Salir</button>
        </div>
      </div>
      <div style={s.main}>

        {view === "home" && <>
          <h1 style={s.h1}>Hola, <span style={{ color: RED }}>{user.name.split(" ")[0]}</span></h1>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 4, fontFamily: F }}>{new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</p>
          <p style={{ color: "#444", fontSize: 13, marginBottom: 16, fontFamily: F }}>Never Stop Building</p>
          {daysLeft < 15 && <div style={{ background: "#1a0505", border: `1px solid ${RED}`, borderRadius: 12, padding: 14, marginBottom: 12 }}>
            <p style={{ color: RED, fontWeight: 700, fontSize: 14, fontFamily: F }}>⚠ Tu plan vence en {daysLeft} días</p>
          </div>}
          <div style={s.grid2}>
            <div style={s.statCard(RED)}><p style={s.h3}>Plan</p><p style={{ fontWeight: 700, fontSize: 14, fontFamily: F }}>{user.plan || "Sin plan"}</p><p style={{ color: "#f97316", fontSize: 12, fontFamily: F }}>{user.type}</p></div>
            <div style={s.statCard("#f97316")}><p style={s.h3}>Vence en</p><p style={{ fontSize: 32, fontWeight: 800, color: daysLeft < 15 ? RED : daysLeft < 30 ? "#f97316" : "#22c55e", lineHeight: 1, fontFamily: F }}>{daysLeft}d</p></div>
            <div style={s.statCard("#22c55e")}><p style={s.h3}>Total completados</p><p style={{ fontSize: 32, fontWeight: 800, color: "#22c55e", lineHeight: 1, fontFamily: F }}>{totalDone}</p></div>
            <div style={s.statCard("#a855f7")}><p style={s.h3}>Esta semana</p><p style={{ fontSize: 32, fontWeight: 800, color: "#a855f7", lineHeight: 1, fontFamily: F }}>{currentWeekDays.filter(d => d.done).length}/{currentWeekDays.length}</p></div>
          </div>

          {currentWeekDays.length > 0 && <div style={s.card}>
            <h2 style={s.h2}>Semana actual</h2>
            {currentWeekDays.map(td => (
              <div key={td.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: RED, fontFamily: F }}>Día {td.day_number}</p>
                  <p style={{ color: "#ccc", fontSize: 14, fontFamily: F }}>{td.title}</p>
                </div>
                <span style={tag(td.done ? "green" : "orange")}>{td.done ? "✓" : "Pend."}</span>
              </div>
            ))}
          </div>}
        </>}

        {view === "plan" && <>
          <h1 style={{ ...s.h1, marginBottom: 4 }}>Mi Planificación</h1>
          <p style={{ color: "#666", fontSize: 13, marginBottom: 16, fontFamily: F }}>{totalDone} días completados en total</p>

          {weeks.length === 0 ? (
            <div style={s.card}><p style={{ color: "#444", fontFamily: F }}>Aún no tienes entrenamientos. Tu coach los está preparando.</p></div>
          ) : weeks.slice().reverse().map(week => (
            <div key={week}>
              <p style={{ ...s.h3, marginBottom: 8, marginTop: 4 }}>{getWeekLabel(week)}</p>
              {weekGroups[week].sort((a, b) => a.day_number - b.day_number).map(td => (
                <div key={td.id} style={{ ...s.card, border: selectedDay?.id === td.id ? `1px solid ${RED}` : td.done ? "1px solid #22c55e44" : "1px solid #222", cursor: "pointer" }} onClick={() => setSelectedDay(selectedDay?.id === td.id ? null : td)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 20, color: RED, fontFamily: F }}>Día {td.day_number}</p>
                      <p style={{ fontWeight: 600, fontSize: 15, fontFamily: F }}>{td.title}</p>
                      <p style={{ color: "#555", fontSize: 12, fontFamily: F }}>{td.exercises?.length} ejercicios</p>
                    </div>
                    <span style={tag(td.done ? "green" : "orange")}>{td.done ? "✓ Listo" : "Pendiente"}</span>
                  </div>
                  {selectedDay?.id === td.id && (
                    <div style={{ marginTop: 12, borderTop: "1px solid #2a2a2a", paddingTop: 12 }}>
                      {td.exercises?.map((ex, i) => <p key={i} style={{ color: "#bbb", fontSize: 15, padding: "8px 0", borderBottom: "1px solid #1a1a1a", fontFamily: F }}>{String(i + 1).padStart(2, "0")}. {ex}</p>)}
                      {td.notes && <p style={{ color: "#666", fontSize: 13, marginTop: 10, fontStyle: "italic", fontFamily: F }}>📝 {td.notes}</p>}
                      {!td.done && <button style={{ ...s.redBtn, marginTop: 14 }} onClick={(e) => { e.stopPropagation(); markDone(td.id, td.done); }}>Marcar completado ✓</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </>}

        {view === "agendar" && <>
          <h1 style={{ ...s.h1, marginBottom: 16 }}>Agendar Sesión</h1>
          {schedules.length === 0 ? <div style={s.card}><p style={{ color: "#444", fontFamily: F }}>No hay horarios disponibles aún.</p></div> :
            schedules.map(sch => {
              const isMine = sch.bookings?.some(b => b.athlete_id === user.id);
              const isFull = (sch.bookings?.length || 0) >= sch.spots;
              return <div key={sch.id} style={{ ...s.card, border: isMine ? `1px solid ${RED}` : "1px solid #222", background: isMine ? "#1a0505" : "#161616" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div><p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase", fontFamily: F }}>{sch.day}</p><p style={{ color: RED, fontSize: 28, fontWeight: 800, lineHeight: 1, fontFamily: F }}>{sch.time}</p></div>
                  <div style={{ textAlign: "right" }}><p style={s.h3}>Cupos</p><p style={{ fontWeight: 700, fontSize: 20, fontFamily: F }}>{sch.bookings?.length || 0}/{sch.spots}</p></div>
                </div>
                <button style={{ ...(isMine ? s.redBtn : s.ghostBtn), fontSize: 13 }} onClick={() => bookSlot(sch.id)} disabled={!isMine && isFull}>
                  {isMine ? "✓ Reservado — Cancelar" : isFull ? "Sin cupos disponibles" : "Reservar este horario"}
                </button>
              </div>;
            })}
        </>}

        {view === "perfil" && <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h1 style={{ ...s.h1, marginBottom: 0 }}>Mi Perfil</h1>
            <button style={{ ...s.redBtn, width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => { if (athleteProfile) setQForm({ training_days_per_week: athleteProfile.training_days_per_week || 3, equipment: athleteProfile.equipment || "", has_running_space: athleteProfile.has_running_space || false, goals: athleteProfile.goals || "", snatch: athleteProfile.snatch || "", clean_and_jerk: athleteProfile.clean_and_jerk || "", clean: athleteProfile.clean || "", front_squat: athleteProfile.front_squat || "", back_squat: athleteProfile.back_squat || "", deadlift: athleteProfile.deadlift || "", overhead_squat: athleteProfile.overhead_squat || "", pull_ups: athleteProfile.pull_ups || "", muscle_ups: athleteProfile.muscle_ups || "", handstand_pushups: athleteProfile.handstand_pushups || "", time_5km: formatTime(athleteProfile.time_5km), time_10km: formatTime(athleteProfile.time_10km), time_21km: formatTime(athleteProfile.time_21km), max_pushups: athleteProfile.max_pushups || "", notes: athleteProfile.notes || "" }); setShowQuestionnaire(true); }}>Editar</button>
          </div>
          {!athleteProfile ? (
            <div style={s.card}>
              <p style={{ color: "#444", fontFamily: F, marginBottom: 12 }}>Aún no has completado tu perfil.</p>
              <button style={s.redBtn} onClick={() => setShowQuestionnaire(true)}>Completar perfil</button>
            </div>
          ) : <>
            <div style={s.card}>
              <h2 style={s.h2}>General</h2>
              <div style={s.grid2}>
                <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Días/semana</p><p style={{ fontWeight: 800, fontSize: 22, color: RED, fontFamily: F }}>{athleteProfile.training_days_per_week}</p></div>
                <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Lugar</p><p style={{ fontWeight: 600, fontSize: 13, fontFamily: F }}>{athleteProfile.equipment || "—"}</p></div>
                <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10, gridColumn: "1 / -1" }}><p style={s.h3}>Objetivos</p><p style={{ fontWeight: 600, fontSize: 14, fontFamily: F }}>{athleteProfile.goals || "—"}</p></div>
              </div>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Halterofilia</h2>
              <div style={s.grid2}>
                {[["Snatch", "snatch"], ["C&J", "clean_and_jerk"], ["Clean", "clean"], ["Frontal", "front_squat"], ["Trasera", "back_squat"], ["Peso Muerto", "deadlift"], ["OHS", "overhead_squat"]].map(([l, k]) => (
                  <div key={k} style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}>
                    <p style={s.h3}>{l}</p>
                    <p style={{ fontWeight: 800, fontSize: 18, color: athleteProfile[k] ? RED : "#333", fontFamily: F }}>{athleteProfile[k] ? `${athleteProfile[k]}kg` : "—"}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Gimnásticos</h2>
              <div style={s.grid2}>
                {[["Pull-ups", "pull_ups"], ["Muscle-ups", "muscle_ups"], ["HSPU", "handstand_pushups"], ["Push-ups", "max_pushups"]].map(([l, k]) => (
                  <div key={k} style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}>
                    <p style={s.h3}>{l}</p>
                    <p style={{ fontWeight: 800, fontSize: 18, color: athleteProfile[k] ? RED : "#333", fontFamily: F }}>{athleteProfile[k] ? `${athleteProfile[k]} reps` : "—"}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Running</h2>
              <div style={s.grid2}>
                {[["5km", "time_5km"], ["10km", "time_10km"], ["21km", "time_21km"]].map(([l, k]) => (
                  <div key={k} style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}>
                    <p style={s.h3}>{l}</p>
                    <p style={{ fontWeight: 800, fontSize: 18, color: athleteProfile[k] ? RED : "#333", fontFamily: F }}>{formatTime(athleteProfile[k])}</p>
                  </div>
                ))}
              </div>
            </div>
            {athleteProfile.notes && <div style={s.card}>
              <h2 style={s.h2}>Notas</h2>
              <p style={{ color: "#bbb", fontSize: 14, fontFamily: F }}>{athleteProfile.notes}</p>
            </div>}
          </>}
        </>}

        {view === "mensajes" && <>
          <h1 style={{ ...s.h1, marginBottom: 16 }}>Mensajes</h1>
          <div style={s.card}>
            <p style={s.h3}>Escribirle al coach</p>
            <textarea style={{ ...s.input, height: 100, resize: "vertical" }} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
            <button style={s.redBtn} onClick={sendMsg}>Enviar</button>
          </div>
          <div style={s.card}>
            <p style={s.h3}>Conversación</p>
            {messages.length === 0 ? <p style={{ color: "#444", fontFamily: F }}>Sin mensajes aún.</p> : messages.slice().reverse().map(m => (
              <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: m.from_id === user.id ? "#f97316" : RED, fontFamily: F }}>{m.from?.name}</span>
                  <span style={{ color: "#444", fontSize: 11, fontFamily: F }}>{new Date(m.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ color: "#bbb", fontSize: 14, fontFamily: F }}>{m.text}</p>
              </div>
            ))}
          </div>
        </>}
      </div>
      <div style={s.bottomNav}>
        {av.map(v => (
          <button key={v} style={s.navItem(view === v)} onClick={() => setView(v)}>
            <span style={{ fontSize: 20, marginBottom: 2 }}>{ai[v]}</span>{al[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
