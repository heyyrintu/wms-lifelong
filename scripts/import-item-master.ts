import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import * as path from "path";

const prisma = new PrismaClient();

async function importItemMaster() {
  try {
    // Read the Excel file
    const filePath = path.join(process.cwd(), "Item Master (1).xlsx");
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in workbook");
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("Worksheet not found");
    }
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${data.length} rows in Excel file`);
    
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
    
    console.log("\n✅ Import completed!");
    console.log(`   Imported: ${imported}`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

importItemMaster();
