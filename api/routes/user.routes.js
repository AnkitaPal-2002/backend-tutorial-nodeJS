const express = require('express');
const router = express.Router();

// Import User controller
const registerUser = require ('../controllers/user.controllers.js');

console.log(registerUser);


// Register a new user

router.post('/register', registerUser);


module.exports = router;