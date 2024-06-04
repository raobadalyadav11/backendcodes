import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js"
import uploadFile from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponce.js";
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation checking not empty
  // check if user already exists :email and usernames
  // check for images for avatar
  // upload them to cloudinary server, avatar
  // craete user object - user entery in db
  // remove password and refresh token field fromm responce
  // check for user creation
  // return response
  const { fullName, email, username, password } = req.body;
  console.log("email: " + email, password);
  if ([email, username, password].some((field) =>
     field?.trim() === "")
) {
    throw new ApiError(400, "All fields are required");
  }
  const exitUser=User.findOne({
    $or:[{username},{email}]
  })
  if (exitUser) {
    throw new ApiError(400, "User already exists");
  }

  const avatarLocalPath= req.fields?.avatar[0]?.path
  const coverLocalPath= req.fields?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar field is required");
  }

  const avatar=await uploadFile(avatarLocalPath);
  const coverImage=await uploadFile(coverLocalPath);
  if(!avatar){
    throw new ApiError(400, "Avatar field is required");
  }

  const user= await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage.url || "",
    email,
    password,
    username:username.toLowerCase()
  })

  const createUser=User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createUser){
    throw new ApiError(500, "User not registered");
  }
  return res.status(200).json(
    ApiResponse(200,createUser, "User register successfully", )
  )
});

export default registerUser;
