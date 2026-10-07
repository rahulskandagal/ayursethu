# Single-container deployment: Node app + embedded PostgreSQL in one image.
#
# This exists because the target hosting account has a hard cap on the
# number of separate services it can provision. The normal, better-practice
# deployment is backend + frontend + a managed Postgres as three independent
# services (see docker-compose.yml at the repo root, and backend/Dockerfile /
# frontend/Dockerfile) — use that layout whenever the hosting account isn't
# capacity-constrained.
FROM node:20-alpine

RUN apk add --no-cache postgresql16 postgresql16-contrib su-exec bash openssl

# ---- Build frontend ----
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- Build backend ----
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# Serve the frontend build from the backend's Express process (see
# backend/src/app.ts — it serves ./public if present).
RUN mkdir -p /app/backend/public && cp -r /app/frontend/dist/. /app/backend/public/

WORKDIR /app/backend
ENV NODE_ENV=production
ENV PGDATA=/data/postgres
ENV UPLOADS_DIR=/data/uploads
ENV PORT=8080

COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /data/uploads

EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
