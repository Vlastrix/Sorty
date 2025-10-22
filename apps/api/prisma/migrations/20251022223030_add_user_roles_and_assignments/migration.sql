-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INVENTORY_MANAGER', 'ASSET_RESPONSIBLE');

-- Crear nueva tabla users con el nuevo esquema
CREATE TABLE "users_new" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'ASSET_RESPONSIBLE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_new_pkey" PRIMARY KEY ("id")
);

-- Crear índice único en email
CREATE UNIQUE INDEX "users_new_email_key" ON "users_new"("email");

-- Copiar datos de User a users_new (si existe tabla User)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'User') THEN
    INSERT INTO "users_new" ("id", "email", "password", "role", "createdAt", "updatedAt")
    SELECT "id", "email", "password", 
      CASE 
        WHEN "role" = 'admin' THEN 'ADMIN'::"UserRole"
        ELSE 'ASSET_RESPONSIBLE'::"UserRole"
      END,
      "createdAt", "updatedAt"
    FROM "User";
    
    -- Eliminar tabla antigua
    DROP TABLE "User" CASCADE;
  END IF;
END $$;

-- Renombrar users_new a users
ALTER TABLE "users_new" RENAME TO "users";

-- AlterTable assets - agregar columnas de asignación
ALTER TABLE "assets" ADD COLUMN "assignedToId" TEXT;
ALTER TABLE "assets" ADD COLUMN "assignedAt" TIMESTAMP(3);

-- AddForeignKey para asignación de activos
ALTER TABLE "assets" ADD CONSTRAINT "assets_assignedToId_fkey" 
FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Actualizar constraint de createdBy si es necesario
DO $$ 
BEGIN
  -- Eliminar constraint vieja si existe
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
             WHERE constraint_name = 'assets_createdById_fkey') THEN
    ALTER TABLE "assets" DROP CONSTRAINT "assets_createdById_fkey";
  END IF;
  
  -- Crear nueva constraint
  ALTER TABLE "assets" ADD CONSTRAINT "assets_createdById_fkey" 
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
END $$;


