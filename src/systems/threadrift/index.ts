// ============================================================
// Threadrift — Barrel Export
// ============================================================

// Main Component
export { Threadrift, NodeGraph } from "./components/Threadrift";
export { ThreadriftCanvas, GraphCanvas } from "./components/ThreadriftCanvas";
export { ThreadriftNavigation, NodeNavigation } from "./components/ThreadriftNavigation";

// Types
export type {
  GraphNode,
  GraphEdge,
  GraphData,
  GraphJSON,
  Sequence,
  Point,
  CameraState,
} from "./types/graph";

// Store
export { useThreadriftStore, useNodeStore } from "./store/threadrift-store";
export type { ThreadriftStore, NodeStore } from "./store/threadrift-store";

// Engine
export { computeTopology, getActivePath, getNode, getOutgoing, getIncoming, getMainOutgoing } from "./engine/topology";
export { catmullSegment, edgePath } from "./engine/spline";
export { detectBranchIntent, isNearFork, getNearestNodeIndex, applyMagneticSnap, interpolatePosition } from "./engine/physics";
export { getPathLength, getPointAtFraction, getTangentAtFraction, invalidatePathCache, clearPathCache } from "./engine/path-math";
export { LEVEL_COLORS, getLevelColor } from "./engine/constants";
