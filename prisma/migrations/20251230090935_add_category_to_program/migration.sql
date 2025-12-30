-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "category_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
