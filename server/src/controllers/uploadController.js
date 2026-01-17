const { uploadToCloudinary } = require('../config/cloudinary');

// Upload single file to Cloudinary
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file provided' 
      });
    }

    const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    
    console.log(`Uploading ${resourceType}:`, {
      filename: req.file.originalname,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      mimetype: req.file.mimetype
    });

    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      'grams/grievances',
      resourceType
    );

    res.status(200).json({
      success: true,
      data: {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: resourceType,
        filename: req.file.originalname,
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload file' 
    });
  }
};

// Upload multiple files to Cloudinary
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files provided' 
      });
    }

    console.log(`Uploading ${req.files.length} files...`);

    // Upload all files in parallel
    const uploadPromises = req.files.map(async (file) => {
      const resourceType = file.mimetype.startsWith('image/') ? 'image' : 'video';
      
      try {
        const uploadResult = await uploadToCloudinary(
          file.buffer,
          'grams/grievances',
          resourceType
        );
        
        return {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          type: resourceType,
          filename: file.originalname,
          success: true
        };
      } catch (uploadError) {
        console.error(`Upload failed for ${file.originalname}:`, uploadError);
        return {
          filename: file.originalname,
          success: false,
          error: uploadError.message
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    res.status(200).json({
      success: true,
      data: successful,
      failed: failed.length > 0 ? failed : undefined,
      message: `${successful.length}/${req.files.length} files uploaded successfully`
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to upload files' 
    });
  }
};
