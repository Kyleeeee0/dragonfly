"use client";

import { useState, useEffect } from "react";
import {
  calculateProjectCost,
  ProjectCartSummary,
} from "@/lib/project-calculator";
import { ProjectDefinition, ProjectModel } from "@/lib/project/types";

export function ProjectCost({
  project,
  className = "",
}: {
  project: ProjectDefinition | ProjectModel | ProjectCartSummary;
  className?: string;
}) {
  const [calculatedCost, setCalculatedCost] = useState<number | null>(null);

  useEffect(() => {
    if ("totalPrice" in project) return;

    calculateProjectCost(project)
      .then(setCalculatedCost)
      .catch(() => setCalculatedCost(0));
  }, [project]);

  const cost = "totalPrice" in project ? project.totalPrice : calculatedCost;

  return (
    <span className={className}>
      {cost !== null ? `₱${cost.toFixed(2)}` : "Calculating..."}
    </span>
  );
}
