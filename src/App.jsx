import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xotytitxgpuuwqgeccih.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvdHl0aXR4Z3B1dXdxZ2VjY2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTc0OTgsImV4cCI6MjA5MzA3MzQ5OH0.sGITzHaZ72OY8m5a6ulwHCpczcWWIjKmhDx2y8yJjNw"
);

const styles = {
  app: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Barlow Condensed', 'Barlow', sans-serif" },
  nav: { background: "#111", borderBottom: "1px solid #222", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 },
  navBtn: (active) => ({ background: active ? "#e53e3e" : "transparent", color: active ? "#fff" : "#999", border: "none", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.2s", borderRadius: 6 }),
  main: { padding: "32px 24px", maxWidth: 1100, margin: "0 auto" },
  card: { background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 20 },
  h1: { fontSize: 36, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 4 },
  h2: { fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 },
  h3: { fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", marginBottom: 8 },
  redBtn: { background: "#e53e3e", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" },
  ghostBtn: { background: "transparent", color: "#999", border: "1px solid #333", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" },
  input: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontFamily: "inherit", fontSize: 15, width: "100%", boxSizing: "border-box", outline: "none" },
  tag: (color) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: color === "red" ? "#e53e3e22" : color === "green" ? "#22c55e22" : "#f9731622", color: color === "red" ? "#e53e3e" : color === "green" ? "#22c55e" : "#f97316", border: `1px solid ${color === "red" ? "#e53e3e44" : color === "green" ? "#22c55e44" : "#f9731644"}` }),
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
};

const NSBLogo = () => (
  <svg width="80" height="32" viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="40" fontFamily="Arial Black, sans-serif" fontSize="44" fontWeight="900" fill="none" stroke="white" strokeWidth="2" letterSpacing="-2">NSB</text>
  </svg>
);

const getDaysUntilExpiry = (dateStr) => {
  if (!dateStr) return 0;
  const today = new Date();
  const exp = new Date(dateStr);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
};

export default function NSBApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("home");

  // Coach state
  const [athletes, setAthletes] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Forms
  const [showAthleteForm, setShowAthleteForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showWorkoutForm, setShowWorkoutForm] = useState(false);
  const [athleteForm, setAthleteForm] = useState({ name: "", email: "", password: "", plan: "", expiry: "", type: "Online" });
  const [scheduleForm, setScheduleForm] = useState({ day: "Lunes", time: "", spots: 4 });
  const [workoutForm, setWorkoutForm] = useState({ title: "", exercises: "", date: "", athlete_id: "" });

  const login = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();
    if (error || !data) {
      setError("Email o contraseña incorrectos");
    } else {
      setUser(data);
      loadData(data);
    }
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
      const { data: msgs } = await supabase.from("messages").select("*, from:from_id(name), to:to_id(name)").eq("to_id", u.id).or(`from_id.eq.${u.id}`).order("created_at");
      setMessages(msgs || []);
      const { data: wrk } = await supabase.from("workouts").select("*").eq("athlete_id", u.id).order("date");
      setWorkouts(wrk || []);
    }
  };

  const logout = () => { setUser(null); setEmail(""); setPassword(""); setView("home"); };

  const createAthlete = async () => {
    const { error } = await supabase.from("users").insert({ ...athleteForm, role: "athlete" });
    if (!error) {
      setShowAthleteForm(false);
      setAthleteForm({ name: "", email: "", password: "", plan: "", expiry: "", type: "Online" });
      loadData(user);
    }
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
    await supabase.from("workouts").insert({
      ...workoutForm,
      exercises: workoutForm.exercises.split("\n").filter(e => e.trim()),
    });
    setShowWorkoutForm(false);
    setWorkoutForm({ title: "", exercises: "", date: "", athlete_id: "" });
    loadData(user);
  };

  const bookSlot = async (scheduleId) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    const myBooking = schedule?.bookings?.find(b => b.athlete_id === user.id);
    if (myBooking) {
      await supabase.from("bookings").delete().eq("id", myBooking.id);
    } else {
      await supabase.from("bookings").insert({ schedule_id: scheduleId, athlete_id: user.id });
    }
    loadData(user);
  };

  const markDone = async (workoutId) => {
    await supabase.from("workouts").update({ done: true }).eq("id", workoutId);
    loadData(user);
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    const toId = user.role === "coach" ? selectedAthlete : athletes.find(a => a.role === "coach")?.id;
    if (!toId) return;
    await supabase.from("messages").insert({ from_id: user.id, to_id: toId, text: newMsg });
    setNewMsg("");
    loadData(user);
  };

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

  if (!user) {
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <NSBLogo />
          <p style={{ color: "#555", letterSpacing: "0.3em", fontSize: 11, marginTop: 8, textTransform: "uppercase" }}>Never Stop Building</p>
        </div>
        <div style={{ background: "#111", border: "1px solid #e53e3e44", borderRadius: 16, padding: "40px 48px", width: "100%", maxWidth: 420 }}>
          <h2 style={{ ...styles.h2, marginBottom: 32 }}>Iniciar Sesión</h2>
          <div style={{ marginBottom: 16 }}>
            <p style={{ ...styles.h3, marginBottom: 6 }}>Email</p>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ ...styles.h3, marginBottom: 6 }}>Contraseña</p>
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          {error && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button style={{ ...styles.redBtn, width: "100%", fontSize: 16 }} onClick={login} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 24, fontStyle: "italic" }}>tus metas merecen un plan real.</p>
        </div>
      </div>
    );
  }

  // COACH
  if (user.role === "coach") {
    return (
      <div style={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <nav style={styles.nav}>
          <NSBLogo />
          <div style={{ display: "flex", gap: 4 }}>
            {["home", "atletas", "planificacion", "horarios", "mensajes"].map(v => (
              <button key={v} style={styles.navBtn(view === v)} onClick={() => setView(v)}>
                {v === "home" ? "Dashboard" : v === "atletas" ? "Atletas" : v === "planificacion" ? "Planificación" : v === "horarios" ? "Horarios" : "Mensajes"}
              </button>
            ))}
          </div>
          <button style={styles.ghostBtn} onClick={logout}>Salir</button>
        </nav>

        <div style={styles.main}>
          {view === "home" && (
            <>
              <h1 style={styles.h1}>Bienvenido, <span style={{ color: "#e53e3e" }}>{user.name}</span></h1>
              <p style={{ color: "#666", marginBottom: 24 }}>Panel de control NSB</p>
              <div style={styles.grid3}>
                <div style={{ ...styles.card, borderLeft: "3px solid #e53e3e" }}>
                  <p style={styles.h3}>Atletas activos</p>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#e53e3e", lineHeight: 1 }}>{athletes.length}</p>
                </div>
                <div style={{ ...styles.card, borderLeft: "3px solid #f97316" }}>
                  <p style={styles.h3}>Horarios creados</p>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#f97316", lineHeight: 1 }}>{schedules.length}</p>
                </div>
                <div style={{ ...styles.card, borderLeft: "3px solid #22c55e" }}>
                  <p style={styles.h3}>Planificaciones</p>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>{workouts.length}</p>
                </div>
              </div>
              <div style={styles.card}>
                <h2 style={styles.h2}>Atletas</h2>
                {athletes.length === 0 ? <p style={{ color: "#444" }}>No hay atletas aún. Ve a la sección Atletas para agregar.</p> :
                  athletes.map(a => {
                    const d = getDaysUntilExpiry(a.expiry);
                    return (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #1a1a1a" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 16 }}>{a.name}</p>
                          <p style={{ color: "#666", fontSize: 13 }}>{a.plan} · {a.type}</p>
                        </div>
                        <span style={styles.tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d} días</span>
                      </div>
                    );
                  })}
              </div>
            </>
          )}

          {view === "atletas" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ ...styles.h1, marginBottom: 0 }}>Gestión de <span style={{ color: "#e53e3e" }}>Atletas</span></h1>
                <button style={styles.redBtn} onClick={() => setShowAthleteForm(!showAthleteForm)}>+ Agregar atleta</button>
              </div>

              {showAthleteForm && (
                <div style={styles.card}>
                  <h2 style={styles.h2}>Nuevo atleta</h2>
                  <div style={styles.grid2}>
                    <div>
                      <p style={styles.h3}>Nombre</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} value={athleteForm.name} onChange={e => setAthleteForm({ ...athleteForm, name: e.target.value })} placeholder="Nombre completo" />
                    </div>
                    <div>
                      <p style={styles.h3}>Email</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} value={athleteForm.email} onChange={e => setAthleteForm({ ...athleteForm, email: e.target.value })} placeholder="email@ejemplo.com" />
                    </div>
                    <div>
                      <p style={styles.h3}>Contraseña</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} value={athleteForm.password} onChange={e => setAthleteForm({ ...athleteForm, password: e.target.value })} placeholder="Contraseña" />
                    </div>
                    <div>
                      <p style={styles.h3}>Plan</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} value={athleteForm.plan} onChange={e => setAthleteForm({ ...athleteForm, plan: e.target.value })} placeholder="Ej: NSB Personalizado" />
                    </div>
                    <div>
                      <p style={styles.h3}>Vencimiento</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} type="date" value={athleteForm.expiry} onChange={e => setAthleteForm({ ...athleteForm, expiry: e.target.value })} />
                    </div>
                    <div>
                      <p style={styles.h3}>Tipo</p>
                      <select style={{ ...styles.input, marginBottom: 12 }} value={athleteForm.type} onChange={e => setAthleteForm({ ...athleteForm, type: e.target.value })}>
                        <option>Online</option>
                        <option>Presencial</option>
                        <option>Mixto</option>
                      </select>
                    </div>
                  </div>
                  <button style={styles.redBtn} onClick={createAthlete}>Crear atleta</button>
                </div>
              )}

              <div style={styles.grid2}>
                {athletes.map(a => {
                  const d = getDaysUntilExpiry(a.expiry);
                  return (
                    <div key={a.id} style={styles.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                        <div>
                          <h2 style={{ ...styles.h2, marginBottom: 4 }}>{a.name}</h2>
                          <span style={styles.tag("orange")}>{a.type}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={styles.tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d} días</span>
                          <button style={{ ...styles.ghostBtn, padding: "6px 12px", fontSize: 11, color: "#e53e3e", borderColor: "#e53e3e44" }} onClick={() => deleteAthlete(a.id)}>Eliminar</button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={styles.h3}>Plan</p>
                          <p style={{ fontWeight: 600 }}>{a.plan || "Sin plan"}</p>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={styles.h3}>Vencimiento</p>
                          <p style={{ fontWeight: 600 }}>{a.expiry || "Sin fecha"}</p>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={styles.h3}>Email</p>
                          <p style={{ fontWeight: 600, fontSize: 13 }}>{a.email}</p>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={styles.h3}>Contraseña</p>
                          <p style={{ fontWeight: 600 }}>{a.password}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {view === "planificacion" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ ...styles.h1, marginBottom: 0 }}>Planificación <span style={{ color: "#e53e3e" }}>Diaria</span></h1>
                <button style={styles.redBtn} onClick={() => setShowWorkoutForm(!showWorkoutForm)}>+ Agregar entrenamiento</button>
              </div>

              {showWorkoutForm && (
                <div style={styles.card}>
                  <h2 style={styles.h2}>Nuevo entrenamiento</h2>
                  <div style={styles.grid2}>
                    <div>
                      <p style={styles.h3}>Atleta</p>
                      <select style={{ ...styles.input, marginBottom: 12 }} value={workoutForm.athlete_id} onChange={e => setWorkoutForm({ ...workoutForm, athlete_id: e.target.value })}>
                        <option value="">Seleccionar atleta</option>
                        {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <p style={styles.h3}>Fecha</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} type="date" value={workoutForm.date} onChange={e => setWorkoutForm({ ...workoutForm, date: e.target.value })} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p style={styles.h3}>Título del entrenamiento</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} value={workoutForm.title} onChange={e => setWorkoutForm({ ...workoutForm, title: e.target.value })} placeholder="Ej: Upper Body Strength" />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p style={styles.h3}>Ejercicios (uno por línea)</p>
                      <textarea style={{ ...styles.input, height: 120, resize: "vertical", marginBottom: 12 }} value={workoutForm.exercises} onChange={e => setWorkoutForm({ ...workoutForm, exercises: e.target.value })} placeholder={"Press de banca 4x8\nRemo con barra 4x8\nPress militar 3x10"} />
                    </div>
                  </div>
                  <button style={styles.redBtn} onClick={createWorkout}>Crear entrenamiento</button>
                </div>
              )}

              <div>
                {workouts.length === 0 ? (
                  <div style={styles.card}><p style={{ color: "#444" }}>No hay entrenamientos creados aún.</p></div>
                ) : workouts.map(w => (
                  <div key={w.id} style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 18, color: "#e53e3e", textTransform: "uppercase" }}>{w.title}</p>
                        <p style={{ color: "#666", fontSize: 13 }}>{w.users?.name} · {w.date}</p>
                      </div>
                      <span style={styles.tag(w.done ? "green" : "orange")}>{w.done ? "✓ Completado" : "Pendiente"}</span>
                    </div>
                    {w.exercises?.map((ex, i) => (
                      <p key={i} style={{ color: "#bbb", fontSize: 14, padding: "6px 0", borderBottom: "1px solid #1a1a1a" }}>· {ex}</p>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "horarios" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h1 style={{ ...styles.h1, marginBottom: 0 }}>Gestión de <span style={{ color: "#e53e3e" }}>Horarios</span></h1>
                <button style={styles.redBtn} onClick={() => setShowScheduleForm(!showScheduleForm)}>+ Agregar horario</button>
              </div>

              {showScheduleForm && (
                <div style={styles.card}>
                  <h2 style={styles.h2}>Nuevo horario</h2>
                  <div style={styles.grid3}>
                    <div>
                      <p style={styles.h3}>Día</p>
                      <select style={{ ...styles.input, marginBottom: 12 }} value={scheduleForm.day} onChange={e => setScheduleForm({ ...scheduleForm, day: e.target.value })}>
                        {days.map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <p style={styles.h3}>Hora</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} type="time" value={scheduleForm.time} onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
                    </div>
                    <div>
                      <p style={styles.h3}>Cupos</p>
                      <input style={{ ...styles.input, marginBottom: 12 }} type="number" value={scheduleForm.spots} onChange={e => setScheduleForm({ ...scheduleForm, spots: e.target.value })} />
                    </div>
                  </div>
                  <button style={styles.redBtn} onClick={createSchedule}>Crear horario</button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {schedules.map(s => (
                  <div key={s.id} style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{s.day}</p>
                        <p style={{ color: "#e53e3e", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.time}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={styles.h3}>Cupos</p>
                        <p style={{ fontWeight: 700, fontSize: 20 }}>{s.bookings?.length || 0}/{s.spots}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 12 }}>
                      {s.bookings?.length === 0 ? <p style={{ color: "#444", fontSize: 13 }}>Sin reservas</p> :
                        s.bookings?.map(b => <p key={b.id} style={{ color: "#ccc", fontSize: 13, padding: "3px 0" }}>· {b.users?.name}</p>)}
                    </div>
                    <button style={{ ...styles.ghostBtn, marginTop: 12, width: "100%", fontSize: 11, color: "#e53e3e", borderColor: "#e53e3e44" }} onClick={() => deleteSchedule(s.id)}>Eliminar</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === "mensajes" && (
            <>
              <h1 style={{ ...styles.h1, marginBottom: 24 }}>Mensajes <span style={{ color: "#e53e3e" }}>con Atletas</span></h1>
              <div style={styles.grid2}>
                <div style={styles.card}>
                  <p style={styles.h3}>Enviar mensaje a</p>
                  <select style={{ ...styles.input, marginBottom: 12 }} value={selectedAthlete || ""} onChange={e => setSelectedAthlete(e.target.value)}>
                    <option value="">Seleccionar atleta</option>
                    {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <textarea style={{ ...styles.input, height: 100, resize: "vertical", marginBottom: 12 }} placeholder="Escribe tu mensaje..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                  <button style={styles.redBtn} onClick={sendMessage}>Enviar</button>
                </div>
                <div style={styles.card}>
                  <p style={styles.h3}>Historial</p>
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
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
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ATLETA
  const myWorkouts = workouts;
  const todayWorkout = myWorkouts.find(w => w.date === selectedDate);
  const daysLeft = getDaysUntilExpiry(user.expiry);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + i + 1);
    return d;
  });

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <nav style={styles.nav}>
        <NSBLogo />
        <div style={{ display: "flex", gap: 4 }}>
          {["home", "planificacion", "horarios", "mensajes"].map(v => (
            <button key={v} style={styles.navBtn(view === v)} onClick={() => setView(v)}>
              {v === "home" ? "Inicio" : v === "planificacion" ? "Mi Plan" : v === "horarios" ? "Agendar" : "Mensajes"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#666", fontSize: 13 }}>{user.name}</span>
          <button style={styles.ghostBtn} onClick={logout}>Salir</button>
        </div>
      </nav>

      <div style={styles.main}>
        {view === "home" && (
          <>
            <h1 style={styles.h1}>{user.name.split(" ")[0]}, <span style={{ color: "#e53e3e" }}>Never Stop</span></h1>
            <p style={{ color: "#666", marginBottom: 24 }}>Tu resumen de hoy</p>
            {daysLeft < 15 && (
              <div style={{ background: "#1a0505", border: "1px solid #e53e3e", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <p style={{ color: "#e53e3e", fontWeight: 700 }}>⚠ Tu planificación vence en {daysLeft} días — contacta a tu coach.</p>
              </div>
            )}
            <div style={styles.grid3}>
              <div style={{ ...styles.card, borderLeft: "3px solid #e53e3e" }}>
                <p style={styles.h3}>Plan activo</p>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{user.plan || "Sin plan"}</p>
                <p style={{ color: "#f97316", fontSize: 13 }}>{user.type}</p>
              </div>
              <div style={{ ...styles.card, borderLeft: "3px solid #f97316" }}>
                <p style={styles.h3}>Vencimiento</p>
                <p style={{ fontWeight: 800, fontSize: 32, color: daysLeft < 15 ? "#e53e3e" : daysLeft < 30 ? "#f97316" : "#22c55e", lineHeight: 1 }}>{daysLeft}</p>
                <p style={{ color: "#666", fontSize: 13 }}>días restantes</p>
              </div>
              <div style={{ ...styles.card, borderLeft: "3px solid #22c55e" }}>
                <p style={styles.h3}>Entrenamientos</p>
                <p style={{ fontWeight: 800, fontSize: 32, color: "#22c55e", lineHeight: 1 }}>{myWorkouts.filter(w => w.done).length}</p>
                <p style={{ color: "#666", fontSize: 13 }}>completados</p>
              </div>
            </div>
            <div style={styles.card}>
              <h2 style={styles.h2}>Entrenamiento de hoy</h2>
              {todayWorkout ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <p style={{ fontWeight: 800, fontSize: 20, color: "#e53e3e", textTransform: "uppercase" }}>{todayWorkout.title}</p>
                    <span style={styles.tag(todayWorkout.done ? "green" : "orange")}>{todayWorkout.done ? "✓ Completado" : "Pendiente"}</span>
                  </div>
                  {todayWorkout.exercises?.map((ex, i) => (
                    <p key={i} style={{ color: "#bbb", fontSize: 15, padding: "8px 0", borderBottom: "1px solid #1a1a1a" }}>{i + 1}. {ex}</p>
                  ))}
                  {!todayWorkout.done && (
                    <button style={{ ...styles.redBtn, marginTop: 16 }} onClick={() => markDone(todayWorkout.id)}>Marcar como completado</button>
                  )}
                </>
              ) : <p style={{ color: "#444" }}>No hay entrenamiento programado para hoy.</p>}
            </div>
          </>
        )}

        {view === "planificacion" && (
          <>
            <h1 style={{ ...styles.h1, marginBottom: 24 }}>Mi <span style={{ color: "#e53e3e" }}>Planificación</span></h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
              {weekDates.map((d, i) => {
                const key = d.toISOString().split("T")[0];
                const w = myWorkouts.find(ww => ww.date === key);
                const isToday = key === new Date().toISOString().split("T")[0];
                return (
                  <div key={key} onClick={() => setSelectedDate(key)} style={{ ...styles.card, padding: 12, cursor: "pointer", border: selectedDate === key ? "1px solid #e53e3e" : isToday ? "1px solid #e53e3e44" : "1px solid #2a2a2a", background: selectedDate === key ? "#1a0a0a" : "#161616" }}>
                    <p style={{ color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>{"LunMarMiéJueViéSábDom".slice(i * 3, i * 3 + 3)}</p>
                    <p style={{ fontWeight: 800, fontSize: 22, color: isToday ? "#e53e3e" : "#fff" }}>{d.getDate()}</p>
                    <div style={{ marginTop: 6, width: 8, height: 8, borderRadius: "50%", background: !w ? "#333" : w.done ? "#22c55e" : "#f97316" }} />
                  </div>
                );
              })}
            </div>
            <div style={styles.card}>
              {myWorkouts.find(w => w.date === selectedDate) ? (() => {
                const w = myWorkouts.find(ww => ww.date === selectedDate);
                return (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                      <h2 style={{ ...styles.h2, marginBottom: 0, color: "#e53e3e" }}>{w.title}</h2>
                      <span style={styles.tag(w.done ? "green" : "orange")}>{w.done ? "✓ Completado" : "Pendiente"}</span>
                    </div>
                    {w.exercises?.map((ex, i) => (
                      <p key={i} style={{ color: "#bbb", fontSize: 15, padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>{String(i + 1).padStart(2, "0")}. {ex}</p>
                    ))}
                    {!w.done && <button style={{ ...styles.redBtn, marginTop: 16 }} onClick={() => markDone(w.id)}>Marcar como completado</button>}
                  </>
                );
              })() : <p style={{ color: "#444", textAlign: "center", padding: 24 }}>Sin entrenamiento para este día.</p>}
            </div>
          </>
        )}

        {view === "horarios" && (
          <>
            <h1 style={{ ...styles.h1, marginBottom: 24 }}>Agendar <span style={{ color: "#e53e3e" }}>Sesión</span></h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {schedules.map(s => {
                const isMine = s.bookings?.some(b => b.athlete_id === user.id);
                const isFull = (s.bookings?.length || 0) >= s.spots;
                return (
                  <div key={s.id} style={{ ...styles.card, border: isMine ? "1px solid #e53e3e" : "1px solid #2a2a2a", background: isMine ? "#1a0a0a" : "#161616" }}>
                    <p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{s.day}</p>
                    <p style={{ color: "#e53e3e", fontSize: 28, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>{s.time}</p>
                    <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>{s.bookings?.length || 0}/{s.spots} cupos</p>
                    <button style={{ ...isMine ? styles.redBtn : styles.ghostBtn, width: "100%", fontSize: 12 }} onClick={() => bookSlot(s.id)} disabled={!isMine && isFull}>
                      {isMine ? "✓ Reservado — Cancelar" : isFull ? "Sin cupos" : "Reservar"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {view === "mensajes" && (
          <>
            <h1 style={{ ...styles.h1, marginBottom: 24 }}>Mensajes <span style={{ color: "#e53e3e" }}>con Coach</span></h1>
            <div style={styles.grid2}>
              <div style={styles.card}>
                <p style={styles.h3}>Nuevo mensaje</p>
                <textarea style={{ ...styles.input, height: 120, resize: "vertical", marginBottom: 12 }} placeholder="Escríbele a tu coach..." value={newMsg} onChange={e => setNewMsg(e.target.value)} />
                <button style={styles.redBtn} onClick={sendMessage}>Enviar</button>
              </div>
              <div style={styles.card}>
                <p style={styles.h3}>Conversación</p>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
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
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
