"use server";

import prisma from "@/lib/prisma";
import {
  putawaySchema,
  type PutawayInput,
  type ActionResult,
  type InventoryRecord,
} from "@/lib/validators";

/**
 * Putaway action - Add inventory to a location
 * Auto-creates location and SKU if they don't exist (configurable)
 */
export async function putaway(
  input: PutawayInput
): Promise<ActionResult<InventoryRecord[]>> {
  try {
    // Validate input
    const validatedData = putawaySchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message ?? "Invalid input",
      };
    }

    const { locationCode, items, user, handlerName, note } = validatedData.data;

    const results = await prisma.$transaction(async (tx) => {
      // Find or create location
      let location = await tx.location.findUnique({
        where: { code: locationCode },
      });

      if (!location) {
        location = await tx.location.create({
          data: { code: locationCode },
        });
      }

      const inventoryRecords: InventoryRecord[] = [];

      for (const item of items) {
        // Find or create SKU
        let sku = await tx.sku.findUnique({
          where: { code: item.skuCode },
        });

        if (!sku) {
          sku = await tx.sku.create({
            data: { 
              code: item.skuCode,
              itemCode: item.itemCode || null,
            },
          });
        } else if (item.itemCode && !sku.itemCode) {
          // Update itemCode if SKU exists but doesn't have one
          sku = await tx.sku.update({
            where: { id: sku.id },
            data: { itemCode: item.itemCode },
          });
        }

        // Upsert inventory
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
            qty: item.qty,
          },
          update: {
            qty: {
              increment: item.qty,
            },
          },
          include: {
            location: true,
            sku: true,
          },
        });

        // Create movement log
        await tx.movementLog.create({
          data: {
            action: "PUTAWAY",
            skuId: sku.id,
            toLocationId: location.id,
            qty: item.qty,
            user: user ?? "system",
            handlerName: handlerName,
            note,
          },
        });

        inventoryRecords.push({
          id: inventory.id,
          locationCode: inventory.location.code,
          skuCode: inventory.sku.code,
          skuName: inventory.sku.name,
          qty: inventory.qty,
          updatedAt: inventory.updatedAt,
        });
      }

      return inventoryRecords;
    });

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Putaway error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to putaway inventory",
    };
  }
}

/**
 * Single item putaway for simpler use cases
 */
export async function putawaySingle(
  locationCode: string,
  skuCode: string,
  qty: number,
  user?: string,
  note?: string
): Promise<ActionResult<InventoryRecord>> {
  const result = await putaway({
    locationCode,
    items: [{ skuCode, qty }],
    user: user ?? "system",
    note,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const record = result.data?.[0];
  if (!record) {
    return { success: false, error: "No inventory record created" };
  }

  return { success: true, data: record };
}
