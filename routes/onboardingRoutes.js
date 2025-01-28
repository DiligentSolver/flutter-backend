const express = require("express");
const router = express.Router();

// Endpoint to get onboarding video URL
router.get("/video", (req, res) => {
  try {
    // Construct the URL of the video hosted on the API server
    const videoUrl = "https://ik.imagekit.io/zf8c9okck/onboarding_video.mp4"; // Build the complete video URL
    res.status(200).json({ videoUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch video URL" });
  }
});

module.exports = router;
