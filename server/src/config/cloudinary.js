const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} folder - Cloudinary folder name
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Upload result with secure_url
 */
const uploadToCloudinary = (fileBuffer, folder = 'grams/grievances', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
        timeout: 120000, // 120 second timeout (increased for large files)
        chunk_size: 6000000, // 6MB chunks for better performance
        transformation: resourceType === 'image' 
          ? [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' }]
          : resourceType === 'video'
          ? [{ quality: 'auto', fetch_format: 'auto' }]
          : undefined,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Error Details:', {
            message: error.message,
            status: error.http_code,
            name: error.name
          });
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
        } else {
          console.log('Cloudinary Upload Success:', {
            public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: result.resource_type,
            bytes: result.bytes
          });
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} Delete result
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
