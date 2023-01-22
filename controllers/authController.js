const User = require('../models/User');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require('../utils/responseWrapper');
const { response } = require('express');

//controller function
const signupController = async (req, res) => {

    try{
        const {firstName, lastName, email, password} = req.body;

        if(!email || !password || !firstName || !lastName){
            return res.send(error(403, "Please fill all the details required"));
        }

        const isUserPresent = await User.findOne({ email });
        if(isUserPresent){
            return res.send(error(409, "Email already exists. Please login"));
        }

        const hashedPassword = await bcrypt.hash(password, 11);

        const newUser = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        });

        const myNewUser = await User.findById(newUser._id);
        return res.send(success(201, {
            myNewUser,
        }));
    } catch (e) {
        response.send(error(500, e.message));
        //console.log(e);
    }
};

//controller function
const loginController = async (req, res) => {

    try {
            const { email, password } = req.body;

        if(!email || !password) {
            return res.send(error(400, "Email or Password is missing"));
        }

        const isUserPresent = await User.findOne({ email }).select('+password');

        if(!isUserPresent) {
            return res.send(error(404, "You are not registered please signup"));
        }

        const match = await bcrypt.compare(password, isUserPresent.password);

        if(!match){
            return res.send(error(403, "Incorrect Password. Please enter a valid password"));
        }

        const accessToken = generateAccessToken({
            _id: isUserPresent._id,
        });

        const refreshToken = generateRefreshToken({
            _id: isUserPresent._id,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
        });

        return res.send(success(200, { accessToken }));
            
    } catch (e) {
        response.send(error(500, e.message));
        //console.log(e);
    }
};

//controller function
const logutController = async (req, res) => {
    try {
        res.clearCookie(refreshToken, {
            httpOnly: true,
            secure: true,
        });
        res.send(success(200, 'RefreshToken cleared from cookies'));

    } catch (e) {
        res.send(error(500, e.message));
    }
}

//controller function
const refreshTokenController = async (req, res) => {
    const cookies = req.cookies;
    //const { refreshToken } = req.body;

    if(!cookies.refreshToken) {
        return res.send(error(401, "Please login first"));
    }

    const refreshToken = cookies.refreshToken;

    try {
        const verifyExistingRefreshToken = jwt.verify(
            refreshToken,
            process.env.PRIVATE_REFRESH_TOKEN_KEY
        );
    
        const _id = verifyExistingRefreshToken._id;
        const accessToken = generateAccessToken({ _id });
    
        return res.send(success(201, { accessToken }));
    } catch (error) {
        console.log(error);
        return res.send(error(401, "This user is using social media since last 1 year. No more refresh token for him. He must logout now. SENSELESS GUY"));
    }
};

// This is definition of function
const generateAccessToken = (value) => {
    try {
        const accessToken = jwt.sign(value, process.env.PRIVATE_ACCESS_TOKEN_KEY, {
            expiresIn: "10m",
        });
        //console.log(`This is Access Token: ${accessToken}`);
        return accessToken;
    } catch (error) {
        response.send(error(500, e.message));
        //console.log(error);
    }
};

//This is definition of function
const generateRefreshToken = (value) => {
    try {
        const refreshToken = jwt.sign(value, process.env.PRIVATE_REFRESH_TOKEN_KEY, {
            expiresIn: "1y",
        });
        //console.log(`This is Refresh Token: ${refreshToken}`);
        return refreshToken;
    } catch (error) {
        response.send(error(500, e.message));
        //console.log(error);
    } 
};

module.exports = { signupController, loginController, logutController, refreshTokenController };