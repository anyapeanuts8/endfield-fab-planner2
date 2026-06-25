import { useFlowStore } from "../../store/flowStore";
import { useMasterStore } from "../../store/masterStore";
import type { FlowNode } from "../../types";

export function Toolbar() {
  const { mode, setMode, addNode, nodes, edges, diagramId, diagramName, setDiagramName, undo, redo, past, future } =
    useFlowStore();
  const { facilities, transportTypes } = useMasterStore();

  const handleAddFacility = (facilityId: string) => {
    const node: FlowNode = {
      id: crypto.randomUUID(),
      type: "facility",
      facility_master_id: facilityId,
      display_x: 80 + Math.random() * 400,
      display_y: 80 + Math.random() * 200,
      pinned: false,
    };
    addNode(node);
  };

  const handleAddBranchMerge = (type: "branch" | "merge", transportTypeId: string) => {
    const node: FlowNode = {
      id: crypto.randomUUID(),
      type,
      transport_type_id: transportTypeId,
      display_x: 80 + Math.random() * 400,
      display_y: 80 + Math.random() * 200,
      pinned: false,
    };
    addNode(node);
  };

  const handleExport = () => {
    const data = { id: diagramId, name: diagramName, nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagramName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          useFlowStore.getState().setDiagram(
            data.id ?? crypto.randomUUID(),
            data.name ?? "インポート",
            data.nodes ?? [],
            data.edges ?? []
          );
        } catch {
          alert("JSONの読み込みに失敗しました");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, background: "#1e293b", borderRadius: 8, minWidth: 200 }}>
      {/* 図の名前 */}
      <input
        value={diagramName}
        onChange={(e) => setDiagramName(e.target.value)}
        style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #475569", background: "#0f172a", color: "#e2e8f0", fontSize: 13 }}
      />

      {/* モード切替 */}
      <div style={{ display: "flex", gap: 4 }}>
        <ModeBtn active={mode === "place"} onClick={() => setMode("place")}>📦 配置</ModeBtn>
        <ModeBtn active={mode === "connect"} onClick={() => setMode("connect")}>🔗 接続</ModeBtn>
      </div>

      <hr style={{ borderColor: "#334155", margin: "4px 0" }} />

      {/* 設備追加 */}
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>設備を追加</div>
      {facilities.map((f) => (
        <Btn key={f.id} onClick={() => handleAddFacility(f.id)}>
          + {f.name} ({f.width}×{f.height})
        </Btn>
      ))}

      <hr style={{ borderColor: "#334155", margin: "4px 0" }} />

      {/* 分岐・合流ノード追加 */}
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>分岐・合流ノード</div>
      {transportTypes.map((tt) => (
        <div key={tt.id} style={{ display: "flex", gap: 4 }}>
          <Btn onClick={() => handleAddBranchMerge("branch", tt.id)} style={{ flex: 1, borderColor: tt.color, color: tt.color }}>
            分岐 ({tt.name})
          </Btn>
          <Btn onClick={() => handleAddBranchMerge("merge", tt.id)} style={{ flex: 1, borderColor: tt.color, color: tt.color }}>
            合流 ({tt.name})
          </Btn>
        </div>
      ))}

      <hr style={{ borderColor: "#334155", margin: "4px 0" }} />

      {/* Undo/Redo */}
      <div style={{ display: "flex", gap: 4 }}>
        <Btn onClick={undo} disabled={past.length === 0} style={{ flex: 1 }}>↩ 元に戻す</Btn>
        <Btn onClick={redo} disabled={future.length === 0} style={{ flex: 1 }}>↪ やり直す</Btn>
      </div>

      <hr style={{ borderColor: "#334155", margin: "4px 0" }} />

      {/* エクスポート/インポート */}
      <Btn onClick={handleExport}>⬇ エクスポート</Btn>
      <Btn onClick={handleImport}>⬆ インポート</Btn>

      {/* 操作ヒント */}
      <div style={{ fontSize: 10, color: "#64748b", marginTop: 8, lineHeight: 1.6 }}>
        <div>配置モード: ドラッグで移動</div>
        <div>配置モード: Deleteで削除</div>
        <div>接続モード: 出力ポート→入力ポート</div>
        <div>エッジをクリックで削除</div>
      </div>
    </div>
  );
}

function ModeBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "6px 8px",
        borderRadius: 4,
        border: `1px solid ${active ? "#f59e0b" : "#475569"}`,
        background: active ? "#78350f" : "transparent",
        color: active ? "#fbbf24" : "#94a3b8",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: active ? "bold" : "normal",
      }}
    >
      {children}
    </button>
  );
}

function Btn({
  onClick, children, disabled = false, style = {}
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "5px 8px",
        borderRadius: 4,
        border: "1px solid #475569",
        background: "transparent",
        color: disabled ? "#475569" : "#cbd5e1",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12,
        textAlign: "left",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
