const express = require("express");
const router = express.Router();

// Endpoint to get onboarding video URL
router.get("/video", (req, res) => {
  try {
    const videoUrl = "https://your-server.com/videos/onboarding.mp4"; // Update with the actual URL of your video.
    res.status(200).json({ videoUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch video URL" });
  }
});

module.exports = router;
