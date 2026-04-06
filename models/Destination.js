const mongoose = require("mongoose");

const DestinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number },
    image: { type: String },
    country: { type: String },
    highlights: [{ type: String }],
    bestTime: { type: String },
    currency: { type: String },
    language: { type: String },
    searchCount: { type: Number, default: 1 },
    lastFetched: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Destination", DestinationSchema);
