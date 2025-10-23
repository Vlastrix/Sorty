-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('ENTRADA', 'SALIDA');

-- CreateEnum
CREATE TYPE "MovementSubtype" AS ENUM ('COMPRA', 'DONACION_IN', 'TRANSFERENCIA_IN', 'BAJA', 'VENTA', 'DONACION_OUT', 'TRANSFERENCIA_OUT');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVO', 'CORRECTIVO');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('DANO', 'PERDIDA', 'ROBO', 'MAL_FUNCIONAMIENTO');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('REPORTED', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "asset_movements" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "MovementType" NOT NULL,
    "movementType" "MovementSubtype" NOT NULL,
    "description" TEXT NOT NULL,
    "cost" DECIMAL(65,30),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenances" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "cost" DECIMAL(65,30),
    "description" TEXT NOT NULL,
    "performedBy" TEXT,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedDate" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "status" "IncidentStatus" NOT NULL DEFAULT 'REPORTED',
    "resolution" TEXT,
    "cost" DECIMAL(65,30),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "asset_movements" ADD CONSTRAINT "asset_movements_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_movements" ADD CONSTRAINT "asset_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
