const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError.js');
const User = require('../models/user.models.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const { APIResponse } = require('@sredmond/apiresponse');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const registerUser = asyncHandler(async (req , res) =>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images , check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullname, email, username, password } = req.body;
    
    // if(!fullname){
    //     throw new ApiError(400, "Full name is required");
    // }

    if([fullname, email, username, password].some((field) =>
        field?.trim() === ""
    )){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or:[
            {username: username.toLowerCase()},
            {email}
        ]
    })

    if(existingUser){
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files['avatar'][0].path;
    console.log("avlocal: "+avatarLocalPath);
    
    const coverImageLocalPath = req.files['coverImage'][0].path;
    console.log("coverlocal: "+coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
   // console.log(avatar);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar to cloudinary");
    }



    

    const user = new User({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    await user.save();
    // Generate tokens manually after saving
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    // Store refresh token in DB
    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return new APIResponse({ success: true, body: createdUser }).Send(res);

})

const loginUser = asyncHandler(async(req, res) =>{
    // req body => data
    // username or email 
    // find the user
    // validate password
    // access and refresh token
    //send cookie
    // return response

    const {email, username, password} = req.body;
    console.log(req.body);
    

    console.log(email+" "+username+" "+password);
    
    
    if(!email || !username || !password){
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findOne({
        $or:[
            {username: username.toLowerCase()},
            {email}
        ]
    })

    if(!user){
        throw new ApiError(401, "User does not exist");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid password");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({validateBeforeSave: false});


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Here the option make the cookies is made modifiable by only server

    const options = {
        httpOnly:true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
        
            success: true, 
            body: loggedInUser,accessToken,refreshToken, 
            status: 200, 
            message: "User logged in successfully"
        });

})

const loggedOutUser = asyncHandler(async (req, res) => {
     const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined

            }
            
         },{
            new : true
         })

         const options = {
            httpsOnly:true,
            secure: true
         }

         //console.log(user);

         const existingUser = await User.findByIdAndUpdate(user._id).select("-password -refreshToken");
         

         return res
         .status(200)
         .clearCookie("accessToken", options)
         .clearCookie("refreshToken", options)
         .json({
            success: true,
            message: "User logged out successfully",
            status: 200,
            accessToken: undefined,
            refreshToken: undefined,
            user: existingUser
         })

    })


const refreshAccessToken = asyncHandler(async(req, res)=>{
    // req.body => refresh token
    // validate refresh token
    // generate new access token
    // send cookie
    // return response

    const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken


    if(!incomingRefreshToken){
        throw new ApiError(401, "No refresh token provided");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
    
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
    
        await user.save({validateBeforeSave: false});
    
        return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json({
        success: true,
        body: user,
        accessToken,
        refreshToken,
        status: 200,
        message: "Access token refreshed successfully"
       });
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

})

module.exports = {
    registerUser,
    loginUser,
    loggedOutUser,
    refreshAccessToken
}
