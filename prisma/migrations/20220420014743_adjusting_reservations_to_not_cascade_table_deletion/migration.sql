-- DropForeignKey
ALTER TABLE "Reservations" DROP CONSTRAINT "Reservations_tableId_fkey";

-- AddForeignKey
ALTER TABLE "Reservations" ADD CONSTRAINT "Reservations_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
