const express = require("express");
const router = express.Router();

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .post(protect, admin, createCategory)
  .get(getCategories);

router
  .route("/:id")
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
