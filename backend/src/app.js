const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Set security HTTP headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Body parser
app.use(express.json());

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 150, // Limit each IP to 150 requests per windowMs
  standardHeaders: "draft-7", // Use modern RateLimit-* headers
  legacyHeaders: false, // Disable the X-RateLimit-* headers
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Apply rate limiter to all routes starting with /api
app.use("/api", limiter);

// Root test route
app.get("/", (req, res) => {
  res.send("Article E-Commerce API is running...");
});

// Mount routers
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Global error handler middleware (must be registered last)
app.use(errorHandler);

module.exports = app;