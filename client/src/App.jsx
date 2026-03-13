import { useEffect, useState } from "react";
import { ping } from "./services/api";
import UploadPage from "./pages/UploadPage";
import UploadRoomsPage from "./pages/UploadRoomsPage";
import UploadCoursesPage from "./pages/UploadCoursesPage";

import Layout from "./components/ui/Layout";
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";

function App() {
  const [msg, setMsg] = useState("loading...");
  const [page, setPage] = useState("lessons");

  useEffect(() => {
    ping()
      .then(setMsg)
      .catch(() => setMsg("error"));
  }, []);

  return (
    <Layout>
      <Header page={page} onNavigate={setPage} serverMsg={msg} />

      <div style={{ marginTop: 12 }}>
        {page === "lessons" && <UploadPage />}
        {page === "courses" && <UploadCoursesPage />}
        {page === "rooms" && <UploadRoomsPage />}
      </div>

      <Footer />
    </Layout>
  );
}

export default App;