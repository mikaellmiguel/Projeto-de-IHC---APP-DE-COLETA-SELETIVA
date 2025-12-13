# Dockerfile para API Node.js (Node 22)
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install --production

# Copia o restante do código
COPY . .

# Expõe a porta padrão (ajuste se necessário)
EXPOSE 4000

# Comando para iniciar a API
CMD ["npm", "start"]
