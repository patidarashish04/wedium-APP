const dbServices = require('../../dao/queries/index');

// create City +
const createCitys = async (City) => {
	try {
		const dbResponse = await dbServices.City.createCity(City);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get City +
const getCitydata = async (data) => {
	try {
		const dbResponse = await dbServices.City.getCitydata(data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// get City by id +
const getCityByid = async (id) => {
	try {
		const dbResponse = await dbServices.City.getCityByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// get All City +
const getAllCity = async () => {
	try {
		const dbResponse = await dbServices.City.getAllCity();
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
// create City +
const updateCityByid = async (id, data) => {
	try {
		const dbResponse = await dbServices.City.updateCityByid(id, data);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};

// delete City +
const deleteCityByid = async (id) => {
	try {
		const dbResponse = await dbServices.City.deleteCityByid(id);
		return dbResponse;
	} catch (err) {
		throw new Error(err);
	}
};
module.exports = {
	createCitys,
	getCityByid,
	getCitydata,
	getAllCity,
	updateCityByid,
	deleteCityByid
};