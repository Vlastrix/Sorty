# Sorty — Gestión de Inventarios y Activos

Sistema web para gestionar activos, inventario, categorías, asignaciones y reportes.  
Frontend en **React + Vite + TS**. Backend en **Node.js (Fastify) + Prisma**. Monorepo con **pnpm workspaces** y **Turborepo**.

## 🛠 Stack Tecnológico

- **Frontend**: React, Vite, TypeScript, React Router, TanStack Query, Tailwind (listo para habilitar)
- **Backend**: Fastify 5, Prisma, PostgreSQL
- **Monorepo**: pnpm v10, Turborepo 2.x
- **Dev Tools**: tsx, ESLint/Prettier (config compartible), .env por app

## 📁 Estructura del Proyecto

```
sorty/
├── apps/
│   ├── web/              # React + Vite + TS
│   └── api/              # Fastify + Prisma + TS
├── packages/
│   ├── validators/       # Esquemas Zod compartidos
│   └── config/          # (placeholder) config compartida
├── turbo.json
├── pnpm-workspace.yaml
└── README.md
```

## 📝 Requisitos

- **Node.js 20+**
- **pnpm 10+**
- **Git**
- **PostgreSQL**  **puerto 5501** 

---

## 🚀 Setup (Windows / PowerShell)

### 1) Clonar e instalar

```powershell
git clone [<sorty>](https://github.com/Vlastrix/sorty.git)
cd sorty
pnpm -w add -D turbo@2.5.8
pnpm install
```

Si pnpm avisa build scripts ignorados, apruébalos:

```powershell
pnpm approve-builds
pnpm -w rebuild -r
```

### 2) Variables de entorno

**apps/api/.env** (Postgres local en 5501):
```env
DATABASE_URL="postgresql://sorty:sorty@127.0.0.1:5501/sorty?schema=public"
JWT_SECRET=changeme
PORT=4000
```

**apps/web/.env**:
```env
VITE_API_URL=http://localhost:4000
```

### 3) Base de datos

Si ya tienes Postgres en 5501, crea la DB/usuario (conectado como postgres):

```sql
CREATE DATABASE sorty;
CREATE USER sorty WITH PASSWORD 'sorty' LOGIN;
GRANT ALL PRIVILEGES ON DATABASE sorty TO sorty;
GRANT ALL ON SCHEMA public TO sorty;
ALTER DATABASE sorty OWNER TO sorty;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO sorty;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO sorty;
```

Si Prisma pide shadow DB y el usuario no tiene CREATEDB:

```sql
ALTER ROLE sorty WITH CREATEDB;
```

> **Alternativa**: usar `SHADOW_DATABASE_URL` con el usuario postgres en `schema.prisma`.

### 4) Prisma (generar cliente y migraciones)

```powershell
cd apps\api
pnpm prisma:gen
pnpm prisma:migrate   # nombre sugerido: init
cd ..\..
```

### 5) Levantar dev (web + api)

```powershell
pnpm dev
```

### API
- `DATABASE_URL` (Postgres)
- `JWT_SECRET`
- `PORT` (default 4000)
- **Opcional**: `SHADOW_DATABASE_URL` (para Prisma migrate)

### WEB
- `VITE_API_URL`


