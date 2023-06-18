import { router, publicProcedure, prismaClient } from '../trpcInit'
import { z } from 'zod'
const bcrypt = require('bcrypt')
import jwt from 'jsonwebtoken'

export const userRouter = router({
   login: publicProcedure
      .input(
         z.object({
            email: z.string().email(),
            password: z.string()
         })
      )
      .query(async (opts) => {
         const account = await prismaClient.account.findMany({
            where: { email: opts.input.email },
            select: {
               id: true,
               username: true,
               email: true,
               createdDate: true,
               password: true,
               role: true,
               banned: true
            }
         })
         if (account.length == 0) throw new Error('No account found')
         if (account.length > 1) throw new Error('Multiple accounts found')

         if (!bcrypt.compare(opts.input.password, account[0].password)) throw new Error('Wrong password')
         if (account[0].banned != '') throw new Error('Account is banned')

         const user = {
            email: account[0].email,
            id: account[0].id,
            role: account[0].role
         }

         const returnAccount = {
            createdDate: account[0].createdDate.toString(),
            email: account[0].email,
            id: account[0].id,
            username: account[0].username,
            role: account[0].role
         }

         const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, {
            expiresIn: '3h'
         })
         return {
            account: returnAccount,
            accessToken: { token: accessToken, expiresInDays: 0.125 }
         }
      }),
   signup: publicProcedure
      .input(
         z.object({
            username: z.string().nonempty(),
            email: z.string().email().nonempty(),
            password: z.string().nonempty()
         })
      )
      .query(async (opts) => {
         const account = await prismaClient.account.create({
            data: {
               username: opts.input.username,
               email: opts.input.email,
               password: await bcrypt.hash(opts.input.password, 10)
            },
            select: {
               username: true,
               email: true
            }
         })

         return account
      })
})
