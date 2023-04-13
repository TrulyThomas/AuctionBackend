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
                        images: {
                            select: {
                                base64data: true,
                                order: true,
                                id: true
                            }
                        }
                    }
                });
                return Object.assign(Object.assign({}, item), { images: item === null || item === void 0 ? void 0 : item.images });
            }),
            allAuctions: () => {
                return prisma.auction.findMany();
            }
        },
        Mutation: {
            newItem: (_, { item }) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                const newItem = yield prisma.item.upsert({
                    where: { id: (_a = item.id) !== null && _a !== void 0 ? _a : 0 },
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
                        text: (_b = item.text) !== null && _b !== void 0 ? _b : undefined,
                        initialPrice: (_c = item.initialPrice) !== null && _c !== void 0 ? _c : undefined,
                        quantity: (_d = item.quantity) !== null && _d !== void 0 ? _d : undefined
                    }
                });
                let itemImages = yield prisma.image.findMany({
                    where: { itemId: newItem.id },
                    select: { id: true }
                });
                console.log(itemImages);
                const imageIds = (_e = item.images) === null || _e === void 0 ? void 0 : _e.filter((i) => i === null || i === void 0 ? void 0 : i.id).map((image) => image === null || image === void 0 ? void 0 : image.id);
                if (!imageIds)
                    return;
                itemImages
                    .filter((i) => !imageIds.includes(i.id))
                    .forEach((i) => __awaiter(void 0, void 0, void 0, function* () {
                    console.log(i.id);
                    yield prisma.image.delete({ where: { id: i.id } });
                }));
                let i = 0;
                for (const image of (_f = item.images) !== null && _f !== void 0 ? _f : []) {
                    yield prisma.image.upsert({
                        create: {
                            base64data: image === null || image === void 0 ? void 0 : image.base64data,
                            order: i++,
                            Item: { connect: { id: newItem.id } }
                        },
                        update: {
                            base64data: image === null || image === void 0 ? void 0 : image.base64data,
                            order: i++,
                            Item: { connect: { id: newItem.id } }
                        },
                        where: { id: (_g = image === null || image === void 0 ? void 0 : image.id) !== null && _g !== void 0 ? _g : 0 }
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
