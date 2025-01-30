const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    description: { type: String, required: true },
    likes: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    product: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      brand: { type: String, required: true },
      image: { type: String, required: true },
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const Video = mongoose.model("Video", VideoSchema);
module.exports = Video;
