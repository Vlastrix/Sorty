import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prisma = new PrismaClient()

async function resetDatabase() {
  try {
    console.log('Limpiando base de datos...')
    
    // Eliminar todos los datos en orden (respetando dependencias)
    await prisma.assetMovement.deleteMany({})
    console.log('Movimientos eliminados')
    
    await prisma.maintenance.deleteMany({})
    console.log('Registros de mantenimiento eliminados')
    
    await prisma.incident.deleteMany({})
    console.log('Incidencias eliminadas')
    
    await prisma.assetAssignment.deleteMany({})
    console.log('Asignaciones eliminadas')
    
    await prisma.asset.deleteMany({})
    console.log('Activos eliminados')
    
    await prisma.category.deleteMany({})
    console.log('Categorías eliminadas')
    
    await prisma.user.deleteMany({})
    console.log('Usuarios eliminados')
    
    console.log('\nBase de datos limpiada exitosamente\n')
    
    // Ahora ejecutar los seeds en orden
    console.log('Comenzando a sembrar datos...\n')
    
    const scriptsPath = __dirname
    
    // 1. Usuarios (primero porque son necesarios para asignaciones)
    console.log('Creando usuarios...')
    execSync(`node "${join(scriptsPath, 'seedUsers.js')}"`, { stdio: 'inherit' })
    
    // 2. Categorías (necesarias para activos)
    console.log('\nCreando categorías...')
    execSync(`node "${join(scriptsPath, 'seedCategories.js')}"`, { stdio: 'inherit' })
    
    // 3. Activos (necesarios para todo lo demás)
    console.log('\nCreando activos...')
    execSync(`node "${join(scriptsPath, 'seedAssets.js')}"`, { stdio: 'inherit' })
    
    // 4. Asignaciones
    console.log('\nCreando asignaciones...')
    execSync(`node "${join(scriptsPath, 'seedAssignments.js')}"`, { stdio: 'inherit' })
    
    // 5. Incidencias
    console.log('\nCreando incidencias...')
    execSync(`node "${join(scriptsPath, 'seedIncidents.js')}"`, { stdio: 'inherit' })
    
    // 6. Mantenimientos
    console.log('\nCreando registros de mantenimiento...')
    execSync(`node "${join(scriptsPath, 'seedMaintenance.js')}"`, { stdio: 'inherit' })
    
    // 7. Movimientos
    console.log('\nCreando movimientos...')
    execSync(`node "${join(scriptsPath, 'seedMovements.js')}"`, { stdio: 'inherit' })
    
    console.log('\n\n¡Base de datos recreada exitosamente!')
    console.log('Todos los datos de prueba han sido generados\n')
    
  } catch (error) {
    console.error('Error al resetear la base de datos:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar el reset
resetDatabase()
