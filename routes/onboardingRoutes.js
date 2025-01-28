const express = require("express");
const router = express.Router();

// Endpoint to get onboarding video URL
router.get("/video", (req, res) => {
  try {
    const videoUrl =
      "https://drive.google.com/uc?export=download&id=1Frj3JBXb2BpKHdKacNOo6Png9kBXooPO"; // Update with the actual URL of your video.
    res.status(200).json({ videoUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch video URL" });
  }
});

module.exports = router;
