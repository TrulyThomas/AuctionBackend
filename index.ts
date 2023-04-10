import express from 'express'
import { PrismaClient } from '@prisma/client'
import { Item, ItemInput } from './gql-types'
var { graphqlHTTP } = require('express-graphql')
var { makeExecutableSchema } = require('@graphql-tools/schema')
const { loadFiles } = require('@graphql-tools/load-files')

const cors = require('cors')

type NewItem = {
   name: string
   text: string
}

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

                  Images: {
                     select: {
                        id: true
                     }
                  }
               }
            })
            return {
               ...item,
               images: item?.Images
            } as Item
         },
         allAuctions: () => {
            return prisma.auction.findMany()
         }
      },
      Mutation: {
         newItem: async (_: any, { item }: { item: ItemInput }) => {
            const newItem = await prisma.item.create({
               data: {
                  name: item.name,
                  text: item.text ? item.text : undefined,
                  initialPrice: item.initialPrice
                     ? item.initialPrice
                     : undefined,
                  quantity: item.quantity ? item.quantity : undefined
               }
            })

            let i = 0
            for (const image of item.images ?? []) {
               await prisma.image.create({
                  data: {
                     base64data: image!,
                     order: i++,
                     Item: { connect: { id: newItem.id } }
                  }
               })
            }

            return newItem
         }
      }
   }

   const typeDefs = await loadFiles('./schema.graphql')

   const schema = makeExecutableSchema({
      resolvers,
      typeDefs: typeDefs
   })

   var app = express()
   app.use(express.json({ limit: '50mb' }))
   app.use(cors())
   app.use(
      '/graphql',
      graphqlHTTP({
         schema: schema,
         graphiql: true
      })
   )
   app.get('/image/:imageId', async (req, res) => {
      res.type('image/png')
      let image = await prisma.image.findUnique({
         where: { id: parseInt(req.params.imageId) }
      })

      const imageBuffer = Buffer.from(image?.base64data!, 'base64')

      res.send(imageBuffer)
   })

   app.listen(4000)
   console.log('BIG vibe')
}

main().catch((e) => console.log(e))
