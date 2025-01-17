const mongoose = require('mongoose');

// Connect to MongoDB

const db = async() =>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
            
        console.log("Connected to MongoDB")
    }catch(e){
        console.error("Failed to connect to MongoDB", e);
    }
} 


module.exports = db;


