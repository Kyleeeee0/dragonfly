import { ConnectionType, ProjectDefinition } from "@/lib/project/types";
import { Bot, Wifi, Network, Cpu, Zap } from "lucide-react";

export const categoryIcons: Record<string, typeof Bot> = {
  Robotics: Bot,
  IoT: Wifi,
  Networking: Network,
  Mechatronics: Cpu,
  Power: Zap,
};

export const edgeColors: Record<ConnectionType, string> = {
  power: "#ef4444",
  signal: "#3b82f6",
  logic: "#8b5cf6",
  i2c: "#10b981",
};

export const recentProjects: ProjectDefinition[] = [
  {
    id: "proj_01",
    name: "Line-Following Robot",
    time: "2d ago",
    tag: "Robotics",
    nodes: [
      { id: "comp_pwr_01", position: { x: 250, y: 0 } },
      { id: "comp_mcu_01", position: { x: 250, y: 150 } },
      { id: "comp_sns_01", position: { x: 550, y: 150 } },
      { id: "comp_act_01", position: { x: -50, y: 150 } }, // Shifted left to align with MCU left handle
      { id: "comp_log_01", position: { x: 550, y: 300 } }, // Below Sensor
      { id: "comp_act_02", position: { x: -50, y: 300 } }, // Below Driver
      { id: "comp_act_04", position: { x: 550, y: 450 } }, // Below NAND
    ],
    substitutes: {
      comp_sns_01: ["comp_sns_01_alt1", "comp_sns_01_alt2", "comp_sns_01_alt3"],
      comp_log_01: ["comp_log_01_alt1", "comp_log_01_alt2", "comp_log_01_alt3"],
      comp_mcu_01: ["comp_mcu_01_alt1", "comp_mcu_01_alt2", "comp_mcu_01_alt3"],
      comp_act_01: ["comp_act_01_alt1", "comp_act_01_alt2", "comp_act_01_alt3"],
    },
    edges: [
      // Power distribution
      {
        id: "e1",
        source: "comp_pwr_01",
        target: "comp_act_01",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "7.4V VMOT",
        type: "power",
      },
      {
        id: "e2",
        source: "comp_pwr_01",
        target: "comp_mcu_01",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "7.4V VIN",
        type: "power",
      },
      {
        id: "e3",
        source: "comp_mcu_01",
        target: "comp_sns_01",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "5V VCC",
        type: "power",
      },

      // Sensor -> MCU
      {
        id: "e5",
        source: "comp_sns_01",
        target: "comp_mcu_01",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Sensor Data",
        type: "signal",
      },

      // MCU -> Motor Driver
      {
        id: "e6",
        source: "comp_mcu_01",
        target: "comp_act_01",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "PWM / DIR",
        type: "signal",
      },

      {
        id: "e7",
        source: "comp_act_01",
        target: "comp_act_02",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Drive Current",
        type: "power",
      },

      // Sensor -> NAND
      {
        id: "e_nand_in1",
        source: "comp_sns_01",
        target: "comp_log_01",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Line Lost",
        type: "logic",
      },

      // NAND -> Buzzer
      {
        id: "e_nand_out",
        source: "comp_log_01",
        target: "comp_act_04",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Buzzer",
        type: "signal",
      },
    ],
  },
  {
    id: "proj_02",
    name: "ESP32 Weather Node",
    time: "5d ago",
    tag: "IoT",
    nodes: [
      { id: "comp_pwr_02", position: { x: 50, y: 0 } }, // Left
      { id: "comp_sns_02", position: { x: 550, y: 0 } }, // Right
      { id: "comp_mcu_02", position: { x: 300, y: 150 } }, // Center, below inputs
      { id: "comp_act_03", position: { x: 300, y: 300 } }, // Center, below MCU
    ],
    substitutes: {
      comp_sns_02: ["comp_sns_02_alt1", "comp_sns_02_alt2", "comp_sns_02_alt3"],
      comp_mcu_02: ["comp_mcu_02_alt1", "comp_mcu_02_alt2", "comp_mcu_02_alt3"],
    },
    edges: [
      // Curves wrapping into the sides
      {
        id: "e9",
        source: "comp_pwr_02",
        target: "comp_mcu_02",
        sourceHandle: "bottom",
        targetHandle: "left",
        label: "Battery",
        type: "power",
      },
      {
        id: "e12",
        source: "comp_sns_02",
        target: "comp_mcu_02",
        sourceHandle: "bottom",
        targetHandle: "right",
        label: "I2C Data",
        type: "i2c",
      },

      // Straight drop
      {
        id: "e13",
        source: "comp_mcu_02",
        target: "comp_act_03",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Display Data",
        type: "i2c",
      },
    ],
  },
  {
    id: "proj_03",
    name: "Motion Detector Alarm",
    time: "1w ago",
    tag: "Mechatronics",
    nodes: [
      { id: "comp_pwr_04", position: { x: 0, y: 0 } },
      { id: "comp_sns_03", position: { x: 250, y: 0 } },
      { id: "comp_pas_01", position: { x: 550, y: 0 } }, // Shifted further right to curve inward smoothly
      { id: "comp_pas_02", position: { x: 800, y: 0 } }, // Shifted further right to curve inward smoothly
      { id: "comp_log_02", position: { x: 250, y: 150 } }, // Centered under sensor
      { id: "comp_act_04", position: { x: 250, y: 300 } }, // Centered under logic
    ],
    substitutes: {
      comp_sns_03: ["comp_sns_03_alt1", "comp_sns_03_alt2", "comp_sns_03_alt3"],
    },
    edges: [
      {
        id: "e_pwr_sns",
        source: "comp_pwr_04",
        target: "comp_sns_03",
        sourceHandle: "right",
        targetHandle: "left",
        label: "9V VCC",
        type: "power",
      },
      {
        id: "e_in",
        source: "comp_sns_03",
        target: "comp_log_02",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Trigger",
        type: "signal",
      },
      {
        id: "e_pwr_log",
        source: "comp_pwr_04",
        target: "comp_log_02",
        sourceHandle: "bottom",
        targetHandle: "left",
        label: "9V VCC",
        type: "power",
      },
      {
        id: "e_rc1",
        source: "comp_pas_01",
        target: "comp_log_02",
        sourceHandle: "bottom",
        targetHandle: "right",
        label: "Timing R",
        type: "logic",
      },
      {
        id: "e_rc2",
        source: "comp_pas_02",
        target: "comp_log_02",
        sourceHandle: "bottom",
        targetHandle: "right",
        label: "Timing C",
        type: "logic",
      },
      {
        id: "e_out",
        source: "comp_log_02",
        target: "comp_act_04",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Alarm Signal",
        type: "signal",
      },
    ],
  },
  {
    id: "proj_04",
    name: "Automatic 12V Charger",
    time: "1w ago",
    tag: "Power",
    nodes: [
      // Central stack aligned perfectly at x: 250
      { id: "comp_pwr_trans", position: { x: 250, y: 0 } },
      { id: "comp_pwr_rect", position: { x: 250, y: 150 } },
      { id: "comp_pwr_03", position: { x: 250, y: 300 } },
      { id: "comp_act_05", position: { x: 250, y: 450 } },

      // Secondary components aligned perfectly to the right at x: 550
      { id: "comp_log_zener", position: { x: 550, y: 150 } },
      { id: "comp_act_led", position: { x: 550, y: 450 } },
    ],
    edges: [
      // Central straight lines
      {
        id: "e_trans",
        source: "comp_pwr_trans",
        target: "comp_pwr_rect",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "12V AC",
        type: "power",
      },
      {
        id: "e_rect",
        source: "comp_pwr_rect",
        target: "comp_pwr_03",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "DC Bus",
        type: "power",
      },
      {
        id: "e_relay",
        source: "comp_pwr_03",
        target: "comp_act_05",
        sourceHandle: "bottom",
        targetHandle: "top",
        label: "Cutoff",
        type: "signal",
      },

      // Curves to/from the right column
      {
        id: "e_zener",
        source: "comp_log_zener",
        target: "comp_pwr_03",
        sourceHandle: "bottom",
        targetHandle: "right",
        label: "V-Ref",
        type: "logic",
      },
      {
        id: "e_led",
        source: "comp_act_05",
        target: "comp_act_led",
        sourceHandle: "right",
        targetHandle: "left",
        label: "Full Status",
        type: "signal",
      },
    ],
    substitutes: {},
  },
];
