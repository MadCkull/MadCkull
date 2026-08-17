"use client";

import { useThreadriftStore } from "../../store/threadrift-store";
import { Spline, GitBranch, Trash2 } from "lucide-react";
import { getLevelColor } from "../../engine/constants";

export function EdgeTab() {
  const selectedEdge = useThreadriftStore((s) => s.selectedEdge);
  const graph = useThreadriftStore((s) => s.graph);
  const updateEdge = useThreadriftStore((s) => s.updateEdge);
  const removeEdge = useThreadriftStore((s) => s.removeEdge);

  if (!selectedEdge) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-600 text-sm">
        <Spline className="w-8 h-8 mb-3 opacity-40" />
        <span>Click an edge on the canvas</span>
        <span className="text-xs text-zinc-700 mt-1">to adjust its curve & divergence</span>
      </div>
    );
  }

  const edge = graph.edges.find((e) => e.id === selectedEdge);
  if (!edge) return null;

  const fromNode = graph.nodes[edge.from];
  const toNode = graph.nodes[edge.to];
  const fromColor = fromNode ? getLevelColor(fromNode.level) : "#555";
  const toColor = toNode ? getLevelColor(toNode.level) : "#555";

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: fromColor }}
          />
          <span className="text-zinc-500 text-xs">→</span>
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: toColor }}
          />
        </div>
        <span className="text-xs text-zinc-500 font-mono tracking-wide">
          {fromNode?.name || edge.from} → {toNode?.name || edge.to}
        </span>
        <span
          className={`text-[10px] uppercase tracking-widest rounded px-1.5 py-0.5 border ${
            edge.type === "main"
              ? "text-emerald-500/70 border-emerald-500/20"
              : "text-sky-500/70 border-sky-500/20"
          }`}
        >
          {edge.type}
        </span>
      </div>

      {/* Curve Control */}
      <label className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider">
            <Spline className="w-3.5 h-3.5" />
            Curve
          </div>
          <span className="text-[10px] text-zinc-600 font-mono">
            {(edge.curve ?? 0).toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={-1}
          max={1}
          step={0.01}
          value={edge.curve ?? 0}
          onChange={(e) =>
            updateEdge(edge.id, { curve: Number(e.target.value) })
          }
          className="w-full accent-white h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
        />
        <p className="text-[10px] text-zinc-700 leading-relaxed">
          Controls the bézier sweep of the path. Positive values curve one
          direction, negative the other.
        </p>
      </label>

      {/* Divergence Control */}
      {edge.type === "branch" && (
        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider">
              <GitBranch className="w-3.5 h-3.5" />
              Divergence
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">
              {(edge.diverge ?? 0).toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={-0.5}
            max={0.5}
            step={0.01}
            value={edge.diverge ?? 0}
            onChange={(e) =>
              updateEdge(edge.id, { diverge: Number(e.target.value) })
            }
            className="w-full accent-white h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <p className="text-[10px] text-zinc-700 leading-relaxed">
            Controls where the branch splits from the parent's tangent.
            Negative = earlier split, Positive = later split.
          </p>
        </label>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Delete */}
      <button
        onClick={() => {
          if (confirm("Delete this edge?")) {
            removeEdge(edge.id);
          }
        }}
        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg 
          bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 
          transition-all text-sm text-red-400/70 hover:text-red-400 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
        Delete Edge
      </button>
    </div>
  );
}
