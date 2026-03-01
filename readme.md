# DigiDoc – Digital Healthcare Triage Platform

DigiDoc is a digital healthcare triage platform designed to reduce waiting lists in Ireland by assessing non-serious health concerns online. Patients submit their symptoms through the platform, where AI-assisted processing and licensed doctors review cases, especially during weekends. The system determines whether the issue requires urgent specialist care or can be managed through self-care or routine GP consultation.

Project currently deployed here : https://digidoc-git-appointmenttracking-joseph-mcs-projects.vercel.app/

## Features

### Patient Portal (`/patient`)
- **Interactive Body Model** – SVG-based clickable body diagram (front/back views) for intuitive symptom area selection
- **5-Step Symptom Wizard** – guided form: About You → Body Area → Symptoms → Details → Review & Submit
- **AI-Powered Triage** – automated severity classification into Green (self-care), Amber (GP review), or Red (urgent)
- **Contextual Symptom Suggestions** – body-area-specific symptom chips with custom entry support

### GP Office Portal (`/gp`)
- **Dashboard** – real-time overview of submissions, pending reviews, and urgent case alerts
- **Patient List** – searchable and filterable patient submissions with triage and status badges
- **Patient Detail** – full patient record with tabs for current submission, medical history, and previous visits
- **AI Clinical Assistant** – LLM-powered analysis providing clinical summaries, risk factors, differential diagnoses, and treatment recommendations based on symptom history and complete medical records

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| React Router | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Lucide React | Icon library |

## Project Structure

```
src/
├── components/
│   ├── BodyModel.jsx        # Interactive SVG body diagram
│   ├── Footer.jsx           # Shared footer
│   ├── GPLayout.jsx         # GP portal sidebar layout
│   ├── Layout.jsx           # Patient portal layout
│   └── Navbar.jsx           # Patient portal navigation
├── data/
│   └── mockPatients.js      # Mock patient records & AI analyses
├── pages/
│   ├── gp/
│   │   ├── AIAssistant.jsx  # Standalone AI analysis tool
│   │   ├── GPDashboard.jsx  # GP dashboard overview
│   │   ├── PatientDetail.jsx# Patient record + AI panel
│   │   └── PatientList.jsx  # Filtered patient list
│   ├── HomePage.jsx         # Patient-facing landing page
│   ├── PortalSelector.jsx   # Portal selection (Patient / GP)
│   ├── SymptomForm.jsx      # 5-step symptom intake wizard
│   └── TriageResult.jsx     # Triage outcome display
├── App.jsx                  # Route definitions
├── index.css                # Tailwind + custom styles
└── main.jsx                 # App entry point
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/Joseph-MCS/digidoc-project-frontend-.git
cd digidoc-project-frontend-
npm install
```

### Development

```bash
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

### Production Build

```bash
npm run build
npm run preview
```

## Routes

| Route | Portal | Page |
|---|---|---|
| `/` | – | Portal selector |
| `/patient` | Patient | Home / landing page |
| `/patient/symptoms` | Patient | Symptom intake wizard |
| `/patient/result` | Patient | Triage result |
| `/gp` | GP Office | Dashboard |
| `/gp/patients` | GP Office | Patient list |
| `/gp/patients/:id` | GP Office | Patient detail + AI analysis |
| `/gp/ai-assistant` | GP Office | AI clinical assistant |

## Disclaimer

DigiDoc is a prototype and is **not a substitute** for professional medical advice, diagnosis, or treatment. If you are experiencing a medical emergency, call **999 / 112**.
