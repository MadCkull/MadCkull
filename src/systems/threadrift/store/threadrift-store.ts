// ============================================================
// Threadrift — Zustand Store
// ============================================================

import { create } from "zustand";
import type { GraphData, GraphEdge, GraphJSON, GraphNode, Sequence } from "../types/graph";
import {
  computeTopology,
  getActivePath,
  getMainOutgoing,
  getNode,
} from "../engine/topology";
import { clearPathCache } from "../engine/path-math";
import { MAX_BRANCH_DEPTH } from "../engine/constants";

// ── Store Interface ─────────────────────────────────────────

export interface ThreadriftStore {
  // Graph data
  graph: GraphData;
  nextNodeId: number;
  sequences: Sequence[];

  // Camera state
  scrollTarget: number;
  scrollCurrent: number;
  activePath: GraphNode[];
  branchChoices: Record<number, string>;
  isScrolling: boolean;

  // UI state
  selectedNode: number | null;
  selectedEdge: string | null;
  editorOpen: boolean;
  mergeModeSource: number | null;

  // Discovery state
  visitedNodes: Set<number>;

  // Actions — Graph
  loadGraph: (data: GraphJSON) => void;
  recompute: () => void;
  addNode: (parentId: number, mode: "main" | "branch") => GraphNode | null;
  removeNode: (id: number) => void;
  updateNode: (id: number, patch: Partial<GraphNode>) => void;
  updateEdge: (id: string, patch: Partial<GraphEdge>) => void;
  removeEdge: (id: string) => void;
  mergeNode: (fromId: number, toId: number) => void;

  // Actions — Navigation
  setScrollTarget: (val: number) => void;
  setScrollCurrent: (val: number) => void;
  setIsScrolling: (val: boolean) => void;
  setBranchChoice: (nodeId: number, edgeId: string | null) => void;
  refreshActivePath: () => void;

  // Actions — UI
  selectNode: (id: number | null) => void;
  selectEdge: (id: string | null) => void;
  toggleEditor: () => void;
  setMergeMode: (sourceId: number | null) => void;

  // Actions — Discovery
  markVisited: (nodeId: number) => void;

  // Serialization
  toJSON: () => GraphJSON;
}

// ── Store Implementation ────────────────────────────────────

