"use server";

import prisma from "@/lib/prisma";
import {
  lookupLocationSchema,
  lookupSkuSchema,
  type ActionResult,
  type LocationInventory,
  type SkuLocations,
} from "@/lib/validators";

/**
 * Lookup all SKUs and quantities at a specific location
 */
export async function lookupByLocation(
  locationCode: string
): Promise<ActionResult<LocationInventory>> {
  try {
    const validated = lookupLocationSchema.safeParse({ locationCode });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "Invalid location code",
      };
    }

    const location = await prisma.location.findUnique({
      where: { code: validated.data.locationCode },
      include: {
        inventory: {
          where: { qty: { gt: 0 } },
          include: { sku: true },
          orderBy: { sku: { code: "asc" } },
        },
      },
    });

    if (!location) {
      return {
        success: false,
        error: `Location "${validated.data.locationCode}" not found`,
      };
    }

    return {
      success: true,
      data: {
        locationId: location.id,
        locationCode: location.code,
        items: location.inventory.map((inv) => ({
          skuId: inv.sku.id,
          skuCode: inv.sku.code,
          skuName: inv.sku.name,
          qty: inv.qty,
        })),
      },
    };
  } catch (error) {
    console.error("Lookup by location error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to lookup location",
    };
  }
}

/**
 * Lookup all locations and quantities for a specific SKU
 */
export async function lookupBySku(
  skuCode: string
): Promise<ActionResult<SkuLocations>> {
  try {
    const validated = lookupSkuSchema.safeParse({ skuCode });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message ?? "Invalid SKU code",
      };
    }

    const sku = await prisma.sku.findUnique({
      where: { code: validated.data.skuCode },
      include: {
        inventory: {
          where: { qty: { gt: 0 } },
          include: { location: true },
          orderBy: { location: { code: "asc" } },
        },
      },
    });

    if (!sku) {
      return {
        success: false,
        error: `SKU "${validated.data.skuCode}" not found`,
      };
    }

    const totalQty = sku.inventory.reduce((sum, inv) => sum + inv.qty, 0);

    return {
      success: true,
      data: {
        skuId: sku.id,
        skuCode: sku.code,
        skuName: sku.name,
        locations: sku.inventory.map((inv) => ({
          locationId: inv.location.id,
          locationCode: inv.location.code,
          qty: inv.qty,
        })),
        totalQty,
      },
    };
  } catch (error) {
    console.error("Lookup by SKU error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to lookup SKU",
    };
  }
}

/**
 * Check if a location exists
 */
export async function locationExists(locationCode: string): Promise<boolean> {
  const location = await prisma.location.findUnique({
    where: { code: locationCode.toUpperCase() },
  });
  return !!location;
}

/**
 * Check if a SKU exists
 */
export async function skuExists(skuCode: string): Promise<boolean> {
  const sku = await prisma.sku.findUnique({
    where: { code: skuCode.toUpperCase() },
  });
  return !!sku;
}
