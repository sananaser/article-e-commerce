const path = require("path");
const fs = require("fs");
const cloudinary = require("../config/cloudinary");

const getProductImagePath = (url) => {
  if (!url || !url.startsWith("/uploads/products/")) return null;
  return path.join(__dirname, "../../uploads/products", path.basename(url));
};

/**
 * Extract Cloudinary public_id from a secure URL.
 * e.g., https://res.cloudinary.com/cloud_name/image/upload/v12345/products/img_name.jpg -> products/img_name
 */
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    let remainingParts = parts.slice(uploadIndex + 1);
    if (remainingParts[0] && /^v\d+$/.test(remainingParts[0])) {
      remainingParts = remainingParts.slice(1);
    }
    
    const pathWithExtension = remainingParts.join("/");
    const lastDotIndex = pathWithExtension.lastIndexOf(".");
    const publicId = lastDotIndex !== -1 ? pathWithExtension.substring(0, lastDotIndex) : pathWithExtension;
    return publicId;
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

/**
 * Upload a file Buffer directly to Cloudinary via upload_stream.
 * Returns a Promise that resolves with the Cloudinary result object (containing secure_url, public_id, etc.)
 */
const uploadBufferToCloudinary = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Asynchronously deletes product images from either Cloudinary or the local filesystem.
 */
const deleteProductImageFiles = async (imageUrls = []) => {
  const deletePromises = imageUrls.map(async (url) => {
    if (!url) return;
    if (url.includes("cloudinary.com")) {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error(`Failed to delete ${url} from Cloudinary:`, error);
        }
      }
    } else {
      const filePath = getProductImagePath(url);
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete local file ${filePath}:`, error);
        }
      }
    }
  });
  await Promise.all(deletePromises);
};

module.exports = {
  getProductImagePath,
  getPublicIdFromUrl,
  uploadBufferToCloudinary,
  deleteProductImageFiles,
};
