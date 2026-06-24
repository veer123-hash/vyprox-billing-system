const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
{
  businessName: {
    type: String,
    required: true
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  phone: String,
  email: String,
  address: String,

  plan: {
    type: String,
    enum: ["Free", "Starter", "Pro"],
    default: "Free"
  },

  isActive: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
});

module.exports = mongoose.model(
  "Business",
  BusinessSchema
);