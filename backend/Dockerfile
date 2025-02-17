# Usa una imagen base de Node.js (puedes ajustar la versión según tus necesidades)
FROM node:16-alpine

# Define el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración de Node y las dependencias
COPY package*.json ./

# Instala las dependencias (solo producción)
RUN npm install --production

# Copia el resto de la aplicación
COPY . .

# Expone el puerto que utiliza el backend (por ejemplo, 3002)
EXPOSE 3002

# Comando para arrancar la aplicación
CMD ["node", "server.js"]
