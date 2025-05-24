// models/Policy.js
const mongoose = require("mongoose");

const moneyReciptSchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true, unique: true },
    issuingDate: { type: Date, required: true },
    plan: { type: String, required: true },
    destinationCountries: [{ type: String, required: true }],
    travelStartDate: { type: Date, required: true },
    travelEndDate: { type: Date, required: true },
    countryOfResidence: { type: String, required: true },
    telephone: { type: String, required: true },
    insuredPerson: {
      fullName: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      passportNumber: { type: String, required: true },
    },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MoneyRecipt", moneyReciptSchema);