export const useThreadriftStore = create<ThreadriftStore>((set, get) => ({
  // Initial state
  graph: { nodes: {}, edges: [], root: 0 },
  nextNodeId: 0,
  sequences: [],
  scrollTarget: -1,
  scrollCurrent: -1,
  activePath: [],
  branchChoices: {},
  isScrolling: false,
  selectedNode: null,
  selectedEdge: null,
  editorOpen: false,
  mergeModeSource: null,
  visitedNodes: new Set<number>(),

  // ── Graph Actions ───────────────────────────────────────

  loadGraph: (data) => {
    const graph: GraphData = {
      nodes: data.nodes,
      edges: data.edges,
      root: data.root,
    };

    // Restore visited nodes from localStorage
    let visited = new Set<number>();
    try {
      const stored = localStorage.getItem("threadrift-visited");
      if (stored) visited = new Set(JSON.parse(stored));
    } catch { /* ignore */ }

    set({ graph, nextNodeId: data.nextNodeId, selectedNode: data.root, visitedNodes: visited });
    get().recompute();
  },

  recompute: () => {
    const { graph, branchChoices } = get();
    clearPathCache();
    const { sequences } = computeTopology(graph);
    const activePath = getActivePath(graph, branchChoices);
    set({ sequences, activePath });
  },

  addNode: (parentId, mode) => {
    const { graph, nextNodeId } = get();
    const parent = getNode(graph, parentId);
    if (!parent) return null;

    if (mode === "branch" && (parent.level ?? 1) >= MAX_BRANCH_DEPTH) return null;

    // Calculate position based on parent tangent
    let dx = 140, dy = 130;
    if (parent.vx !== undefined && parent.vy !== undefined) {
      const ux = parent.vx, uy = parent.vy;
      const px = -uy, py = ux;
      if (mode === "main") {
        dx = ux * 180; dy = uy * 180;
      } else {
        const side = (nextNodeId % 2 === 0) ? -1 : 1;
        dx = ux * 130 + px * 130 * side;
        dy = uy * 130 + py * 130 * side;
      }
    }

    const newNode: GraphNode = {
      id: nextNodeId,
      name: `Node ${nextNodeId}`,
      content: "",
      x: Math.max(20, Math.min(980, parent.x + dx)),
      y: Math.max(20, Math.min(980, parent.y + dy)),
    };

    const type = mode === "main" ? "main" as const : "branch" as const;
    if (type === "main" && getMainOutgoing(graph, parentId)) return null;

    const newEdge: GraphEdge = {
      id: "e" + crypto.randomUUID(),
      from: parentId,
      to: newNode.id,
      type,
      curve: 0,
      diverge: 0,
    };

    set((state) => ({
      graph: {
        ...state.graph,
        nodes: { ...state.graph.nodes, [newNode.id]: newNode },
        edges: [...state.graph.edges, newEdge],
      },
      nextNodeId: nextNodeId + 1,
      selectedNode: newNode.id,
      selectedEdge: null,
    }));

    get().recompute();
    return newNode;
  },

  removeNode: (id) => {
    const { graph } = get();
    if (id === graph.root) return;

    const newNodes = { ...graph.nodes };
    delete newNodes[id];

    set((state) => ({
      graph: {
        ...state.graph,
        nodes: newNodes,
        edges: state.graph.edges.filter((e) => e.from !== id && e.to !== id),
      },
      selectedNode: graph.root,
      selectedEdge: null,
    }));

    get().recompute();
  },

  updateNode: (id, patch) => {
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: {
          ...state.graph.nodes,
          [id]: { ...state.graph.nodes[id], ...patch },
        },
      },
    }));
    get().recompute();
  },

  updateEdge: (id, patch) => {
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    }));
    get().recompute();
  },

  removeEdge: (id) => {
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.filter((e) => e.id !== id),
      },
      selectedEdge: null,
    }));
    get().recompute();
  },

  mergeNode: (fromId, toId) => {
    const { graph } = get();
    if (graph.edges.some((e) => e.from === fromId && e.to === toId)) return;

    const newEdge: GraphEdge = {
      id: "e" + crypto.randomUUID(),
      from: fromId,
      to: toId,
      type: "branch",
      curve: 0,
      diverge: 0,
    };

    set((state) => ({
      graph: {
        ...state.graph,
        edges: [...state.graph.edges, newEdge],
      },
      selectedEdge: newEdge.id,
      selectedNode: null,
    }));

    get().recompute();
  },

  // ── Navigation Actions ──────────────────────────────────

  setScrollTarget: (val) => set({ scrollTarget: val }),
  setScrollCurrent: (val) => set({ scrollCurrent: val }),
  setIsScrolling: (val) => set({ isScrolling: val }),

  setBranchChoice: (nodeId, edgeId) => {
    set((state) => {
      const choices = { ...state.branchChoices };
      if (edgeId) {
        choices[nodeId] = edgeId;
      } else {
        delete choices[nodeId];
      }
      return { branchChoices: choices };
    });
    get().refreshActivePath();
  },

  refreshActivePath: () => {
    const { graph, branchChoices } = get();
    const activePath = getActivePath(graph, branchChoices);
    set({ activePath });
  },

  // ── UI Actions ──────────────────────────────────────────

  selectNode: (id) => set({ selectedNode: id, selectedEdge: null }),
  selectEdge: (id) => set({ selectedEdge: id, selectedNode: null }),
  toggleEditor: () => set((s) => ({ editorOpen: !s.editorOpen })),
  setMergeMode: (sourceId) => set({ mergeModeSource: sourceId }),

  // ── Discovery ───────────────────────────────────────────

  markVisited: (nodeId) => {
    set((state) => {
      const visited = new Set(state.visitedNodes);
      visited.add(nodeId);
      // Persist to localStorage
      try {
        localStorage.setItem("threadrift-visited", JSON.stringify([...visited]));
      } catch { /* ignore */ }
      return { visitedNodes: visited };
    });
  },

  // ── Serialization ───────────────────────────────────────

  toJSON: () => {
    const { graph, nextNodeId } = get();
    return {
      version: "1.0",
      nextNodeId,
      root: graph.root,
      nodes: graph.nodes,
      edges: graph.edges,
    };
  },
}));

// Compatibility alias
export const useNodeStore = useThreadriftStore;
export type NodeStore = ThreadriftStore;
