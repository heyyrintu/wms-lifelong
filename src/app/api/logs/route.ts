import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { MovementRecord } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      parseInt(searchParams.get("limit") ?? "50", 10),
      200
    );
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const action = searchParams.get("action");
    const skuCode = searchParams.get("sku");
    const locationCode = searchParams.get("location");

    // Build where clause
    const where: {
      action?: "PUTAWAY" | "MOVE" | "ADJUST";
      sku?: { code: { contains: string; mode: "insensitive" } };
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

    if (locationCode) {
      where.OR = [
        { fromLocation: { code: { contains: locationCode.toUpperCase(), mode: "insensitive" } } },
        { toLocation: { code: { contains: locationCode.toUpperCase(), mode: "insensitive" } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.movementLog.findMany({
        where,
        include: {
          sku: true,
          fromLocation: true,
          toLocation: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.movementLog.count({ where }),
    ]);

    const records: MovementRecord[] = logs.map((log) => ({
      id: log.id,
      action: log.action,
      skuCode: log.sku.code,
      itemCode: log.sku.itemCode,
      skuName: log.sku.name,
      fromLocationCode: log.fromLocation?.code ?? null,
      toLocationCode: log.toLocation?.code ?? null,
      qty: log.qty,
      user: log.user,
      handlerName: log.handlerName,
      note: log.note,
      createdAt: log.createdAt,
    }));

    return NextResponse.json({
      data: records,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Get movement logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movement logs" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("id");

    if (!logId) {
      return NextResponse.json(
        { error: "Log ID is required" },
        { status: 400 }
      );
    }

    // Delete the log entry
    await prisma.movementLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete movement log error:", error);
    return NextResponse.json(
      { error: "Failed to delete movement log" },
      { status: 500 }
    );
  }
}
