import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Starting database cleanup (keeping SKUs)...\n');

  try {
    // Delete in order (respecting foreign key constraints)
    console.log('Deleting movement logs...');
    const logs = await prisma.movementLog.deleteMany({});
    console.log(`✓ Deleted ${logs.count} movement logs`);

    console.log('Deleting inventory records...');
    const inventory = await prisma.inventory.deleteMany({});
    console.log(`✓ Deleted ${inventory.count} inventory records`);

    console.log('Deleting locations...');
    const locations = await prisma.location.deleteMany({});
    console.log(`✓ Deleted ${locations.count} locations`);

    console.log('✓ Keeping SKUs intact');

    console.log('\n✅ Database cleared successfully (SKUs preserved)!');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
