# Frontend Deployment Guide

Place Pro Platform - React TypeScript Frontend

## Overview

This is a React TypeScript application built with Vite, featuring:
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router DOM

## Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (or yarn/pnpm)
- **Backend API**: Running on configured endpoint

## Environment Configuration

### 1. API Configuration

Update the API base URL in `src/constants/api.ts`:

```typescript
// For development
export const API_BASE_URL = 'http://localhost:8080';

// For production
export const API_BASE_URL = 'https://your-api-domain.com';
```

### 2. Environment Variables (Optional)

Create `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-api-domain.com
VITE_APP_TITLE=Place Pro Platform
```

Then update `src/constants/api.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The application will be available at `https://localhost:8081` (or next available port).

### 3. Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Production Deployment

### Option 1: Static Hosting (Recommended)

#### Vercel Deployment

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Build and Deploy**:
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod
```

3. **Configure Environment Variables** in Vercel dashboard:
   - `VITE_API_BASE_URL`: Your backend API URL

#### Netlify Deployment

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to Netlify**:
   - Drag and drop the `dist` folder to Netlify
   - Or connect your Git repository

3. **Build Settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

#### AWS S3 + CloudFront

1. **Build the project**:
```bash
npm run build
```

2. **Upload to S3**:
```bash
aws s3 sync dist/ s3://your-bucket-name --delete
```

3. **Configure CloudFront** for SPA routing:
   - Error Pages: 404 -> /index.html (200)

### Option 2: Docker Deployment

#### Create Dockerfile

Create `Dockerfile` in the root directory:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Create nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

#### Build and Run Docker Container

```bash
# Build the image
docker build -t place-pro-frontend .

# Run the container
docker run -p 80:80 place-pro-frontend
```

### Option 3: Node.js Server (Express)

#### Create server.js

```javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Deploy Commands

```bash
# Install production dependencies
npm install express

# Build the project
npm run build

# Start the server
node server.js
```

## Performance Optimization

### 1. Build Optimization

```bash
# Build with source maps for debugging
npm run build -- --sourcemap

# Build without source maps for production
npm run build
```

### 2. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
    }),
  ],
});
```

### 3. Code Splitting

The application already uses React Router for code splitting. Additional optimizations:

```typescript
// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Companies = lazy(() => import('./pages/Companies'));
```

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` for documentation
- Set environment variables in your hosting platform

### 2. API Security

- Configure CORS properly on the backend
- Use HTTPS in production
- Implement proper authentication headers

### 3. Content Security Policy

Add to your hosting platform or nginx configuration:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
```

## Monitoring and Logging

### 1. Error Tracking

Install and configure error tracking:

```bash
npm install @sentry/react @sentry/tracing
```

### 2. Analytics

Add analytics tracking:

```bash
npm install @vercel/analytics
# or
npm install gtag
```

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check Node.js version (>= 18)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

2. **Routing Issues**:
   - Configure server for SPA routing
   - Check base URL in router configuration

3. **API Connection Issues**:
   - Verify API_BASE_URL configuration
   - Check CORS settings on backend
   - Verify network connectivity

### Debug Commands

```bash
# Check build output
npm run build -- --mode development

# Preview build locally
npm run preview

# Check dependencies
npm ls

# Update dependencies
npm update
```

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

### Performance Monitoring

- Monitor Core Web Vitals
- Use Lighthouse for performance analysis
- Monitor bundle size over time

---

## Quick Deployment Checklist

- [ ] Update API_BASE_URL for production
- [ ] Set environment variables
- [ ] Run `npm run build`
- [ ] Test production build locally with `npm run preview`
- [ ] Deploy to hosting platform
- [ ] Configure custom domain (if needed)
- [ ] Set up monitoring and analytics
- [ ] Test all functionality in production environment

For support, check the main project documentation or contact the development team. 