"use client";
import { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Image, ChevronDown } from "lucide-react";
import { recentProjects, edgeColors } from "@/data/mock/projects";
import { getAllComponents } from "@/lib/inventory/client";
import { Component } from "@/lib/inventory/types";

interface ComponentNode {
  id: string;
  label: string;
  type: string;
  specs: string;
  position: { x: number; y: number };
}

const projects = recentProjects;

const categoryColor: Record<string, string> = {
  mcu: "bg-primary/20 text-primary ring-primary/40",
  sensor: "bg-accent/20 text-accent ring-accent/40",
  actuator: "bg-warning/20 text-warning ring-warning/40",
  logic: "bg-white/10 text-foreground ring-white/20",
  power: "bg-destructive/15 text-destructive ring-destructive/30",
  passive: "bg-white/5 text-muted-foreground ring-white/10",
};

const CustomNode = ({
  data,
}: {
  data: { component: ComponentNode; onClick: (c: ComponentNode) => void };
}) => (
  <button
    onClick={() => data.onClick(data.component)}
    className="flex w-48 relative flex-col items-center gap-1 rounded-2xl border bg-surface-elevated px-4 py-3 text-center border-white/10"
  >
    <Handle
      id="top"
      type="target"
      position={Position.Top}
      className="w-2 h-2 border-none bg-muted-foreground/50"
    />

    <Handle
      id="bottom"
      type="source"
      position={Position.Bottom}
      className="w-2 h-2 border-none bg-muted-foreground/50"
    />

    {/* NODE CONTENT */}
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
        categoryColor[data.component.type.toLowerCase()] ||
        "bg-white/5 text-muted-foreground ring-white/10"
      }`}
    >
      {data.component.type.toUpperCase()}
    </span>
    <p className="text-sm font-medium">{data.component.label}</p>
    <p className="text-[10px] text-muted-foreground">{data.component.specs}</p>
  </button>
);

const nodeTypes = { custom: CustomNode };

export default function FlowScreen() {
  const [selected, setSelected] = useState<ComponentNode | null>(null);
  const [currentProject, setCurrentProject] = useState(projects[0]);
  const [inventory, setInventory] = useState<Component[]>([]);

  useEffect(() => {
    getAllComponents()
      .then(setInventory)
      .catch((err) => console.error("Failed to load inventory for flow:", err));
  }, []);

  // 1. Compute nodes and edges once whenever currentProject changes
  const { nodes: projectNodes, edges: projectEdges } = useMemo(() => {
    const nodes = currentProject.nodes.map((node) => {
      const comp = inventory.find((item) => item.id === node.id);
      return {
        id: node.id,
        label: comp?.name || "Unknown",
        type: comp?.category.toLowerCase() || "logic",
        specs: comp?.specs || "",
        position: node.position,
      };
    });

    const edges = currentProject.edges.map((edge) => ({
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle || "bottom",
      targetHandle: edge.targetHandle || "top",
      label: edge.label ?? "",
      type: edge.type ?? "logic",
    }));

    return { nodes, edges };
  }, [currentProject, inventory]);

  // 2. Initialize React Flow states with the computed values

  // 2. Initialize React Flow states with the computed values
  const [nodes, setNodes, onNodesChange] = useNodesState(
    projectNodes.map((node) => ({
      id: node.id,
      type: "custom",
      data: { component: node, onClick: setSelected },
      position: node.position,
    })),
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    projectEdges.map((edge, i) => ({
      id: `e${edge.source}-${edge.target}-${i}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      animated: true,
      type: "smoothstep",
      style: {
        stroke: edgeColors[edge.type as keyof typeof edgeColors] || "#a1a1aa",
        strokeWidth: 2,
      },
      labelBgStyle: { fill: "transparent" },
      labelStyle: { fill: "#a1a1aa", fontSize: 10, fontWeight: 500 },
    })),
  );

  // 3. Keep the flow updated when the project changes
  useEffect(() => {
    setNodes(
      projectNodes.map((node) => ({
        id: node.id,
        type: "custom",
        data: { component: node, onClick: setSelected },
        position: node.position,
      })),
    );
    setEdges(
      projectEdges.map((edge, i) => ({
        id: `e${edge.source}-${edge.target}-${i}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        label: edge.label,
        animated: true,
        type: "smoothstep",
        style: {
          stroke: edgeColors[edge.type as keyof typeof edgeColors] || "#a1a1aa",
          strokeWidth: 2,
        },
        labelBgStyle: { fill: "transparent" },
        labelStyle: { fill: "#a1a1aa", fontSize: 10, fontWeight: 500 },
      })),
    );
  }, [projectNodes, projectEdges, setNodes, setEdges, setSelected]);

  return (
    <div className="flex flex-col h-screen">
      <div className="px-5 pt-14 pb-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Visual flow
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {currentProject.name}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-full"
              >
                {currentProject.name} <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  className="focus:bg-primary/20 focus:text-primary transition-colors"
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
      </div>

      <div className="flex-1 rounded-3xl border border-white/5 bg-surface/40 m-5 mb-28">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background color="#333" gap={20} />
          <Controls />
        </ReactFlow>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="bg-surface border-white/10">
          <DialogHeader>
            <DialogTitle>{selected?.label}</DialogTitle>
            <DialogDescription>
              {selected?.type.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="h-40 w-full rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
              <Image size={48} opacity={0.4} />
            </div>
            <div className="text-xs text-foreground/80 leading-relaxed">
              {selected?.specs}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
