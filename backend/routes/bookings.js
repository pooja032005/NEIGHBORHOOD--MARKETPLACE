const express = require("express");
const router = express.Router();
const { createBooking, getBookings } = require("../controllers/bookingController");
const { auth } = require("../utils/authMiddleware");

router.post("/create", auth, createBooking);
router.get("/", auth, getBookings);

module.exports = router;
