import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

 const uploadFile = async (localfile) => {
    try {
        if(!localfile) return null
        // upload on cloudinary server 
    const responce=   await cloudinary.uploader.upload(localfile,{
            resource_type:"image",
        });
        // file has been successful upload
        console.log("file is successfully uploaded");
        console.log(responce.url);
    // Delete the locally saved temporary file
    fs.unlinkSync(localfile);

    return responce;
    } catch (error) {
        console.log("error uploading file");
        if (fs.existsSync(localfile)) {
            fs.unlinkSync(localfile) //delete locally saved temporary file file
        }
        return null;
    }
}

export default uploadFile;