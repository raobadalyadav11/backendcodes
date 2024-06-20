import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  console.log("Request body:", req.body);
  const { content } = req.body;
  try {
    const userId = req.params.userId || req.user._id;
    console.log(userId);
    if (!userId || !isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }
    if (!content) {
      throw new ApiError(400, "Content is required");
    }

    const tweet = await Tweet.create({
      content: content,
      user: userId,
    });
     await tweet.save();
    const user = await User.findById(userId).select("-password -refreshToken")
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    user.tweets.push(tweet._id);
    const newTweet = await user.save();

    return res
      .status(201)
      .json(new ApiResponse(200, {newTweet}, "Create tweet successfully"));
  } catch (error) {
    console.log(error);
    console.log(error.message);
    throw new ApiError(400, "Failed to create tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
console.log("userId received", userId);
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId).populate('tweets');
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const tweets = user.tweets;
    return res.status(200).json(new ApiResponse(200, {tweets}, "User tweets retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving user tweets:", error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  if (!tweetId ||!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  try {
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    tweet.content = req.body.content || tweet.content;
    await tweet.save();
    return res
     .status(200)
     .json(new ApiResponse(200, {tweet}, "Update tweet successfully"));
  } catch (error) {
    console.error("Error updating tweet:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!tweetId ||!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  try {
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    await tweet.deleteOne();

    return res
     .status(200)
     .json(new ApiResponse(200, {tweet}, "Delete tweet successfully"));
  } catch (error) {
    console.error("Error deleting tweet:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
