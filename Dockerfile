FROM node:18
WORKDIR /api
COPY package*.json .
RUN npm i --silent
COPY ./ ./
RUN npx prisma migrate dev
EXPOSE 4000
CMD ["npm", "run", "start"]