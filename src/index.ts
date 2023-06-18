import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'
import { itemRouter } from './routers/item'
import { createContext, router } from './trpcInit'
import { auctionRouter } from './routers/auction'
import { userRouter } from './routers/user'
import jwt from 'jsonwebtoken'
const cookieParser = require('cookie-parser')

const cors = require('cors')

const appRouter = router({
   item: itemRouter,
   auction: auctionRouter,
   user: userRouter
})

const loggingMiddleware = (req: any, res: any, next: () => void) => {
   const accessToken = req.cookies['accessToken'] ?? null
   if (accessToken) {
      jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
         if (!err) req.user = user
      })
   }

   next()
}

var corsOptions = {
   origin: 'http://localhost:3000',
   credentials: true
}

var app = express()
app.use(cookieParser())

app.use(express.json({ limit: '50mb' }))
app.use(cors())
app.use(loggingMiddleware)
app.use(
   '/api',
   trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext
   })
)

app.listen(4000)
console.log('Backend running..!')
export type AppRouter = typeof appRouter
