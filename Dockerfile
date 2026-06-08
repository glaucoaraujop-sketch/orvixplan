FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Apenas a chave Anthropic precisa de build arg (é secret)
# Supabase URL e anon key estão hardcoded no código (são públicas por design)
ARG VITE_ANTHROPIC_KEY
ENV VITE_ANTHROPIC_KEY=$VITE_ANTHROPIC_KEY
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
