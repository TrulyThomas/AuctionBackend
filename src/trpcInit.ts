import { initTRPC, inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { PrismaClient } from '@prisma/client'

const t = initTRPC.context<Context>().create()

export const createContext = ({
	req,
	res
}: trpcExpress.CreateExpressContextOptions) => ({}) // no context
type Context = inferAsyncReturnType<typeof createContext>
export const prismaClient = new PrismaClient()
export const middleware = t.middleware
export const router = t.router
export const publicProcedure = t.procedure
