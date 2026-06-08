const path = require("path");
const fs = require("fs");

const getProductImagePath = (url) => {
  if (!url || !url.startsWith("/uploads/products/")) return null;
  return path.join(__dirname, "../../uploads/products", path.basename(url));
};

const deleteProductImageFiles = (imageUrls = []) => {
  imageUrls.forEach((url) => {
    const filePath = getProductImagePath(url);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
};

module.exports = { getProductImagePath, deleteProductImageFiles };
