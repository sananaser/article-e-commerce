const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

// All admin routes require authentication and admin role privileges
router.use(protect, admin);

router.get("/dashboard", getDashboardStats);

module.exports = router;
