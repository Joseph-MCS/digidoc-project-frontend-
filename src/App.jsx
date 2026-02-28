import { Routes, Route } from "react-router-dom";

/* Shared */
import PortalSelector from "./pages/PortalSelector";
import ProtectedRoute from "./components/ProtectedRoute";

/* Auth */
import PatientAuth from "./pages/auth/PatientAuth";
import GPAuth from "./pages/auth/GPAuth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

/* Patient pipeline */
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SymptomForm from "./pages/SymptomForm";
import TriageResult from "./pages/TriageResult";

/* GP Office pipeline */
import GPLayout from "./components/GPLayout";
import GPDashboard from "./pages/gp/GPDashboard";
import PatientList from "./pages/gp/PatientList";
import PatientDetail from "./pages/gp/PatientDetail";
import AIAssistant from "./pages/gp/AIAssistant";

export default function App() {
  return (
    <Routes>
      {/* Portal selector (landing) */}
      <Route path="/" element={<PortalSelector />} />

      {/* Auth pages */}
      <Route path="/auth/patient" element={<PatientAuth />} />
      <Route path="/auth/gp" element={<GPAuth />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* ── Patient Pipeline (requires patient role) ── */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute requiredRole="patient" redirectTo="/auth/patient">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="symptoms" element={<SymptomForm />} />
        <Route path="result" element={<TriageResult />} />
      </Route>

      {/* ── GP Office Pipeline (requires gp role) ── */}
      <Route
        path="/gp"
        element={
          <ProtectedRoute requiredRole="gp" redirectTo="/auth/gp">
            <GPLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<GPDashboard />} />
        <Route path="patients" element={<PatientList />} />
        <Route path="patients/:id" element={<PatientDetail />} />
        <Route path="ai-assistant" element={<AIAssistant />} />
      </Route>
    </Routes>
  );
}
