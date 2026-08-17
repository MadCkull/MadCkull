"use client";

import { useState } from "react";
import { useThreadriftStore } from "../../store/threadrift-store";
import {
  Gauge,
  Magnet,
  Timer,
  Download,
  Upload,
  RotateCcw,
} from "lucide-react";
import {
  SCROLL_SENSITIVITY,
  SNAP_STRENGTH,
  SNAP_THRESHOLD,
} from "../../engine/constants";

export function GlobalTab() {
  const toJSON = useThreadriftStore((s) => s.toJSON);
  const loadGraph = useThreadriftStore((s) => s.loadGraph);

  // Live physics tuning states
  const [scrollSens, setScrollSens] = useState(SCROLL_SENSITIVITY);
  const [snapStrength, setSnapStrength] = useState(SNAP_STRENGTH);
  const [snapThreshold, setSnapThreshold] = useState(SNAP_THRESHOLD);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  async function handleSave() {
    try {
      const json = toJSON();
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json",
      });

      // Try File System Access API first
      if ("showSaveFilePicker" in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: "graph.json",
          types: [
            {
              description: "JSON files",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        setSaveStatus("Saved!");
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.json";
        a.click();
        URL.revokeObjectURL(url);
        setSaveStatus("Downloaded!");
      }

      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Save failed:", err);
        setSaveStatus("Save failed");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  }

  async function handleLoad() {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const text = await file.text();
        const data = JSON.parse(text);
        loadGraph(data);
        setSaveStatus("Loaded!");
        setTimeout(() => setSaveStatus(null), 2000);
      };
      input.click();
    } catch (err) {
      console.error("Load failed:", err);
    }
  }

  async function handleReload() {
    try {
      const res = await fetch("/data/graph.json");
      const data = await res.json();
      loadGraph(data);
      setSaveStatus("Reloaded!");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error("Reload failed:", err);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Physics Tuning */}
      <div className="flex flex-col gap-4">
        <span className="text-zinc-500 text-xs uppercase tracking-wider">
          Physics Tuning
        </span>

        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Gauge className="w-3.5 h-3.5" />
              Scroll Sensitivity
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">
              {scrollSens.toFixed(4)}
            </span>
          </div>
          <input
            type="range"
            min={0.0005}
            max={0.01}
            step={0.0001}
            value={scrollSens}
            onChange={(e) => setScrollSens(Number(e.target.value))}
            className="w-full accent-white h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Magnet className="w-3.5 h-3.5" />
              Snap Strength
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">
              {snapStrength.toFixed(3)}
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.2}
            step={0.005}
            value={snapStrength}
            onChange={(e) => setSnapStrength(Number(e.target.value))}
            className="w-full accent-white h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Timer className="w-3.5 h-3.5" />
              Snap Threshold
            </div>
            <span className="text-[10px] text-zinc-600 font-mono">
              {snapThreshold.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={0.05}
            max={0.5}
            step={0.01}
            value={snapThreshold}
            onChange={(e) => setSnapThreshold(Number(e.target.value))}
            className="w-full accent-white h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </label>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* I/O */}
      <div className="flex flex-col gap-2">
        <span className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
          Data
        </span>

        <button
          onClick={handleSave}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg 
            bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10 
            transition-all text-sm text-zinc-300 hover:text-white cursor-pointer"
        >
          <Download className="w-4 h-4 text-zinc-500" />
          Save to File
        </button>

        <button
          onClick={handleLoad}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg 
            bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10 
            transition-all text-sm text-zinc-300 hover:text-white cursor-pointer"
        >
          <Upload className="w-4 h-4 text-zinc-500" />
          Load from File
        </button>

        <button
          onClick={handleReload}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg 
            bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-white/10 
            transition-all text-sm text-zinc-300 hover:text-white cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-zinc-500" />
          Reload Default
        </button>

        {/* Status Badge */}
        {saveStatus && (
          <div className="text-xs text-emerald-400/70 text-center mt-1 animate-pulse">
            {saveStatus}
          </div>
        )}
      </div>

      {/* Graph Stats */}
      <div className="h-px bg-white/5" />
      <GraphStats />
    </div>
  );
}

function GraphStats() {
  const graph = useThreadriftStore((s) => s.graph);
  const nodeCount = Object.keys(graph.nodes).length;
  const edgeCount = graph.edges.length;
  const mainEdges = graph.edges.filter((e) => e.type === "main").length;
  const branchEdges = graph.edges.filter((e) => e.type === "branch").length;

  return (
    <div className="flex flex-col gap-2">
      <span className="text-zinc-500 text-xs uppercase tracking-wider">
        Threadrift Stats
      </span>
      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Nodes" value={nodeCount} />
        <StatCard label="Edges" value={edgeCount} />
        <StatCard label="Main" value={mainEdges} />
        <StatCard label="Branch" value={branchEdges} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-lg px-3 py-2 text-center">
      <div className="text-lg font-light text-white font-mono">{value}</div>
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
