import { useState, useEffect } from "react";

const USERS = {
  const USERS = {
  coach: { email: "coach@nsb.com", password: "nsb2024", role: "coach", name: "Tomás Coach" },
};

const SCHEDULE = [
  { id: 1, day: "Lunes", time: "07:00", spots: 3, booked: ["Tomás Araya"] },
  { id: 2, day: "Lunes", time: "18:00", spots: 4, booked: [] },
  { id: 3, day: "Miércoles", time: "07:00", spots: 3, booked: ["Piero Gorichon"] },
  { id: 4, day: "Miércoles", time: "18:00", spots: 4, booked: ["Tomás Araya"] },
  { id: 5, day: "Viernes", time: "07:00", spots: 3, booked: [] },
  { id: 6, day: "Viernes", time: "18:00", spots: 4, booked: [] },
  { id: 7, day: "Sábado", time: "09:00", spots: 6, booked: ["Tomás Araya", "Piero Gorichon"] },
];

const WORKOUTS = {
  "2026-04-28": { title: "Upper Body Strength", exercises: ["Press de banca 4x8", "Remo con barra 4x8", "Press militar 3x10", "Curl de bíceps 3x12"], done: true },
  "2026-04-29": { title: "Lower Body Power", exercises: ["Sentadilla trasera 5x5", "Peso muerto rumano 4x8", "Prensa 3x15", "Elevación de talones 4x20"], done: false },
  "2026-04-30": { title: "Cardio & Core", exercises: ["HIIT 20 min", "Plancha 3x60s", "Crunch 3x20", "Mountain climbers 3x30s"], done: false },
  "2026-05-02": { title: "Push Day", exercises: ["Press inclinado 4x8", "Aperturas 3x12", "Press francés 3x12", "Extensión tríceps 3x15"], done: false },
};

const COMMENTS = [
  { id: 1, from: "Coach", to: "Tomás Araya", text: "Excelente semana Tomás, noto progreso en la sentadilla. Sigue así!", date: "2026-04-27", read: false },
  { id: 2, from: "Tomás Araya", to: "Coach", text: "Gracias coach! El lunes sentí mucho ardor en el hombro derecho durante el press.", date: "2026-04-28", read: true },
  { id: 3, from: "Coach", to: "Piero Gorichon", text: "Piero, recuerda mantener la espalda neutra en el peso muerto.", date: "2026-04-26", read: true },
];

const NSBLogo = ({ size = 40 }) => (
  <svg width={size * 2.2} height={size} viewBox="0 0 220 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M10 90 L10 10 L30 10 L70 70 L70 10 L90 10 L90 90 L70 90 L30 30 L30 90 Z" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M100 90 L100 10 L120 10 L120 50 Q120 70 140 70 Q160 70 160 50 L160 10 L180 10 L180 50 Q180 85 140 85 Q100 85 100 50 Z" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
      <path d="M190 10 L220 10 Q240 10 240 30 Q240 45 225 48 Q242 51 242 68 Q242 90 218 90 L190 90 Z M205 45 L218 45 Q225 45 225 35 Q225 25 218 25 L205 25 Z M205 78 L220 78 Q230 78 230 68 Q230 58 220 58 L205 58 Z" fill="none" stroke="white" strokeWidth="4" strokeLinejoin="round"/>
    </g>
  </svg>
);

const getDaysUntilExpiry = (dateStr) => {
  const today = new Date("2026-04-29");
  const exp = new Date(dateStr);
  return Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
};

const getWeekDates = () => {
  const today = new Date("2026-04-29");
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

export default function NSBApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState("home");
  const [schedule, setSchedule] = useState(SCHEDULE);
  const [comments, setComments] = useState(COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState("Tomás Araya");
  const [workouts, setWorkouts] = useState(WORKOUTS);
  const [selectedDate, setSelectedDate] = useState("2026-04-29");

  const weekDates = getWeekDates();
  const athletes = Object.values(USERS).filter(u => u.role === "athlete");

  const login = () => {
    const found = USERS[email] || (email === "coach@nsb.com" ? USERS.coach : null);
    if (found && found.password === password) {
      setUser(found);
      setError("");
      setView("home");
    } else {
      setError("Email o contraseña incorrectos");
    }
  };

  const logout = () => { setUser(null); setEmail(""); setPassword(""); setView("home"); };

  const bookSlot = (id) => {
    setSchedule(s => s.map(slot => slot.id === id
      ? { ...slot, booked: slot.booked.includes(user.name) ? slot.booked.filter(n => n !== user.name) : [...slot.booked, user.name] }
      : slot));
  };

  const sendComment = () => {
    if (!newComment.trim()) return;
    const target = user.role === "coach" ? selectedAthlete : "Coach";
    setComments(c => [...c, { id: Date.now(), from: user.name, to: target, text: newComment, date: "2026-04-29", read: false }]);
    setNewComment("");
  };

  const myComments = user?.role === "coach"
    ? comments.filter(c => c.from === "Coach" || c.to === "Coach")
    : comments.filter(c => c.from === user?.name || c.to === user?.name);

  const daysLeft = user?.expiry ? getDaysUntilExpiry(user.expiry) : 0;

  const styles = {
    app: { minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Barlow Condensed', 'Barlow', sans-serif" },
    nav: { background: "#111", borderBottom: "1px solid #222", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 },
    navLinks: { display: "flex", gap: 8 },
    navBtn: (active) => ({ background: active ? "#e53e3e" : "transparent", color: active ? "#fff" : "#999", border: "none", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.2s" }),
    main: { padding: "32px 24px", maxWidth: 1100, margin: "0 auto" },
    card: { background: "#161616", border: "1px solid #2a2a2a", borderRadius: 12, padding: 24, marginBottom: 20 },
    redCard: { background: "#1a0a0a", border: "1px solid #e53e3e44", borderRadius: 12, padding: 24, marginBottom: 20 },
    h1: { fontSize: 36, fontWeight: 800, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 4 },
    h2: { fontSize: 22, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16 },
    h3: { fontSize: 16, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999", marginBottom: 12 },
    redBtn: { background: "#e53e3e", color: "#fff", border: "none", padding: "12px 24px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s" },
    ghostBtn: { background: "transparent", color: "#999", border: "1px solid #333", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", transition: "all 0.2s" },
    input: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontFamily: "inherit", fontSize: 15, width: "100%", boxSizing: "border-box", outline: "none" },
    tag: (color) => ({ display: "inline-block", padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", background: color === "red" ? "#e53e3e22" : color === "green" ? "#22c55e22" : "#f9731622", color: color === "red" ? "#e53e3e" : color === "green" ? "#22c55e" : "#f97316", border: `1px solid ${color === "red" ? "#e53e3e44" : color === "green" ? "#22c55e44" : "#f9731644"}` }),
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  };

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ ...styles.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <NSBLogo size={36} />
          <p style={{ color: "#555", letterSpacing: "0.3em", fontSize: 11, marginTop: 8, textTransform: "uppercase" }}>Never Stop Building</p>
        </div>
        <div style={{ background: "#111", border: "1px solid #e53e3e44", borderRadius: 16, padding: "40px 48px", width: "100%", maxWidth: 420 }}>
          <h2 style={{ ...styles.h2, marginBottom: 32 }}>Iniciar Sesión</h2>
          <div style={{ marginBottom: 16 }}>
            <p style={{ ...styles.h3, marginBottom: 6, fontSize: 11 }}>Email</p>
            <input style={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ ...styles.h3, marginBottom: 6, fontSize: 11 }}>Contraseña</p>
            <input style={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
          </div>
          {error && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <button style={{ ...styles.redBtn, width: "100%", fontSize: 16 }} onClick={login}>Entrar</button>
          <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 24, fontStyle: "italic" }}>tus metas merecen un plan real.</p>
        </div>
        <div style={{ marginTop: 24, color: "#333", fontSize: 12 }}>
          Coach: coach@nsb.com / nsb2024 · Atleta: atleta1@nsb.com / 1234
        </div>
      </div>
    );
  }

  // COACH DASHBOARD
  if (user.role === "coach") {
    return (
      <div style={styles.app}>
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <nav style={styles.nav}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <NSBLogo size={28} />
          </div>
          <div style={styles.navLinks}>
            {["home", "atletas", "horarios", "mensajes"].map(v => (
              <button key={v} style={styles.navBtn(view === v)} onClick={() => setView(v)}>
                {v === "home" ? "Dashboard" : v === "atletas" ? "Atletas" : v === "horarios" ? "Horarios" : "Mensajes"}
              </button>
            ))}
          </div>
          <button style={styles.ghostBtn} onClick={logout}>Salir</button>
        </nav>

        <div style={styles.main}>
          {view === "home" && (
            <>
              <div style={{ marginBottom: 32 }}>
                <h1 style={styles.h1}>Bienvenido, <span style={{ color: "#e53e3e" }}>Coach</span></h1>
                <p style={{ color: "#666", fontSize: 15 }}>Resumen de tu plataforma NSB</p>
              </div>
              <div style={styles.grid3}>
                <div style={{ ...styles.card, borderLeft: "3px solid #e53e3e" }}>
                  <p style={styles.h3}>Atletas activos</p>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#e53e3e", lineHeight: 1 }}>{athletes.length}</p>
                </div>
                <div style={{ ...styles.card, borderLeft: "3px solid #f97316" }}>
                  <p style={styles.h3}>Sesiones semana</p>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#f97316", lineHeight: 1 }}>7</p>
                </div>
                <div style={{ ...styles.card, borderLeft: "3px solid #22c55e" }}>
                  <p style={styles.h3}>Mensajes nuevos</p>
                  <p style={{ fontSize: 48, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>{comments.filter(c => !c.read && c.from !== "Coach").length}</p>
                </div>
              </div>
              <div style={styles.grid2}>
                <div style={styles.card}>
                  <h2 style={styles.h2}>Atletas</h2>
                  {athletes.map(a => {
                    const d = getDaysUntilExpiry(a.expiry);
                    return (
                      <div key={a.email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #222" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{a.name}</p>
                          <p style={{ color: "#666", fontSize: 13 }}>{a.plan} · {a.type}</p>
                        </div>
                        <span style={styles.tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>
                          {d} días
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={styles.card}>
                  <h2 style={styles.h2}>Próximas sesiones</h2>
                  {schedule.filter(s => s.booked.length > 0).slice(0, 4).map(s => (
                    <div key={s.id} style={{ padding: "12px 0", borderBottom: "1px solid #222" }}>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>{s.day} {s.time}</p>
                      <p style={{ color: "#666", fontSize: 13 }}>{s.booked.join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {view === "atletas" && (
            <>
              <h1 style={{ ...styles.h1, marginBottom: 24 }}>Gestión de <span style={{ color: "#e53e3e" }}>Atletas</span></h1>
              <div style={styles.grid2}>
                {athletes.map(a => {
                  const d = getDaysUntilExpiry(a.expiry);
                  const myW = Object.entries(workouts).filter(([,w]) => w.done).length;
                  return (
                    <div key={a.email} style={styles.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                        <div>
                          <h2 style={{ ...styles.h2, marginBottom: 4 }}>{a.name}</h2>
                          <span style={styles.tag("orange")}>{a.type}</span>
                        </div>
                        <span style={styles.tag(d < 15 ? "red" : d < 30 ? "orange" : "green")}>{d} días restantes</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Plan</p>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{a.plan}</p>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Vencimiento</p>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{a.expiry}</p>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Entrenamientos</p>
                          <p style={{ fontWeight: 600, fontSize: 14, color: "#22c55e" }}>{myW} completados</p>
                        </div>
                        <div style={{ background: "#0d0d0d", borderRadius: 8, padding: 12 }}>
                          <p style={{ color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Sesiones agendadas</p>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>{schedule.filter(s => s.booked.includes(a.name)).length}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {view === "horarios" && (
            <>
              <h1 style={{ ...styles.h1, marginBottom: 24 }}>Gestión de <span style={{ color: "#e53e3e" }}>Horarios</span></h1>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                {schedule.map(s => (
                  <div key={s.id} style={styles.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div>
                        <p style={{ fontWeight: 800, fontSize: 18, textTransform: "uppercase" }}>{s.day}</p>
                        <p style={{ color: "#e53e3e", fontSize: 24, fontWeight: 800 }}>{s.time}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>Cupos</p>
                        <p style={{ fontWeight: 700, fontSize: 20 }}>{s.booked.length}/{s.spots}</p>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {s.booked.length === 0
                        ? <p style={{ color: "#444", fontSize: 13, fontStyle: "italic" }}>Sin reservas</p>
                        : s.booked.map(n => <p key={n} style={{ color: "#ccc", fontSize: 13, padding: "4px 0" }}>· {n}</p>)
                      }
                    </div>
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
                  <p style={styles.h3}>Enviar mensaje</p>
                  <select style={{ ...styles.input, marginBottom: 12 }} value={selectedAthlete} onChange={e => setSelectedAthlete(e.target.value)}>
                    {athletes.map(a => <option key={a.email} value={a.name}>{a.name}</option>)}
                  </select>
                  <textarea style={{ ...styles.input, height: 100, resize: "vertical", marginBottom: 12 }} placeholder="Escribe tu comentario..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                  <button style={styles.redBtn} onClick={sendComment}>Enviar</button>
                </div>
                <div style={styles.card}>
                  <p style={styles.h3}>Historial</p>
                  <div style={{ maxHeight: 400, overflowY: "auto" }}>
                    {comments.slice().reverse().map(c => (
                      <div key={c.id} style={{ padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: c.from === "Coach" ? "#e53e3e" : "#f97316" }}>{c.from} → {c.to}</span>
                          <span style={{ color: "#444", fontSize: 11 }}>{c.date}</span>
                        </div>
                        <p style={{ color: "#bbb", fontSize: 14 }}>{c.text}</p>
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

  // ATHLETE DASHBOARD
  const todayWorkout = workouts[selectedDate];
  const mySchedule = schedule.filter(s => s.booked.includes(user.name));
  const myCommentsList = comments.filter(c => c.from === user.name || c.to === user.name);

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <nav style={styles.nav}>
        <NSBLogo size={24} />
        <div style={styles.navLinks}>
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
            <div style={{ marginBottom: 32 }}>
              <h1 style={styles.h1}>{user.name.split(" ")[0]}, <span style={{ color: "#e53e3e" }}>Never Stop</span></h1>
              <p style={{ color: "#666", fontSize: 15 }}>Aquí está tu resumen de hoy</p>
            </div>
            <div style={styles.grid3}>
              <div style={{ ...styles.redCard, borderLeft: "3px solid #e53e3e" }}>
                <p style={styles.h3}>Plan activo</p>
                <p style={{ fontWeight: 700, fontSize: 16 }}>{user.plan}</p>
                <p style={{ color: "#f97316", fontSize: 13, marginTop: 4 }}>{user.type}</p>
              </div>
              <div style={{ ...styles.card, borderLeft: "3px solid #f97316" }}>
                <p style={styles.h3}>Vencimiento</p>
                <p style={{ fontWeight: 800, fontSize: 32, color: daysLeft < 15 ? "#e53e3e" : daysLeft < 30 ? "#f97316" : "#22c55e", lineHeight: 1 }}>{daysLeft}</p>
                <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>días restantes</p>
              </div>
              <div style={{ ...styles.card, borderLeft: "3px solid #22c55e" }}>
                <p style={styles.h3}>Sesiones agendadas</p>
                <p style={{ fontWeight: 800, fontSize: 32, color: "#22c55e", lineHeight: 1 }}>{mySchedule.length}</p>
                <p style={{ color: "#666", fontSize: 13, marginTop: 4 }}>esta semana</p>
              </div>
            </div>
            {daysLeft < 15 && (
              <div style={{ background: "#1a0505", border: "1px solid #e53e3e", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                <p style={{ color: "#e53e3e", fontWeight: 700, fontSize: 15 }}>⚠ Tu planificación vence en {daysLeft} días</p>
                <p style={{ color: "#999", fontSize: 13, marginTop: 4 }}>Contacta a tu coach para renovar.</p>
              </div>
            )}
            <div style={styles.card}>
              <h2 style={styles.h2}>Entrenamiento de Hoy</h2>
              {todayWorkout ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ color: "#e53e3e", fontSize: 20, fontWeight: 800, textTransform: "uppercase" }}>{todayWorkout.title}</h3>
                    <span style={styles.tag(todayWorkout.done ? "green" : "orange")}>{todayWorkout.done ? "Completado" : "Pendiente"}</span>
                  </div>
                  {todayWorkout.exercises.map((ex, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a1a" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e53e3e22", border: "1px solid #e53e3e44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#e53e3e", flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: 15 }}>{ex}</p>
                    </div>
                  ))}
                </>
              ) : <p style={{ color: "#444", fontStyle: "italic" }}>Descanso activo hoy. Recupera bien.</p>}
            </div>
          </>
        )}

        {view === "planificacion" && (
          <>
            <h1 style={{ ...styles.h1, marginBottom: 8 }}>Mi <span style={{ color: "#e53e3e" }}>Planificación</span></h1>
            <p style={{ color: "#666", marginBottom: 24 }}>Semana actual — {user.plan}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 24 }}>
              {weekDates.map((d, i) => {
                const key = d.toISOString().split("T")[0];
                const w = workouts[key];
                const isToday = key === "2026-04-29";
                return (
                  <div key={key} onClick={() => setSelectedDate(key)} style={{ ...styles.card, padding: 12, cursor: "pointer", border: selectedDate === key ? "1px solid #e53e3e" : isToday ? "1px solid #e53e3e44" : "1px solid #2a2a2a", background: selectedDate === key ? "#1a0a0a" : "#161616" }}>
                    <p style={{ color: "#666", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][i]}</p>
                    <p style={{ fontWeight: 800, fontSize: 22, lineHeight: 1, color: isToday ? "#e53e3e" : "#fff" }}>{d.getDate()}</p>
                    <div style={{ marginTop: 8, width: 8, height: 8, borderRadius: "50%", background: !w ? "#333" : w.done ? "#22c55e" : "#f97316" }} />
                  </div>
                );
              })}
            </div>
            <div style={styles.card}>
              {workouts[selectedDate] ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ ...styles.h2, marginBottom: 0, color: "#e53e3e" }}>{workouts[selectedDate].title}</h2>
                    <span style={styles.tag(workouts[selectedDate].done ? "green" : "orange")}>{workouts[selectedDate].done ? "✓ Completado" : "Pendiente"}</span>
                  </div>
                  {workouts[selectedDate].exercises.map((ex, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: "#e53e3e", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                      <p style={{ fontSize: 16 }}>{ex}</p>
                    </div>
                  ))}
                  {!workouts[selectedDate].done && (
                    <button style={{ ...styles.redBtn, marginTop: 20 }} onClick={() => setWorkouts(w => ({ ...w, [selectedDate]: { ...w[selectedDate], done: true } }))}>
                      Marcar como completado
                    </button>
                  )}
                </>
              ) : <p style={{ color: "#555", fontStyle: "italic", textAlign: "center", padding: 24 }}>Sin entrenamiento programado para este día</p>}
            </div>
          </>
        )}

        {view === "horarios" && (
          <>
            <h1 style={{ ...styles.h1, marginBottom: 8 }}>Agendar <span style={{ color: "#e53e3e" }}>Sesión</span></h1>
            <p style={{ color: "#666", marginBottom: 24 }}>Elige tus horarios para la semana</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {schedule.map(s => {
                const isMine = s.booked.includes(user.name);
                const isFull = s.booked.length >= s.spots;
                return (
                  <div key={s.id} style={{ ...styles.card, border: isMine ? "1px solid #e53e3e" : "1px solid #2a2a2a", background: isMine ? "#1a0a0a" : "#161616" }}>
                    <p style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase" }}>{s.day}</p>
                    <p style={{ color: "#e53e3e", fontSize: 32, fontWeight: 800, lineHeight: 1, marginBottom: 8 }}>{s.time}</p>
                    <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>{s.booked.length}/{s.spots} cupos</p>
                    <button
                      style={{ ...isMine ? styles.redBtn : styles.ghostBtn, width: "100%", fontSize: 12, padding: "10px" }}
                      onClick={() => bookSlot(s.id)}
                      disabled={!isMine && isFull}
                    >
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
                <textarea style={{ ...styles.input, height: 120, resize: "vertical", marginBottom: 12 }} placeholder="Escríbele a tu coach..." value={newComment} onChange={e => setNewComment(e.target.value)} />
                <button style={styles.redBtn} onClick={sendComment}>Enviar</button>
              </div>
              <div style={styles.card}>
                <p style={styles.h3}>Conversación</p>
                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {myCommentsList.length === 0
                    ? <p style={{ color: "#444", fontStyle: "italic" }}>Sin mensajes aún</p>
                    : myCommentsList.slice().reverse().map(c => {
                        const isMe = c.from === user.name;
                        return (
                          <div key={c.id} style={{ padding: "12px 0", borderBottom: "1px solid #1a1a1a" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 12, color: isMe ? "#f97316" : "#e53e3e" }}>{c.from}</span>
                              <span style={{ color: "#444", fontSize: 11 }}>{c.date}</span>
                            </div>
                            <p style={{ color: "#bbb", fontSize: 14 }}>{c.text}</p>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
