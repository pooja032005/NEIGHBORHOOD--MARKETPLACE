const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

router.get("/dashboard", async (req, res) => {
  try {
    const stats = {
      totalBookings: await Booking.countDocuments(),
      totalRevenue: await Booking.countDocuments({ status: "completed" })
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Admin error" });
  }
});

module.exports = router;
