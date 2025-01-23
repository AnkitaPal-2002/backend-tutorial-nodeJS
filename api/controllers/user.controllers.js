const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApiError.js');
const User = require('../models/user.models.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
const { APIResponse } = require('@sredmond/apiresponse');

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


module.exports = registerUser