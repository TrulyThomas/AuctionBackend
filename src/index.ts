import express from 'express'
import { PrismaClient } from '@prisma/client'
var { graphqlHTTP } = require('express-graphql')
import { initTRPC, inferAsyncReturnType } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { z } from 'zod'
import { itemRouter } from './routers/item'
import { createContext, router } from './trpcInit'
import { auctionRouter } from './routers/auction'
const cors = require('cors')
const appRouter = router({
   item: itemRouter,
   auction: auctionRouter
 });


var app = express()
app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use(
	'/api',
	trpcExpress.createExpressMiddleware({
		router: appRouter,
		createContext
	})
)

app.listen(4000)
console.log('Backend running...')
export type AppRouter = typeof appRouter;