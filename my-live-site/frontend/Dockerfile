FROM node:20-alpine AS build

# Build-time environment variables for Vite (baked into the JS bundle).
# Pass via docker-compose build.args or --build-arg at build time.
ARG VITE_API_URL=http://localhost:8000
ARG VITE_APP_TITLE=Urban Home School
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_TITLE=$VITE_APP_TITLE

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
