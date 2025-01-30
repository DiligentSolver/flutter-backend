const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const videoController = require("../controllers/videosController");

const router = express.Router();

router.get("/", videoController.getVideos);
router.post("/:id/like", verifyToken.protect, videoController.likeVideo);
router.post("/:id/comment", verifyToken.protect, videoController.commentVideo);
router.post("/:id/share", verifyToken.protect, videoController.shareVideo);
router.post("/:id/view", videoController.viewVideo);
router.post("/:id/buy", verifyToken.protect, videoController.buyVideoProduct);
router.post("/:id/add-to-bag", verifyToken.protect, videoController.addToBag);
router.get("/brand/:brand", videoController.getProductsByBrand);
// POST API to upload video data
router.post("/upload", videoController.uploadVideoData);

module.exports = router;
