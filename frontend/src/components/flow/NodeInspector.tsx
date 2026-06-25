import { useFlowStore } from "../../store/flowStore";
import { useMasterStore } from "../../store/masterStore";

export function NodeInspector() {
  const { nodes, edges, selectedNodeId, deleteNode, togglePin } = useFlowStore();
  const { facilities, transportTypes } = useMasterStore();

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) {
    return (
      <div style={{ padding: 12, color: "#64748b", fontSize: 12 }}>
        ノードを選択するとプロパティが表示されます
      </div>
    );
  }

  const fac = facilities.find((f) => f.id === node.facility_master_id);
  const tt = transportTypes.find((t) => t.id === node.transport_type_id);
  const connectedEdges = edges.filter(
    (e) => e.from_node_id === node.id || e.to_node_id === node.id
  );

  return (
    <div style={{ padding: 12, fontSize: 12, color: "#e2e8f0" }}>
      <div style={{ fontWeight: "bold", marginBottom: 8, color: "#f59e0b" }}>選択中のノード</div>

      <Row label="種別">
        {node.type === "facility" ? "設備" : node.type === "branch" ? "分岐" : "合流"}
      </Row>
      {fac && <Row label="設備名">{fac.name} ({fac.width}×{fac.height})</Row>}
      {tt && <Row label="輸送種別"><span style={{ color: tt.color }}>{tt.name}</span></Row>}
      <Row label="接続数">{connectedEdges.length} 本</Row>
      <Row label="ピン留め">
        <input type="checkbox" checked={node.pinned} onChange={() => togglePin(node.id)} />
        {node.pinned && (
          <span style={{ marginLeft: 6, color: "#f59e0b" }}>固定</span>
        )}
      </Row>

      <button
        onClick={() => deleteNode(node.id)}
        style={{
          marginTop: 12,
          padding: "5px 10px",
          borderRadius: 4,
          border: "1px solid #ef4444",
          background: "transparent",
          color: "#ef4444",
          cursor: "pointer",
          fontSize: 12,
          width: "100%",
        }}
      >
        🗑 削除
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ color: "#94a3b8" }}>{label}:</span>
      <span>{children}</span>
    </div>
  );
}
