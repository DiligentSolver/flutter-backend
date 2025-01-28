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

const app = express();
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use(errorHandler);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Hello, World!");
  console.log("Hello, World");
});
