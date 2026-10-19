FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
# Default: relative /api via the nginx proxy below (works from any host).
# Override only when the API is on a different origin (e.g. https://api.seis.example.com).
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
# Harden: remove default nginx header via server_tokens off (in nginx.conf)
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# Run nginx as non-root is handled by nginx:alpine default
CMD ["nginx", "-g", "daemon off;"]
