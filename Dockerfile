# Build stage
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm
RUN npm install -g @nestjs/cli

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Development stage
FROM builder AS development

EXPOSE 3000

CMD ["pnpm", "start:dev"] 

# Production stage
FROM builder AS production

CMD ["pnpm", "start:prod"]