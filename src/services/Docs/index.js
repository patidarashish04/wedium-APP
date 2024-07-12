const { getAllDocument } = require("../Docs/functions");

// retrieve and return all PromoCode
const getDocumentList = async (req, res, next) => {
    getAllDocument()
    .then((doc) => {
      console.log(doc);
      res.status(200).json({
        data: doc,
        success: true,
        message: null,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Error Occurred while retriving doc information",
      });
      next(err);
    });
};



module.exports = {
    getDocumentList
};
