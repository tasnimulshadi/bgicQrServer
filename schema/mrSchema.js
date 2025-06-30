import Joi from "joi";
// Validation schema

export const mrCreateSchema = Joi.object({
  mrOffice: Joi.string().required(),
  mrOfficeCode: Joi.string().required(),
  mrClass: Joi.string().required(),
  mrClassCode: Joi.string().required(),
  mrNumber: Joi.string().required(),
  mrDate: Joi.date().required(),
  mrNo: Joi.string().required(),
  receivedFrom: Joi.string().required(),
  mop: Joi.string().required(),
  chequeNo: Joi.string().allow(null, ""),
  chequeDate: Joi.date().allow(null, ""),
  bank: Joi.string().allow(null, ""),
  bankBranch: Joi.string().allow(null, ""),

  policyOffice: Joi.string().required(),
  policyOfficeCode: Joi.string().required(),
  policyClass: Joi.string().required(),
  policyClassCode: Joi.string().required(),
  policyNumber: Joi.string().required(),
  policyDate: Joi.date().required(),
  coins: Joi.string().required(),
  policyNo: Joi.string().required(),

  premium: Joi.number().positive().required(),
  vat: Joi.number().positive().allow(null, ""),
  total: Joi.number().positive().required(),
  stamp: Joi.number().positive().allow(null, ""),
  coinsnet: Joi.number().positive().allow(null, ""),

  note: Joi.string().allow(null, ""),
});

// Define Joi schema for PATCH (all fields optional)
export const mrUpdateSchema = Joi.object({
  mrOffice: Joi.string().optional(),
  mrOfficeCode: Joi.string().optional(),
  mrClass: Joi.string().optional(),
  mrClassCode: Joi.string().optional(),
  mrNumber: Joi.string().optional(),
  mrDate: Joi.date().optional(),
  mrNo: Joi.string().optional(),
  receivedFrom: Joi.string().optional(),
  mop: Joi.string().optional(),
  chequeNo: Joi.string().allow(null, "").optional(),
  chequeDate: Joi.date().allow(null, "").optional(),
  bank: Joi.string().allow(null, "").optional(),
  bankBranch: Joi.string().allow(null, "").optional(),

  policyOffice: Joi.string().optional(),
  policyClass: Joi.string().optional(),
  policyNumber: Joi.string().optional(),
  policyDate: Joi.date().optional(),
  coins: Joi.string().optional(),
  policyNo: Joi.string().optional(),

  premium: Joi.number().optional(),
  vat: Joi.number().optional(),
  total: Joi.number().optional(),
  stamp: Joi.number().allow(null, "").optional(),
  coinsnet: Joi.number().allow(null, "").optional(),

  note: Joi.string().allow(null, "").optional(),
});
