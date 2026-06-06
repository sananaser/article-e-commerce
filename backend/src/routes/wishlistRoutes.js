const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController");

const { protect } = require("../middleware/authMiddleware");

// All routes in this module are protected
router.use(protect);

router
  .route("/")
  .get(getWishlist)
  .post(addToWishlist);

router.delete("/:productId", removeFromWishlist);

module.exports = router;
