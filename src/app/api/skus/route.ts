import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toUpperCase();
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "20", 10),
      100
    );

    const where = search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" as const } },
            { barcode: { contains: search, mode: "insensitive" as const } },
            { name: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const skus = await prisma.sku.findMany({
      where,
      orderBy: { code: "asc" },
      take: limit,
      select: {
        id: true,
        code: true,
        name: true,
        barcode: true,
        inventory: {
          where: { qty: { gt: 0 } },
          select: { qty: true },
        },
      },
    });

    return NextResponse.json({
      data: skus.map((sku) => ({
        id: sku.id,
        code: sku.code,
        name: sku.name,
        barcode: sku.barcode,
        totalQty: sku.inventory.reduce((sum, inv) => sum + inv.qty, 0),
        locationCount: sku.inventory.length,
      })),
    });
  } catch (error) {
    console.error("Get SKUs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SKUs" },
      { status: 500 }
    );
  }
}
