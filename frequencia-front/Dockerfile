# ---------------------------------------------------
# Etapa 1: Compilação da aplicação (Build stage)
# ---------------------------------------------------
FROM node:24-alpine as build
WORKDIR /app

# Adiciona o diretório de executáveis dos pacotes ao PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copia os arquivos de configuração de dependências
COPY package*.json ./

# Instala TODAS as dependências necessárias para a compilação (incluindo tsc e vite)
# A flag --ignore-scripts impede falhas por ferramentas locais de git (como o Husky)
RUN npm ci --ignore-scripts

# Copia o código-fonte restante do front-end
COPY . .

# Gera o build de produção (os arquivos finais vão para a pasta /app/dist)
RUN npm run build

# ---------------------------------------------------
# Etapa 2: Servidor Web de Produção (Nginx stage)
# ---------------------------------------------------
FROM nginx:alpine

# Instala o bash e atualiza os pacotes da imagem Alpine
RUN apk update && apk upgrade && apk add bash

# Configura o redirecionamento dos logs do Nginx para a saída padrão do Docker
RUN ln -sf /dev/stdout /var/log/nginx/access.log \
 && ln -sf /dev/stderr /var/log/nginx/error.log

# Ajusta o fuso horário para Recife
RUN apk add tzdata
RUN cp /usr/share/zoneinfo/America/Recife /etc/localtime
RUN echo "America/Recife" > /etc/timezone

# Copia os arquivos estáticos gerados na etapa 1 para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia e dá permissão de execução ao script de entrada do Nginx
COPY docker-entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]