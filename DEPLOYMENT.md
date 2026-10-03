# StayLink — Production Deployment & Operations Guide

This guide details how to configure, harden, and deploy **StayLink** to production environments (Vercel, Google Cloud Run, AWS, Render, or Docker).

---

## 1. Production Architecture Overview

StayLink is structured as a full-stack Node.js/TypeScript application with a unified Vite frontend and Express REST API (`/api/v1/*`).

```
Internet (HTTPS)
      │
   Cloudflare / CDN (staylink.in)
      │
   Reverse Proxy / Ingress (Port 443 -> Port 3000)
      │
┌─────┴────────────────────────────────────────┐
│  StayLink Express Server (server.ts)         │
│  ├── /api/v1/auth/*     (Rate-limited)       │
│  ├── /api/v1/properties (Cached & Indexed)   │
│  ├── /api/v1/enquiries  (Direct messaging)   │
│  ├── /api/v1/visits     (Appointments)       │
│  └── Vite SPA Middleware (Static Assets)     │
└─────┬───────────────────┬────────────────────┘
      │                   │
 Managed PostgreSQL    Cloudinary / S3
 (Data persistence)    (Property images)
```

---

## 2. Production Environment Checklist (`.env`)

In your production secrets manager, configure the following:

| Variable | Description | Example / Required Format |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment | `production` |
| `PORT` | Listening port | `3000` (or injected by Cloud Run/Render) |
| `APP_URL` | Canonical website domain | `https://staylink.in` |
| `JWT_SECRET` | 64-char crypto string | Generate via `openssl rand -hex 32` |
| `DATABASE_URL` | Managed PostgreSQL connection | `postgresql://user:pass@ep-xyz.neon.tech/staylink?sslmode=require` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | `staylink-media` |
| `CLOUDINARY_API_KEY` | Cloudinary access key | `128394829104` |
| `CLOUDINARY_API_SECRET` | Cloudinary private secret | `secret_abcdef123` |
| `SMTP_HOST` | Transactional email provider | `smtp.resend.com` (or SendGrid/Postmark) |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `resend` |
| `SMTP_PASS` | SMTP API key | `re_YourKey` |
| `FROM_EMAIL` | Branded sender | `support@staylink.in` |

---

## 3. Option A: Deployment via Docker (Recommended for AWS/GCP/DigitalOcean)

### Step 1: Build the Production Container
```bash
docker build -t staylink:latest .
```

### Step 2: Run with Docker Compose
```bash
docker compose up -d
```
This automatically boots:
- StayLink App container on port `3000`
- PostgreSQL 16 container with persistent volumes
- Redis 7 container for caching and rate limiting

---

## 4. Option B: Deployment to Google Cloud Run

1. **Build and push image to Google Artifact Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/staylink:latest
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy staylink \
     --image gcr.io/YOUR_PROJECT_ID/staylink:latest \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --port 3000 \
     --set-env-vars NODE_ENV=production,APP_URL=https://staylink.in
   ```

3. **Map Custom Domain**:
   - Go to Google Cloud Run -> Custom Domains -> Add `staylink.in`.
   - Point your DNS A/CNAME records to the supplied Google IP addresses.

---

## 5. Option C: Deployment to Render / Railway

1. Connect your GitHub repository.
2. Select **Web Service** with Node environment.
3. Configure build & start commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables from `.env.example`.

---

## 6. Security Hardening Checklist

Before public launch:

- [x] **Rate Limiting Active**: `/api/v1/auth/*` limited to 20 requests/minute per IP to defeat brute force.
- [x] **Cryptographic Password Hashing**: PBKDF2 with SHA-512 and unique salt per user; plaintext passwords never stored.
- [x] **Zero Brokerage Anti-Middleman Verification**: Mandatory owner verification via electricity meter/property tax IDs.
- [x] **File Size & MIME Restrictions**: Photo uploads capped at 5MB with strict JPEG/PNG/WebP validation.
- [x] **CORS & CSRF Safeguards**: API restricts state-changing calls to authorized origin.
- [x] **Schema.org Structured Data**: Integrated in `index.html` for Google RealEstate rich snippet indexing.
- [x] **Automated Regression Suite**: 12 automated unit and integration tests passing (`npm run test`).
