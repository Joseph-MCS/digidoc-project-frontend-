/**
 * Mock data store – simulates patient submissions and medical records.
 * In production this would come from a backend API.
 */

export const PATIENTS = [
  {
    id: "P-1001",
    firstName: "Aoife",
    lastName: "Murphy",
    age: 34,
    gender: "Female",
    email: "aoife.murphy@example.com",
    phone: "087 123 4567",
    ppsn: "1234567TA",
    submittedAt: "2026-02-28T09:14:00Z",
    status: "pending-review",
    triageLevel: "amber",
    bodyArea: "Chest / Lungs",
    selectedSymptoms: ["Cough", "Shortness of breath", "Chest tightness"],
    duration: "4 – 7 days",
    severity: 3,
    additionalInfo:
      "I have a history of asthma. The cough has been getting worse at night and I've been using my inhaler more frequently than usual.",
    medicalHistory: {
      conditions: ["Asthma (diagnosed 2015)", "Seasonal allergies"],
      medications: ["Salbutamol inhaler (as needed)", "Cetirizine 10mg daily"],
      allergies: ["Penicillin"],
      surgeries: [],
      familyHistory: ["Mother – Type 2 Diabetes", "Father – Hypertension"],
      smoking: "Never",
      alcohol: "Social (1–2 drinks/week)",
      previousVisits: [
        {
          date: "2025-11-10",
          reason: "Asthma review",
          outcome: "Stable – continue current medication",
          doctor: "Dr. O'Brien",
        },
        {
          date: "2025-06-22",
          reason: "Sore throat & fever",
          outcome: "Viral pharyngitis – self-care advised",
          doctor: "Dr. O'Brien",
        },
        {
          date: "2024-09-15",
          reason: "Annual check-up",
          outcome: "All clear – bloods normal",
          doctor: "Dr. Kelly",
        },
      ],
    },
  },
  {
    id: "P-1002",
    firstName: "Seán",
    lastName: "O'Connor",
    age: 52,
    gender: "Male",
    email: "sean.oc@example.com",
    phone: "086 987 6543",
    ppsn: "7654321RB",
    submittedAt: "2026-02-28T08:32:00Z",
    status: "pending-review",
    triageLevel: "red",
    bodyArea: "Heart / Cardiovascular",
    selectedSymptoms: ["Chest pain", "Palpitations", "Shortness of breath"],
    duration: "Less than 24 hours",
    severity: 4,
    additionalInfo:
      "Woke up at 3am with chest pain radiating into left arm. Pain eased slightly but palpitations remain. Family history of heart disease.",
    medicalHistory: {
      conditions: [
        "Hypertension (diagnosed 2020)",
        "High cholesterol (diagnosed 2021)",
        "Obesity (BMI 32)",
      ],
      medications: [
        "Ramipril 5mg daily",
        "Atorvastatin 20mg daily",
        "Aspirin 75mg daily",
      ],
      allergies: [],
      surgeries: ["Appendectomy (2005)"],
      familyHistory: [
        "Father – MI at age 58 (deceased)",
        "Brother – Stent placed at 49",
      ],
      smoking: "Ex-smoker (quit 2019, 20 pack-year history)",
      alcohol: "Moderate (5–6 drinks/week)",
      previousVisits: [
        {
          date: "2026-01-15",
          reason: "Blood pressure review",
          outcome: "BP 148/92 – increased Ramipril to 5mg",
          doctor: "Dr. O'Brien",
        },
        {
          date: "2025-10-20",
          reason: "Cholesterol review",
          outcome: "LDL still elevated – lifestyle advice given",
          doctor: "Dr. O'Brien",
        },
        {
          date: "2025-05-10",
          reason: "Knee pain",
          outcome: "Mild osteoarthritis – physiotherapy referral",
          doctor: "Dr. Kelly",
        },
      ],
    },
  },
  {
    id: "P-1003",
    firstName: "Ciara",
    lastName: "Byrne",
    age: 27,
    gender: "Female",
    email: "ciara.byrne@example.com",
    phone: "085 555 1234",
    ppsn: "3456789SC",
    submittedAt: "2026-02-27T22:05:00Z",
    status: "reviewed",
    triageLevel: "green",
    bodyArea: "Skin",
    selectedSymptoms: ["Rash", "Itching"],
    duration: "1 – 3 days",
    severity: 1,
    additionalInfo:
      "Small red rash appeared on my forearm after using new laundry detergent. Mildly itchy, no pain.",
    medicalHistory: {
      conditions: ["Eczema (childhood, mostly resolved)"],
      medications: [],
      allergies: ["Latex"],
      surgeries: [],
      familyHistory: ["Mother – Eczema"],
      smoking: "Never",
      alcohol: "Rarely",
      previousVisits: [
        {
          date: "2025-08-01",
          reason: "Eczema flare-up",
          outcome: "Prescribed hydrocortisone cream",
          doctor: "Dr. Kelly",
        },
      ],
    },
  },
  {
    id: "P-1004",
    firstName: "Patrick",
    lastName: "Gallagher",
    age: 68,
    gender: "Male",
    email: "pat.g@example.com",
    phone: "089 222 3344",
    ppsn: "9876543TD",
    submittedAt: "2026-02-28T07:45:00Z",
    status: "pending-review",
    triageLevel: "amber",
    bodyArea: "Abdomen / Stomach",
    selectedSymptoms: ["Stomach cramps", "Bloating", "Constipation"],
    duration: "More than 2 weeks",
    severity: 2,
    additionalInfo:
      "Persistent bloating and irregular bowel habits over the last 3 weeks. Some unintentional weight loss (~3kg). No blood in stool.",
    medicalHistory: {
      conditions: [
        "Type 2 Diabetes (diagnosed 2018)",
        "Benign prostatic hyperplasia",
      ],
      medications: [
        "Metformin 1000mg twice daily",
        "Tamsulosin 0.4mg daily",
      ],
      allergies: ["Sulfa drugs"],
      surgeries: ["Hernia repair (2012)"],
      familyHistory: [
        "Mother – Colorectal cancer at age 72",
        "Father – Type 2 Diabetes",
      ],
      smoking: "Ex-smoker (quit 2001)",
      alcohol: "Occasional",
      previousVisits: [
        {
          date: "2026-01-05",
          reason: "Diabetes review",
          outcome: "HbA1c 7.2% – continue current regimen",
          doctor: "Dr. O'Brien",
        },
        {
          date: "2025-09-12",
          reason: "Prostate review",
          outcome: "Stable – continue Tamsulosin",
          doctor: "Dr. Kelly",
        },
      ],
    },
  },
  {
    id: "P-1005",
    firstName: "Niamh",
    lastName: "Doyle",
    age: 41,
    gender: "Female",
    email: "niamh.doyle@example.com",
    phone: "083 444 5566",
    ppsn: "5678901RE",
    submittedAt: "2026-02-28T10:20:00Z",
    status: "pending-review",
    triageLevel: "amber",
    bodyArea: "Mental Health",
    selectedSymptoms: ["Anxiety", "Insomnia", "Low mood", "Fatigue"],
    duration: "1 – 2 weeks",
    severity: 3,
    additionalInfo:
      "Work stress has significantly increased. Difficulty sleeping for the past 2 weeks, waking at 4am and unable to get back to sleep. Feeling overwhelmed and tearful.",
    medicalHistory: {
      conditions: [
        "Generalised Anxiety Disorder (diagnosed 2022)",
        "Migraine",
      ],
      medications: [
        "Sertraline 50mg daily",
        "Sumatriptan 50mg (as needed for migraine)",
      ],
      allergies: [],
      surgeries: [],
      familyHistory: ["Sister – Depression", "Mother – Anxiety"],
      smoking: "Never",
      alcohol: "Social (2–3 drinks/week)",
      previousVisits: [
        {
          date: "2025-12-01",
          reason: "Anxiety review",
          outcome: "Stable on Sertraline – continue",
          doctor: "Dr. O'Brien",
        },
        {
          date: "2025-07-18",
          reason: "Migraine cluster",
          outcome: "3 episodes in 2 weeks – renewed Sumatriptan",
          doctor: "Dr. O'Brien",
        },
      ],
    },
  },
  {
    id: "P-1006",
    firstName: "Rory",
    lastName: "Walsh",
    age: 8,
    gender: "Male",
    email: "walsh.family@example.com",
    phone: "087 999 8877",
    ppsn: "1122334TF",
    submittedAt: "2026-02-27T19:30:00Z",
    status: "reviewed",
    triageLevel: "green",
    bodyArea: "Ears / Nose / Throat",
    selectedSymptoms: ["Sore throat", "Blocked nose"],
    duration: "1 – 3 days",
    severity: 1,
    additionalInfo:
      "Submitted by parent. Rory has a runny nose and sore throat since yesterday. Temperature 37.8°C. Eating and drinking normally.",
    medicalHistory: {
      conditions: [],
      medications: [],
      allergies: [],
      surgeries: [],
      familyHistory: [],
      smoking: "N/A",
      alcohol: "N/A",
      previousVisits: [
        {
          date: "2025-11-05",
          reason: "Ear infection",
          outcome: "Prescribed amoxicillin – resolved",
          doctor: "Dr. Kelly",
        },
      ],
    },
  },
];

