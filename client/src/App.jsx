import { useEffect, useState } from "react";

function App() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    fetch("/api/ping")
      .then((res) => res.text())
      .then((data) => setMsg(data))
      .catch(() => setMsg("error"));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Course Scheduling Client</h1>
      <p>Server says: {msg}</p>
    </div>
  );
}

export default App;