import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadFile from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(500, "user not found");
    }
    const accessToken = user.generateAcessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    console.log("AccessToken:", accessToken); // Debugging log
    console.log("RefreshToken:", refreshToken); // Debugging log
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation checking not emptyS
  // check if user already exists :email and usernames
  // check for images for avatar
  // upload them to cloudinary server, avatar
  // craete user object - user entery in db
  // remove password and refresh token field fromm responce
  // check for user creation
  // return response

  // Extract user details from the request body
  const { fullName, email, username, password } = req.body;

  // Validate that all required fields are provided
  if ([email, username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if the user already exists
  const exitUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exitUser) {
    throw new ApiError(400, "User already exists");
  }

  // Get paths for avatar and cover image from the request
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverLocalPath = req.files?.coverImage[0]?.path;

  let coverLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverLocalPath = req.files.coverImage[0]?.path;
  }
  // Ensure that avatar file is provided
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar files is required");
  }
  const avatar = await uploadFile(avatarLocalPath);
  const coverImage = await uploadFile(coverLocalPath);

  // Check if avatar upload was successful
  if (!avatar) {
    throw new ApiError(400, "failed to upload Avatar");
  }

  // Create a new user in the database
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Find the created user by ID and exclude sensitive fields
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Check if user was successfully created
  if (!createUser) {
    throw new ApiError(500, "User not registered");
  }

  // Return success response with created user data
  return res
    .status(200)
    .json(new ApiResponse(200, createUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body => data for login
  //usename or email for login
  //find user by username
  // password checking
  // access and refresh token
  // send cookies
  // send responce
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, "username or email is  required");
  }
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "user is does not exits");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  console.log("AccessToken:", accessToken); // Debugging log
  console.log("RefreshToken:", refreshToken); // Debugging log

  const loggedInUser = await User.findOne(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged SuccessFully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200,
        {},
        { message: "user logged out successfully" },
        "user logged out SuccessFully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "No refresh token provided unauthenticated");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );
  
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh Token provided ");
    }
    if (!incomingRefreshToken) {
      throw new ApiError(401, "No refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(200, accessToken, refreshToken, "Access token Refreshed")
      );
  } catch (error) {
    throw new ApiError(401,error?.message|| "invalid refresh token"
    )
  }
});

export { registerUser, loginUser, logoutUser,refreshAccessToken };
