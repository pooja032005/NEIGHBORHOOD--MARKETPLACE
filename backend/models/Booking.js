const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startDate: Date,
  endDate: Date,
  status: { type: String, default: "pending" }
});

module.exports = mongoose.model("Booking", BookingSchema);
