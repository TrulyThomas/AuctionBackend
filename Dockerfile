FROM node:18
WORKDIR /api
COPY package.json .
COPY package-lock.json .
RUN npm i --silent
COPY . .
RUN npx prisma migrate dev
COPY . .
EXPOSE 4000
CMD ["npm", "run", "start"]