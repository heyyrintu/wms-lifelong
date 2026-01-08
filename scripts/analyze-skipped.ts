import * as XLSX from "xlsx";
import * as path from "path";

async function analyzeSkipped() {
  try {
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
    
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Total rows: ${data.length}\n`);
    
    let missingEAN = 0;
    let missingItemCode = 0;
    let missingBoth = 0;
    let emptyRows = 0;
    
    const samples: Record<string, unknown>[] = [];
    
    for (const row of data as Record<string, unknown>[]) {
      const itemCode = row["Item Code"]?.toString().trim();
      const ean = row["EAN"]?.toString().trim();
      
      if (!ean && !itemCode) {
        missingBoth++;
        if (samples.length < 5) {
          samples.push({ reason: "Missing both", row });
        }
      } else if (!ean) {
        missingEAN++;
        if (samples.length < 5) {
          samples.push({ reason: "Missing EAN", itemCode, row });
        }
      } else if (!itemCode) {
        missingItemCode++;
        if (samples.length < 5) {
          samples.push({ reason: "Missing Item Code", ean, row });
        }
      }
      
      // Check if row is completely empty
      const values = Object.values(row).filter(v => v != null && v.toString().trim() !== "");
      if (values.length === 0) {
        emptyRows++;
      }
    }
    
    console.log("📊 Skip Analysis:");
    console.log(`   Missing EAN only: ${missingEAN}`);
    console.log(`   Missing Item Code only: ${missingItemCode}`);
    console.log(`   Missing both: ${missingBoth}`);
    console.log(`   Empty rows: ${emptyRows}`);
    console.log(`   Total would skip: ${missingEAN + missingItemCode + missingBoth}\n`);
    
    if (samples.length > 0) {
      console.log("📋 Sample skipped rows:");
      samples.forEach((sample, i) => {
        console.log(`\n${i + 1}. ${sample.reason}`);
        console.log(`   Data:`, JSON.stringify(sample.row, null, 2).slice(0, 200));
      });
    }
  } catch (error) {
    console.error("Analysis failed:", error);
  }
}

analyzeSkipped();
