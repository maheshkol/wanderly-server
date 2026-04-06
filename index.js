require("dotenv").config();
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("🚀 Server file started");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const destinationRoutes = require("./routes/destinationRoutes");
app.use("/", destinationRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Wanderly API is running...");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.log(err));