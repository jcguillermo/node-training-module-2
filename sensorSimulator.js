const cron = require("node-cron");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Connect to your MongoDB database
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// If you haven't already defined your SensorData model in your main application, define it here as well
const SensorData = mongoose.model(
  "SensorData",
  new mongoose.Schema({
    timestamp: Date,
    location: String,
    temperature_celsius: Number,
    humidity_percent: Number,
    pressure_hpa: Number,
  }),
);

// Function to generate random sensor data
function generateSensorData() {
  const data = new SensorData({
    timestamp: new Date(), // current time
    location: `Location${Math.floor(Math.random() * 3) + 1}`, // random location
    temperature_celsius: Math.random() * 15 + 20, // random temperature between 20 and 35
    humidity_percent: Math.floor(Math.random() * 100), // random humidity
    pressure_hpa: Math.floor(Math.random() * 50) + 970, // random pressure between 970 and 1020
  });
  return data;
}

// Scheduled task for sensor data simulation
// This cron job is set to run every 10 minutes. You can adjust the timing as needed.
cron.schedule("* * * * *", async () => {
  console.log("Generating simulated sensor data...");

  // Create new sensor data
  const newSensorData = generateSensorData();

  try {
    const doc = await newSensorData.save();
    console.log("Simulated data inserted:", doc);
  } catch (err) {
    console.error("Error inserting simulated data:", err);
  }
});

// Keep the script running
setInterval(() => {}, 1000);
