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
            getItem: (_, { id }) => __awaiter(void 0, void 0, void 0, function* () {
                let item = yield prisma.item.findUnique({
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
                });
                return Object.assign(Object.assign({}, item), { images: item === null || item === void 0 ? void 0 : item.Images });
            }),
            allAuctions: () => {
                return prisma.auction.findMany();
            }
        },
        Mutation: {
            newItem: (_, { item }) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const newItem = yield prisma.item.create({
                    data: {
                        name: item.name,
                        text: item.text ? item.text : undefined,
                        initialPrice: item.initialPrice
                            ? item.initialPrice
                            : undefined,
                        quantity: item.quantity ? item.quantity : undefined
                    }
                });
                let i = 0;
                for (const image of (_a = item.images) !== null && _a !== void 0 ? _a : []) {
                    yield prisma.image.create({
                        data: {
                            base64data: image,
                            order: i++,
                            Item: { connect: { id: newItem.id } }
                        }
                    });
                }
                return newItem;
            })
        }
    };
    const typeDefs = yield loadFiles('./schema.graphql');
    const schema = makeExecutableSchema({
        resolvers,
        typeDefs: typeDefs
    });
    var app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: '50mb' }));
    app.use(cors());
    app.use('/graphql', graphqlHTTP({
        schema: schema,
        graphiql: true
    }));
    app.get('/image/:imageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        res.type('image/png');
        let image = yield prisma.image.findUnique({
            where: { id: parseInt(req.params.imageId) }
        });
        const imageBuffer = Buffer.from(image === null || image === void 0 ? void 0 : image.base64data, 'base64');
        res.send(imageBuffer);
    }));
    app.listen(4000);
    console.log('BIG vibe');
});
main().catch((e) => console.log(e));
