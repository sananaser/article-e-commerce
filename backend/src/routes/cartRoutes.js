const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All routes in this module are protected
router.use(protect);

router
  .route("/")
  .get(getCart)
  .post(addToCart)
  .delete(clearCart);

router.put("/quantity", updateQuantity);
router.delete("/item/:productId", removeItem);

module.exports = router;
