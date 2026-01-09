"use server";

import prisma from "@/lib/prisma";
import {
  moveInventorySchema,
  type MoveInventoryInput,
  type ActionResult,
  type InventoryRecord,
} from "@/lib/validators";

export interface MoveResult {
  fromInventory: InventoryRecord;
  toInventory: InventoryRecord;
}

/**
 * Move inventory from one location to another
 * Uses Prisma transaction to ensure atomicity
 * Prevents negative stock
 */
export async function moveInventory(
  input: MoveInventoryInput
): Promise<ActionResult<MoveResult>> {
  try {
    // Validate input
    const validatedData = moveInventorySchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { fromLocationCode, toLocationCode, skuCode, qty, user, handlerName, note } =
      validatedData.data;

    const result = await prisma.$transaction(async (tx) => {
      // Get source location
      const fromLocation = await tx.location.findUnique({
        where: { code: fromLocationCode },
      });

      if (!fromLocation) {
        throw new Error(`Source location "${fromLocationCode}" not found`);
      }

      // Get or create destination location
      let toLocation = await tx.location.findUnique({
        where: { code: toLocationCode },
      });

      if (!toLocation) {
        toLocation = await tx.location.create({
          data: { code: toLocationCode },
        });
      }

      // Get SKU
      const sku = await tx.sku.findUnique({
        where: { code: skuCode },
      });

      if (!sku) {
        throw new Error(`EN "${skuCode}" not found`);
      }

      // Get source inventory with lock
      const sourceInventory = await tx.inventory.findUnique({
        where: {
          locationId_skuId: {
            locationId: fromLocation.id,
            skuId: sku.id,
          },
        },
      });

      if (!sourceInventory) {
        throw new Error(
          `EN "${skuCode}" not found at location "${fromLocationCode}"`
        );
      }

      if (sourceInventory.qty < qty) {
        throw new Error(
          `Insufficient quantity. Available: ${sourceInventory.qty}, Requested: ${qty}`
        );
      }

      // Decrease source inventory
      const updatedSource = await tx.inventory.update({
        where: { id: sourceInventory.id },
        data: { qty: { decrement: qty } },
        include: { location: true, sku: true },
      });

      // Upsert destination inventory
      const updatedDestination = await tx.inventory.upsert({
        where: {
          locationId_skuId: {
            locationId: toLocation.id,
            skuId: sku.id,
          },
        },
        create: {
          locationId: toLocation.id,
          skuId: sku.id,
          qty: qty,
        },
        update: {
          qty: { increment: qty },
        },
        include: { location: true, sku: true },
      });

      // Create movement log
      await tx.movementLog.create({
        data: {
          action: "MOVE",
          skuId: sku.id,
          fromLocationId: fromLocation.id,
          toLocationId: toLocation.id,
          qty: qty,
          user: user ?? "system",
          handlerName: handlerName,
          note,
        },
      });

      return {
        fromInventory: {
          id: updatedSource.id,
          locationCode: updatedSource.location.code,
          skuCode: updatedSource.sku.code,
          skuName: updatedSource.sku.name,
          qty: updatedSource.qty,
          updatedAt: updatedSource.updatedAt,
        },
        toInventory: {
          id: updatedDestination.id,
          locationCode: updatedDestination.location.code,
          skuCode: updatedDestination.sku.code,
          skuName: updatedDestination.sku.name,
          qty: updatedDestination.qty,
          updatedAt: updatedDestination.updatedAt,
        },
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Move inventory error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to move inventory",
    };
  }
}

/**
 * Check available quantity at a location for a SKU
 */
export async function getAvailableQty(
  locationCode: string,
  skuCode: string
): Promise<ActionResult<{ qty: number; skuName?: string | null }>> {
  try {
    const inventory = await prisma.inventory.findFirst({
      where: {
        location: { code: locationCode.toUpperCase() },
        sku: { code: skuCode.toUpperCase() },
      },
      include: { sku: true },
    });

    if (!inventory) {
      return {
        success: true,
        data: { qty: 0, skuName: null },
      };
    }

    return {
      success: true,
      data: { qty: inventory.qty, skuName: inventory.sku.name },
    };
  } catch (error) {
    console.error("Get available qty error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get available quantity",
    };
  }
}
