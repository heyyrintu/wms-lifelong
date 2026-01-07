-- CreateEnum
CREATE TYPE "MovementAction" AS ENUM ('PUTAWAY', 'MOVE', 'ADJUST');

-- CreateTable
CREATE TABLE "locations" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skus" (
    "id" UUID NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255),
    "barcode" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "sku_id" UUID NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movement_logs" (
    "id" UUID NOT NULL,
    "action" "MovementAction" NOT NULL,
    "sku_id" UUID NOT NULL,
    "from_location_id" UUID,
    "to_location_id" UUID,
    "qty" INTEGER NOT NULL,
    "user" VARCHAR(100) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movement_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_code_key" ON "locations"("code");

-- CreateIndex
CREATE INDEX "locations_code_idx" ON "locations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "skus_code_key" ON "skus"("code");

-- CreateIndex
CREATE INDEX "skus_code_idx" ON "skus"("code");

-- CreateIndex
CREATE INDEX "skus_barcode_idx" ON "skus"("barcode");

-- CreateIndex
CREATE INDEX "inventory_location_id_idx" ON "inventory"("location_id");

-- CreateIndex
CREATE INDEX "inventory_sku_id_idx" ON "inventory"("sku_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_location_id_sku_id_key" ON "inventory"("location_id", "sku_id");

-- CreateIndex
CREATE INDEX "movement_logs_action_idx" ON "movement_logs"("action");

-- CreateIndex
CREATE INDEX "movement_logs_sku_id_idx" ON "movement_logs"("sku_id");

-- CreateIndex
CREATE INDEX "movement_logs_from_location_id_idx" ON "movement_logs"("from_location_id");

-- CreateIndex
CREATE INDEX "movement_logs_to_location_id_idx" ON "movement_logs"("to_location_id");

-- CreateIndex
CREATE INDEX "movement_logs_created_at_idx" ON "movement_logs"("created_at");

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_logs" ADD CONSTRAINT "movement_logs_sku_id_fkey" FOREIGN KEY ("sku_id") REFERENCES "skus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_logs" ADD CONSTRAINT "movement_logs_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movement_logs" ADD CONSTRAINT "movement_logs_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
