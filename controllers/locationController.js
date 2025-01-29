const Location = require("../models/locationModel");

// Get all locations (or create location management functionality if needed)
exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Set a location (if needed)
exports.setLocation = async (req, res) => {
  try {
    const location = new Location({
      userId: req.user.id,
      location: req.body.location,
    });
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
