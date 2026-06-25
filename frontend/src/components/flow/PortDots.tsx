import type { FacilityMaster, FlowNode, TransportType } from "../../types";
import { NODE_SCALE, BRANCH_MERGE_SIZE } from "./NodeShape";

interface Props {
  node: FlowNode;
  facility?: FacilityMaster;
  transportTypes: TransportType[];
  mode: "place" | "connect";
  connectingFromNodeId: string | null;
  onPortClick: (nodeId: string, transportTypeId: string, direction: "input" | "output") => void;
}

export function PortDots({ node, facility, transportTypes, mode, connectingFromNodeId, onPortClick }: Props) {
  if (mode !== "connect") return null;

  const ttMap = Object.fromEntries(transportTypes.map((t) => [t.id, t]));

  if (node.type === "facility" && facility) {
    return (
      <g transform={`translate(${node.display_x},${node.display_y})`}>
        {facility.ports.map((port) => {
          const tt = ttMap[port.transport_type_id];
          const cx = port.x * NODE_SCALE + NODE_SCALE / 2;
          const cy = port.y * NODE_SCALE + NODE_SCALE / 2;
          const isConnecting = connectingFromNodeId !== null && connectingFromNodeId !== node.id;
          return (
            <circle
              key={port.id}
              cx={cx} cy={cy} r={7}
              fill={tt?.color ?? "#6b7280"}
              stroke={isConnecting ? "#fff" : "#1e293b"}
              strokeWidth={1.5}
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onPortClick(node.id, port.transport_type_id, port.direction);
              }}
            >
              <title>{tt?.name} {port.direction === "input" ? "入力" : "出力"}</title>
            </circle>
          );
        })}
      </g>
    );
  }

  // branch / merge ノード: 接続モードでクリック可能な単一ポート
  const tt = node.transport_type_id ? ttMap[node.transport_type_id] : undefined;
  const cx = BRANCH_MERGE_SIZE / 2;
  const cy = BRANCH_MERGE_SIZE / 2;
  return (
    <g transform={`translate(${node.display_x},${node.display_y})`}>
      <circle
        cx={cx} cy={cy} r={10}
        fill="transparent"
        stroke={tt?.color ?? "#6b7280"}
        strokeWidth={1.5}
        strokeDasharray="3 2"
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          if (node.transport_type_id) {
            onPortClick(node.id, node.transport_type_id, "input");
          }
        }}
      />
    </g>
  );
}
