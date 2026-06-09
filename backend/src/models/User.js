const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    required: [true, "Please add a label"],
  },
  line: {
    type: String,
    required: [true, "Please add an address line"],
  },
  city: {
    type: String,
    required: [true, "Please add a city/state/zip"],
  },
  default: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active",
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);