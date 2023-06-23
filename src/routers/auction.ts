import { Item } from '@prisma/client'
import { router, publicProcedure, prismaClient } from '../trpcInit'
import { z } from 'zod'

export const auctionRouter = router({
   getAll: publicProcedure.query(() => {
      return prismaClient.auction.findMany()
   })
})
