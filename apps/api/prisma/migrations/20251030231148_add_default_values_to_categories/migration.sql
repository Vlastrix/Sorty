-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "defaultAcquisitionCost" DECIMAL(65,30),
ADD COLUMN     "defaultResidualValue" DECIMAL(65,30),
ADD COLUMN     "defaultUsefulLife" INTEGER;
