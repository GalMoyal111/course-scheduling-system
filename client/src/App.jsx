import { useEffect } from "react";
import { ping } from "./services/api";
import { useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";

import UploadPage from "./pages/UploadPage";
import UploadRoomsPage from "./pages/UploadRoomsPage";
import UploadCoursesPage from "./pages/UploadCoursesPage";

import Layout from "./components/ui/Layout";
import Footer from "./components/ui/Footer";

function App() {
  const location = useLocation();

  useEffect(() => {
    let pageName = "Dashboard";

    if (location.pathname === "/courses") pageName = "Courses";
    else if (location.pathname === "/classrooms") pageName = "Classrooms";
    else if (location.pathname === "/lessons") pageName = "Lessons";
    else if (location.pathname === "/generate") pageName = "Generate";
    else if (location.pathname === "/timetable") pageName = "Timetable";
    else if (location.pathname === "/history") pageName = "History";
    else if (location.pathname === "/settings") pageName = "Settings";

    document.title = `UniSched – ${pageName}`;
  }, [location]);


  useEffect(() => {
    ping().catch(() => {});
  }, []);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<h2>Dashboard</h2>} />
        <Route path="/classrooms" element={<UploadRoomsPage />} />
        <Route path="/courses" element={<UploadCoursesPage />} />
        <Route path="/lessons" element={<UploadPage />} />

        <Route path="/generate" element={<h2>Generate AI</h2>} />
        <Route path="/timetable" element={<h2>Timetable</h2>} />
        <Route path="/history" element={<h2>History</h2>} />
        <Route path="/settings" element={<h2>Settings</h2>} />
      </Routes>

      <Footer />
    </Layout>
  );
}

export default App;