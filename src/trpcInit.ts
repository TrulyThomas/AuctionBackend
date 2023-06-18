import { initTRPC, inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
   let user = undefined

   if (req.cookies['accessToken']) {
      jwt.verify(req.cookies['accessToken'], process.env.ACCESS_TOKEN_SECRET!, (err: any, authUser: any) => {
         if (!err) user = authUser
      })
   }
   return {
      user
   }
}

type Context = inferAsyncReturnType<typeof createContext>
const t = initTRPC.context<Context>().create()

export const prismaClient = new PrismaClient()
export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure
