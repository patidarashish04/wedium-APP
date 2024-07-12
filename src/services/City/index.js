const {
  createCitys,
  getCityByid,
  getAllCity,
  updateCityByid,
  deleteCityByid,
} = require("../City/function");

// GET City
const createCity = async (req, res) => {
  try {
    const body = req.body;
    // Create Store in our database
    const City = await createCitys(body);
    res.status(200).json({ CityDetails: City });
  } catch (err) {
    res.status(500).json({ message: "Error creating City" });
  }
};

//  retrive and return a All City
const getCity = async (req, res, next) => {
  getAllCity()
    .then((City) => {
      res.status(200).json({
        data: City,
        success: true,
        message: "City found",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message:
          err.message || "Error Occurred while retriving City information",
      });
      next(err);
    });
};

// retrive and return a single City
const FindOneCity = async (req, res, next) => {
  const id = req.params.id;
  getCityByid(id)
    .then(async (City) => {
      try {
        if (!City && City.id) {
          res.status(404).json({ message: "Not found City with id " + id });
        } else {
          res.status(200).json(City);
        }
      } catch (err) {
        res
          .status(500)
          .json({ message: "Error retrieving City with id " + id });
      }
    })
    .catch((err) => res.status(500).json(err));
};

// update City
const updateCity = async (req, res) => {
  console.log("INFO : ", "poiuytrew");
  const data = req.body;
  if (!data) {
    return res.status(400).json({ message: "Data to update can not be empty" });
  }
  const id = req.params.id;
  await updateCityByid(id, data)
    .then((data) => {
      if (!data) {
        res.status(404).json({
          message: `Cannot Update City with ${id}. Maybe City not found!`,
        });
      } else {
        res
          .status(200)
          .json({ message: " Successfully Updated City information" });
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Error Update City information" });
    });
};
// delete City
const deleteCity = async (req, res, next) => {
  const id = req.params.id;
  await deleteCityByid(id)
    .then((data) => {
      if (!data) {
        res
          .status(404)
          .json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
      } else {
        res.status(200).json({
          message: "City was deleted successfully!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        message: "Could not delete City with id=" + id,
      });
    });
};

module.exports = {
  createCity,
  getCity,
  FindOneCity,
  updateCity,
  deleteCity,
};
