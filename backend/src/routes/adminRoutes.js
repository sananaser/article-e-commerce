const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  toggleUserBlock,
  getAllOrders,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// All admin routes require authentication and admin role privileges
router.use(protect, admin);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.get("/orders", getAllOrders);
router.put("/users/:id/toggle-block", toggleUserBlock);

module.exports = router;
