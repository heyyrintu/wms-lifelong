"use server";

import prisma from "@/lib/prisma";
import {
  adjustInventorySchema,
  type AdjustInventoryInput,
  type ActionResult,
  type InventoryRecord,
} from "@/lib/validators";

/**
 * Adjust inventory quantity at a location
 * Can be positive (add) or negative (remove) adjustment
 * Requires a note explaining the adjustment
 */
export async function adjustInventory(
  input: AdjustInventoryInput
): Promise<ActionResult<InventoryRecord>> {
  try {
    const validated = adjustInventorySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { locationCode, skuCode, qty, user, note } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      // Get or create location
      let location = await tx.location.findUnique({
        where: { code: locationCode },
      });

      if (!location) {
        location = await tx.location.create({
          data: { code: locationCode },
        });
      }

      // Get or create SKU
      let sku = await tx.sku.findUnique({
        where: { code: skuCode },
      });

      if (!sku) {
        sku = await tx.sku.create({
          data: { code: skuCode },
        });
      }

      // Get current inventory
      const currentInventory = await tx.inventory.findUnique({
        where: {
          locationId_skuId: {
            locationId: location.id,
            skuId: sku.id,
          },
        },
      });

      const currentQty = currentInventory?.qty ?? 0;
      const newQty = currentQty + qty;

      if (newQty < 0) {
        throw new Error(
          `Cannot adjust. Current: ${currentQty}, Adjustment: ${qty}, Result would be: ${newQty}`
        );
      }

      // Upsert inventory with new quantity
      const inventory = await tx.inventory.upsert({
        where: {
          locationId_skuId: {
            locationId: location.id,
            skuId: sku.id,
          },
        },
        create: {
          locationId: location.id,
          skuId: sku.id,
          qty: Math.max(0, qty),
        },
        update: {
          qty: newQty,
        },
        include: { location: true, sku: true },
      });

      // Create movement log
      await tx.movementLog.create({
        data: {
          action: "ADJUST",
          skuId: sku.id,
          toLocationId: location.id,
          qty,
          user: user ?? "system",
          note,
        },
      });

      return {
        id: inventory.id,
        locationCode: inventory.location.code,
        skuCode: inventory.sku.code,
        skuName: inventory.sku.name,
        qty: inventory.qty,
        updatedAt: inventory.updatedAt,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Adjust inventory error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to adjust inventory",
    };
  }
}
