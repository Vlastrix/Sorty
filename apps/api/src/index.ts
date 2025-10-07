import Fastify from 'fastify'
import cors from '@fastify/cors'
import { PrismaClient } from '@prisma/client'

const app = Fastify()
await app.register(cors, { origin: true })

const prisma = new PrismaClient()

app.get('/health', async () => {
  return { ok: true }
})

app.get('/assets', async () => {
  const items = await prisma.asset.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
  const out = items.map(a => ({
    id: a.id, code: a.code, name: a.name, categoryName: a.category?.name ?? ''
  }))
  return { items: out }
})

app.post('/auth/login', async () => {
  return { token: 'dev' }
})

const port = Number(process.env.PORT || 4000)
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`API on http://localhost:${port}`)
})