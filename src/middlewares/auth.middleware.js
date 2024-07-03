import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export  const verifyJWT=asyncHandler(async(req,_,next)=>{
   try {
    console.log(req.body);
     const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    //  console.log("token",token);
     if (!token) {
         throw new ApiError(401,"Unauthorized access token")
     }
     const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);
     const user=await User.findOne(decodedToken?._id).select("-password -refreshToken")
     if (!user) {
         // TODO discus about frontent
         throw new ApiError(401,"Unauthorized user access token")
     }
     req.user=user;
     next();
   } catch (error) {
    throw new ApiError(401,error?.message|| "invalid access token")
   }
})