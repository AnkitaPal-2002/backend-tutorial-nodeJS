const cloudinary = require('cloudinary');
const fs = require('fs');


 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath){
            console.error("No local file path provided");
            return;
        }

        //Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        //File has been uploaed successfully
        console.log("File has been uploaed successfully", response.url);
        return response;
        
    }catch(e){
        fs.unlinkSync(localFilePath) //remove the locally saved temporary file as the upload operation got failed
        return null;
      
    }
}

module.exports = uploadOnCloudinary;

