import { useEffect, useState } from "react";
import { apiClient } from "./api/client";

function App() {
  const [health, setHealth] = useState<string>("確認中...");

  useEffect(() => {
    apiClient
      .get("/health")
      .then(() => setHealth("✅ バックエンド接続OK"))
      .catch(() => setHealth("❌ バックエンド未接続"));
  }, []);

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Endfield Fab Planner</h1>
      <p>{health}</p>
    </div>
  );
}

export default App;
