import { supabase } from "./supabase";

/* ═══════════════════════════════════════════════════════
   PRACTICES
   ═══════════════════════════════════════════════════════ */

/**
 * Fetch all practices (for patient registration dropdown).
 */
export async function getPractices() {
  const { data, error } = await supabase
    .from("practices")
    .select("id, name, address, eircode")
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Fetch practices a GP is staff at (via practice_staff join table).
 */
export async function getGPPractices(gpId) {
  const { data, error } = await supabase
    .from("practice_staff")
    .select("practice:practices(*)")
    .eq("gp_id", gpId);

  if (error) throw error;
  return (data || []).map((r) => r.practice).filter(Boolean);
}

/* ═══════════════════════════════════════════════════════
   SUBMISSIONS
   ═══════════════════════════════════════════════════════ */

/**
 * Create a new patient submission.
 * @param {Object} params
 * @param {string} params.patientId  - auth user id
 * @param {Object} params.formData   - symptom form fields
 * @param {string} params.triageLevel - green | amber | red
 * @returns {Promise<Object>} created row
 */
export async function createSubmission({ patientId, formData, triageLevel }) {
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      patient_id: patientId,
      first_name: formData.firstName,
      last_name: formData.lastName,
      age: Number(formData.age),
      gender: formData.gender,
      body_areas: formData.bodyAreas,
      selected_symptoms: formData.selectedSymptoms,
      duration: formData.duration,
      severity: formData.severity,
      additional_info: formData.additionalInfo || "",
      triage_level: triageLevel,
      status: "pending-review",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch submissions for a specific patient.
 */
export async function getPatientSubmissions(patientId) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch ALL submissions visible to the current user.
 * RLS ensures GPs only see submissions from their practice patients.
 */
export async function getAllSubmissions() {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, profiles!submissions_patient_id_fkey(first_name, last_name, email, phone)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetch a single submission by ID.
 */
export async function getSubmission(id) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, profiles!submissions_patient_id_fkey(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update submission status (GP action).
 */
export async function updateSubmissionStatus(id, status) {
  const { data, error } = await supabase
    .from("submissions")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ═══════════════════════════════════════════════════════
   GP ACTIONS
   ═══════════════════════════════════════════════════════ */

/**
 * Add a GP action to a submission.
 */
export async function createGPAction({ submissionId, gpId, actionType, notes }) {
  const { data, error } = await supabase
    .from("gp_actions")
    .insert({
      submission_id: submissionId,
      gp_id: gpId,
      action_type: actionType,
      notes: notes || "",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all actions for a submission.
 */
export async function getSubmissionActions(submissionId) {
  const { data, error } = await supabase
    .from("gp_actions")
    .select("*, profiles!gp_actions_gp_id_fkey(first_name, last_name)")
    .eq("submission_id", submissionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
