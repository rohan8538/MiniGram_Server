const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { error } = require("../utils/responseWrapper");

module.exports = async (req, res, next) => {
    if(!req.header ||
       !req.headers.authorization ||
       !req.headers.authorization.startsWith("Bearer")
    ) {
        return res.send(error(401, "Authorization key is needed. Please login to view posts"));
    }

    const accessToken = req.headers.authorization.split(" ")[1];
    try {
        const tokenUser = jwt.verify(
            accessToken,
            process.env.PRIVATE_ACCESS_TOKEN_KEY
        );
        req._id = tokenUser._id;

        const user = await User.findById(req._id);

        // Checking if user exists
        if(!user) {
            return res.send(error(404, 'unregistered user'));
        }

        next();
        
    } catch (e) {
        console.log(e.message);
        return res.send(error(401, "User not login or the token expired"));
    }
};