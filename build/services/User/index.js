const bcrypt = require('bcrypt');
// const { Countries, State, City }  = require('country-state-city');
// let Country = require('country-state-city').Country;
// let State = require('country-state-city').State;
// const { Countries, States, Cities } = require('countries-states-cities-service');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config('.env.local');
const { getUserByEmail, createUser, updateUserById, deleteUserById } = require('../User/function');
const { firebase } = require('../../utils/firebase');
// user register
const register = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate user input
        if (!(body.email && body.password && body.name)) {
            res.status(400).json("All input is required");
        }
        // check if user already exist
        const oldUser = await getUserByEmail(body.email);
        if (oldUser.length > 0) {
            return res.status(409).json("User Already Exist. Please Login");
        }
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(body.password, 5);
        const options = {
            name: body.name,
            email: body.email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword
            // role : phone === process.env.ADMIN_PHONE ? "ADMIN" :"USER"
        };
        // Create user in our database
        const user = await createUser(options);
        const token = jwt.sign({ User_id: user._id, User_email: user.email, role: user.role }, process.env.TOKEN_SECRET);
        res.status(201).json({ userDetails: user, token });
    } catch (err) {
        console.log(err);
    }
};

// user login
const login = async (req, res, next) => {
    try {
        // Get user input
        const body = req.body;
        // Validate user input
        if (!(body.email && body.password)) {
            res.status(400).json("All input is required");
        }
        // Validate if user exist in our database
        const user = await getUserByEmail(body.email);
        if (user && (await bcrypt.compare(body.password, user[0].password))) {
            // Create token
            const token = jwt.sign({ User_id: user[0]._id, User_email: user[0].email, role: user[0].role }, process.env.TOKEN_SECRET, {
                expiresIn: "24h"
            });
            res.header("auth-token", token).json({ "token": token });
            user.token = token;
            const updatedUser = await updateUserById(user._id, {
                $set: { active: true }
            });
            return [true, updatedUser, token];
        }
        res.status(400).json("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
};

// user profile
// const profile = async (req, res) => {
//     try {
//         console.log('under aa gya h')
//         const userRef = firebase.firestore().collection('users');
//         userRef
//         .get()
//         .then((snapshot) => {
//           const data = snapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           console.log("All data in 'books' collection", data); 
//           // [ { id: 'glMeZvPpTN1Ah31sKcnj', title: 'The Great Gatsby' } ]
//         });
//     } catch (err) {
//         console.log(err);
//     }
// }

// user location
const location = async (req, res) => {
    try {
        // console.log('***********locaton***********88',Country.getAllCountries())
        // console.log('***********locaton***********88',State.getAllStates())
        // let States = getStates('in');
        // const countries = Countries.getCountries({ locale: 'it' })
        // const location = await getLocation(phone);
        res.status(201).json({
            data: location,
            status: true,
            message: null
        });
    } catch (err) {
        console.log(err);
    }
};

//  update user
const updateUser = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res.status(400).json({ message: "Data to update can not be empty" });
    }
    const id = req.params.id;
    await updateUserById(id, data).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Update SubCategory with ${id}. Maybe SubCategory not found!` });
        } else {
            res.json(data);
        }
    }).catch(err => {
        res.status(500).json({ message: "Error Update SubCategory information" });
    });
};

//  delete user
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    await deleteUserById(id).then(data => {
        if (!data) {
            res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` });
        } else {
            res.json({
                message: "user was deleted successfully!"
            });
        }
    }).catch(err => {
        res.status(500).json({
            message: "Could not delete user with id=" + id
        });
    });
};

module.exports = {
    register,
    login,
    updateUser,
    deleteUser,
    location
};