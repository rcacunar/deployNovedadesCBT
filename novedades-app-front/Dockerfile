# Etapa de build: usa Node.js para compilar la aplicación React
FROM node:16-alpine as build

WORKDIR /app

# Copia package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instala las dependencias usando el flag --legacy-peer-deps
RUN npm install --legacy-peer-deps

# Copia el código fuente y compila la aplicación
COPY . .
RUN npm run build

# Etapa final: utiliza Nginx para servir la aplicación compilada
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
