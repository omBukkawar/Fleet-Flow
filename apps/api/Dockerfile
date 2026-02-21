FROM node:20-alpine

WORKDIR /usr/src/app

# Install OpenSSL required by Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript Code
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
