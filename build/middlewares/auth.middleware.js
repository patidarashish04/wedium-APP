const jwt = require("jsonwebtoken");
const { User } = require("../dao/queries");
const { getUserByEmail } = require('../services/User/function');

const loggedIn = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).send("Access Denied..No token provided.");
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        if (verified.role === 'Admin') {
            next();
        } else {
            return next(res.status(401).json({
                message: "Unauthorized! you must be an Admin"
            }));
        }
    } catch (err) {
        res.status(400).json({
            message: "Invalid Token"
        });
    }
};

const adminOnly = async (req, res, next) => {
    const email = req.body.email;
    const user = await getUserByEmail(email);
    if (user.role != 'Admin') {
        return next(res.status(401).json({
            message: "Unauthorized! you must be an Admin"
        }));
    }
    next();
};

// check if user is authenticated
const isAuthenticated = async (req, res, next) => {
    let token = req.header('Authorization');
    // make sure that token is dended
    if (!token) {
        return next(new ErrorResponse('You must log in to access this ressource', 401));
    }
    try {
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        const user = await User.findUserUpdate(token.email);

        next();
    } catch (error) {
        return next(new ErrorResponse('You must login to access this ressource', 401));
    };
};

// const auth = async (req,res,next) => {
//     try {
//         const token = req.header("Authorization");

//         if(!token){
//             return res.status(400).json({ msg: "You are not authorized" });
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         if (!decoded) {
//           return res.status(400).json({ msg: "You are not authorized" });
//         }

//         const user = await Users.findOne({_id: decoded.id});

//         req.user = user;
//         next();
//     } catch (err) {
//         return res.status(500).json({msg: err.message});
//     }
// }

module.exports = {
    loggedIn,
    adminOnly,
    isAuthenticated
};