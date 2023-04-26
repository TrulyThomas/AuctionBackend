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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var { graphqlHTTP } = require('express-graphql');
var { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadFiles } = require('@graphql-tools/load-files');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
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
            allAuctions: () => __awaiter(void 0, void 0, void 0, function* () {
                return prisma.auction.findMany();
            }),
            login: (_, { email, password }) => __awaiter(void 0, void 0, void 0, function* () {
                const account = yield prisma.account.findMany({
                    where: { email: email },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        createdDate: true,
                        password: true,
                        role: true
                    }
                });
                if (account.length == 0)
                    throw new Error('No account found');
                if (account.length > 1)
                    throw new Error('Multiple accounts found');
                if (!bcrypt.compare(password, account[0].password))
                    throw new Error('Wrong password');
                const user = {
                    email: account[0].email,
                    id: account[0].id,
                    role: account[0].role
                };
                const returnAccount = {
                    createdDate: account[0].createdDate.toString(),
                    email: account[0].email,
                    id: account[0].id,
                    username: account[0].username
                };
                const accessToken = jsonwebtoken_1.default.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '12h' });
                return { token: accessToken, account: returnAccount, expiresInDays: 0.5 };
            })
        },
        Mutation: {
            newItem: (_, { item }, { user }) => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g;
                console.log(user);
                if (user.role != 'seller')
                    throw new Error('Not authorized');
                const newItem = yield prisma.item.upsert({
                    where: { id: (_a = item.id) !== null && _a !== void 0 ? _a : 0 },
                    update: {
                        name: item.name,
                        text: item.text ? item.text : undefined,
                        initialPrice: item.initialPrice ? item.initialPrice : undefined,
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
                const imageIds = (_e = item.images) === null || _e === void 0 ? void 0 : _e.filter((i) => i === null || i === void 0 ? void 0 : i.id).map((image) => image === null || image === void 0 ? void 0 : image.id);
                if (!imageIds)
                    return;
                itemImages
                    .filter((i) => !imageIds.includes(i.id))
                    .forEach((i) => __awaiter(void 0, void 0, void 0, function* () {
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
            }),
            signup: (_, { username, password, email }) => __awaiter(void 0, void 0, void 0, function* () {
                if (username == '' || password == '' || email == '')
                    throw new Error('Missing fields');
                const account = yield prisma.account.create({
                    data: {
                        username: username,
                        email: email,
                        password: yield bcrypt.hash(password, 10)
                    }
                });
                return account;
            })
        }
    };
    const typeDefs = yield loadFiles('./schema.graphql');
    const schema = makeExecutableSchema({
        resolvers,
        typeDefs: typeDefs
    });
    const loggingMiddleware = (req, res, next) => {
        var _a;
        console.log(req.cookies['accessToken']);
        const accessToken = (_a = req.cookies['accessToken']) !== null && _a !== void 0 ? _a : null;
        if (accessToken) {
            jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
                if (err)
                    return res.sendStatus(403);
                req.user = user;
            });
        }
        next();
    };
    var corsOptions = {
        origin: 'http://localhost:3000',
        credentials: true
    };
    var app = (0, express_1.default)();
    app.use(cookieParser());
    app.use(express_1.default.json({ limit: '50mb' }));
    app.use(loggingMiddleware);
    app.use(cors(corsOptions));
    app.use('/graphql', graphqlHTTP((req) => ({
        schema,
        graphiql: true,
        context: {
            user: req.user,
            cookies: req.cookies // Access cookies through req.cookies
        }
    })));
    app.listen(4000);
    console.log('BIG vibe');
});
main().catch((e) => console.log(e));
