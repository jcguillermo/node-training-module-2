const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendNotification = (subject, message) => {
  const mailOptions = {
    from: "jguillermo@stratpoint.com",
    to: process.env.MOCK_EMAIL,
    subject,
    text: message,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending notification", error);
    } else {
      console.log("Notification sent: " + info.response);
    }
  });
};

const setupChangeStream = async () => {
  const client = new MongoClient(process.env.MONGODB_URI, {
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db();

    // Create a change stream on a collection
    const collection = db.collection("sensordatas");
    const changeStream = collection.watch({ fullDocument: "updateLookup" });

    changeStream.on("change", (change) => {
      if (change.operationType === "delete") return;
      const data = change.fullDocument;
      let notificationMessage = "";

      if (data.temperature_celsius > process.env.CELSIUS_THRESHOLD)
        notificationMessage +=
          "Temperature threshold exceeded: Temperature is high. \n";

      if (data.humidity_percent > process.env.HUMIDITY_THRESHOLD)
        notificationMessage +=
          "Temperature threshold exceeded: Humidity is high. \n";

      if (
        data.temperature_celsius > process.env.CELSIUS_THRESHOLD ||
        data.humidity_percent > process.env.HUMIDITY_THRESHOLD
      ) {
        notificationMessage += `Temperature: ${data.temperature_celsius}c \n`;
        notificationMessage += `Humidity:  ${data.humidity_percent}% \n`;
        notificationMessage += `Pressure: ${data.pressure_hpa}`;
        sendNotification("Sensor Threshold Exceeded", notificationMessage);
        console.log("Sensor Threshold Exceeded \n ", notificationMessage);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = { setupChangeStream };
