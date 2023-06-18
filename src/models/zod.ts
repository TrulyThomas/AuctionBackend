import { z } from 'zod'

export const zItem = z.object({
	id: z.number()
})

export const zImage = z.object({
    id: z.number(),
    base64data: z.string(),
    order: z.number()
})
