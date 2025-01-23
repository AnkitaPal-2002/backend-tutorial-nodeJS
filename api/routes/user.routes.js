const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer.middleware.js')

// Import User controller
const registerUser = require ('../controllers/user.controllers.js');

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


module.exports = router;