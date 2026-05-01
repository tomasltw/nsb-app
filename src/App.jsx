import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xotytitxgpuuwqgeccih.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdHl0aXR4Z3B1dXdxZ2VjY2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTc0OTgsImV4cCI6MjA5MzA3MzQ5OH0.sGITzHaZ72OY8m5a6ulwHCpczcWWIjKmhDx2y8yJjNw"
);

const getDaysUntilExpiry = (dateStr) => {
  if (!dateStr) return 0;
  const today = new Date();
  const exp = new Date(dateStr);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
};

const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function NSBApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("home");
  const [athletes, setAthletes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [messages, setMessages] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAthleteForm, setShowAthleteForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [athleteForm, setAthleteForm] = useState({ name: "", email: "", password: "", plan: "", expiry: "", type: "Online" });
  const [scheduleForm, setScheduleForm] = useState({ day: "Lunes", time: "", spots: 4 });
  const [workoutForm, setWorkoutForm] = useState({ title: "", exercises: "", date: "", athlete_id: "" });

  const login = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("users").select("*").eq("email", email).eq("password", password).single();
    if (error || !data) { setError("Email o contraseña incorrectos"); }
    else { setUser(data); loadData(data); }
    setLoading(false);
  };

  const loadData = async (u) => {
    if (u.role === "coach") {
      const { data: ath } = await supabase.from("users").select("*").eq("role", "athlete");
      setAthletes(ath || []);
      const { data: sch } = await supabase.from("schedules").select("*, bookings(*, users(*))");
      setSchedules(sch || []);
      const { data: msgs } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages(msgs || []);
      const { data: wrk } = await supabase.from("workouts").select("*, users(name)").order("date");
      setWorkouts(wrk || []);
    } else {
      const { data: sch } = await supabase.from("schedules").select("*, bookings(*, users(*))");
      setSchedules(sch || []);
      const { data: msgs } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").order("created_at");
      setMessages((msgs || []).filter(m => m.from_id === u.id || m.to_id === u.id));
      const { data: wrk } = await supabase.from("workouts").select("*").eq("athlete_id", u.id).order("date");
      setWorkouts(wrk || []);
    }
  };

  const logout = () => { setUser(null); setEmail(""); setPassword(""); setView("home"); };

  const createAthlete = async () => {
    await supabase.from("users").insert({ ...athleteForm, role: "athlete" });
    setShowAthleteForm(false);
    setAthleteForm({ name: "", email: "", password: "", plan: "", expiry: "", type: "Online" });
    loadData(user);
  };

  const deleteAthlete = async (id) => {
    await supabase.from("users").delete().eq("id", id);
    loadData(user);
  };

  const createSchedule = async () => {
    await supabase.from("schedules").insert({ ...scheduleForm, spots: parseInt(scheduleForm.spots) });
    setShowScheduleForm(false);
    setScheduleForm({ day: "Lunes", time: "", spots: 4 });
    loadData(user);
  };

  const deleteSchedule = async (id) => {
    await supabase.from("schedules").delete().eq("id", id);
    loadData(user);
  };

  const createWorkout = async () => {
    await supabase.from("workouts").insert({ ...workoutForm, exercises: workoutForm.exercises.split("\n").filter(e => e.trim()) });
    setShowWorkoutForm(false);
    setWorkoutForm({ title: "", exercises: "", date: "", athlete_id: "" });
    loadData(user);
  };

  const bookSlot = async (scheduleId) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const myBooking = schedule?.bookings?.find(b => b.athlete_id === user.id);
    if (myBooking) { await supabase.from("bookings").delete().eq("id", myBooking.id); }
    else { await supabase.from("bookings").insert({ schedule_id: scheduleId, athlete_id: user.id }); }
    loadData(user);
  };

  const markDone = async (id) => {
    await supabase.from("workouts").update({ done: true }).eq("id", id);
    loadData(user);
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    let toId;
    if (user.role === "coach") {
      toId = selectedAthlete;
    } else {
      const { data: coach } = await supabase.from("users").select("id").eq("role", "coach").single();
      toId = coach?.id;
    }
    if (!toId) return;
    await supabase.from("messages").insert({ from_id: user.id, to_id: toId, text: newMsg });
    setNewMsg("");
    loadData(user);
  };

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i + 1);
    return d;
  });

  const s = {
    app: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", paddingBottom: 80 },
    login: { minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 },
    loginBox: { background: "#111", border: "1px solid #e53e3e44", borderRadius: 16, padding: "32px 24px", width: "100%", maxWidth: 400 },
    h1: { fontSize: 28, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 4 },
    h2: { fontSize: 20, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 },
    h3: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", marginBottom: 6 },
    label: { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#666", marginBottom: 6, display: "block" },
    input: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 10, padding: "14px 16px", color: "#fff", fontFamily: "inherit", fontSize: 16, width: "100%", boxSizing: "border-box", outline: "none", marginBottom: 12 },
    redBtn: { background: "#e53e3e", color: "#fff", border: "none", padding: "14px 24px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", width: "100%" },
    ghostBtn: { background: "transparent", color: "#999", border: "1px solid #333", padding: "12px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, textTransform: "uppercase" },
    card: { background: "#161616", border: "1px solid #222", borderRadius: 14, padding: 16, marginBottom: 12 },
    tag: (c) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: c === "red" ? "#e53e3e22" : c === "green" ? "#22c55e22" : "#f9731622", color: c === "red" ? "#e53e3e" : c === "green" ? "#22c55e" : "#f97316", border: `1px solid ${c === "red" ? "#e53e3e44" : c === "green" ? "#22c55e44" : "#f9731644"}` }),
    bottomNav: { position: "fixed", bottom: 0, left: 0, right: 0, background: "#111", borderTop: "1px solid #222", display: "flex", zIndex: 100 },
    navItem: (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", cursor: "pointer", color: active ? "#e53e3e" : "#555", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", border: "none", background: "transparent", fontFamily: "inherit" }),
    topBar: { background: "#111", borderBottom: "1px solid #222", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 },
    main: { padding: 16 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
    statCard: (color) => ({ background: "#161616", border: `1px solid ${color}44`, borderRadius: 14, padding: 16, borderLeft: `3px solid ${color}` }),
  };

  if (!user) {
    return (
      <div style={s.login}>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="NSB" style={{ width: 140, marginBottom: 8 }} />
          <p style={{ color: "#555", letterSpacing: "0.3em", fontSize: 10, textTransform: "uppercase" }}>Never Stop Building</p>
        </div>
        <div style={s.loginBox}>
          <h2 style={{ ...s.h2, marginBottom: 24 }}>Iniciar Sesión</h2>
          <label style={s.label}>Email</label>
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e => e.key === "Enter" && login()} />
          <label style={s.label}>Contraseña</label>
          <input style={{ ...s.input, marginBottom: 20 }} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          {error && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button style={s.redBtn} onClick={login} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 20, fontStyle: "italic" }}>tus metas merecen un plan real.</p>
        </div>
      </div>
    );
  }

  if (user.role === "coach") {
    const coachViews = ["home", "atletas", "plan", "horarios", "mensajes"];
    const coachIcons = { home: "⚡", atletas: "👥", plan: "📋", horarios: "📅", mensajes: "💬" };
    const coachLabels = { home: "Inicio", atletas: "Atletas", plan: "Plan", horarios: "Horarios", mensajes: "Mensajes" };

    return (
      <div style={s.app}>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <div style={s.topBar}>
          <img src="/logo.png" alt="NSB" style={{ height: 28 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#666", fontSize: 13 }}>{user.name}</span>
            <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 11 }} onClick={logout}>Salir</button>
          </div>
        </div>

        <div style={s.main}>
          {view === "home" && (
            <>
              <h1 style={{ ...s.h1, marginBottom: 4 }}>Dashboard</h1>
              <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>Panel de control NSB</p>
              <div style={s.grid2}>
                <div style={s.statCard("#e53e3e")}><p style={s.h3}>Atletas</p><p style={{ fontSize: 40, fontWeight: 800, color: "#e53e3e", lineHeight: 1 }}>{athletes.length}</p></div>
                <div style={s.statCard("#f97316")}><p style={s.h3}>Horarios</p><p style={{ fontSize: 40, fontWeight: 800, color: "#f97316", lineHeight: 1 }}>{schedules.length}</p></div>
                <div style={s.statCard("#22c55e")}><p style={s.h3}>Planes</p><p style={{ fontSize: 40, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>{workouts.length}</p></div>
                <div style={s.statCard("#a855f7")}><p style={s.h3}>Mensajes</p><p style={{ fontSize: 40, fontWeight: 800, color: "#a855f7", lineHeight: 1 }}>{messages.length}</p></div>
              </div>
              <div style={s.card}>
                <h2 style={s.h2}>Atletas</h2>
                {athletes.length === 0 ? <p style={{ color: "#444" }}>Sin atletas aún.</p> :
                  athletes.map(a => {
                    const d = getDaysUntilExpiry(a.expiry);
                    return (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                        <div><p style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</p><p style={{ color: "#666", fontSize: 13 }}>{a.type}</p></div>
                        <span style={s.tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d}d</span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {view === "atletas" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ ...s.h1, marginBottom: 0 }}>Atletas</h1>
                <button style={{ ...s.redBtn, width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setShowAthleteForm(!showAthleteForm)}>+ Agregar</button>
              </div>
              {showAthleteForm && (
                <div style={s.card}>
                  <h2 style={s.h2}>Nuevo atleta</h2>
                  <label style={s.label}>Nombre</label>
                  <input style={s.input} value={athleteForm.name} onChange={e => setAthleteForm({ ...athleteForm, name: e.target.value })} placeholder="Nombre completo" />
                  <label style={s.label}>Email</label>
                  <input style={s.input} type="email" value={athleteForm.email} onChange={e => setAthleteForm({ ...athleteForm, email: e.target.value })} placeholder="email@ejemplo.com" />
                  <label style={s.label}>Contraseña</label>
                  <input style={s.input} value={athleteForm.password} onChange={e => setAthleteForm({ ...athleteForm, password: e.target.value })} placeholder="Contraseña" />
                  <label style={s.label}>Plan</label>
                  <input style={s.input} value={athleteForm.plan} onChange={e => setAthleteForm({ ...athleteForm, plan: e.target.value })} placeholder="Ej: NSB Personalizado" />
                  <label style={s.label}>Vencimiento</label>
                  <input style={s.input} type="date" value={athleteForm.expiry} onChange={e => setAthleteForm({ ...athleteForm, expiry: e.target.value })} />
                  <label style={s.label}>Tipo</label>
                  <select style={s.input} value={athleteForm.type} onChange={e => setAthleteForm({ ...athleteForm, type: e.target.value })}>
                    <option>Online</option><option>Presencial</option><option>Mixto</option>
                  </select>
                  <button style={s.redBtn} onClick={createAthlete}>Crear atleta</button>
                </div>
              )}
              {athletes.map(a => {
                const d = getDaysUntilExpiry(a.expiry);
                return (
                  <div key={a.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div><p style={{ fontWeight: 800, fontSize: 18 }}>{a.name}</p><span style={s.tag("orange")}>{a.type}</span></div>
                      <span style={s.tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d} días</span>
                    </div>
                    <div style={s.grid2}>
                      <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Plan</p><p style={{ fontWeight: 600, fontSize: 14 }}>{a.plan || "Sin plan"}</p></div>
                      <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Vence</p><p style={{ fontWeight: 600, fontSize: 14 }}>{a.expiry || "—"}</p></div>
                      <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Email</p><p style={{ fontWeight: 600, fontSize: 12 }}>{a.email}</p></div>
                      <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 10 }}><p style={s.h3}>Clave</p><p style={{ fontWeight: 600, fontSize: 14 }}>{a.password}</p></div>
                    </div>
                    <button style={{ ...s.ghostBtn, marginTop: 12, width: "100%", fontSize: 12, color: "#e53e3e", borderColor: "#e53e3e44" }} onClick={() => deleteAthlete(a.id)}>Eliminar atleta</button>
                  </div>
                );
              })}
            </>
          )}

          {view === "plan" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ ...s.h1, marginBottom: 0 }}>Planificación</h1>
                <button style={{ ...s.redBtn, width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setShowWorkoutForm(!showWorkoutForm)}>+ Agregar</button>
              </div>
              {showWorkoutForm && (
                <div style={s.card}>
                  <h2 style={s.h2}>Nuevo entrenamiento</h2>
                  <label style={s.label}>Atleta</label>
                  <select style={s.input} value={workoutForm.athlete_id} onChange={e => setWorkoutForm({ ...workoutForm, athlete_id: e.target.value })}>
                    <option value="">Seleccionar atleta</option>
                    {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <label style={s.label}>Fecha</label>
                  <input style={s.input} type="date" value={workoutForm.date} onChange={e => setWorkoutForm({ ...workoutForm, date: e.target.value })} />
                  <label style={s.label}>Título</label>
                  <input style={s.input} value={workoutForm.title} onChange={e => setWorkoutForm({ ...workoutForm, title: e.target.value })} placeholder="Ej: Upper Body Strength" />
                  <label style={s.label}>Ejercicios (uno por línea)</label>
                  <textarea style={{ ...s.input, height: 120, resize: "vertical" }} value={workoutForm.exercises} onChange={e => setWorkoutForm({ ...workoutForm, exercises: e.target.value })} placeholder={"Press de banca 4x8\nRemo con barra 4x8"} />
                  <button style={s.redBtn} onClick={createWorkout}>Crear entrenamiento</button>
                </div>
              )}
              {workouts.length === 0 ? <div style={s.card}><p style={{ color: "#444" }}>Sin entrenamientos aún.</p></div> :
                workouts.map(w => (
                  <div key={w.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div><p style={{ fontWeight: 800, fontSize: 16, color: "#e53e3e", textTransform: "uppercase" }}>{w.title}</p><p style={{ color: "#666", fontSize: 13 }}>{w.users?.name} · {w.date}</p></div>
                      <span style={s.tag(w.done ? "green" : "orange")}>{w.done ? "✓" : "Pend."}</span>
                    </div>
                    {w.exercises?.map((ex, i) => <p key={i} style={{ color: "#bbb", fontSize: 14, padding: "6px 0", borderBottom: "1px solid #1a1a1a" }}>· {ex}</p>)}
                  </div>
                ))}
            </>
          )}

          {view === "horarios" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h1 style={{ ...s.h1, marginBottom: 0 }}>Horarios</h1>
                <button style={{ ...s.redBtn, width: "auto", padding: "10px 16px", fontSize: 13 }} onClick={() => setShowScheduleForm(!showScheduleForm)}>+ Agregar</button>
              </div>
              {showScheduleForm && (
                <div style={s.card}>
                  <h2 style={s.h2}>Nuevo horario</h2>
                  <label style={s.label}>Día</label>
                  <select style={s.input} value={scheduleForm.day} onChange={e => setScheduleForm({ ...scheduleForm, day: e.target.value })}>{days.map(d => <option key={d}>{d}</option>)}</select>
                  <label style={s.label}>Hora</label>
                  <input style={s.input} type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
                  <label style={s.label}>Cupos</label>
                  <input style={s.input} type="number" value={scheduleForm.spots} onChange={e => setScheduleForm({ ...scheduleForm, spots: e.target.value })} />
                  <button style={s.redBtn} onClick={createSchedule}>Crear horario</button>
                </div>
              )}
              {schedules.map(sch => (
                <div key={sch.id} style={s.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div><p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{sch.day}</p><p style={{ color: "#e53e3e", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{sch.time}</p></div>
                    <div style={{ textAlign: "right" }}><p style={s.h3}>Cupos</p><p style={{ fontWeight: 700, fontSize: 22 }}>{sch.bookings?.length || 0}/{sch.spots}</p></div>
                  </div>
                  {sch.bookings?.length === 0 ? <p style={{ color: "#444", fontSize: 13 }}>Sin reservas</p> : sch.bookings?.map(b => <p key={b.id} style={{ color: "#ccc", fontSize: 14, padding: "3px 0" }}>· {b.users?.name}</p>)}
                  <button style={{ ...s.ghostBtn, marginTop: 10, width: "100%", fontSize: 12, color: "#e53e3e", borderColor: "#e53e3e44" }} onClick={() => deleteSchedule(sch.id)}>Eliminar</button>
                </div>
              ))}
            </>
          )}

          {view === "mensajes" && (
            <>
              <h1 style={{ ...s.h1, marginBottom: 16 }}>Mensajes</h1>
              <div style={s.card}>
                <label style={s.label}>Enviar a</label>
                <select style={s.input} value={selectedAthlete} onChange={e => setSelectedAthlete(e.target.value)}>
                  <option value="">Seleccionar atleta</option>
                  {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <textarea style={{ ...s.input, height: 90, resize: "vertical" }} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                <button style={s.redBtn} onClick={sendMessage}>Enviar</button>
              </div>
              <div style={s.card}>
                <p style={s.h3}>Historial</p>
                {messages.slice().reverse().map(m => (
                  <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: "#e53e3e" }}>{m.from?.name} → {m.to?.name}</span>
                      <span style={{ color: "#444", fontSize: 11 }}>{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: "#bbb", fontSize: 14 }}>{m.text}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={s.bottomNav}>
          {coachViews.map(v => (
            <button key={v} style={s.navItem(view === v)} onClick={() => setView(v)}>
              <span style={{ fontSize: 20, marginBottom: 2 }}>{coachIcons[v]}</span>
              {coachLabels[v]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ATLETA
  const daysLeft = getDaysUntilExpiry(user.expiry);
  const todayWorkout = workouts.find(w => w.date === selectedDate);
  const athleteViews = ["home", "plan", "agendar", "mensajes"];
  const athleteIcons = { home: "🏠", plan: "📋", agendar: "📅", mensajes: "💬" };
  const athleteLabels = { home: "Inicio", plan: "Mi Plan", agendar: "Agendar", mensajes: "Mensajes" };

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div style={s.topBar}>
        <img src="/logo.png" alt="NSB" style={{ height: 28 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#666", fontSize: 13 }}>{user.name.split(" ")[0]}</span>
          <button style={{ ...s.ghostBtn, padding: "6px 12px", fontSize: 11 }} onClick={logout}>Salir</button>
        </div>
      </div>

      <div style={s.main}>
        {view === "home" && (
          <>
            <h1 style={{ ...s.h1, marginBottom: 4 }}>Hola, <span style={{ color: "#e53e3e" }}>{user.name.split(" ")[0]}</span></h1>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 16 }}>Never Stop Building</p>
            {daysLeft < 15 && (
              <div style={{ background: "#1a0505", border: "1px solid #e53e3e", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                <p style={{ color: "#e53e3e", fontWeight: 700, fontSize: 14 }}>⚠ Tu plan vence en {daysLeft} días</p>
              </div>
            )}
            <div style={s.grid2}>
              <div style={s.statCard("#e53e3e")}><p style={s.h3}>Plan</p><p style={{ fontWeight: 700, fontSize: 14 }}>{user.plan || "Sin plan"}</p><p style={{ color: "#f97316", fontSize: 12 }}>{user.type}</p></div>
              <div style={s.statCard("#f97316")}><p style={s.h3}>Vence en</p><p style={{ fontSize: 36, fontWeight: 800, color: daysLeft < 15 ? "#e53e3e" : daysLeft < 30 ? "#f97316" : "#22c55e", lineHeight: 1 }}>{daysLeft}</p><p style={{ color: "#666", fontSize: 12 }}>días</p></div>
              <div style={{ ...s.statCard("#22c55e"), gridColumn: "1 / -1" }}><p style={s.h3}>Completados</p><p style={{ fontSize: 36, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>{workouts.filter(w => w.done).length} <span style={{ fontSize: 14, color: "#666" }}>/ {workouts.length}</span></p></div>
            </div>
            <div style={s.card}>
              <h2 style={s.h2}>Entrenamiento de hoy</h2>
              {todayWorkout ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ fontWeight: 800, fontSize: 16, color: "#e53e3e", textTransform: "uppercase" }}>{todayWorkout.title}</p>
                    <span style={s.tag(todayWorkout.done ? "green" : "orange")}>{todayWorkout.done ? "✓" : "Pend."}</span>
                  </div>
                  {todayWorkout.exercises?.map((ex, i) => <p key={i} style={{ color: "#bbb", fontSize: 15, padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>{i + 1}. {ex}</p>)}
                  {!todayWorkout.done && <button style={{ ...s.redBtn, marginTop: 14 }} onClick={() => markDone(todayWorkout.id)}>Marcar completado ✓</button>}
                </>
              ) : <p style={{ color: "#444" }}>Sin entrenamiento para hoy.</p>}
            </div>
          </>
        )}

        {view === "plan" && (
          <>
            <h1 style={{ ...s.h1, marginBottom: 16 }}>Mi Planificación</h1>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
              {weekDates.map((d, i) => {
                const key = d.toISOString().split("T")[0];
                const w = workouts.find(ww => ww.date === key);
                const isToday = key === new Date().toISOString().split("T")[0];
                return (
                  <div key={key} onClick={() => setSelectedDate(key)} style={{ minWidth: 56, background: selectedDate === key ? "#1a0a0a" : "#161616", border: selectedDate === key ? "1px solid #e53e3e" : isToday ? "1px solid #e53e3e44" : "1px solid #222", borderRadius: 12, padding: "10px 8px", textAlign: "center", cursor: "pointer" }}>
                    <p style={{ color: "#666", fontSize: 10, textTransform: "uppercase" }}>{"LunMarMiéJueViéSábDom".slice(i * 3, i * 3 + 3)}</p>
                    <p style={{ fontWeight: 800, fontSize: 20, color: isToday ? "#e53e3e" : "#fff" }}>{d.getDate()}</p>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: !w ? "#333" : w.done ? "#22c55e" : "#f97316", margin: "4px auto 0" }} />
                  </div>
                );
              })}
            </div>
            <div style={s.card}>
              {workouts.find(w => w.date === selectedDate) ? (() => {
                const w = workouts.find(ww => ww.date === selectedDate);
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ fontWeight: 800, fontSize: 18, color: "#e53e3e", textTransform: "uppercase" }}>{w.title}</p>
                      <span style={s.tag(w.done ? "green" : "orange")}>{w.done ? "✓ Listo" : "Pendiente"}</span>
                    </div>
                    {w.exercises?.map((ex, i) => <p key={i} style={{ color: "#bbb", fontSize: 15, padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>{String(i + 1).padStart(2, "0")}. {ex}</p>)}
                    {!w.done && <button style={{ ...s.redBtn, marginTop: 14 }} onClick={() => markDone(w.id)}>Marcar completado ✓</button>}
                  </>
                );
              })() : <p style={{ color: "#444", textAlign: "center", padding: 20 }}>Sin entrenamiento para este día.</p>}
            </div>
          </>
        )}

        {view === "agendar" && (
          <>
            <h1 style={{ ...s.h1, marginBottom: 16 }}>Agendar Sesión</h1>
            {schedules.map(sch => {
              const isMine = sch.bookings?.some(b => b.athlete_id === user.id);
              const isFull = (sch.bookings?.length || 0) >= sch.spots;
              return (
                <div key={sch.id} style={{ ...s.card, border: isMine ? "1px solid #e53e3e" : "1px solid #222", background: isMine ? "#1a0a0a" : "#161616" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div><p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{sch.day}</p><p style={{ color: "#e53e3e", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{sch.time}</p></div>
                    <div style={{ textAlign: "right" }}><p style={s.h3}>Cupos</p><p style={{ fontWeight: 700, fontSize: 20 }}>{sch.bookings?.length || 0}/{sch.spots}</p></div>
                  </div>
                  <button style={{ ...isMine ? s.redBtn : s.ghostBtn, fontSize: 13 }} onClick={() => bookSlot(sch.id)} disabled={!isMine && isFull}>
                    {isMine ? "✓ Reservado — Cancelar" : isFull ? "Sin cupos disponibles" : "Reservar este horario"}
                  </button>
                </div>
              );
            })}
          </>
        )}

        {view === "mensajes" && (
          <>
            <h1 style={{ ...s.h1, marginBottom: 16 }}>Mensajes</h1>
            <div style={s.card}>
              <p style={s.h3}>Escribirle al coach</p>
              <textarea style={{ ...s.input, height: 100, resize: "vertical" }} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
              <button style={s.redBtn} onClick={sendMessage}>Enviar</button>
            </div>
            <div style={s.card}>
              <p style={s.h3}>Conversación</p>
              {messages.length === 0 ? <p style={{ color: "#444" }}>Sin mensajes aún.</p> :
                messages.slice().reverse().map(m => (
                  <div key={m.id} style={{ padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: m.from_id === user.id ? "#f97316" : "#e53e3e" }}>{m.from?.name}</span>
                      <span style={{ color: "#444", fontSize: 11 }}>{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: "#bbb", fontSize: 14 }}>{m.text}</p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>

      <div style={s.bottomNav}>
        {athleteViews.map(v => (
          <button key={v} style={s.navItem(view === v)} onClick={() => setView(v)}>
            <span style={{ fontSize: 20, marginBottom: 2 }}>{athleteIcons[v]}</span>
            {athleteLabels[v]}
          </button>
        ))}
      </div>
    </div>
  );
}
