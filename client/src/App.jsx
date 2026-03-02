import { useEffect, useState } from "react";
import { ping } from "./services/api";
import UploadPage from "./pages/UploadPage";

function App() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    ping()
      .then(setMsg)
      .catch(() => setMsg("error"));
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Course Scheduling Client</h1>
      <p>Server says: {msg}</p>

      <UploadPage />
    </div>
  );
}

export default App;