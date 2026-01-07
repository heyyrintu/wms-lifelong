import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const locationCode = code.toUpperCase();

    const location = await prisma.location.findUnique({
      where: { code: locationCode },
      include: {
        inventory: {
          where: { qty: { gt: 0 } },
          include: { sku: true },
          orderBy: { sku: { code: "asc" } },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: `Location "${locationCode}" not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        id: location.id,
        code: location.code,
        items: location.inventory.map((inv) => ({
          skuId: inv.sku.id,
          skuCode: inv.sku.code,
          skuName: inv.sku.name,
          qty: inv.qty,
        })),
        totalItems: location.inventory.length,
        totalQty: location.inventory.reduce((sum, inv) => sum + inv.qty, 0),
      },
    });
  } catch (error) {
    console.error("Get location inventory error:", error);
    return NextResponse.json(
      { error: "Failed to fetch location inventory" },
      { status: 500 }
    );
  }
}
