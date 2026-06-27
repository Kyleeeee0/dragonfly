import { mockInventory } from "../data/mock/inventory";
import { ProjectDefinition } from "../data/mock/projects";

/**
 * Calculates the total cost of a project based on its nodes and the inventory.
 */
export const calculateTotalProjectPrice = (project: ProjectDefinition): number => {
  return project.nodes.reduce((sum, node) => {
    const inventoryItem = mockInventory.find((item) => item.id === node.id);
    if (inventoryItem) {
      return sum + inventoryItem.unitPrice * inventoryItem.qty;
    }
    return sum;
  }, 0);
};
