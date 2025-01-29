const Notification = require("../models/noficationModel");

// Get notifications for the user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
