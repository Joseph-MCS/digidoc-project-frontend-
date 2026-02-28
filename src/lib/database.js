// All data access goes through the local Express API.
// Vite proxies /api → http://localhost:3001 in dev.

async function req(path, options = {}) {
  const res = await fetch("/api" + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// ── Submissions ───────────────────────────────────────────────────────────────

export async function createSubmission({ patientId, formData, triageLevel }) {
  return req("/submissions", { method: "POST", body: { patientId, formData, triageLevel } });
}

export async function getPatientSubmissions(patientId) {
  return req(`/submissions?patientId=${patientId}`);
}

export async function getAllSubmissions() {
  return req("/submissions");
}

export async function getSubmission(id) {
  return req(`/submissions/${id}`);
}

export async function updateSubmissionStatus(id, status) {
  return req(`/submissions/${id}`, { method: "PATCH", body: { status } });
}

// ── GP Actions ────────────────────────────────────────────────────────────────

export async function createGPAction({ submissionId, gpId, actionType, notes }) {
  return req("/gp-actions", { method: "POST", body: { submissionId, gpId, actionType, notes } });
}

export async function getSubmissionActions(submissionId) {
  return req(`/submissions/${submissionId}/actions`);
}

// ── Appointments ─────────────────────────────────────────────────────────────

export async function createAppointment(data) {
  return req("/appointments", { method: "POST", body: data });
}

export async function getPatientAppointments(patientId) {
  return req(`/appointments?patientId=${patientId}`);
}

export async function getSubmissionAppointments(submissionId) {
  return req(`/appointments?submissionId=${submissionId}`);
}

export async function updateAppointment(id, data) {
  return req(`/appointments/${id}`, { method: "PATCH", body: data });
}

// ── Practices (removed – no longer used) ─────────────────────────────────────

export async function getPractices() {
  return [];
}
