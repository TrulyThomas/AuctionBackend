import { router, publicProcedure, prismaClient } from '../trpcInit'
import { z } from 'zod'
import { zImage } from '../models/zod'
import { Roles } from '../models/types'
import { TRPCError } from '@trpc/server'

export const itemRouter = router({
   getAll: publicProcedure.query(async () => {
      let items = await prismaClient.item.findMany({
         where: { isPublished: true },
         select: {
            id: true,
            name: true,
            text: true,
            initialPrice: true,
            quantity: true,
            images: {
               select: {
                  base64data: true,
                  order: true,
                  id: true
               }
            }
         }
      })

      return items
   }),
   get: publicProcedure.input(z.object({ id: z.number() })).query(async (opts) => {
      let item = await prismaClient.item.findUnique({
         where: { id: opts.input.id },
         select: {
            id: true,
            name: true,
            text: true,
            initialPrice: true,
            quantity: true,
            isPublished: true,
            images: {
               select: {
                  base64data: true,
                  order: true,
                  id: true
               }
            },
            accountId: true
         }
      })

      let authorized = false
      if (opts.ctx.user?.id) authorized = item?.accountId == opts.ctx.user?.id
      if (opts.ctx.user?.role == Roles.Admin) authorized = true

      if (item?.isPublished == false && !authorized) throw new TRPCError({ code: 'UNAUTHORIZED' })

      return item
   }),
   putItem: publicProcedure
      .input(
         z.object({
            id: z.number(),
            name: z.string(),
            text: z.string(),
            initialPrice: z.number(),
            quantity: z.number(),
            images: z.array(zImage),
            isPublished: z.boolean()
         })
      )
      .mutation(async (opts) => {
         if (opts.ctx.user?.role && ![Roles.Admin, Roles.Artisan].includes(opts.ctx.user?.role)) throw new Error('Not authorized')

         const item = opts.input
         let checkItem = await prismaClient.item.findUnique({
            where: { id: opts.input.id },
            select: {
               accountId: true
            }
         })

         if (checkItem?.accountId != opts.ctx.user?.id) throw new Error('Not authorized to edit this item')

         const newItem = await prismaClient.item.upsert({
            where: { id: item.id ?? 0 },
            update: {
               name: item.name,
               text: item.text ? item.text : undefined,
               initialPrice: item.initialPrice ? item.initialPrice : undefined,
               quantity: item.quantity ? item.quantity : undefined,
               isPublished: item.isPublished ? item.isPublished : undefined
            },
            create: {
               name: item.name,
               text: item.text ?? undefined,
               initialPrice: item.initialPrice ?? undefined,
               quantity: item.quantity ?? undefined,
               Account: { connect: { id: opts.ctx.user?.id } },
               isPublished: item.isPublished ?? undefined
            }
         })

         let itemImages = await prismaClient.image.findMany({
            where: { itemId: newItem.id },
            select: { id: true }
         })

         const imageIds = item.images?.filter((i) => i?.id).map((image) => image?.id!)
         if (!imageIds) return

         itemImages
            .filter((i) => !imageIds.includes(i.id))
            .forEach(async (i) => {
               await prismaClient.image.delete({ where: { id: i.id } })
            })

         let i = 0
         for (const image of item.images ?? []) {
            await prismaClient.image.upsert({
               create: {
                  base64data: image?.base64data!,
                  order: i++,
                  Item: { connect: { id: newItem.id } }
               },
               update: {
                  base64data: image?.base64data!,
                  order: i++,
                  Item: { connect: { id: newItem.id } }
               },
               where: { id: image?.id ?? 0 }
            })
         }
         return newItem
      })
})
