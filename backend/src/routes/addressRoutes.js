const express = require("express");
const router = express.Router();

const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

// All routes in this module require authentication
router.use(protect);

router
  .route("/")
  .get(getAddresses)
  .post(addAddress);

router
  .route("/:id")
  .put(updateAddress)
  .delete(deleteAddress);

router.put("/:id/default", setDefaultAddress);

module.exports = router;
