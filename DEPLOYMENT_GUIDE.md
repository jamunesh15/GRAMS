# GRAMS Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas account (for database)
- Cloudinary account (for image uploads)
- Firebase account (for authentication)
- All required API keys and credentials

## Deployment Steps

### 1. Prepare Environment Variables

#### Client Environment Variables
Create these in Vercel Dashboard for client deployment:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_MSAL_CLIENT_ID
VITE_MSAL_AUTHORITY
VITE_API_BASE_URL (your deployed backend URL)
```

#### Server Environment Variables
Create these in Vercel Dashboard for server deployment:
```
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASSWORD
FIREBASE_PROJECT_ID (optional)
FIREBASE_PRIVATE_KEY (optional)
FIREBASE_CLIENT_EMAIL (optional)
FRONTEND_URL (your deployed frontend URL)
```

### 2. Deploy Server (Backend) First

```bash
cd server
vercel --prod
```

Or using Vercel Dashboard:
1. Import your GitHub repository
2. Select the `server` folder as root directory
3. Add environment variables
4. Deploy

**Note the deployed server URL** - you'll need it for the client configuration.

### 3. Deploy Client (Frontend)

Update your client `.env` file with the backend URL:
```env
VITE_API_BASE_URL=https://your-backend-url.vercel.app/api
```

```bash
cd client
vercel --prod
```

Or using Vercel Dashboard:
1. Create a new project
2. Select the `client` folder as root directory
3. Add environment variables (including VITE_API_BASE_URL)
4. Deploy

### 4. Update CORS Settings

After deploying the frontend, update your server environment variable:
```env
FRONTEND_URL=https://your-frontend-url.vercel.app
```

Redeploy the server if needed.

### 5. Verify Deployment

Test these endpoints:
- Frontend: `https://your-frontend-url.vercel.app`
- Backend Health: `https://your-backend-url.vercel.app/api/health`

## Important Notes

### Server Limitations on Vercel
- Vercel Functions have a 10-second timeout on Hobby plan (60s on Pro)
- File uploads are limited to 4.5MB on Hobby plan
- Functions are stateless (no local file storage)
- PDF reports should be generated in memory, not saved to disk

### Database
- Use MongoDB Atlas (cloud database)
- Add Vercel's IP ranges to MongoDB whitelist (or use 0.0.0.0/0)

### File Storage
- All file uploads (images, documents) must use Cloudinary
- Do not rely on local file system storage

### Environment Variables
- Never commit `.env` files to Git
- Use Vercel Dashboard to set environment variables
- Variables starting with `VITE_` are exposed to client-side code

## Vercel CLI Commands

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login to Vercel
```bash
vercel login
```

### Deploy to Production
```bash
vercel --prod
```

### Deploy to Preview
```bash
vercel
```

### View Logs
```bash
vercel logs [deployment-url]
```

### List Deployments
```bash
vercel ls
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify all dependencies are in package.json
- Ensure environment variables are set

### API Calls Failing
- Check CORS configuration
- Verify VITE_API_BASE_URL is correct
- Check server logs in Vercel Dashboard

### Database Connection Issues
- Verify MONGODB_URI is correct
- Check MongoDB Atlas network access settings
- Ensure database user has correct permissions

### File Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Review Cloudinary quota

## Custom Domain (Optional)

1. Go to Project Settings in Vercel Dashboard
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables with new domain

## Continuous Deployment

Connect your GitHub repository to Vercel for automatic deployments:
1. Import Git Repository in Vercel
2. Configure build settings
3. Add environment variables
4. Enable automatic deployments on push

Every push to main branch will trigger a new deployment!

## Support

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Cloudinary: https://cloudinary.com/documentation
