const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer.middleware.js')
const verifyJWT = require('../middleware/auth.middleware.js')

// Import User controller
const {registerUser, loginUser, loggedOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar,
    updateUserCoverImg } = require ('../controllers/user.controllers.js');

//const loginUser = require ('../controllers/user.controllers.js').loginUser;

console.log(registerUser);


// Register a new user

router.post('/register', upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser);

router.post('/login', loginUser);

//secured routes 
router.post('/logout', verifyJWT, loggedOutUser)

router.post('/refresh-token', refreshAccessToken)

router.get('/profile', verifyJWT, getCurrentUser)

router.put('/update-details', verifyJWT, updateAccountDetails)

router.put('/update-password', verifyJWT, changeCurrentPassword)

router.put('/update-avatar', upload.fields(
    {
        name: "avatar",
        maxCount: 1
    }
), updateUserAvatar);

router.put('/update-cover-img', upload.fields(
    {
        name: "coverImage",
        maxCount: 1
    }
    ), updateUserCoverImg);

    


module.exports = router;