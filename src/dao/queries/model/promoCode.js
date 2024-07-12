const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

module.exports = PromoCode;
