const express = require("express");
const SensorData = require("../models/temperature");
const validateRules = require("../middleware/validatorMiddleware");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    await validateRules.AddSensorData(req.body);
    const { location, temperatureCelsius, humidityPercent, pressureHpa } =
      req.body;
    const sensor = new SensorData({
      timestamp: new Date(),
      location: location.trim(),
      temperature_celsius: temperatureCelsius.toFixed(2),
      humidity_percent: humidityPercent.toFixed(2),
      pressure_hpa: pressureHpa,
    });
    const createdSensor = await sensor.save();
    res.status(201).json(createdSensor);
  } catch (error) {
    next(error);
  }
});

router.get("", async (req, res, next) => {
  try {
    const data = await SensorData.find();
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    await validateRules.getSensorDataById(req.params);
    const data = await SensorData.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await validateRules.updateSensorDataById(req.params, req.body);

    const { location, temperatureCelsius, humidityPercent, pressureHpa } =
      req.body;

    const updateBody = {};
    if (temperatureCelsius)
      updateBody.temperature_celsius = Number(temperatureCelsius).toFixed(2);
    if (humidityPercent)
      updateBody.humidity_percent = Number(humidityPercent).toFixed(2);
    if (pressureHpa) updateBody.pressure_hpa = pressureHpa;
    if (location) updateBody.location = location;

    const data = await SensorData.findByIdAndUpdate(req.params.id, updateBody, {
      new: true,
    });
    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await validateRules.deleteSensorDataById(req.params);
    const data = await SensorData.findByIdAndRemove(req.params.id);
    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
