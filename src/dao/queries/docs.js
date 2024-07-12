const docs = require("./model/docs");
const mongoose = require("mongoose");

const getAllDocument = async () => await docs.find();


module.exports = {
    getAllDocument
  };