const Registers = require('../../dao/queries/model/register');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config('.env.local');
const { getmyname,} = require('./function');

// user register
const register = async (req, res, next) => {
    try {
        const { name, email, password, role} = req.body;
        // Validate user input
        if (!(email && password && name)) {
            res.status(400).json("All input is required");
        }
        // check if user already exist
        const oldUser = await Registers.findOne({ email });
        if (oldUser) {
            return res.status(409).json("User Already Exist. Please Login");
        }
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
        // Create user in our database
        const user = await Registers.create({
            name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,
            role,
        });
        const token = jwt.sign({ User_id: user._id, User_email: user.email, role: user.role }, process.env.TOKEN_SECRET);
        res.status(201).json({user, token});
    } catch (err) {
        console.log(err);
    }
};

// user login
const login = async (req, res, next) => {
    try {
        // Get user input
        const { email, password } = req.body;
        // Validate user input
        if (!(email && password)) {
            res.status(400).json("All input is required");
        }
        // Validate if user exist in our database
        const user = await Registers.findOne({ email });
         
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { User_id: user._id, User_email: user.email, role: user.role },
                process.env.TOKEN_SECRET,
                {
                    expiresIn: "24h",
                }
            );
            res.header("auth-token", token).json({"token": token});
            user.token = token; 
            const updatedUser = await Registers.findByIdAndUpdate(user._id, {
                $set: { active: true },
              });
              return [true, updatedUser,token];
        }
        res.status(400).json("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
};


//  update user
const updateUser = async (req, res, next) => {
    if (!req.body) {
        return res
            .status(400)
            .json({ message: "Data to update can not be empty" })
    }
    const id = req.params.id;
    Registers.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
        .then(data => {
            if (!data) {
                res.status(404).json({ message: `Cannot Update user with ${id}. Maybe user not found!` })
            } else {
                res.json(data)
            }
        })
        .catch(err => {
            res.status(500).json({ message: "Error Update user information" })
        })
}

// user delete
const deleteUser = async (req, res, next) => {
    const id = req.params.id;
    Registers.findByIdAndDelete(id)
    .then(data => {
        if (!data) {
                res.status(404).json({ message: `Cannot Delete with id ${id}. Maybe id is wrong` })
            } else {
                res.json({
                    message: "User was deleted successfully!"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                message: "Could not delete User with id=" + id
            });
        });
}

module.exports = {
	register,
	login,
    updateUser,
    deleteUser
};