/** Simulated AI analysis responses keyed by patient ID */
export const AI_ANALYSES = {
  "P-1001": {
    summary:
      "34-year-old female with known asthma presenting with worsening cough, shortness of breath, and chest tightness over 4–7 days. Increased reliever inhaler use suggests suboptimal asthma control.",
    riskFactors: [
      "Known asthma – potential exacerbation",
      "Penicillin allergy limits antibiotic options if infection suspected",
      "Night-time symptoms suggest poor nocturnal control",
    ],
    differentialDiagnosis: [
      { condition: "Asthma exacerbation", likelihood: "High" },
      { condition: "Lower respiratory tract infection", likelihood: "Moderate" },
      { condition: "Allergic bronchospasm", likelihood: "Low–Moderate" },
    ],
    recommendation:
      "Recommend GP review within 48 hours. Consider stepping up preventer therapy (e.g. add ICS/LABA combination). If symptoms worsen acutely or O₂ saturation drops, advise A&E attendance. Check peak flow if available.",
    urgency: "Moderate – GP review recommended within 48 hours",
  },
  "P-1002": {
    summary:
      "52-year-old male with significant cardiovascular risk factors (hypertension, hyperlipidaemia, obesity, ex-smoker, strong family history of MI) presenting with acute chest pain radiating to left arm and palpitations. Onset during sleep.",
    riskFactors: [
      "Multiple cardiovascular risk factors",
      "Strong family history – father MI at 58, brother stent at 49",
      "Ex-smoker with 20 pack-year history",
      "Recent BP still suboptimally controlled (148/92)",
      "LDL cholesterol previously elevated",
    ],
    differentialDiagnosis: [
      { condition: "Acute Coronary Syndrome (ACS)", likelihood: "High" },
      { condition: "Unstable angina", likelihood: "High" },
      { condition: "Cardiac arrhythmia", likelihood: "Moderate" },
      { condition: "Musculoskeletal chest pain", likelihood: "Low" },
    ],
    recommendation:
      "URGENT – This patient requires immediate assessment. Recommend calling 999/112 or presenting to A&E immediately. Administer 300mg aspirin if not contraindicated. ECG and troponin required urgently. Do NOT wait for GP appointment.",
    urgency: "Critical – Immediate A&E attendance required",
  },
  "P-1003": {
    summary:
      "27-year-old female with history of childhood eczema presenting with mild rash and itching on forearm following use of new laundry detergent. No systemic symptoms.",
    riskFactors: [
      "History of eczema – predisposition to contact dermatitis",
      "Latex allergy indicates atopic tendency",
    ],
    differentialDiagnosis: [
      { condition: "Allergic contact dermatitis", likelihood: "High" },
      { condition: "Irritant contact dermatitis", likelihood: "Moderate" },
      { condition: "Eczema flare", likelihood: "Low–Moderate" },
    ],
    recommendation:
      "Self-care appropriate. Discontinue new detergent, wash affected clothing. Apply emollient and OTC hydrocortisone 1% cream if itching persists. If rash spreads, worsens, or systemic symptoms develop, advise GP review.",
    urgency: "Low – Self-care with monitoring",
  },
  "P-1004": {
    summary:
      "68-year-old male with Type 2 Diabetes presenting with persistent bloating, constipation, and unintentional weight loss (~3kg over 3 weeks). Family history of colorectal cancer (mother at 72).",
    riskFactors: [
      "Age >60 with change in bowel habit",
      "Unintentional weight loss – red flag symptom",
      "First-degree relative with colorectal cancer",
      "Duration >2 weeks",
    ],
    differentialDiagnosis: [
      { condition: "Colorectal malignancy", likelihood: "Requires exclusion" },
      { condition: "Irritable bowel syndrome", likelihood: "Moderate" },
      { condition: "Diabetic gastroparesis", likelihood: "Low–Moderate" },
      { condition: "Medication side effect (Metformin)", likelihood: "Low" },
    ],
    recommendation:
      "Urgent GP review recommended. Red flag symptoms (weight loss + change in bowel habit + age + family history) warrant 2-week wait urgent referral for colonoscopy to exclude colorectal malignancy. Check FBC, CRP, coeliac screen, and faecal calprotectin.",
    urgency: "High – Urgent GP review and 2-week wait referral",
  },
  "P-1005": {
    summary:
      "41-year-old female with known GAD on Sertraline 50mg presenting with worsening anxiety, insomnia (early morning waking), low mood, and fatigue over 1–2 weeks. Triggered by increased work stress.",
    riskFactors: [
      "Pre-existing anxiety disorder",
      "Family history of depression and anxiety",
      "Sleep disruption exacerbating symptoms",
      "Possible SSRI dose inadequacy under stress",
    ],
    differentialDiagnosis: [
      { condition: "GAD exacerbation with depressive features", likelihood: "High" },
      { condition: "Adjustment disorder", likelihood: "Moderate" },
      { condition: "Major depressive episode", likelihood: "Moderate" },
      { condition: "Thyroid dysfunction", likelihood: "Low – consider screening" },
    ],
    recommendation:
      "GP review within 1 week. Consider increasing Sertraline to 100mg. Screen with PHQ-9 and GAD-7. Discuss sleep hygiene and stress management. Consider referral to counselling/CBT. Check TFTs to exclude thyroid cause. Assess risk – safety netting essential.",
    urgency: "Moderate – GP review within 1 week",
  },
  "P-1006": {
    summary:
      "8-year-old male with acute onset sore throat and nasal congestion for 1–2 days. Low-grade fever (37.8°C). Eating and drinking well. No red flag symptoms.",
    riskFactors: [
      "Age – common childhood viral illness",
      "Previous ear infection – monitor for secondary bacterial infection",
    ],
    differentialDiagnosis: [
      { condition: "Viral upper respiratory tract infection", likelihood: "High" },
      { condition: "Streptococcal pharyngitis", likelihood: "Low–Moderate" },
    ],
    recommendation:
      "Self-care appropriate. Paracetamol/ibuprofen for fever and discomfort (age-appropriate dosing). Encourage fluids. If fever persists >5 days, symptoms worsen, or difficulty swallowing/breathing develops, advise GP review. No antibiotics needed at this stage.",
    urgency: "Low – Self-care with monitoring",
  },
};
