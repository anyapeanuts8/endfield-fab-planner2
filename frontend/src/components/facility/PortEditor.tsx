import { useState } from "react";
import type { Port, TransportType } from "../../types";

const CELL = 48;
const OUTER = 16; // 外周クリック領域の幅

type PortKind = "conveyor-input" | "conveyor-output" | "pipe-input" | "pipe-output";

interface Props {
  width: number;
  height: number;
  ports: Port[];
  transportTypes: TransportType[];
  onChange: (ports: Port[]) => void;
}

// 外周マスの (x, y) と facing を列挙
function perimeterCells(w: number, h: number): Array<{ x: number; y: number; facing: "up" | "down" | "left" | "right" }> {
  const cells: Array<{ x: number; y: number; facing: "up" | "down" | "left" | "right" }> = [];
  for (let x = 0; x < w; x++) cells.push({ x, y: 0, facing: "up" });
  for (let x = 0; x < w; x++) cells.push({ x, y: h - 1, facing: "down" });
  for (let y = 0; y < h; y++) cells.push({ x: 0, y, facing: "left" });
  for (let y = 0; y < h; y++) cells.push({ x: w - 1, y, facing: "right" });
  // 重複除去（コーナーは上下優先）
  const seen = new Set<string>();
  return cells.filter(({ x, y }) => {
    const k = `${x},${y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ポートの表示色と記号
const KIND_INFO: Record<PortKind, { label: string; color: string }> = {
  "conveyor-input":  { label: "C↓", color: "#f59e0b" },
  "conveyor-output": { label: "C↑", color: "#d97706" },
  "pipe-input":      { label: "P↓", color: "#3b82f6" },
  "pipe-output":     { label: "P↑", color: "#1d4ed8" },
};

function portKind(p: Port): PortKind {
  return `${p.transport_type_id}-${p.direction}` as PortKind;
}

export function PortEditor({ width, height, ports, transportTypes, onChange }: Props) {
  const [selectedKind, setSelectedKind] = useState<PortKind>("conveyor-input");

  const ttIds = transportTypes.map((t) => t.id);

  // クリックされた外周マスにポートをトグル
  const handleCellClick = (x: number, y: number, facing: "up" | "down" | "left" | "right") => {
    const [transport_type_id, direction] = selectedKind.split("-") as [string, "input" | "output"];
    const existing = ports.find(
      (p) => p.x === x && p.y === y && p.transport_type_id === transport_type_id && p.direction === direction
    );
    if (existing) {
      onChange(ports.filter((p) => p.id !== existing.id));
    } else {
      const newPort: Port = {
        id: crypto.randomUUID(),
        transport_type_id,
        direction,
        x, y, facing,
      };
      onChange([...ports, newPort]);
    }
  };

  const perimeter = perimeterCells(width, height);
  const svgW = width * CELL + OUTER * 2;
  const svgH = height * CELL + OUTER * 2;

  return (
    <div>
      {/* ポート種別セレクター */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {(Object.entries(KIND_INFO) as [PortKind, { label: string; color: string }][])
          .filter(([kind]) => {
            const ttId = kind.split("-")[0];
            return ttIds.includes(ttId);
          })
          .map(([kind, info]) => (
            <button
              key={kind}
              onClick={() => setSelectedKind(kind)}
              style={{
                padding: "4px 10px", borderRadius: 4, fontSize: 12,
                border: `1.5px solid ${selectedKind === kind ? info.color : "#475569"}`,
                background: selectedKind === kind ? `${info.color}22` : "transparent",
                color: selectedKind === kind ? info.color : "#94a3b8",
                cursor: "pointer",
              }}
            >
              {info.label} {kind.includes("conveyor") ? "コンベア" : "パイプ"}{kind.includes("input") ? "入力" : "出力"}
            </button>
          ))}
      </div>

      {/* 設備グリッド + 外周クリック領域 */}
      <svg width={svgW} height={svgH} style={{ display: "block" }}>
        {/* 設備本体 */}
        {Array.from({ length: height }, (_, row) =>
          Array.from({ length: width }, (_, col) => (
            <rect
              key={`${col}-${row}`}
              x={OUTER + col * CELL} y={OUTER + row * CELL}
              width={CELL} height={CELL}
              fill="#1e293b" stroke="#334155" strokeWidth={1}
            />
          ))
        )}

        {/* 外周クリック領域 */}
        {perimeter.map(({ x, y, facing }) => {
          // ポート有無を確認
          const portsHere = ports.filter((p) => p.x === x && p.y === y);
          const cx = OUTER + x * CELL + CELL / 2;
          const cy = OUTER + y * CELL + CELL / 2;

          // 外側にクリックバッジを出す位置
          const offset = CELL * 0.5 + OUTER * 0.6;
          const bx = cx + (facing === "right" ? offset : facing === "left" ? -offset : 0);
          const by = cy + (facing === "down" ? offset : facing === "up" ? -offset : 0);

          return (
            <g key={`${x}-${y}`} onClick={() => handleCellClick(x, y, facing)} style={{ cursor: "pointer" }}>
              {/* クリック領域（透明） */}
              <rect
                x={OUTER + x * CELL - 2} y={OUTER + y * CELL - 2}
                width={CELL + 4} height={CELL + 4}
                fill="transparent"
              />
              {/* ポートバッジ */}
              {portsHere.map((p, i) => {
                const kind = portKind(p);
                const info = KIND_INFO[kind];
                return (
                  <g key={p.id} transform={`translate(${bx + i * 14 - (portsHere.length - 1) * 7}, ${by})`}>
                    <circle r={9} fill={info.color} stroke="#0f172a" strokeWidth={1} />
                    <text textAnchor="middle" dy="4" fontSize={8} fill="#fff" style={{ pointerEvents: "none" }}>
                      {info.label}
                    </text>
                  </g>
                );
              })}
              {/* ホバー用ハイライト */}
              <rect
                x={OUTER + x * CELL} y={OUTER + y * CELL}
                width={CELL} height={CELL}
                fill="transparent"
                stroke={portsHere.length > 0 ? "#f59e0b44" : "transparent"}
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* 設備ラベル */}
        <text
          x={svgW / 2} y={svgH / 2 + 5}
          textAnchor="middle" fontSize={13} fill="#475569"
          style={{ pointerEvents: "none" }}
        >
          {width}×{height}
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>
        外周セルをクリックしてポートを追加・削除
      </div>

      {/* ポートリスト */}
      {ports.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>設定済みポート ({ports.length})</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {ports.map((p) => {
              const kind = portKind(p);
              const info = KIND_INFO[kind];
              return (
                <span
                  key={p.id}
                  style={{
                    fontSize: 11, padding: "2px 6px", borderRadius: 3,
                    border: `1px solid ${info.color}`, color: info.color,
                    cursor: "pointer",
                  }}
                  onClick={() => onChange(ports.filter((q) => q.id !== p.id))}
                  title="クリックで削除"
                >
                  {info.label} ({p.x},{p.y}) ×
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
