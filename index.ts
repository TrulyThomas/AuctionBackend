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
      getItem: (_: any, { id }: { id: number }) => {
        return prisma.item.findUnique({ where: { id: id } })
      },
      allAuctions: () => {
        return prisma.auction.findMany()
      }
    },
    Mutation: {
      newItem: (_: any, { item }: { item: ItemInput }) => {
        return prisma.item.create({
          data: {
            name: item.name,
            text: item.text ? item.text : undefined,
            initialPrice: item.initialPrice ? item.initialPrice : undefined,
            quantity: item.quantity ? item.quantity : undefined
          }
        })
      }
    }
  }

  const typeDefs = await loadFiles('./schema.graphql')

  const schema = makeExecutableSchema({
    resolvers,
    typeDefs: typeDefs
  })

  var app = express()
  app.use(cors())
  app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true
    })
  )
  app.get('/image/:imageId', (req, res) => {
    return prisma.image.findUnique({
      where: { id: parseInt(req.params.imageId) }
    })
  })

  app.listen(4000)
  console.log('BIG vibe')
}

main().catch((e) => console.log(e))
