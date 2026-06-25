import type { FlowNode, FacilityMaster, TransportType } from "../../types";

const NODE_SCALE = 40; // 1グリッドマス = 40px（表示用）
const BRANCH_MERGE_SIZE = 40;

interface Props {
  node: FlowNode;
  facility?: FacilityMaster;
  transportType?: TransportType;
  selected: boolean;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export function NodeShape({ node, facility, transportType, selected, onClick, onDragStart }: Props) {
  const color = transportType?.color ?? "#6b7280";

  if (node.type === "facility" && facility) {
    const w = facility.width * NODE_SCALE;
    const h = facility.height * NODE_SCALE;
    return (
      <g
        transform={`translate(${node.display_x},${node.display_y})`}
        style={{ cursor: "grab" }}
        onClick={onClick}
        onMouseDown={onDragStart}
      >
        <rect
          x={0} y={0} width={w} height={h}
          fill="#1e293b"
          stroke={selected ? "#f59e0b" : "#475569"}
          strokeWidth={selected ? 2 : 1}
          rx={4}
        />
        {node.pinned && (
          <text x={w - 10} y={14} fontSize={12} fill="#f59e0b">📌</text>
        )}
        <text
          x={w / 2} y={h / 2 + 5}
          textAnchor="middle"
          fontSize={12}
          fill="#e2e8f0"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {facility.name}
        </text>
        <text
          x={w / 2} y={h / 2 + 20}
          textAnchor="middle"
          fontSize={10}
          fill="#94a3b8"
          style={{ pointerEvents: "none", userSelect: "none" }}
        >
          {facility.width}×{facility.height}
        </text>
      </g>
    );
  }

  // branch / merge ノード
  const label = node.type === "branch" ? "分" : "合";
  const typeLabel = transportType?.name.slice(0, 2) ?? "";
  return (
    <g
      transform={`translate(${node.display_x},${node.display_y})`}
      style={{ cursor: "grab" }}
      onClick={onClick}
      onMouseDown={onDragStart}
    >
      <rect
        x={0} y={0}
        width={BRANCH_MERGE_SIZE} height={BRANCH_MERGE_SIZE}
        fill="#1e293b"
        stroke={selected ? "#f59e0b" : color}
        strokeWidth={selected ? 2 : 1.5}
        rx={4}
      />
      <text
        x={BRANCH_MERGE_SIZE / 2} y={BRANCH_MERGE_SIZE / 2 - 2}
        textAnchor="middle" fontSize={14} fontWeight="bold" fill={color}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {label}
      </text>
      <text
        x={BRANCH_MERGE_SIZE / 2} y={BRANCH_MERGE_SIZE / 2 + 13}
        textAnchor="middle" fontSize={9} fill="#94a3b8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {typeLabel}
      </text>
    </g>
  );
}

export { NODE_SCALE, BRANCH_MERGE_SIZE };
