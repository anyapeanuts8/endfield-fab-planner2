import type { FlowEdge, FlowNode, TransportType } from "../../types";
import { NODE_SCALE, BRANCH_MERGE_SIZE } from "./NodeShape";
import type { FacilityMaster } from "../../types";

function nodeCenterPx(
  node: FlowNode,
  facilities: FacilityMaster[]
): { x: number; y: number } {
  if (node.type === "facility") {
    const fac = facilities.find((f) => f.id === node.facility_master_id);
    if (fac) {
      return {
        x: node.display_x + (fac.width * NODE_SCALE) / 2,
        y: node.display_y + (fac.height * NODE_SCALE) / 2,
      };
    }
  }
  return {
    x: node.display_x + BRANCH_MERGE_SIZE / 2,
    y: node.display_y + BRANCH_MERGE_SIZE / 2,
  };
}

interface Props {
  edges: FlowEdge[];
  nodes: FlowNode[];
  facilities: FacilityMaster[];
  transportTypes: TransportType[];
  onDeleteEdge: (id: string) => void;
}

export function EdgeLines({ edges, nodes, facilities, transportTypes, onDeleteEdge }: Props) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const ttMap = Object.fromEntries(transportTypes.map((t) => [t.id, t]));

  return (
    <g>
      {edges.map((edge) => {
        const from = nodeMap[edge.from_node_id];
        const to = nodeMap[edge.to_node_id];
        if (!from || !to) return null;
        const fp = nodeCenterPx(from, facilities);
        const tp = nodeCenterPx(to, facilities);
        const tt = ttMap[edge.transport_type_id];
        const color = tt?.color ?? "#6b7280";
        const mx = (fp.x + tp.x) / 2;
        const my = (fp.y + tp.y) / 2;

        // 矢印マーカーID
        const markerId = `arrow-${edge.id}`;

        return (
          <g key={edge.id}>
            <defs>
              <marker id={markerId} markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill={color} />
              </marker>
            </defs>
            {/* クリック領域用の太い透明線 */}
            <line
              x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
              stroke="transparent" strokeWidth={12}
              style={{ cursor: "pointer" }}
              onClick={() => onDeleteEdge(edge.id)}
            />
            <line
              x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={tt?.line_style === "dashed" ? "6 3" : undefined}
              markerEnd={`url(#${markerId})`}
              style={{ pointerEvents: "none" }}
            />
            {/* 輸送種別ラベル */}
            <text x={mx} y={my - 6} textAnchor="middle" fontSize={9} fill={color}>
              {tt?.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}
