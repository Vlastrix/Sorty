import { z } from 'zod'

export const AssetCreate = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional()
})