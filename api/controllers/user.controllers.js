const asyncHandler = require('../utils/asyncHandler.js');
const ApiError = require('../utils/ApisError.js');
const {User} = require('../utils/user.models.js');
const uploadOnCloudinary = require('../utils/cloudinary.js');
import { APIResponse } from '@sredmond/apiresponse';

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

    if([fullname, email, username, password].some((field) =>{
        field?.trim() === ""
    })){
        throw new ApiError(400, "All fields are required");
    }

    const existingUser =  User.findOne({
        $or:[
            {username},
            {email}
        ]
    })

    if(existingUser){
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(500, "Failed to upload avatar to cloudinary");
    }

    const user = User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return new APIResponse({ success: true, body: user }).Send(res);

})


module.exports = registerUser