const express = require("express");
const router = express.Router();

const {
  uploadProductImages,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, admin } = require("../middleware/authMiddleware");
const { uploadProductImages: uploadMiddleware } = require("../middleware/uploadMiddleware");

router.post(
  "/upload",
  protect,
  admin,
  uploadMiddleware.array("images", 5),
  uploadProductImages
);

router
  .route("/")
  .post(protect, admin, createProduct)
  .get(getProducts);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

module.exports = router;
