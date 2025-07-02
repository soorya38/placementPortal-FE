# Place Pro Platform - Production Deployment Guide

A comprehensive React TypeScript application for company management and approval workflows with multiple user interfaces.

## 🏗️ Project Overview

Place Pro Platform consists of:
- **Main React App** (`index.html`) - Modern React 18 + TypeScript SPA
- **Admin Dashboard** (`admin.html`) - Standalone admin interface
- **Manager Dashboard** (`manager.html`) - Manager-specific interface
- **User Interface** (`user.html`) - User-specific interface

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, Tailwind CSS, Shadcn/ui
- **State Management**: React Context, TanStack Query
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## 📋 Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 (or yarn/pnpm equivalent)
- **Backend API**: Running and accessible
- **SSL Certificates**: For HTTPS (development/production)

## ⚙️ Environment Configuration

### 1. API Configuration

**For Production**, update `src/constants/api.ts`:

```typescript
export const API_BASE_URL = 'https://your-production-api.com';
```

**For Environment-based Configuration**, create `.env.production`:

```env
VITE_API_BASE_URL=https://your-production-api.com
VITE_APP_TITLE=Place Pro Platform
VITE_APP_ENV=production
```

Then update `src/constants/api.ts`:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

### 2. SSL Certificates (Development)

For local development with HTTPS:

```bash
# Generate self-signed certificates
./generate-cert.sh

# Or manually create .cert directory with:
# - cert.pem
# - key.pem
```

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone <repository-url>
cd place-pro-platform-88

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build Commands

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Production Deployment Options

### Option 1: Static Hosting (Recommended)

#### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Build and deploy
npm run build
vercel --prod
```

**Environment Variables in Vercel:**
- `VITE_API_BASE_URL`: `https://your-api-domain.com`

#### Netlify

```bash
# Build
npm run build

# Deploy via CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Build Settings:**
- Build Command: `npm run build`
- Publish Directory: `dist`
- Node Version: `18`

#### AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**CloudFront Configuration:**
- Error Pages: 404 → `/index.html` (200)
- Origin Path: `/`
- Viewer Protocol Policy: Redirect HTTP to HTTPS

### Option 2: Docker Deployment

#### Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (if needed)
COPY .cert/ /etc/ssl/certs/

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
```

#### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        # SSL configuration
        ssl_certificate /etc/ssl/certs/cert.pem;
        ssl_certificate_key /etc/ssl/certs/key.pem;
        
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Handle React Router (SPA routing)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Serve static HTML files directly
        location ~ \.(html)$ {
            try_files $uri =404;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy (optional)
        location /api/ {
            proxy_pass https://your-backend-api.com/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### Docker Commands

```bash
# Build image
docker build -t place-pro-platform .

# Run container
docker run -d -p 80:80 -p 443:443 --name place-pro-app place-pro-platform

# Docker Compose
docker-compose up -d
```

### Option 3: Traditional Web Server

#### Apache (.htaccess)

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

## 🔧 Production Optimizations

### 1. Build Optimization

Update `vite.config.ts` for production:

```typescript
export default defineConfig(({ mode }) => ({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: mode === 'development',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
  // ... other config
}));
```

### 2. Environment Variables

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_TITLE=Place Pro Platform
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

### 3. Performance Monitoring

Add to `src/main.tsx`:

```typescript
// Production monitoring
if (import.meta.env.PROD) {
  // Add Sentry, analytics, etc.
}
```

## 🔒 Security Considerations

### 1. Content Security Policy

Add to HTML files:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.gpteng.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;">
```

### 2. API Security

- Use HTTPS for all API communications
- Implement proper CORS headers
- Use secure authentication tokens
- Validate all API endpoints

### 3. Frontend Security

- Sanitize user inputs
- Implement proper error boundaries
- Use secure headers in nginx/Apache
- Regular dependency updates

## 📊 Monitoring & Analytics

### Health Check Endpoint

Create `public/health.json`:

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Boundaries

Implement in React components for production error handling.

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify `API_BASE_URL` configuration
   - Check CORS settings on backend
   - Ensure SSL certificates are valid

2. **Build Failures**
   - Check Node.js version compatibility
   - Clear `node_modules` and reinstall
   - Verify TypeScript configuration

3. **Routing Issues (SPA)**
   - Configure server for client-side routing
   - Check nginx/Apache configuration
   - Ensure all routes return `index.html`

4. **SSL Certificate Issues**
   - Verify certificate paths in config
   - Check certificate validity
   - Ensure proper nginx SSL configuration

### Logs & Debugging

```bash
# Check application logs
docker logs place-pro-app

# Nginx error logs
tail -f /var/log/nginx/error.log

# Build logs
npm run build 2>&1 | tee build.log
```

## 📝 Post-Deployment Checklist

- [ ] Verify all interfaces load correctly (`/`, `/admin.html`, `/manager.html`, `/user.html`)
- [ ] Test API connectivity and authentication
- [ ] Confirm SSL certificates are working
- [ ] Check browser console for errors
- [ ] Verify responsive design on mobile devices
- [ ] Test all user workflows end-to-end
- [ ] Confirm proper caching headers
- [ ] Validate security headers
- [ ] Test error pages and 404 handling
- [ ] Verify analytics/monitoring setup

## 🆘 Support

For deployment issues:
1. Check the `DEPLOYMENT.md` file for detailed configuration
2. Review application logs
3. Verify backend API status
4. Check network connectivity and DNS resolution

---
