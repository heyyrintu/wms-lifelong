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
          code: {
            contains: search,
            mode: "insensitive" as const,
          },
        }
      : {};

    const locations = await prisma.location.findMany({
      where,
      orderBy: { code: "asc" },
      take: limit,
      select: {
        id: true,
        code: true,
        _count: {
          select: {
            inventory: {
              where: { qty: { gt: 0 } },
            },
          },
        },
      },
    });

    return NextResponse.json({
      data: locations.map((loc) => ({
        id: loc.id,
        code: loc.code,
        skuCount: loc._count.inventory,
      })),
    });
  } catch (error) {
    console.error("Get locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
