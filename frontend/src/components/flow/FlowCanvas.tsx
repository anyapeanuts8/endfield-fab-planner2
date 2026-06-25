import { useRef, useCallback } from "react";
import { useFlowStore } from "../../store/flowStore";
import { useMasterStore } from "../../store/masterStore";
import { NodeShape, NODE_SCALE } from "./NodeShape";
import { PortDots } from "./PortDots";
import { EdgeLines } from "./EdgeLines";
const CANVAS_W = 1200;
const CANVAS_H = 800;

export function FlowCanvas() {
  const {
    nodes, edges, mode, selectedNodeId, connectingFromNodeId, connectingTransportTypeId,
    moveNode, deleteNode, deleteEdge, selectNode,
    startConnect, finishConnect, cancelConnect,
  } = useFlowStore();
  const { facilities, transportTypes } = useMasterStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const facilityMap = Object.fromEntries(facilities.map((f) => [f.id, f]));
  const ttMap = Object.fromEntries(transportTypes.map((t) => [t.id, t]));

  // ドラッグ開始
  const handleDragStart = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (mode !== "place") return;
    e.stopPropagation();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    const rect = svgRef.current!.getBoundingClientRect();
    dragging.current = {
      id: nodeId,
      offsetX: e.clientX - rect.left - node.display_x,
      offsetY: e.clientY - rect.top - node.display_y,
    };
  }, [mode, nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const rect = svgRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.current.offsetX;
    const y = e.clientY - rect.top - dragging.current.offsetY;
    moveNode(dragging.current.id, x, y);
  }, [moveNode]);

  const handleMouseUp = useCallback(() => {
    dragging.current = null;
  }, []);

  // キャンバスクリック（接続キャンセル or 選択解除）
  const handleCanvasClick = useCallback(() => {
    if (connectingFromNodeId) {
      cancelConnect();
    } else {
      selectNode(null);
    }
  }, [connectingFromNodeId, cancelConnect, selectNode]);

  // ポートクリック
  const handlePortClick = useCallback((nodeId: string, transportTypeId: string, direction: "input" | "output") => {
    if (!connectingFromNodeId) {
      // 出力ポートから接続開始
      if (direction === "output") {
        startConnect(nodeId, transportTypeId);
      }
    } else {
      // 入力ポートで接続完了（同種別チェック）
      if (direction === "input" && connectingTransportTypeId === transportTypeId) {
        finishConnect(nodeId);
      } else {
        cancelConnect();
      }
    }
  }, [connectingFromNodeId, connectingTransportTypeId, startConnect, finishConnect, cancelConnect]);

  // Delete キーでノード削除
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
      deleteNode(selectedNodeId);
    }
  }, [selectedNodeId, deleteNode]);

  return (
    <svg
      ref={svgRef}
      width={CANVAS_W}
      height={CANVAS_H}
      style={{
        background: "#0f172a",
        border: "1px solid #334155",
        borderRadius: 8,
        outline: "none",
        cursor: mode === "connect" ? "crosshair" : "default",
      }}
      tabIndex={0}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleCanvasClick}
      onKeyDown={handleKeyDown}
    >
      {/* グリッド背景 */}
      <defs>
        <pattern id="grid" width={NODE_SCALE} height={NODE_SCALE} patternUnits="userSpaceOnUse">
          <path d={`M ${NODE_SCALE} 0 L 0 0 0 ${NODE_SCALE}`} fill="none" stroke="#1e293b" strokeWidth={0.5} />
        </pattern>
      </defs>
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid)" />

      {/* エッジ */}
      <EdgeLines
        edges={edges}
        nodes={nodes}
        facilities={facilities}
        transportTypes={transportTypes}
        onDeleteEdge={deleteEdge}
      />

      {/* ノード */}
      {nodes.map((node) => {
        const fac = node.facility_master_id ? facilityMap[node.facility_master_id] : undefined;
        const tt = node.transport_type_id ? ttMap[node.transport_type_id] : undefined;
        return (
          <g key={node.id}>
            <NodeShape
              node={node}
              facility={fac}
              transportType={tt}
              selected={selectedNodeId === node.id}
              onClick={() => {
                if (mode === "place") selectNode(node.id);
              }}
              onDragStart={(e) => handleDragStart(e, node.id)}
            />
            <PortDots
              node={node}
              facility={fac}
              transportTypes={transportTypes}
              mode={mode}
              connectingFromNodeId={connectingFromNodeId}
              onPortClick={handlePortClick}
            />
          </g>
        );
      })}

      {/* 接続中インジケーター */}
      {connectingFromNodeId && (
        <text x={10} y={CANVAS_H - 10} fontSize={12} fill="#f59e0b">
          接続中: {ttMap[connectingTransportTypeId ?? ""]?.name ?? ""} — 接続先の入力ポートをクリック（ESC でキャンセル）
        </text>
      )}
    </svg>
  );
}
