/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[employee_id]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `employee_id` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
ADD COLUMN     "employee_id" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_employee_id_key" ON "Employee"("employee_id");
