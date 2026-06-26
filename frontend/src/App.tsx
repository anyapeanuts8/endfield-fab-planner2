import { useState } from "react";
import { FlowEditorPage } from "./pages/FlowEditorPage";
import { FacilityMasterPage } from "./pages/FacilityMasterPage";

type Page = "flow" | "facility";

export function App() {
  const [page, setPage] = useState<Page>("flow");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0f172a" }}>
      <nav style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "0 16px", height: 40,
        background: "#0f172a", borderBottom: "1px solid #334155",
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: "bold", fontSize: 14, color: "#e2e8f0", marginRight: 16 }}>
          Endfield Fab Planner
        </span>
        <NavBtn active={page === "flow"} onClick={() => setPage("flow")}>
          🔗 フロー図エディタ
        </NavBtn>
        <NavBtn active={page === "facility"} onClick={() => setPage("facility")}>
          🏭 設備マスタ
        </NavBtn>
      </nav>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {page === "flow" && <FlowEditorPage hideHeader />}
        {page === "facility" && <FacilityMasterPage />}
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 14px", borderRadius: 4, fontSize: 12,
        border: `1px solid ${active ? "#f59e0b" : "transparent"}`,
        background: active ? "#78350f33" : "transparent",
        color: active ? "#fbbf24" : "#94a3b8",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default App;
