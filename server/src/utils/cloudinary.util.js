const cloudinary = require('../config/cloudinary');
const fs = require('fs');

/**
 * Upload file to Cloudinary then delete local temp file
 */
const uploadFile = async (filePath, folder, resourceType = 'image') => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: resourceType,
  });

  // Clean up local temp file
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width || null,
    height: result.height || null,
    format: result.format || null,
    resourceType: result.resource_type,
    duration: result.duration || null,
  };
};

/**
 * Delete file from Cloudinary (silent fail)
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.error(`[Cloudinary] Delete failed for ${publicId}:`, err.message);
  }
};

module.exports = { uploadFile, deleteFile };
