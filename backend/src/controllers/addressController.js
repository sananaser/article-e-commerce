const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get user's addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: user.addresses || [],
  });
});

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res, next) => {
  const { label, line, city, default: isDefault } = req.body;

  if (!label || !line || !city) {
    return next(new ErrorResponse("Please provide all required fields (label, line, city)", 400));
  }

  const user = await User.findById(req.user._id);

  // If this is the first address, it must be default
  const makeDefault = user.addresses.length === 0 ? true : !!isDefault;

  if (makeDefault) {
    // Unset other default addresses
    user.addresses.forEach((addr) => {
      addr.default = false;
    });
  }

  user.addresses.push({ label, line, city, default: makeDefault });
  await user.save();

  res.status(201).json({
    success: true,
    data: user.addresses,
  });
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res, next) => {
  const { label, line, city, default: isDefault } = req.body;
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(id);

  if (!address) {
    return next(new ErrorResponse("Address not found", 404));
  }

  if (label !== undefined) address.label = label;
  if (line !== undefined) address.line = line;
  if (city !== undefined) address.city = city;

  if (isDefault !== undefined) {
    if (isDefault) {
      // Unset other default addresses
      user.addresses.forEach((addr) => {
        if (addr._id.toString() !== id) {
          addr.default = false;
        }
      });
      address.default = true;
    } else {
      address.default = false;
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses,
  });
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(id);

  if (!address) {
    return next(new ErrorResponse("Address not found", 404));
  }

  const wasDefault = address.default;

  user.addresses.pull(id);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].default = true;
  }

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses,
  });
});

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);
  const address = user.addresses.id(id);

  if (!address) {
    return next(new ErrorResponse("Address not found", 404));
  }

  user.addresses.forEach((addr) => {
    addr.default = addr._id.toString() === id;
  });

  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses,
  });
});

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
