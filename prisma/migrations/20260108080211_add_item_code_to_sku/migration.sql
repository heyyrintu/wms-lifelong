-- AlterTable
ALTER TABLE "skus" ADD COLUMN     "itemCode" VARCHAR(100);

-- CreateIndex
CREATE INDEX "skus_itemCode_idx" ON "skus"("itemCode");
