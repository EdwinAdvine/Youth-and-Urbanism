FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# SPA routing: send all paths to index.html
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
