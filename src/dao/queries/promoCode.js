const promoCode = require("./model/promoCode");


const getAllPromoCode = async () => await promoCode.find();
const createPromoCode = (promoCodeData) => promoCode.create(promoCodeData);

module.exports = {
    getAllPromoCode,
    createPromoCode,
  };