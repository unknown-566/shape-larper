FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY server.js ./
USER node
ENV PORT=10000
EXPOSE 10000
CMD ["node", "server.js"]
