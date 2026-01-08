import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Read the Excel file
    const filePath = path.join(process.cwd(), "Item Master (1).xlsx");
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Item Master (1).xlsx not found in project root" },
        { status: 404 }
      );
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: "No sheets found in workbook" },
        { status: 400 }
      );
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      return NextResponse.json(
        { error: "Worksheet not found" },
        { status: 400 }
      );
    }
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    
    for (const row of data as Record<string, unknown>[]) {
      const itemCode = String(row["Item Code"] ?? "").trim();
      const ean = String(row["EAN"] ?? "").trim();
      const itemName = String(row["Item Name"] ?? "").trim();
      const details = String(row["Details"] ?? row["Item Details"] ?? "").trim();
      
      // Skip rows without EAN or Item Code
      if (!ean || !itemCode) {
        skipped++;
        continue;
      }
      
      try {
        // Upsert SKU with EAN as code and itemCode mapping
        const sku = await prisma.sku.upsert({
          where: { code: ean.toUpperCase() },
          update: {
            itemCode: itemCode.toUpperCase(),
            name: itemName || null,
            details: details || null,
          },
          create: {
            code: ean.toUpperCase(),
            itemCode: itemCode.toUpperCase(),
            name: itemName || null,
            details: details || null,
          },
        });
        
        if (sku.createdAt.getTime() === sku.updatedAt.getTime()) {
          imported++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error(`Error processing row:`, { itemCode, ean, error });
        skipped++;
      }
    }
    
    await prisma.$disconnect();

    return NextResponse.json({
      success: true,
      imported,
      updated,
      skipped,
      total: data.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      { error: "Failed to import Item Master data" },
      { status: 500 }
    );
  }
}
