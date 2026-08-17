import { memo, useRef, useEffect } from "react";
import gsap from "gsap";
import { useThreadriftStore } from "../store/threadrift-store";
import { GraphNodeComponent } from "./GraphNode";
import { GraphEdgeComponent } from "./GraphEdge";
import { GraphLabels } from "./GraphLabels";
import { CANVAS_SIZE, CAMERA_SCALE } from "../engine/constants";
import { getPathLength } from "../engine/path-math";
import { getNode } from "../engine/topology";
import { interpolatePosition } from "../engine/physics";

export const ThreadriftCanvas = memo(function ThreadriftCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const cameraGroupRef = useRef<SVGGElement>(null);

  // Zustand state subscriptions
  const graph = useThreadriftStore((s) => s.graph);
  const sequences = useThreadriftStore((s) => s.sequences);
  const activePath = useThreadriftStore((s) => s.activePath);
  const scrollCurrent = useThreadriftStore((s) => s.scrollCurrent);
  const visitedNodes = useThreadriftStore((s) => s.visitedNodes);
  const selectNode = useThreadriftStore((s) => s.selectNode);
  const selectEdge = useThreadriftStore((s) => s.selectEdge);
  const mergeModeSource = useThreadriftStore((s) => s.mergeModeSource);
  const setMergeMode = useThreadriftStore((s) => s.setMergeMode);
  const mergeNode = useThreadriftStore((s) => s.mergeNode);

  // Map graph objects
  const nodesArray = Object.values(graph.nodes);
  const edgesArray = graph.edges;

  // ── Camera Animation ─────────────────────────────────────
  
  useEffect(() => {
    if (!cameraGroupRef.current) return;

    // Interpolate camera position along active path
    const targetPos = interpolatePosition(activePath, scrollCurrent);
    
    // Calculate centered camera coordinates
    const cx = CANVAS_SIZE / 2 - targetPos.x * CAMERA_SCALE;
    const cy = CANVAS_SIZE / 2 - targetPos.y * CAMERA_SCALE;

    gsap.set(cameraGroupRef.current, {
      x: cx,
      y: cy,
      scale: CAMERA_SCALE,
      transformOrigin: `${targetPos.x}px ${targetPos.y}px`,
    });
  }, [scrollCurrent, activePath]);

  // ── Edge Masking (Progress Drawing) ──────────────────────

  useEffect(() => {
    if (!svgRef.current) return;

    activePath.forEach((node, i) => {
      // Find the outgoing edge on the active path
      const nextNode = activePath[i + 1];
      if (!nextNode) return;

      const activeEdge = edgesArray.find(
        (e) => e.from === node.id && e.to === nextNode.id
      );
      if (!activeEdge) return;

      const pathEl = svgRef.current?.querySelector<SVGPathElement>(
        `#edge-${activeEdge.id}`
      );
      if (!pathEl) return;

      const pathData = pathEl.getAttribute("d");
      if (!pathData) return;

      const len = getPathLength(activeEdge.id, pathData);
      
      // Calculate how much of this specific edge is drawn
      const edgeStartScroll = i;
      const edgeEndScroll = i + 1;
      let progress = 0;

      if (scrollCurrent >= edgeEndScroll) progress = 1;
      else if (scrollCurrent <= edgeStartScroll) progress = 0;
      else progress = scrollCurrent - edgeStartScroll;

      const drawLength = progress * len;

      gsap.set(pathEl, {
        strokeDasharray: `${drawLength} ${len}`,
      });
    });
  }, [scrollCurrent, activePath, edgesArray]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full"
      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <g ref={cameraGroupRef} className="will-change-transform">
        {/* Render Edges */}
        {edgesArray.map((edge) => {
          // Check if edge is part of the active path
          const isActive = activePath.some((n, i) => {
            const next = activePath[i + 1];
            return next && n.id === edge.from && next.id === edge.to;
          });

          return (
            <GraphEdgeComponent
              key={edge.id}
              edge={edge}
              sequences={sequences}
              getNode={(id) => getNode(graph, id)}
              isActive={isActive}
              onPointerDown={(e, id) => {
                e.stopPropagation();
                selectEdge(id);
              }}
            />
          );
        })}

        {/* Render Nodes */}
        {nodesArray.map((node) => (
          <GraphNodeComponent
            key={node.id}
            node={node}
            isRoot={node.id === graph.root}
            isActive={activePath.includes(node)}
            isVisited={visitedNodes.has(node.id)}
            isMergeTarget={mergeModeSource !== null && node.id !== mergeModeSource}
            onPointerDown={(e, id) => {
              e.stopPropagation();
              if (mergeModeSource !== null && id !== mergeModeSource) {
                // Execute merge
                mergeNode(mergeModeSource, id);
                setMergeMode(null);
              } else {
                selectNode(id);
              }
            }}
          />
        ))}

        {/* Render Floating Labels */}
        <GraphLabels nodes={activePath} scrollCurrent={scrollCurrent} />
      </g>
    </svg>
  );
});

export const GraphCanvas = ThreadriftCanvas;
