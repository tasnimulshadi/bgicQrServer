import Joi from "joi";
// Validation schema

export const ompCreateSchema = Joi.object({
  plan: Joi.string().required(),
  planCode: Joi.string().required(),
  policyOffice: Joi.string().required(),
  policyOfficeCode: Joi.string().required(),
  policyClass: Joi.string().required(),
  policyClassCode: Joi.string().required(),
  policyNumber: Joi.string().required(),
  policyDate: Joi.date().required(),
  policyNo: Joi.string().required(),

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
  currency: Joi.string().required(),
  premium: Joi.number().required(),
  vat: Joi.number().required(),
  total: Joi.number().required(),
});

// Define Joi schema for PATCH (all fields optional)
export const ompUpdateSchema = Joi.object({
  plan: Joi.string().optional(),
  planCode: Joi.string().optional(),
  policyOffice: Joi.string().optional(),
  policyOfficeCode: Joi.string().optional(),
  policyClass: Joi.string().optional(),
  policyClassCode: Joi.string().optional(),
  policyNumber: Joi.string().optional(),
  policyDate: Joi.date().optional(),
  policyNo: Joi.string().optional(),

  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  dob: Joi.date().optional(),
  gender: Joi.string().valid("Male", "Female", "Other").optional(), // valid() is retained
  address: Joi.string().optional(),
  mobile: Joi.string().optional(),
  email: Joi.string().email().optional(),
  passport: Joi.string().optional(),

  destination: Joi.string().optional(),
  travelDateFrom: Joi.date().optional(),
  travelDays: Joi.number().optional(),
  travelDateTo: Joi.date().optional(),
  countryOfResidence: Joi.string().optional(),
  limitOfCover: Joi.number().optional(),
  currency: Joi.string().optional(),
  premium: Joi.number().optional(),
  vat: Joi.number().optional(),
  total: Joi.number().optional(),
});
