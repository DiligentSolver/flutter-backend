const mongoose = require("mongoose");

// Video Schema
const VideoSchema = new mongoose.Schema({
  url: String,
  description: String,
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [{ user: String, text: String }],
  product: {
    name: String,
    price: Number,
    brand: String,
    image: String,
  },
});

const Video = mongoose.model("Video", VideoSchema);
