var express = require('express')
import { PrismaClient } from '@prisma/client'
var { graphqlHTTP } = require('express-graphql')
var { makeExecutableSchema } = require('@graphql-tools/schema')
const cors = require('cors')

const prisma = new PrismaClient()

const typeDefs = `
  type Item {
    id: Int
    initialPrice: Float
    quantity: Int
    name: String
    text: String
  }

  type Query {
    allItems: [Item!]!
  }
`

const resolvers = {
  Query: {
    allItems: () => {
      return prisma.item.findMany()
    }
  }
}

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs
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

app.listen(4000)
console.log('BIG vibe')
