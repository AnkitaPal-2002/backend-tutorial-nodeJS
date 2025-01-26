const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer.middleware.js')
const verifyJWT = require('../middleware/auth.middleware.js')

// Import User controller
const {registerUser, loginUser, loggedOutUser} = require ('../controllers/user.controllers.js');

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


module.exports = router;