# --- Build frontend ---
FROM node:lts-alpine AS frontend-build
WORKDIR /app/frontend
ARG GTM_ID="GTM-PLACEHOLDER"
ENV VITE_GTM_ID=$GTM_ID

COPY ../frontend/package.json ../frontend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --dangerously-allow-all-builds
COPY ../frontend/ .
RUN chmod +x node_modules/.bin/*
ENV NODE_OPTIONS=--max-old-space-size=8192
RUN echo "Building with VITE_GTM_ID: $VITE_GTM_ID"
RUN pnpm run build

# --- Build backend ---
FROM python:3.11-slim AS backend-build
WORKDIR /app/backend
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# --- Final image ---
FROM python:3.11-slim
WORKDIR /app

# Copy backend code
COPY --from=backend-build /app/backend ./backend
# Copy frontend build output
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Install backend dependencies in final image
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose port
EXPOSE 8080

# Entrypoint: serve FastAPI app with uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
