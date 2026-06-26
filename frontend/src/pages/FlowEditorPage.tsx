import { useEffect, useCallback } from "react";
import { useFlowStore } from "../store/flowStore";
import { useMasterStore } from "../store/masterStore";
import { FlowCanvas } from "../components/flow/FlowCanvas";
import { Toolbar } from "../components/flow/Toolbar";
import { NodeInspector } from "../components/flow/NodeInspector";
import { apiClient } from "../api/client";

export function FlowEditorPage({ hideHeader = false }: { hideHeader?: boolean }) {
  const { transportTypes, loaded, load } = useMasterStore();
  const { nodes, edges, diagramId, diagramName, undo, redo, past, future, cancelConnect } = useFlowStore();

  useEffect(() => {
    if (!loaded) load();
  }, [loaded, load]);

  // キーボードショートカット
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }
    if (e.key === "Escape") {
      cancelConnect();
    }
  }, [undo, redo, cancelConnect]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSave = async () => {
    try {
      const payload = { name: diagramName, nodes, edges };
      if (diagramId) {
        await apiClient.put(`/flow-diagrams/${diagramId}`, payload);
      } else {
        const res = await apiClient.post("/flow-diagrams/", payload);
        useFlowStore.getState().setDiagram(res.data.id, res.data.name, res.data.nodes, res.data.edges);
      }
      alert("保存しました");
    } catch {
      alert("保存に失敗しました");
    }
  };

  if (!loaded) {
    return <div style={{ padding: 32, color: "#e2e8f0" }}>読み込み中...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0f172a", color: "#e2e8f0" }}>
      {/* スタンドアロン時のみタイトルを表示 */}
      {!hideHeader && (
        <div style={{ padding: "8px 16px", background: "#1e293b", borderBottom: "1px solid #334155" }}>
          <span style={{ fontWeight: "bold", fontSize: 16, color: "#e2e8f0" }}>Endfield Fab Planner</span>
        </div>
      )}

      {/* サブヘッダー (保存ボタン等、常に表示) */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "4px 16px", background: "#1e293b", borderBottom: "1px solid #334155"
      }}>
        <span style={{ color: "#64748b", fontSize: 12 }}>フロー図エディタ</span>
        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8 }}>
          ノード: {nodes.length} | エッジ: {edges.length}
        </span>
        <span style={{ fontSize: 11, color: "#475569" }}>
          ↩{past.length} ↪{future.length}
        </span>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "4px 14px", borderRadius: 4,
              border: "1px solid #22c55e", background: "transparent",
              color: "#22c55e", cursor: "pointer", fontSize: 12,
            }}
          >
            💾 保存
          </button>
        </div>
      </div>

      {/* メインエリア */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 左サイドパネル: ツールバー */}
        <div style={{ width: 220, overflowY: "auto", borderRight: "1px solid #334155" }}>
          <Toolbar />
        </div>

        {/* キャンバス */}
        <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
          <FlowCanvas />
        </div>

        {/* 右サイドパネル: インスペクター */}
        <div style={{ width: 200, borderLeft: "1px solid #334155" }}>
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #334155", fontSize: 12, color: "#94a3b8" }}>
            プロパティ
          </div>
          <NodeInspector />
          <div style={{ padding: "8px 12px", borderTop: "1px solid #334155", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>輸送種別</div>
            {transportTypes.map((tt) => (
              <div key={tt.id} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 12, height: 4, background: tt.color, borderRadius: 2 }} />
                <span style={{ fontSize: 11, color: "#94a3b8" }}>{tt.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
