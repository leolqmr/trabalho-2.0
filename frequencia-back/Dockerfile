# ---------------------------------------------------
# Etapa 1: Compilação do aplicativo (Build Stage)
# ---------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# 1. Copia os manifestos de dependências e a pasta do Prisma
COPY package*.json ./
COPY prisma ./prisma

# 2. Instala TODAS as dependências (incluindo devDependencies para a CLI do NestJS e TypeScript)
# A flag --ignore-scripts evita erros com ferramentas de git (como o Husky)
RUN npm ci --ignore-scripts

# 3. Gera o Prisma Client com as tipagens
RUN npx prisma generate --schema prisma/schema.prisma

# 4. Copia todo o código-fonte restante
COPY . .

# 5. Compila o NestJS (gera a pasta /app/dist)
RUN npm run build

# ---------------------------------------------------
# Etapa 2: Instalação de Produção
# ---------------------------------------------------
FROM node:22-alpine AS prod-dependencies

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

# Instala apenas as dependências de produção
RUN npm ci --omit=dev --ignore-scripts

# Gera o Prisma Client necessário para a execução em produção
RUN npx prisma generate --schema prisma/schema.prisma

# ---------------------------------------------------
# Etapa 3: Imagem Final de Produção (Production)
# ---------------------------------------------------
FROM node:22-alpine AS production

WORKDIR /app

# Copia as dependências de produção da etapa anterior
COPY --from=prod-dependencies /app/node_modules ./node_modules
COPY --from=prod-dependencies /app/package*.json ./

# Copia o código compilado da etapa de build
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# Porta exposta da API NestJS
EXPOSE 3000

# Executa o servidor NestJS
CMD ["node", "dist/main"]