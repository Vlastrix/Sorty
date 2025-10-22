import { PrismaClient, UserRole } from '@prisma/client'
import argon2 from 'argon2'

const prisma = new PrismaClient()

async function seedUsers() {
  console.log('👥 Creando usuarios de ejemplo...')

  try {
    // Limpiar usuarios existentes
    await prisma.user.deleteMany()
    console.log('🧹 Usuarios existentes eliminados')

    // Contraseña común para testing: "password123"
    const hashedPassword = await argon2.hash('password123')
    
    // Contraseña para el admin por defecto: "123456"
    const adminPassword = await argon2.hash('123456')

    // Crear usuarios con diferentes roles
    const users = [
      {
        email: 'vladi@gmail.com',
        name: 'Vladi - Administrador Principal',
        password: adminPassword,
        role: UserRole.ADMIN
      },
      {
        email: 'admin@sorty.com',
        name: 'Admin de Prueba',
        password: hashedPassword,
        role: UserRole.ADMIN
      },
      {
        email: 'inventario@sorty.com',
        name: 'Juan Pérez - Encargado de Inventario',
        password: hashedPassword,
        role: UserRole.INVENTORY_MANAGER
      },
      {
        email: 'responsable1@sorty.com',
        name: 'María García - Responsable',
        password: hashedPassword,
        role: UserRole.ASSET_RESPONSIBLE
      },
      {
        email: 'responsable2@sorty.com',
        name: 'Carlos López - Responsable',
        password: hashedPassword,
        role: UserRole.ASSET_RESPONSIBLE
      }
    ]

    console.log('📝 Creando usuarios...')

    for (const userData of users) {
      const user = await prisma.user.create({
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      })

      console.log(`  ✅ ${user.name} (${user.role}): ${user.email}`)
    }

    // Estadísticas
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    })

    console.log(`\n📊 Resumen de usuarios:`)
    console.log(`   Total: ${users.length}`)

    const roleLabels = {
      ADMIN: 'Administradores',
      INVENTORY_MANAGER: 'Encargados de Inventario',
      ASSET_RESPONSIBLE: 'Responsables de Activos'
    }

    usersByRole.forEach(stat => {
      console.log(`   ${roleLabels[stat.role]}: ${stat._count.role}`)
    })

    console.log(`\n🔐 Credenciales de acceso:`)
    console.log(`   vladi@gmail.com - Contraseña: "123456" (ADMIN PRINCIPAL)`)
    console.log(`   Resto de usuarios - Contraseña: "password123"`)
    console.log(`\n👤 Usuarios creados:`)
    users.forEach(user => {
      console.log(`   - ${user.email} (${roleLabels[user.role]})`)
    })

    console.log('\n✅ ¡Usuarios de ejemplo creados exitosamente!')
    console.log('💡 Puedes usar estas cuentas para testing del sistema de roles.')

  } catch (error) {
    console.error('❌ Error al crear usuarios:', error)
    console.error(error.message)
  } finally {
    await prisma.$disconnect()
  }
}

seedUsers()
