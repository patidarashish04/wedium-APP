const dbServices = require("../../dao/queries/index");


// get All PromoCode +
const getAllPromoCode = async () => {
    try {
      const dbResponse = await dbServices.PromoCode.getAllPromoCode();
      return dbResponse;
    } catch (err) {
      throw new Error(err);
    }
  };
  // Create PromoCode
const createPromoCodefunction = async (promoCodeData) => {
  try {
    const dbResponse = await dbServices.PromoCode.createPromoCode(promoCodeData)
    return dbResponse;
  } catch (err) {
    throw new Error(err);
  }
};

  module.exports = {
    getAllPromoCode,
    createPromoCodefunction
  };