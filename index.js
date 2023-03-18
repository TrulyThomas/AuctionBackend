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
    id: Int
    initialPrice: Float
    quantity: Int
    name: String
    text: String
  }

  type Query {
    allItems: [Item!]!
  }
`;
const resolvers = {
    Query: {
        allItems: () => {
            return prisma.item.findMany();
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
