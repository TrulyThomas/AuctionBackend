"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
var express = require('express');
const client_1 = require("@prisma/client");
var { graphqlHTTP } = require('express-graphql');
var { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const prisma = new client_1.PrismaClient();
const typeDefs = `
  type Item {
    id: Int!
    initialPrice: Float!
    quantity: Int!
    name: String
    text: String
  }

  type Account {
    id: Int!
    userName: String!
    email: String!
    createdDate: String!
    credits: String!
  }

  type Auction{
    id: Int!
    createdDate: String!
    startDate: String!
    endDate: String!
    extendedTime: Float!
    startingPrice: Float!
    winner: Account
    items: [Item!]!
    bids: [Bid]
    closed: Boolean!
  }

  type Bid{
    id: Int!
    auction: Auction!
    bid: Float!
  }

  type Query {
    allItems: [Item!]!
    getItem: Item!

    allAuctions: [Auction!]
  }
`;
const resolvers = {
    Query: {
        allItems: () => {
            return prisma.item.findMany();
        },
        getItem: (id) => {
            return prisma.item.findUnique({ where: { id: id } });
        }
    }
};
exports.schema = makeExecutableSchema({
    resolvers,
    typeDefs
});
var app = express();
app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: exports.schema,
    graphiql: true
}));
app.listen(4000);
console.log('BIG vibe');
