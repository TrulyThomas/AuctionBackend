import express from 'express'
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { Account, Item, ItemInput } from './gql-types'
import jwt from 'jsonwebtoken'
var { graphqlHTTP } = require('express-graphql')
var { makeExecutableSchema } = require('@graphql-tools/schema')
const { loadFiles } = require('@graphql-tools/load-files')
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser')
const cors = require('cors')
require('dotenv').config()

const main = async () => {
   const prisma = new PrismaClient()

   const resolvers = {
      Query: {
         allItems: () => {
            return prisma.item.findMany()
         },
         getItem: async (_: any, { id }: { id: number }) => {
            let item = await prisma.item.findUnique({
               where: { id: id },
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
            return {
               ...item,
               images: item?.images
            } as Item
         },
         allAuctions: async () => {
            return prisma.auction.findMany()
         },
         login: async (_: any, { email, password }: { email: string; password: string }) => {
            const account = await prisma.account.findMany({
               where: { email: email },
               select: {
                  id: true,
                  username: true,
                  email: true,
                  createdDate: true,
                  password: true,
                  role: true
               }
            })

            if (account.length == 0) throw new Error('No account found')
            if (account.length > 1) throw new Error('Multiple accounts found')

            if (!bcrypt.compare(password, account[0].password)) throw new Error('Wrong password')

            const user = {
               email: account[0].email,
               id: account[0].id,
               role: account[0].role
            }

            const returnAccount = {
               createdDate: account[0].createdDate.toString(),
               email: account[0].email,
               id: account[0].id,
               username: account[0].username
            } as Account

            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '12h' })
            return { token: accessToken, account: returnAccount, expiresInDays: 0.5 }
         }
      },
      Mutation: {
         newItem: async (_: any, { item }: { item: ItemInput }, { user }: { user: any }) => {
            console.log(user)

            if (user.role != 'seller') throw new Error('Not authorized')

            const newItem = await prisma.item.upsert({
               where: { id: item.id ?? 0 },
               update: {
                  name: item.name,
                  text: item.text ? item.text : undefined,
                  initialPrice: item.initialPrice ? item.initialPrice : undefined,
                  quantity: item.quantity ? item.quantity : undefined
               },
               create: {
                  name: item.name,
                  text: item.text ?? undefined,
                  initialPrice: item.initialPrice ?? undefined,
                  quantity: item.quantity ?? undefined
               }
            })

            let itemImages = await prisma.image.findMany({
               where: { itemId: newItem.id },
               select: { id: true }
            })

            const imageIds = item.images?.filter((i) => i?.id).map((image) => image?.id!)
            if (!imageIds) return

            itemImages
               .filter((i) => !imageIds.includes(i.id))
               .forEach(async (i) => {
                  await prisma.image.delete({ where: { id: i.id } })
               })

            let i = 0
            for (const image of item.images ?? []) {
               await prisma.image.upsert({
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
         },
         signup: async (_: any, { username, password, email }: { username: string; password: string; email: string }) => {
            if (username == '' || password == '' || email == '') throw new Error('Missing fields')

            const account = await prisma.account.create({
               data: {
                  username: username,
                  email: email,
                  password: await bcrypt.hash(password, 10)
               }
            })

            return account
         }
      }
   }

   const typeDefs = await loadFiles('./schema.graphql')

   const schema = makeExecutableSchema({
      resolvers,
      typeDefs: typeDefs
   })

   const loggingMiddleware = (req: any, res: any, next: () => void) => {
      console.log(req.cookies['accessToken'])

      const accessToken = req.cookies['accessToken'] ?? null
      if (accessToken) {
         jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
            if (err) return res.sendStatus(403)
            req.user = user
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
   app.use(loggingMiddleware)
   app.use(cors(corsOptions))

   app.use(
      '/graphql',
      graphqlHTTP((req: any) => ({
         schema,
         graphiql: true,
         context: {
            user: req.user, // Access user through req.user
            cookies: req.cookies // Access cookies through req.cookies
         }
      }))
   )

   app.listen(4000)
   console.log('BIG vibe')
}

main().catch((e) => console.log(e))
