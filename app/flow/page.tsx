"use client";
import { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
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
import { Image, ChevronDown, Loader2 } from "lucide-react";
import {
  getAllProjects,
  getProjectNodes,
  getProjectEdges,
} from "@/lib/project/client";
import { edgeColors } from "@/lib/project/constants";
import { getAllComponents } from "@/lib/inventory/client";
import { Component } from "@/lib/inventory/types";
import { CustomNode, type ComponentNode } from "@/features/visual-flow/CustomNode";
import {
  ProjectEdgeModel,
  ProjectModel,
  ProjectNodeModel,
} from "@/lib/project/types";

const nodeTypes = { custom: CustomNode };

export default function FlowScreen() {
  const [selected, setSelected] = useState<ComponentNode | null>(null);
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectModel | null>(
    null,
  );
  const [currentNodes, setCurrentNodes] = useState<ProjectNodeModel[]>([]);
  const [currentEdges, setCurrentEdges] = useState<ProjectEdgeModel[]>([]);
  const [inventory, setInventory] = useState<Component[]>([]);

  useEffect(() => {
    Promise.all([getAllProjects(), getAllComponents()])
      .then(([projs, inv]) => {
        setProjects(projs);
        setInventory(inv);
        if (projs.length > 0) {
          setCurrentProject(projs[0]);
        }
      })
      .catch((err) => console.error("Failed to load initial data:", err));
  }, []);

  useEffect(() => {
    if (!currentProject) return;

    Promise.all([
      getProjectNodes(currentProject.id),
      getProjectEdges(currentProject.id),
    ])
      .then(([nodesData, edgesData]) => {
        setCurrentNodes(nodesData);
        setCurrentEdges(edgesData);
      })
      .catch((err) => console.error("Failed to load project details:", err));
  }, [currentProject]);

  const { nodes: projectNodes, edges: projectEdges } = useMemo(() => {
    const nodes = currentNodes.map((node) => {
      const comp = inventory.find((item) => item.id === node.componentId);
      return {
        id: node.id,
        label: comp?.name || "Unknown",
        type: comp?.category.toLowerCase() || "logic",
        specs: comp?.specs || "",
        position: { x: node.positionX, y: node.positionY },
      };
    });

    const edges = currentEdges.map((edge) => ({
      source: edge.sourceId,
      target: edge.targetId,
      sourceHandle: edge.sourceHandle || "bottom",
      targetHandle: edge.targetHandle || "top",
      label: edge.label ?? "",
      type: edge.type ?? "logic",
    }));

    return { nodes, edges };
  }, [currentNodes, currentEdges, inventory]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

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

  if (!currentProject) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
