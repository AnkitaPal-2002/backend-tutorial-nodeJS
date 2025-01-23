const cloudinary = require('cloudinary').v2;
const fs = require('fs');

//dotenv configuration
require('dotenv').config();


 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        console.log("localpath: "+localFilePath);

        //console.log(fs.existsSync(localFilePath))

        if (!fs.existsSync(localFilePath)) {
            console.error("File not found:", localFilePath);
            //return null;
        }
        
        //Check if a local file path is provided
        if(!localFilePath){
            console.error("No local file path provided");
            return;
        }

        //console.log(cloudinary.config());
        
        //console.log("Hi");
        
        //Upload the file on cloudinary
        // Upload an image
     const uploadResult = await cloudinary.uploader
     .upload(
         localFilePath, {
             resource_type: "auto"
         }
     )

     console.log("File has been uploaed successfully", uploadResult.url);
     fs.unlinkSync(localFilePath);
     return uploadResult;


        //File has been uploaed successfully
        // console.log("File has been uploaed successfully", response.url);
        // return response;
        
    }catch(e){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
      
    }
}

module.exports = uploadOnCloudinary;

