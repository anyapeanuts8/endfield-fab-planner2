export type PortDirection = "input" | "output";
export type Facing = "up" | "down" | "left" | "right";

export interface Port {
  id: string;
  transport_type_id: string;
  direction: PortDirection;
  x: number; // 設備グリッド上の座標（回転0°基準）
  y: number;
  facing: Facing;
}

export interface FacilityMaster {
  id: string;
  name: string;
  width: number;
  height: number;
  ports: Port[];
}

export interface TransportType {
  id: string;
  name: string;
  layer_id: string;
  occupies_layers: string[];
  can_coexist_with: string[];
  display_order: number;
  color: string;
  line_style: string;
}

export type NodeType = "facility" | "branch" | "merge";

export interface FlowNode {
  id: string;
  type: NodeType;
  facility_master_id?: string;
  transport_type_id?: string;
  display_x: number;
  display_y: number;
  pinned: boolean;
  pinned_grid_x?: number;
  pinned_grid_y?: number;
  pinned_rotation?: number;
}

export interface FlowEdge {
  id: string;
  transport_type_id: string;
  from_node_id: string;
  to_node_id: string;
}

export interface FlowDiagram {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export type EditorMode = "place" | "connect";
