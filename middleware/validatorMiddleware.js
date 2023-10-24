const Joi = require("joi");
const mongoose = require("mongoose");

const throwError = (error) => {
  throw new Error(
    "Validation Error: " + error.details.map((d) => d.message).join(", "),
  );
};

const validateObjectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const idSchema = Joi.string().custom(validateObjectId, "Object ID");

exports.AddSensorData = async (params) => {
  const schema = Joi.object({
    location: Joi.string().min(3).max(50).required(),
    temperatureCelsius: Joi.number().max(120).required(),
    humidityPercent: Joi.number().max(120).required(),
    pressureHpa: Joi.number().required(),
  });

  const { error } = schema.validate(params);
  if (error) throwError(error);
};

exports.getSensorDataById = async (params) => {
  const schema = Joi.object({
    id: idSchema.required(),
  });

  const { error } = schema.validate(params);
  if (error) throwError(error);
};

exports.updateSensorDataById = async (params, body) => {
  const schema = Joi.object({
    id: idSchema.required(),
  });

  const schemaBody = Joi.object({
    location: Joi.string().min(3).max(50),
    temperatureCelsius: Joi.number().max(120),
    humidityPercent: Joi.number().max(120),
    pressureHpa: Joi.number(),
  });

  const { error: errorParams } = schema.validate(params);
  const { error: errorBody } = schemaBody.validate(body);
  if (errorParams || errorBody) {
    const combinedErrors = [
      ...(errorParams ? errorParams.details : []),
      ...(errorBody ? errorBody.details : []),
    ];
    const errorMessages = combinedErrors.map((d) => d.message).join(", ");
    throw new Error("Validation Error: " + errorMessages);
  }
};

exports.deleteSensorDataById = async (params) => {
  const schema = Joi.object({
    id: idSchema.required(),
  });

  const { error } = schema.validate(params);
  if (error) throwError(error);
};
