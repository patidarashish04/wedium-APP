const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config('.env.local');
const { firebase } = require('../../utils/firebase');
const User = require("../../dao/queries/model/user");
const { City, CityLite } = require('country-state-city-js')
const { generateOTP, fast2sms } = require("../../utils/otp.util");

// const city = require('country-state-city').city;

const { getUserByPhone, createUser, updateUserById, deleteUserById, } = require('../User/function');
// const { City } = require('country-state-city');

// user register
const register = async (req, res, next) => {
    try {
        const body = req.body;
        // Validate user input
        if (!(body.phone && body.password)) {
            res.status(400).json("All input is required");
        }
        // check if user already exist
        const oldUser = await getUserByPhone(body.phone);
        if (oldUser.length > 0) {
            return res.status(409).json("User Already Exist. Please Login");
        }
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(body.password, 5);
        const options = {
            name: body.name,
            phone: body.phone,
            email: body.email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            // role : phone === process.env.ADMIN_PHONE ? "ADMIN" :"USER"
        };
        // Create user in our database
        const user = await createUser(options);
        const token = jwt.sign({ User_id: user._id, User_phone: user.phone, role: user.role }, process.env.TOKEN_SECRET);
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
        if (!(body.phone && body.password)) {
            res.status(400).json("All input is required");
        }
        // Validate if user exist in our database
        const user = await getUserByPhone(body.phone);
        
        if (user && (await bcrypt.compare(body.password, user.password))) {
            // Create token
            const token = jwt.sign(
                { User_id: user._id, User_phone: user.phone, role: user.role },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: "7d",
                }
            );
            res.header("auth-token", token).json({ user, "token": token });
            user.token = token;
            const updatedUser = await updateUserById(user._id, {
                $set: { active: true },
            });
            return [true, updatedUser, token];
        }
        res.status(400).json("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
};

const generateOtp = async (req, res) => {
    const contact = pass.contact;
    const otp = await otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, alphabets: false });
    const options = { authorization: FAST2SMS_API_KEY, message: `Your OTP is ${otp}`, numbers: [8888888888, 9999999999, 6666666666] };
    const message = await fast2sms.sendMessage(options) //Asynchronous Function.
    const user = new user({
        contact,
        otp
    })
    user.save()
        .then(result => {
            console.log(otp);
            console.log(result);
            message,
            res.end();
        })
}

// user location
const location = async (req, res) => {
    try {
        const cities = City('IN', 'UP') // or CityLite('IN', 'UP')
        res.status(201).json({
            data: location,
            status: true,
            message: null
        })
    } catch (err) {
        console.log(err);
    }
};

//  update user
const updateUser = async (req, res, next) => {
    const data = req.body;
    if (!data) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    await updateUserById(id, data)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update SubCategory with ${id}. Maybe SubCategory not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update SubCategory information" })
        })
}

//  delete user
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    await deleteUserById(id)
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "user was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete user with id=" + id
            });
        });
}


// --------------------- create new user ---------------------------------

const createNewUser = async (req, res, next) => {
    try {
        let { phone, name } = req.body;
        // check duplicate phone Number
        const phoneExist = await User.findOne({ phone });

        if (phoneExist) {
            next({ status: 400, message: 'phone Number already exist' });
            return;
        }
        // create new user
        const createUser = new User({
            phone,
            name,
            role: phone === process.env.ADMIN_PHONE ? "ADMIN" : "USER"
        });
        // save user
        const user = await createUser.save();
        res.status(200).json({
            type: "success",
            message: "Account created OTP sended to mobile number",
            data: {
                userId: user._id,
            },
        });
        // generate otp
        const otp = generateOTP(6);
        // save otp to user collection
        user.phoneOtp = otp;
        await user.save();
        // send otp to phone number
        await fast2sms(
            {
                message: `Your OTP is ${otp}`,
                contactNumber: user.phone,
            },
            next
        );
    } catch (error) {
        next(error);
    }
};


// ------------ login with phone otp ----------------------------------

const loginWithPhoneOtp = async (req, res, next) => {
    try {
        const { phone } = req.body;
        const user = await User.findOne({ phone });
        if (!user) {
            next({ status: 400, message: 'Phone number not found' });
            return;
        }
        res.status(201).json({
            type: "success",
            message: "OTP sended to your registered phone number",
            data: {
                userId: user._id,
            },
        });

        // generate otp
        const otp = generateOTP(6);
        // save otp to user collection
        user.phoneOtp = otp;
        user.isAccountVerified = true;
        await user.save();
        // send otp to phone number
        await fast2sms(
            {
                message: `Your OTP is ${otp}`,
                contactNumber: user.phone,
            },
            next
        );
    } catch (error) {
        next(error);
    }
};

// ---------------------- verify phone otp -------------------------

const verifyPhoneOtp = async (req, res, next) => {
    try {
        const { otp, userId } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            next({ status: 400, message: 'user not found' });
            return;
        }
        if (user.phoneOtp !== otp) {
            next({ status: 400, message: 'INCORRECT OTP' });
            return;
        }
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET);
        user.phoneOtp = "";
        await user.save();
        res.status(201).json({
            type: "success",
            message: "OTP verified successfully",
            data: {
                token,
                userId: user._id,
            },
        });
    } catch (error) {
        next(error);
    }
};


// --------------- fetch current user -------------------------

const fetchCurrentUser = async (req, res, next) => {
    try {
        const currentUser = res.locals.user;
        return res.status(200).json({
            type: "success",
            message: "fetch current user",
            data: {
                user: currentUser,
            },
        });
    } catch (error) {
        next(error);
    }
};

// --------------- admin access only -------------------------

const handleAdmin = async (req, res, next) => {
    try {
        const currentUser = res.locals.user;
        return res.status(200).json({
            type: "success",
            message: "Okay you are admin!!",
            data: {
                user: currentUser,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    updateUser,
    deleteUser,
    profile,
    location,
    generateOtp,
    createNewUser,
    loginWithPhoneOtp,
    verifyPhoneOtp,
    fetchCurrentUser,
    handleAdmin,
};