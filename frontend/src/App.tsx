import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import MedicineSearch from "./pages/MedicineSearch";
import MedicineDetail from "./pages/MedicineDetail";
import MedicineCompare from "./pages/MedicineCompare";
import PharmacyLocator from "./pages/PharmacyLocator";
import PlantsLibrary from "./pages/PlantsLibrary";
import PlantDetail from "./pages/PlantDetail";
import LearningCenter from "./pages/LearningCenter";
import SubjectPage from "./pages/SubjectPage";
import ChapterPage from "./pages/ChapterPage";
import QuizPage from "./pages/QuizPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import AyurBot from "./pages/AyurBot";
import ScanMedicine from "./pages/ScanMedicine";

import PatientDashboard from "./pages/patient/PatientDashboard";
import MyReservations from "./pages/patient/MyReservations";
import PrescriptionVault from "./pages/patient/PrescriptionVault";
import MyReports from "./pages/patient/MyReports";
import StudentDashboard from "./pages/student/StudentDashboard";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/medicines" element={<MedicineSearch />} />
        <Route path="/medicines/:id" element={<MedicineDetail />} />
        <Route path="/compare" element={<MedicineCompare />} />
        <Route path="/pharmacies" element={<PharmacyLocator />} />
        <Route path="/plants" element={<PlantsLibrary />} />
        <Route path="/plants/:id" element={<PlantDetail />} />
        <Route path="/learning" element={<LearningCenter />} />
        <Route path="/learning/subjects/:id" element={<SubjectPage />} />
        <Route path="/learning/chapters/:id" element={<ChapterPage />} />
        <Route path="/learning/chapters/:chapterId/flashcards" element={<FlashcardsPage />} />
        <Route path="/learning/quizzes/:id" element={<QuizPage />} />

        <Route path="/ayurbot" element={<ProtectedRoute><AyurBot /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanMedicine /></ProtectedRoute>} />

        <Route path="/patient" element={<ProtectedRoute roles={["PATIENT"]}><PatientDashboard /></ProtectedRoute>} />
        <Route path="/patient/reservations" element={<ProtectedRoute roles={["PATIENT"]}><MyReservations /></ProtectedRoute>} />
        <Route path="/patient/prescriptions" element={<ProtectedRoute roles={["PATIENT"]}><PrescriptionVault /></ProtectedRoute>} />
        <Route path="/patient/reports" element={<ProtectedRoute roles={["PATIENT"]}><MyReports /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute roles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute roles={["DOCTOR"]}><DoctorDashboard /></ProtectedRoute>} />
        <Route path="/pharmacy" element={<ProtectedRoute roles={["PHARMACY"]}><PharmacyDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Landing />} />
      </Routes>
    </Layout>
  );
}
