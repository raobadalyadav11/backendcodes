import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadFile = async (localfile) => {
    try {
        if(!localfile) return null
        // upload on cloudinary server 
    const responce=   await cloudinary.uploader.uploadFile(localfile,{
            resource_type:"auto"
        }) 
        // file has been successful upload
        console.log("file is successfully uploaded");
        console.log(responce.url);
        return responce;
    } catch (error) {
        fs.unlinkSync(localfile) //delete locally saved temporary file file
        return null;
    }
}