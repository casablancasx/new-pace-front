# Stage 1: Build
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci --legacy-peer-deps

# Copiar todo o código fonte (incluindo imagens em src/assets)
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar o build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta 80

EXPOSE 5471

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"]
