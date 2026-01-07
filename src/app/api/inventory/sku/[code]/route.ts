import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const skuCode = code.toUpperCase();

    const sku = await prisma.sku.findUnique({
      where: { code: skuCode },
      include: {
        inventory: {
          where: { qty: { gt: 0 } },
          include: { location: true },
          orderBy: { location: { code: "asc" } },
        },
      },
    });

    if (!sku) {
      return NextResponse.json(
        { error: `SKU "${skuCode}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: sku.id,
        code: sku.code,
        name: sku.name,
        barcode: sku.barcode,
        locations: sku.inventory.map((inv) => ({
          locationId: inv.location.id,
          locationCode: inv.location.code,
          qty: inv.qty,
        })),
        totalLocations: sku.inventory.length,
        totalQty: sku.inventory.reduce((sum, inv) => sum + inv.qty, 0),
      },
    });
  } catch (error) {
    console.error("Get SKU inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SKU inventory" },
      { status: 500 }
    );
  }
}
