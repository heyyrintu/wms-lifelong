import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const skuCode = searchParams.get("sku");
    const locationCode = searchParams.get("location");
    const userFilter = searchParams.get("user");

    // Build where clause (same as main logs route)
    const where: {
      action?: "PUTAWAY" | "MOVE" | "ADJUST";
      sku?: { code: { contains: string; mode: "insensitive" } };
      user?: string;
      OR?: Array<{
        fromLocation?: { code: { contains: string; mode: "insensitive" } };
        toLocation?: { code: { contains: string; mode: "insensitive" } };
      }>;
    } = {};

    if (action && ["PUTAWAY", "MOVE", "ADJUST"].includes(action)) {
      where.action = action as "PUTAWAY" | "MOVE" | "ADJUST";
    }

    if (skuCode) {
      where.sku = { code: { contains: skuCode.toUpperCase(), mode: "insensitive" } };
    }

    if (userFilter) {
      where.user = userFilter;
    }

    if (locationCode) {
      where.OR = [
        { fromLocation: { code: { contains: locationCode.toUpperCase(), mode: "insensitive" } } },
        { toLocation: { code: { contains: locationCode.toUpperCase(), mode: "insensitive" } } },
      ];
    }

    // Get all logs matching the filter
    const logs = await prisma.movementLog.findMany({
      where,
      include: {
        sku: true,
        fromLocation: true,
        toLocation: true,
      },
    });

    // Calculate statistics
    const uniqueLocations = new Set<string>();
    const uniqueSKUs = new Set<string>();
    const uniqueEANs = new Set<string>();
    let totalQuantity = 0;

    logs.forEach((log) => {
      // Add locations
      if (log.fromLocation) uniqueLocations.add(log.fromLocation.code);
      if (log.toLocation) uniqueLocations.add(log.toLocation.code);
      
      // Add SKU item code
      if (log.sku.itemCode) uniqueSKUs.add(log.sku.itemCode);
      
      // Add EAN code
      uniqueEANs.add(log.sku.code);
      
      // Sum quantities
      totalQuantity += log.qty;
    });

    return NextResponse.json({
      totalLocations: uniqueLocations.size,
      totalSKUs: uniqueSKUs.size,
      totalEANs: uniqueEANs.size,
      totalQuantity,
    });
  } catch (error) {
    console.error("Get logs stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
