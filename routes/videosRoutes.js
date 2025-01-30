const express = require("express");
const Video = require("../models/Video");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

// Get paginated videos
router.get("/videos?page=1&limit=10", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const videos = await Video.find()
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ _id: -1 });

  res.json(videos);
});

// Like a video
router.post("/:id/like", verifyToken, async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  res.json(video);
});

// Comment on a video
router.post("/:id/comment", verifyToken, async (req, res) => {
  const { text } = req.body;
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { user: req.user.id, text } } },
    { new: true }
  );
  res.json(video);
});

// Share a video
router.post("/:id/share", verifyToken, async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $inc: { shares: 1 } },
    { new: true }
  );
  res.json(video);
});

// Track video views
router.post("/:id/view", async (req, res) => {
  await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  res.json({ message: "View counted" });
});

// Buy now
router.post("/:id/buy", verifyToken, async (req, res) => {
  const video = await Video.findById(req.params.id);
  res.json({ message: "Proceed to checkout", product: video.product });
});

// Add to bag
router.post("/:id/add-to-bag", verifyToken, async (req, res) => {
  res.json({ message: "Added to bag", productId: req.params.id });
});

// Explore more products from the same brand
router.get("/brand/:brand", async (req, res) => {
  const products = await Video.find({ "product.brand": req.params.brand });
  res.json(products);
});

module.exports = router;
