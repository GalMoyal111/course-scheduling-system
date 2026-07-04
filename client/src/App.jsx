import { useEffect } from "react";
import { ping } from "./services/api";
import { useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import UploadPage from "./pages/UploadPage";
import UploadRoomsPage from "./pages/UploadRoomsPage";
import UploadCoursesPage from "./pages/UploadCoursesPage";
import DashboardPage from "./pages/DashboardPage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getUserRole } from "./services/api";
import SettingsPage from "./pages/SettingsPage";
import LecturersPage from "./pages/LecturersPage";
import TimetablePage from "./pages/TimetablePage";
import HelpPage from "./pages/HelpPage";
import GeneratePage from "./pages/GeneratePage";
import HistoryPage from "./pages/HistoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/global.css";


import Layout from "./components/ui/Layout";
import Footer from "./components/ui/Footer";

// Renders the App component.
function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let pageName = "Dashboard";

    if (location.pathname === "/courses") pageName = "Courses";
    else if (location.pathname === "/classrooms") pageName = "Classrooms";
    else if (location.pathname === "/lessons") pageName = "Lessons";
    else if (location.pathname === "/lecturers") pageName = "Lecturers";
    else if (location.pathname === "/generate") pageName = "Generate";
    else if (location.pathname === "/timetable") pageName = "Timetable";
    else if (location.pathname === "/history") pageName = "History";
    else if (location.pathname === "/settings") pageName = "Settings";
    else if (location.pathname === "/help") pageName = "Help & Information";

    document.title = `UniSched – ${pageName}`;
  }, [location]);


  useEffect(() => {
    ping().catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const data = await getUserRole(token);

          setUser({
            email: firebaseUser.email,
            role: data.role,
          });
        } catch (err) {
          console.error("Failed to fetch user role", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null;
  
  return (
    <Layout user={user} onLogin={setUser} onLogout={() => setUser(null)}>
      <Routes>
        <Route path="/" element={<DashboardPage user={user} />} />
        <Route
          path="/classrooms"
          element={
            <ProtectedRoute user={user}>
              <UploadRoomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute user={user}>
              <UploadCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lessons"
          element={
            <ProtectedRoute user={user}>
              <UploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lecturers"
          element={
            <ProtectedRoute user={user}>
              <LecturersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute user={user}>
              <GeneratePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute user={user}>
              <TimetablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute user={user}>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute user={user}>
              <SettingsPage user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute user={user}>
              <HelpPage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </Layout>
  );
}

export default App;
