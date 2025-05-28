// models/Policy.js
const mongoose = require("mongoose");

const destinationSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  country: { type: String, required: true },
  remarks: { type: String, default: "" },
});

const ompSchema = new mongoose.Schema(
  {
    typeOfTRV: { type: String, required: true },
    ompNumber: { type: String, required: true },
    policyNumber: { type: String, required: true },
    issueDate: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    passport: { type: String, required: true },
    destination: { type: [destinationSchema], required: true },
    travelDateFrom: { type: String, required: true },
    travelDays: { type: String, required: true },
    travelDateTo: { type: String, required: true },
    countryOfResidence: { type: String, required: true },
    limitOfCover: { type: String, required: true },
    limitOfCoverCurrency: { type: String, required: true },
    premium: { type: String, required: true },
    vat: { type: String, required: true },
    producer: { type: String, required: true },
    mrNo: { type: String, required: false },
    mrDate: { type: String, required: false },
    mop: { type: String, required: false },
    chequeNo: { type: String, required: false },
    chequeDate: { type: String, required: false },
    bank: { type: String, required: false },
    bankBranch: { type: String, required: false },
    note: { type: String, required: false },
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OMP", ompSchema);
