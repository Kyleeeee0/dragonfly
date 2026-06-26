"use client";
import { useState, useMemo, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Node,
  type Edge,
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

interface ComponentNode {
  id: string;
  label: string;
  type: string;
  specs: string;
  position: { x: number; y: number };
}

const projects = [
  { id: "line-follower", name: "Line-Follower Bot" },
  { id: "power-electronics", name: "Power Electronics" },
  { id: "esp32-weather-node", name: "ESP32 Weather Node" },
];

const categoryColor: Record<string, string> = {
  mcu: "bg-primary/20 text-primary ring-primary/40",
  sensor: "bg-accent/20 text-accent ring-accent/40",
  actuator: "bg-warning/20 text-warning ring-warning/40",
  logic: "bg-white/10 text-foreground ring-white/20",
  power: "bg-destructive/15 text-destructive ring-destructive/30",
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
      type="target"
      position={Position.Top}
      className="w-2 h-2 border-none bg-muted-foreground/50"
    />
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
        categoryColor[data.component.type] ||
        "bg-white/5 text-muted-foreground ring-white/10"
      }`}
    >
      {data.component.type.toUpperCase()}
    </span>
    <p className="text-sm font-medium">{data.component.label}</p>
    <p className="text-[10px] text-muted-foreground">{data.component.specs}</p>
    <Handle
      type="source"
      position={Position.Bottom}
      className="w-2 h-2 border-none bg-muted-foreground/50"
    />
  </button>
);

const nodeTypes = { custom: CustomNode };

const dataSets: Record<
  string,
  {
    nodes: ComponentNode[];
    edges: { source: string; target: string; label?: string }[];
  }
> = {
  "line-follower": {
    nodes: [
      {
        id: "power_batt",
        label: "Li-ion Battery Pack",
        type: "power",
        specs: "7.4V · 2600mAh · JST",
        position: { x: 0, y: 0 },
      },
      {
        id: "mcu_nano",
        label: "Arduino Nano",
        type: "mcu",
        specs: "5V · 16MHz · 22 GPIO",
        position: { x: 0, y: 150 },
      },
      {
        id: "sensor_ir",
        label: "IR Reflectance Array",
        type: "sensor",
        specs: "8-ch · digital · 3-5V",
        position: { x: -160, y: 300 },
      },
      {
        id: "logic_nand",
        label: "Quad NAND Gate",
        type: "logic",
        specs: "2-V to 6-V · 14-DIP",
        position: { x: 160, y: 300 },
      },
      {
        id: "actuator_buzzer",
        label: "Active Piezo Buzzer",
        type: "actuator",
        specs: "12V · 85 dB · 2.3 kHz",
        position: { x: -160, y: 450 },
      },
      {
        id: "driver_motor",
        label: "TB6612FNG Motor Driver",
        type: "actuator",
        specs: "Dual H-bridge · 1.2A · 2.5-13.5V",
        position: { x: 160, y: 450 },
      },
      {
        id: "actuator_motor",
        label: "Micro Gear Motor",
        type: "actuator",
        specs: "6V · 200 RPM · 1:48",
        position: { x: 160, y: 600 },
      },
    ],
    edges: [
      { source: "power_batt", target: "mcu_nano", label: "7.4V -> Vin" },
      {
        source: "power_batt",
        target: "driver_motor",
        label: "7.4V -> VMOT (Motor Power)",
      },
      { source: "mcu_nano", target: "sensor_ir", label: "5V VCC" },
      {
        source: "sensor_ir",
        target: "mcu_nano",
        label: "Digital Out -> D2-D9",
      },
      {
        source: "mcu_nano",
        target: "logic_nand",
        label: "5V VCC & Signal Logic",
      },
      {
        source: "logic_nand",
        target: "driver_motor",
        label: "Processed Logic -> Standby/PWM",
      },
      {
        source: "mcu_nano",
        target: "driver_motor",
        label: "PWM & Dir -> IN1, IN2",
      },
      {
        source: "driver_motor",
        target: "actuator_motor",
        label: "Drive Output -> Motor A/B",
      },
      {
        source: "mcu_nano",
        target: "actuator_buzzer",
        label: "Digital Out -> Base/Gate (via Transistor)",
      },
    ],
  },
  "esp32-weather-node": {
    nodes: [
      {
        id: "pwr_lipo",
        label: "3.7V LiPo Battery",
        type: "power",
        specs: "3.7V · 1000mAh",
        position: { x: 0, y: 0 },
      },
      {
        id: "pwr_charger",
        label: "TP4056 Charger",
        type: "power",
        specs: "5V USB In · 1A Charge",
        position: { x: 0, y: 150 },
      },
      {
        id: "mcu_esp32",
        label: "ESP32 Dev Module",
        type: "mcu",
        specs: "3.3V Logic · WiFi/BT",
        position: { x: 0, y: 300 },
      },
      {
        id: "sens_bme280",
        label: "BME280 Env Sensor",
        type: "sensor",
        specs: "I2C · Temp/Hum/Pres",
        position: { x: -160, y: 450 },
      },
      {
        id: "act_oled",
        label: '0.96" OLED Display',
        type: "actuator",
        specs: "I2C · 128x64 SSD1306",
        position: { x: 160, y: 450 },
      },
    ],
    edges: [
      { source: "pwr_lipo", target: "pwr_charger", label: "BAT+ / BAT-" },
      { source: "pwr_charger", target: "mcu_esp32", label: "OUT+ -> 5V Vin" },
      {
        source: "mcu_esp32",
        target: "sens_bme280",
        label: "3.3V VCC & I2C (SDA/SCL)",
      },
      {
        source: "mcu_esp32",
        target: "act_oled",
        label: "3.3V VCC & I2C (SDA/SCL)",
      },
    ],
  },
  "power-electronics": {
    nodes: [
      {
        id: "pwr_source24v",
        label: "24V DC Power Supply",
        type: "power",
        specs: "24V · 5A Max",
        position: { x: 0, y: 0 },
      },
      {
        id: "logic_buck_ic",
        label: "LM2596 Buck IC",
        type: "logic",
        specs: "Step-Down · 3A Max",
        position: { x: 0, y: 150 },
      },
      {
        id: "pass_inductor",
        label: "Power Inductor",
        type: "power",
        specs: "33uH · 3A",
        position: { x: -160, y: 300 },
      },
      {
        id: "pass_diode",
        label: "Schottky Diode",
        type: "power",
        specs: "1N5822 · 3A/40V",
        position: { x: 160, y: 300 },
      },
      {
        id: "pass_cap_out",
        label: "Electrolytic Cap",
        type: "power",
        specs: "220uF · 35V",
        position: { x: 0, y: 450 },
      },
      {
        id: "act_high_led",
        label: "High Power LED Array",
        type: "actuator",
        specs: "12V · 10W",
        position: { x: 0, y: 600 },
      },
    ],
    edges: [
      { source: "pwr_source24v", target: "logic_buck_ic", label: "24V IN" },
      {
        source: "logic_buck_ic",
        target: "pass_inductor",
        label: "Switching Out",
      },
      {
        source: "logic_buck_ic",
        target: "pass_diode",
        label: "Catch Diode to GND",
      },
      {
        source: "pass_inductor",
        target: "pass_cap_out",
        label: "Filtered DC Out",
      },
      {
        source: "pass_cap_out",
        target: "act_high_led",
        label: "12V Smooth Power",
      },
    ],
  },
};

export default function FlowScreen() {
  const [selected, setSelected] = useState<ComponentNode | null>(null);
  const [currentProject, setCurrentProject] = useState(projects[0]);

  const { nodes: projectNodes, edges: projectEdges } = useMemo(
    () => dataSets[currentProject.id],
    [currentProject],
  );

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
      label: edge.label,
      animated: true,
      labelBgStyle: { fill: "transparent" },
      labelStyle: { fill: "#a1a1aa", fontSize: 10, fontWeight: 500 },
    })),
  );

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
        label: edge.label,
        animated: true,
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
