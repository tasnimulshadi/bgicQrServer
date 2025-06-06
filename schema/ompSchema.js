import Joi from "joi";
// Validation schema

export const ompCreateSchema = Joi.object({
  typeOfTRV: Joi.string().required(),
  ompNumber: Joi.string().required(),
  policyNumber: Joi.string().required(),
  issueDate: Joi.date().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  dob: Joi.date().required(),
  gender: Joi.string().valid("Male", "Female", "Other").required(),
  address: Joi.string().required(),
  mobile: Joi.string().required(),
  email: Joi.string().email().required(),
  passport: Joi.string().required(),
  destination: Joi.string().required(),
  travelDateFrom: Joi.date().required(),
  travelDays: Joi.number().required(),
  travelDateTo: Joi.date().required(),
  countryOfResidence: Joi.string().required(),
  limitOfCover: Joi.number().required(),
  limitOfCoverCurrency: Joi.string().required(),
  premium: Joi.number().required(),
  vat: Joi.number().required(),
  producer: Joi.string().required(),

  mrNo: Joi.string().allow(null, ""),
  mrDate: Joi.date().allow(null),
  mop: Joi.string().allow(null, ""),
  chequeNo: Joi.string().allow(null, ""),
  chequeDate: Joi.date().allow(null),
  bank: Joi.string().allow(null, ""),
  bankBranch: Joi.string().allow(null, ""),
  note: Joi.string().allow(null, ""),
});

// Define Joi schema for PATCH (all fields optional)
export const ompUpdateSchema = Joi.object({
  typeOfTRV: Joi.string(),
  ompNumber: Joi.string(),
  policyNumber: Joi.string(),
  issueDate: Joi.date(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  dob: Joi.date(),
  gender: Joi.string().valid("Male", "Female", "Other"),
  address: Joi.string(),
  mobile: Joi.string(),
  email: Joi.string().email(),
  passport: Joi.string(),
  destination: Joi.string(),
  travelDateFrom: Joi.date(),
  travelDays: Joi.number(),
  travelDateTo: Joi.date(),
  countryOfResidence: Joi.string(),
  limitOfCover: Joi.number(),
  limitOfCoverCurrency: Joi.string(),
  premium: Joi.number(),
  vat: Joi.number(),
  producer: Joi.string(),

  mrNo: Joi.string().allow(null, ""),
  mrDate: Joi.date().allow(null),
  mop: Joi.string().allow(null, ""),
  chequeNo: Joi.string().allow(null, ""),
  chequeDate: Joi.date().allow(null),
  bank: Joi.string().allow(null, ""),
  bankBranch: Joi.string().allow(null, ""),
  note: Joi.string().allow(null, ""),
});
