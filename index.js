"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
var { graphqlHTTP } = require('express-graphql');
var { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFiles } = require('@graphql-tools/load-files');
const cors = require('cors');
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const prisma = new client_1.PrismaClient();
    const resolvers = {
        Query: {
            allItems: () => {
                return prisma.item.findMany();
            },
            getItem: (_, { id }) => {
                return prisma.item.findUnique({ where: { id: id } });
            },
            allAuctions: () => {
                return prisma.auction.findMany();
            }
        },
        Mutation: {
            newItem: (_, input) => {
                return prisma.item.create({
                    data: { name: input.name }
                });
            }
        }
    };
    const typeDefs = yield loadFiles('./schema.graphql');
    const schema = makeExecutableSchema({
        resolvers,
        typeDefs: typeDefs
    });
    var app = (0, express_1.default)();
    app.use(cors());
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        graphiql: true
    }));
    app.get('/image/:imageId', (req, res) => {
        return prisma.image.findUnique({
            where: { id: parseInt(req.params.imageId) }
        });
    });
    app.listen(4000);
    console.log('BIG vibe');
});
main().catch((e) => console.log(e));
