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
import "./styles/global.css";


import Layout from "./components/ui/Layout";
import Footer from "./components/ui/Footer";

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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/classrooms" element={<UploadRoomsPage />} />
        <Route path="/courses" element={<UploadCoursesPage />} />
        <Route path="/lessons" element={<UploadPage />} />
        <Route path="/lecturers" element={<LecturersPage />} />
        <Route path="/generate" element={<GeneratePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage user={user} />} />
        <Route path="/help" element={<HelpPage />} />
      </Routes>

      <Footer />
    </Layout>
  );
}

export default App;