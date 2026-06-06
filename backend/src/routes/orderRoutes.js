const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, admin } = require("../middleware/authMiddleware");

// All routes in this module are protected
router.use(protect);

router.post("/", createOrder);
router.get("/myorders", getMyOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", admin, updateOrderStatus);

module.exports = router;
