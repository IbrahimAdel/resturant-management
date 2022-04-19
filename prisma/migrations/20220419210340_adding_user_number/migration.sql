/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId,number]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "number" VARCHAR(4) NOT NULL DEFAULT E'0000';

-- CreateIndex
CREATE UNIQUE INDEX "Users_restaurantId_number_key" ON "Users"("restaurantId", "number");
