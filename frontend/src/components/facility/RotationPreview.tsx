import type { Port, TransportType } from "../../types";

const CELL = 28;

// 回転適用: 0°は素通し、90°はCW回転
export function rotatePort(port: Port, rotation: number, width: number, height: number): Port {
  let { x, y } = port;
  let facing = port.facing;
  const steps = ((rotation / 90) % 4 + 4) % 4;

  for (let i = 0; i < steps; i++) {
    // CW 90°: (x,y) → (h-1-y, x)  where new w=old h, new h=old w
    const [newW, newH] = [height, width]; // 回転後のサイズ
    [x, y] = [newH - 1 - y, x];
    [width, height] = [newW, newH];
    facing = (
      facing === "up" ? "right" :
      facing === "right" ? "down" :
      facing === "down" ? "left" : "up"
    ) as Port["facing"];
  }
  return { ...port, x, y, facing };
}

const KIND_COLOR: Record<string, string> = {
  "conveyor-input":  "#f59e0b",
  "conveyor-output": "#d97706",
  "pipe-input":      "#3b82f6",
  "pipe-output":     "#1d4ed8",
};

interface PreviewProps {
  width: number;
  height: number;
  ports: Port[];
  rotation: number;
  transportTypes: TransportType[];
}

function SinglePreview({ width, height, ports, rotation, transportTypes }: PreviewProps) {
  const steps = ((rotation / 90) % 4 + 4) % 4;
  let rw = width, rh = height;
  for (let i = 0; i < steps; i++) [rw, rh] = [rh, rw];

  const rotatedPorts = ports.map((p) => rotatePort(p, rotation, width, height));

  const svgW = rw * CELL;
  const svgH = rh * CELL;

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{rotation}°</div>
      <svg width={svgW} height={svgH} style={{ display: "block", margin: "0 auto" }}>
        {/* セルグリッド */}
        {Array.from({ length: rh }, (_, row) =>
          Array.from({ length: rw }, (_, col) => (
            <rect
              key={`${col}-${row}`}
              x={col * CELL} y={row * CELL}
              width={CELL} height={CELL}
              fill="#1e293b" stroke="#334155" strokeWidth={0.5}
            />
          ))
        )}
        {/* ポート */}
        {rotatedPorts.map((p) => {
          const key = `${p.transport_type_id}-${p.direction}`;
          const color = KIND_COLOR[key] ?? "#6b7280";
          const cx = p.x * CELL + CELL / 2;
          const cy = p.y * CELL + CELL / 2;
          const arrowLen = 8;
          const [dx, dy] =
            p.facing === "up" ? [0, -arrowLen] :
            p.facing === "down" ? [0, arrowLen] :
            p.facing === "left" ? [-arrowLen, 0] : [arrowLen, 0];
          return (
            <g key={p.id}>
              <circle cx={cx} cy={cy} r={5} fill={color} />
              <line
                x1={cx} y1={cy} x2={cx + dx} y2={cy + dy}
                stroke={color} strokeWidth={1.5}
                markerEnd={`url(#arr-${p.transport_type_id})`}
              />
            </g>
          );
        })}
        {/* 矢印マーカー */}
        <defs>
          {transportTypes.map((tt) => (
            <marker key={tt.id} id={`arr-${tt.id}`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill={tt.color} />
            </marker>
          ))}
        </defs>
      </svg>
      <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{rw}×{rh}</div>
    </div>
  );
}

interface Props {
  width: number;
  height: number;
  ports: Port[];
  transportTypes: TransportType[];
}

export function RotationPreview({ width, height, ports, transportTypes }: Props) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>回転プレビュー</div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[0, 90, 180, 270].map((r) => (
          <SinglePreview
            key={r}
            width={width} height={height}
            ports={ports} rotation={r}
            transportTypes={transportTypes}
          />
        ))}
      </div>
    </div>
  );
}
