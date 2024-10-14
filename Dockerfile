FROM oven/bun:1.1.22-alpine

WORKDIR /app

# Copy source
COPY ./ ./

# Update system
RUN apk update

# Folder and Config
RUN mkdir -p /run/nginx
RUN mkdir -p /app/log
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir -p /etc/ssl && mv -r ssl /etc/ssl/

# Install Nginx
RUN apk add nginx

# Install packages
RUN bun install

EXPOSE 3000

ENTRYPOINT [ "sh", "entrypoint.sh" ]