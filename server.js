require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middlewares/errorHandler");
const onboardingRoutes = require("./routes/onboardingRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");
const locationRoutes = require("./routes/locationRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const brandRoutes = require("./routes/brandRoutes");
const newProductRoutes = require("./routes/newProductRoutes");
const featuredProductRoutes = require("./routes/featuredProductRoutes");
const dealsRoutes = require("./routes/dealsRoutes");
const saleProductRoutes = require("./routes/saleProductRoutes");
const recommendedRoutes = require("./routes/recommendedRoutes");
const videoRoutes = require("./routes/videosRoutes");
const { client } = require("./utils/redisClient");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);

// Define API routes
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/favorites", favouriteRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products/new", newProductRoutes);
app.use("/api/products/recommended", recommendedRoutes);
app.use("/api/products/featured", featuredProductRoutes);
app.use("/api/products/deals", dealsRoutes);
app.use("/api/products/sale", saleProductRoutes);
app.use("/api/videos", videoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (res) => {
  res.send("Hello, World!");
  console.log("Hello, World");
});

async function closeRedis() {
  if (client.isOpen) {
    console.log("Closing Redis connection...");
    await client.quit();
  } else {
    console.log("Redis client is already closed.");
  }
  process.exit(0);
}

process.on("SIGINT", closeRedis); // Handles Ctrl + C
process.on("SIGTERM", closeRedis); // Handles process termination
