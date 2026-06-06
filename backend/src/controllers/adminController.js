const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Aggregate revenue from non-cancelled orders
  const revenueData = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    },
  });
});

module.exports = {
  getDashboardStats,
};
