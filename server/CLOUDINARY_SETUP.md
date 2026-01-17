# Cloudinary Setup Guide for GRAMS

This guide will help you set up Cloudinary for photo and video uploads in the GRAMS application.

## Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Click "Sign Up for Free"
3. Create an account using email or Google/GitHub

## Step 2: Get Your Credentials

After logging in:

1. Go to your **Dashboard**
2. You'll see your credentials in the "Account Details" section:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Configure Environment Variables

1. Open `server/.env` file
2. Update the following variables with your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=grams-app
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Folder Structure

The application automatically uploads files to:
- `grams/grievances/` - All grievance photos and videos

You can view uploaded files in your Cloudinary Media Library.

## Step 5: Test Upload

1. Start the server: `npm run dev`
2. Submit a grievance with photos/videos
3. Check Cloudinary Dashboard > Media Library to see uploaded files

## Features

- ✅ Automatic image optimization (max 1200x1200px)
- ✅ Support for 5 photos + 2 videos per grievance
- ✅ 50MB max size per video
- ✅ Automatic cleanup on grievance deletion
- ✅ Secure URLs with transformations

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB monthly bandwidth
- 25,000 transformations/month

Perfect for development and small-scale production!

## Troubleshooting

**Error: "Invalid cloud_name"**
- Double-check your `CLOUDINARY_CLOUD_NAME` in `.env`
- Make sure there are no extra spaces

**Error: "Upload failed"**
- Check API Key and Secret are correct
- Verify internet connection
- Check Cloudinary dashboard for account status

**Files not showing in Media Library**
- Check the folder path: `grams/grievances`
- Verify upload was successful (check server logs)

## Security Notes

- ✅ Never commit `.env` file to Git
- ✅ API Secret should remain private
- ✅ Use environment variables in production
- ✅ Enable signed uploads for extra security (optional)

---

Need help? Check [Cloudinary Documentation](https://cloudinary.com/documentation)
