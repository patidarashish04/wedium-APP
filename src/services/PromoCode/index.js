const { getAllPromoCode,createPromoCodefunction } = require("../PromoCode/function");

// retrieve and return all PromoCode
const getPromoCodeList = async (req, res, next) => {
  getAllPromoCode()
    .then((PromoCode) => {
      console.log(PromoCode);
      res.status(200).json({
        data: PromoCode,
        success: true,
        message: null,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Error Occurred while retriving PromoCode information",
      });
      next(err);
    });
};

// Create PromoCode
const createPromoCode = async (req, res, next) => {
  try {
    const body = req.body;

    // Validate input
    if (!body.code || !body.expiry || !body.discount) {
      return res.status(400).json({ message: "Code, expiry, and discount are required" });
    }

    // Create PromoCode in the database
    const newPromoCode = await createPromoCodefunction(body);

    res.status(201).json({
      data: newPromoCode,
      success: true,
      message: "PromoCode created successfully",
    });
  } catch (err) {
    console.error("Error creating PromoCode:", err); // Log the error
    res.status(500).json({
      message: "Error creating PromoCode",
      error: err.message,
    });
    next(err);
  }
};

module.exports = {
  getPromoCodeList,
  createPromoCode
};
