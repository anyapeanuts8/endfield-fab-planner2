import { create } from "zustand";
import type { FlowNode, FlowEdge, EditorMode } from "../types";

interface Snapshot {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowStore {
  diagramId: string | null;
  diagramName: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  mode: EditorMode;
  selectedNodeId: string | null;
  connectingFromNodeId: string | null;
  connectingTransportTypeId: string | null;

  // undo/redo
  past: Snapshot[];
  future: Snapshot[];

  // actions
  setMode: (mode: EditorMode) => void;
  setDiagram: (id: string, name: string, nodes: FlowNode[], edges: FlowEdge[]) => void;
  setDiagramName: (name: string) => void;

  addNode: (node: FlowNode) => void;
  moveNode: (id: string, x: number, y: number) => void;
  deleteNode: (id: string) => void;

  startConnect: (nodeId: string, transportTypeId: string) => void;
  finishConnect: (toNodeId: string) => void;
  cancelConnect: () => void;
  addEdge: (edge: FlowEdge) => void;
  deleteEdge: (id: string) => void;

  selectNode: (id: string | null) => void;
  togglePin: (id: string) => void;

  undo: () => void;
  redo: () => void;
}

const snapshot = (state: FlowStore): Snapshot => ({
  nodes: structuredClone(state.nodes),
  edges: structuredClone(state.edges),
});

const MAX_HISTORY = 50;

export const useFlowStore = create<FlowStore>((set, get) => ({
  diagramId: null,
  diagramName: "新しいフロー図",
  nodes: [],
  edges: [],
  mode: "place",
  selectedNodeId: null,
  connectingFromNodeId: null,
  connectingTransportTypeId: null,
  past: [],
  future: [],

  setMode: (mode) => set({ mode, connectingFromNodeId: null, connectingTransportTypeId: null }),

  setDiagram: (id, name, nodes, edges) =>
    set({ diagramId: id, diagramName: name, nodes, edges, past: [], future: [] }),

  setDiagramName: (name) => set({ diagramName: name }),

  addNode: (node) => {
    const s = get();
    set({
      past: [...s.past.slice(-MAX_HISTORY), snapshot(s)],
      future: [],
      nodes: [...s.nodes, node],
    });
  },

  moveNode: (id, x, y) => {
    const s = get();
    set({
      past: [...s.past.slice(-MAX_HISTORY), snapshot(s)],
      future: [],
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, display_x: x, display_y: y } : n)),
    });
  },

  deleteNode: (id) => {
    const s = get();
    set({
      past: [...s.past.slice(-MAX_HISTORY), snapshot(s)],
      future: [],
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.from_node_id !== id && e.to_node_id !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    });
  },

  startConnect: (nodeId, transportTypeId) =>
    set({ connectingFromNodeId: nodeId, connectingTransportTypeId: transportTypeId }),

  finishConnect: (toNodeId) => {
    const s = get();
    if (!s.connectingFromNodeId || !s.connectingTransportTypeId) return;
    if (s.connectingFromNodeId === toNodeId) {
      set({ connectingFromNodeId: null, connectingTransportTypeId: null });
      return;
    }
    const edge: FlowEdge = {
      id: crypto.randomUUID(),
      transport_type_id: s.connectingTransportTypeId,
      from_node_id: s.connectingFromNodeId,
      to_node_id: toNodeId,
    };
    set({
      past: [...s.past.slice(-MAX_HISTORY), snapshot(s)],
      future: [],
      edges: [...s.edges, edge],
      connectingFromNodeId: null,
      connectingTransportTypeId: null,
    });
  },

  cancelConnect: () =>
    set({ connectingFromNodeId: null, connectingTransportTypeId: null }),

  addEdge: (edge) => {
    const s = get();
    set({
      past: [...s.past.slice(-MAX_HISTORY), snapshot(s)],
      future: [],
      edges: [...s.edges, edge],
    });
  },

  deleteEdge: (id) => {
    const s = get();
    set({
      past: [...s.past.slice(-MAX_HISTORY), snapshot(s)],
      future: [],
      edges: s.edges.filter((e) => e.id !== id),
    });
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  togglePin: (id) => {
    const s = get();
    set({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ nodes: structuredClone(nodes), edges: structuredClone(edges) }, ...future],
      nodes: prev.nodes,
      edges: prev.edges,
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, { nodes: structuredClone(nodes), edges: structuredClone(edges) }],
      future: future.slice(1),
      nodes: next.nodes,
      edges: next.edges,
    });
  },
}));
