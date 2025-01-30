const Video = require("../models/videosModel");

// Get paginated videos
exports.getVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const videos = await Video.find()
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ _id: -1 });

    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Like a video
exports.likeVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Comment on a video
exports.commentVideo = async (req, res) => {
  try {
    const { text } = req.body;
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { user: req.user.id, text } } },
      { new: true }
    );
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Share a video
exports.shareVideo = async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { shares: 1 } },
      { new: true }
    );
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Track video views
exports.viewVideo = async (req, res) => {
  try {
    await Video.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ message: "View counted" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Buy now
exports.buyVideoProduct = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    res.json({ message: "Proceed to checkout", product: video.product });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add to bag
exports.addToBag = async (req, res) => {
  try {
    res.json({ message: "Added to bag", productId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Explore more products from the same brand
exports.getProductsByBrand = async (req, res) => {
  try {
    const products = await Video.find({ "product.brand": req.params.brand });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST API to upload video data
exports.uploadVideoData = async (req, res) => {
  try {
    // Extract video data from the request body
    const { url, description, likes, shares, views, comments, product } =
      req.body;

    // Validate the required fields
    if (
      !url ||
      !description ||
      !product ||
      !product.name ||
      !product.price ||
      !product.brand ||
      !product.image
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create a new video document
    const newVideo = new Video({
      url,
      description,
      likes: likes || 0,
      shares: shares || 0,
      views: views || 0,
      comments: comments || [],
      product,
    });

    // Save the video to the database
    await newVideo.save();

    // Respond with success
    res
      .status(201)
      .json({ message: "Video data uploaded successfully", video: newVideo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
