import { useEffect, useState } from "react";
import { ping } from "./services/api";

import UploadPage from "./pages/UploadPage";
import UploadRoomsPage from "./pages/UploadRoomsPage";
import UploadCoursesPage from "./pages/UploadCoursesPage";

import Layout from "./components/ui/Layout";
import Footer from "./components/ui/Footer";

function App() {
  const [msg, setMsg] = useState("loading...");
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    ping()
      .then(setMsg)
      .catch(() => setMsg("error"));
  }, []);

  const renderPage = () => {
    switch (page) {
      case "lessons":
        return <UploadPage />;
      case "courses":
        return <UploadCoursesPage />;
      case "rooms":
        return <UploadRoomsPage />;

      case "dashboard":
        return <h2>Dashboard</h2>;

      case "generate":
        return <h2>Generate AI</h2>;

      case "timetable":
        return <h2>Timetable</h2>;

      case "history":
        return <h2>History</h2>;

      case "settings":
        return <h2>Settings</h2>;

      default:
        return <h2>Page not found</h2>;
    }
  };

  return (
    <Layout page={page} onNavigate={setPage}>
      {renderPage()}
      <Footer />
    </Layout>
  );
}

export default App;