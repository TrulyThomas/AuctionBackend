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
         allAuctions: () => {
            return prisma.auction.findMany()
         }
      },
      Mutation: {
         newItem: async (_: any, { item }: { item: ItemInput }) => {
            const newItem = await prisma.item.upsert({
               where: { id: item.id ?? 0 },
               update: {
                  name: item.name,
                  text: item.text ? item.text : undefined,
                  initialPrice: item.initialPrice
                     ? item.initialPrice
                     : undefined,
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

            console.log(itemImages)

            const imageIds = item.images
               ?.filter((i) => i?.id)
               .map((image) => image?.id!)
            if (!imageIds) return

            itemImages
               .filter((i) => !imageIds.includes(i.id))
               .forEach(async (i) => {
                  console.log(i.id)
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
