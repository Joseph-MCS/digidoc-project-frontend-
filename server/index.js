import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { openDatabase } from "./db.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseSubmission(s) {
  if (!s) return null;
  return {
    ...s,
    body_areas: JSON.parse(s.body_areas || "[]"),
    selected_symptoms: JSON.parse(s.selected_symptoms || "[]"),
  };
}

function newId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

// ── Open the SQLite database, then register routes ───────────────────────────
const db = await openDatabase();

// ── Auth ──────────────────────────────────────────────────────────────────────
app.post("/api/auth/register", (req, res) => {
  const { email, password, role = "patient", firstName = "", lastName = "" } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const { lastInsertRowid } = db.run(
      "INSERT INTO users (email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?)",
      [email, hash, role, firstName, lastName]
    );
    const user = db.get(
      "SELECT id, email, role, first_name, last_name, created_at FROM users WHERE id = ?",
      [lastInsertRowid]
    );
    res.json(user);
  } catch (err) {
    if (String(err).includes("UNIQUE")) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required." });

  const user = db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const { password: _pw, ...safeUser } = user;
  res.json(safeUser);
});

// ── Submissions ───────────────────────────────────────────────────────────────
app.get("/api/submissions", (req, res) => {
  const { patientId } = req.query;
  const rows = patientId
    ? db.all("SELECT * FROM submissions WHERE patient_id = ? ORDER BY created_at DESC", [patientId])
    : db.all("SELECT * FROM submissions ORDER BY created_at DESC");
  res.json(rows.map(parseSubmission));
});

app.get("/api/submissions/:id", (req, res) => {
  const row = db.get("SELECT * FROM submissions WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Submission not found." });
  res.json(parseSubmission(row));
});

app.post("/api/submissions", (req, res) => {
  const { patientId, formData, triageLevel } = req.body;
  const id = newId("SUB");

  db.run(
    `INSERT INTO submissions
       (id, patient_id, first_name, last_name, age, gender,
        body_areas, selected_symptoms, duration, severity,
        additional_info, triage_level, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending-review')`,
    [
      id,
      patientId ?? null,
      formData.firstName,
      formData.lastName,
      Number(formData.age),
      formData.gender,
      JSON.stringify(formData.bodyAreas),
      JSON.stringify(formData.selectedSymptoms),
      formData.duration,
      formData.severity,
      formData.additionalInfo || "",
      triageLevel,
    ]
  );

  res.json(parseSubmission(db.get("SELECT * FROM submissions WHERE id = ?", [id])));
});

app.patch("/api/submissions/:id", (req, res) => {
  const { status } = req.body;
  db.run("UPDATE submissions SET status = ? WHERE id = ?", [status, req.params.id]);
  res.json(parseSubmission(db.get("SELECT * FROM submissions WHERE id = ?", [req.params.id])));
});

// ── GP Actions ────────────────────────────────────────────────────────────────
app.get("/api/submissions/:id/actions", (req, res) => {
  const actions = db.all(
    "SELECT * FROM gp_actions WHERE submission_id = ? ORDER BY created_at DESC",
    [req.params.id]
  );
  res.json(actions);
});

app.post("/api/gp-actions", (req, res) => {
  const { submissionId, gpId, actionType, notes } = req.body;
  const id = newId("ACT");

  db.run(
    "INSERT INTO gp_actions (id, submission_id, gp_id, action_type, notes) VALUES (?, ?, ?, ?, ?)",
    [id, submissionId, gpId ?? null, actionType, notes || ""]
  );

  res.json(db.get("SELECT * FROM gp_actions WHERE id = ?", [id]));
});

// ── Appointments ──────────────────────────────────────────────────────────────

/** GP books a hospital appointment for a patient */
app.post("/api/appointments", (req, res) => {
  const {
    submissionId, patientId, gpId,
    hospital, department, doctor,
    appointmentDate, appointmentTime,
    reason, notes,
  } = req.body;

  if (!hospital || !appointmentDate || !appointmentTime)
    return res.status(400).json({ error: "Hospital, date and time are required." });

  const id = newId("APT");
  db.run(
    `INSERT INTO appointments
       (id, submission_id, patient_id, gp_id, hospital, department, doctor,
        appointment_date, appointment_time, reason, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      submissionId ?? null,
      patientId ?? null,
      gpId ?? null,
      hospital,
      department || "",
      doctor || "",
      appointmentDate,
      appointmentTime,
      reason || "",
      notes || "",
    ]
  );

  // Auto-create a "refer" GP action so it appears in the GP actions log
  if (submissionId && gpId) {
    const actionId = newId("ACT");
    const actionNote = `Referred to ${hospital}${department ? ` – ${department}` : ""}. Appointment: ${appointmentDate} at ${appointmentTime}.${reason ? ` Reason: ${reason}` : ""}`;
    db.run(
      "INSERT INTO gp_actions (id, submission_id, gp_id, action_type, notes) VALUES (?, ?, ?, 'refer', ?)",
      [actionId, submissionId, gpId, actionNote]
    );
  }

  res.json(db.get("SELECT * FROM appointments WHERE id = ?", [id]));
});

/** Get appointments — by patientId or submissionId */
app.get("/api/appointments", (req, res) => {
  const { patientId, submissionId } = req.query;
  let rows;
  if (patientId) {
    rows = db.all(
      "SELECT * FROM appointments WHERE patient_id = ? ORDER BY appointment_date ASC, appointment_time ASC",
      [patientId]
    );
  } else if (submissionId) {
    rows = db.all(
      "SELECT * FROM appointments WHERE submission_id = ? ORDER BY created_at DESC",
      [submissionId]
    );
  } else {
    rows = db.all("SELECT * FROM appointments ORDER BY appointment_date ASC, appointment_time ASC");
  }
  res.json(rows);
});

/** Cancel or reschedule an appointment */
app.patch("/api/appointments/:id", (req, res) => {
  const { status, appointmentDate, appointmentTime } = req.body;

  if (appointmentDate && appointmentTime) {
    // Reschedule
    db.run(
      "UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'confirmed', updated_at = datetime('now') WHERE id = ?",
      [appointmentDate, appointmentTime, req.params.id]
    );
  } else if (status) {
    db.run(
      "UPDATE appointments SET status = ?, updated_at = datetime('now') WHERE id = ?",
      [status, req.params.id]
    );
  }

  const row = db.get("SELECT * FROM appointments WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Appointment not found." });
  res.json(row);
});

// ── Serve Vite build in production ───────────────────────────────────────────
const distPath = join(__dirname, "../dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // All non-API routes return index.html (React Router SPA)
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(join(distPath, "index.html"));
  });
}

// ── Start (skip listen on Vercel — it uses the exported app) ─────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`DigiDoc  →  http://localhost:${PORT}`);
  });
}

export default app;
