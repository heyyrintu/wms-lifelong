import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create sample locations
  const locations = [
    { code: "A1-R01-S01-B01" },
    { code: "A1-R01-S01-B02" },
    { code: "A1-R01-S02-B01" },
    { code: "A1-R02-S01-B01" },
    { code: "A2-R01-S01-B01" },
    { code: "B1-R01-S01-B01" },
    { code: "B1-R01-S01-B02" },
    { code: "B1-R02-S01-B01" },
    { code: "RECV-01" },
    { code: "RECV-02" },
    { code: "SHIP-01" },
    { code: "SHIP-02" },
  ];

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    });
  }
  console.log(`✅ Created ${locations.length} locations`);

  // Create sample SKUs
  const skus = [
    { code: "SKU-001", name: "Widget A", barcode: "1234567890123" },
    { code: "SKU-002", name: "Widget B", barcode: "1234567890124" },
    { code: "SKU-003", name: "Gadget X", barcode: "1234567890125" },
    { code: "SKU-004", name: "Gadget Y", barcode: "1234567890126" },
    { code: "SKU-005", name: "Component Alpha", barcode: "1234567890127" },
    { code: "SKU-006", name: "Component Beta", barcode: "1234567890128" },
    { code: "PART-100", name: "Spare Part 100", barcode: "2345678901234" },
    { code: "PART-101", name: "Spare Part 101", barcode: "2345678901235" },
    { code: "PART-102", name: "Spare Part 102", barcode: "2345678901236" },
    { code: "RAW-001", name: "Raw Material 001", barcode: "3456789012345" },
  ];

  for (const sku of skus) {
    await prisma.sku.upsert({
      where: { code: sku.code },
      update: {},
      create: sku,
    });
  }
  console.log(`✅ Created ${skus.length} SKUs`);

  // Create sample inventory
  const location1 = await prisma.location.findUnique({ where: { code: "A1-R01-S01-B01" } });
  const location2 = await prisma.location.findUnique({ where: { code: "A1-R01-S01-B02" } });
  const location3 = await prisma.location.findUnique({ where: { code: "B1-R01-S01-B01" } });
  
  const sku1 = await prisma.sku.findUnique({ where: { code: "SKU-001" } });
  const sku2 = await prisma.sku.findUnique({ where: { code: "SKU-002" } });
  const sku3 = await prisma.sku.findUnique({ where: { code: "SKU-003" } });

  if (location1 && location2 && location3 && sku1 && sku2 && sku3) {
    const inventoryData = [
      { locationId: location1.id, skuId: sku1.id, qty: 100 },
      { locationId: location1.id, skuId: sku2.id, qty: 50 },
      { locationId: location2.id, skuId: sku1.id, qty: 25 },
      { locationId: location2.id, skuId: sku3.id, qty: 75 },
      { locationId: location3.id, skuId: sku2.id, qty: 200 },
    ];

    for (const inv of inventoryData) {
      await prisma.inventory.upsert({
        where: {
          locationId_skuId: {
            locationId: inv.locationId,
            skuId: inv.skuId,
          },
        },
        update: { qty: inv.qty },
        create: inv,
      });
    }
    console.log(`✅ Created ${inventoryData.length} inventory records`);

    // Create sample movement logs
    await prisma.movementLog.createMany({
      data: [
        {
          action: "PUTAWAY",
          skuId: sku1.id,
          toLocationId: location1.id,
          qty: 100,
          user: "system",
          note: "Initial stock",
        },
        {
          action: "PUTAWAY",
          skuId: sku2.id,
          toLocationId: location1.id,
          qty: 50,
          user: "system",
          note: "Initial stock",
        },
        {
          action: "MOVE",
          skuId: sku1.id,
          fromLocationId: location1.id,
          toLocationId: location2.id,
          qty: 25,
          user: "system",
          note: "Stock redistribution",
        },
      ],
    });
    console.log("✅ Created sample movement logs");
  }

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
