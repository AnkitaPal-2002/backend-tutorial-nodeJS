const ApiError = require('../utils/ApiError.js');
const jwt = require('jsonwebtoken');
const asyncHandler = require( "../utils/asyncHandler");
const User = require('../models/user.models.js');

require('dotenv').config();

const verifyJWT = asyncHandler(async(req, res, next) =>{

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError("Unauthorized access");
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    
        if(!user){
            throw new ApiError("Invalid access token");
        }
    
        req.user = user;
        next();
    } catch (error) {

        throw new ApiError(400, error.message || "Invalid access token")
        
    }

    

})

module.exports = verifyJWT;

