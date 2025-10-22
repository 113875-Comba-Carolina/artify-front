# Dockerfile para el frontend Angular
FROM node:20-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 4200

# Comando para ejecutar en modo desarrollo
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
