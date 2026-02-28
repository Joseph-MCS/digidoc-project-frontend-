import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SymptomForm from "./pages/SymptomForm";
import TriageResult from "./pages/TriageResult";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/symptoms" element={<SymptomForm />} />
        <Route path="/result" element={<TriageResult />} />
      </Route>
    </Routes>
  );
}
