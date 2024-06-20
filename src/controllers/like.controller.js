import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import {Comment} from "../models/comment.model.js";
import {Tweet} from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on video
  console.log("userId: " + userId);
  console.log("videoId: " + videoId);
  // Validate videoId
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  // Validate user ID
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  try {
    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    // Check if the like exists
    const like = await Like.findOne({
      user: userId,
      video: videoId,
    });
    // If like exists, delete it
    if (like) {
      await Like.findByIdAndDelete(like._id);
      video.likes.pull(like._id);
      await video.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            video,
            like: null,
          },
          "Video unliked successfully"
        )
      );
    } else {
      // If like does not exist, create it
      const newLike = new Like({
        user: userId,
        video: videoId,
      });
      await newLike.save();
      video.likes.push(newLike._id);
      await video.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            video,
            like: newLike,
          },
          "Video liked successfully"
        )
      );
    }
  } catch (error) {
    console.log("Error" + error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user._id;
  // Validate commentId
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }
  // Validate user ID
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  try {
    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    // console.log("Comment"+ comment);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Check if the not comment like
    const like = await Like.findOne({
      user: userId,
      comment: commentId,
    });
    // If like exists, delete it
    if (like) {
      await Like.findByIdAndDelete(like._id);
      comment.likes.pull(like._id);
      await comment.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            comment,
            like: null,
          },
          "Comment unliked successfully"
        )
      );
    } else {
      // If like does not exist, create it
      const newLike = new Like({
        user: userId,
        comment: commentId,
      });
      await newLike.save();
      comment.likes.push(newLike._id);
      await comment.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            comment,
            like: newLike,
          },
          "Comment liked successfully"
        )
      );
    }
    
  } catch (error) {
    console.log("Error: " + error.message);
    throw new ApiError(500, "Internal server error");
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user._id;
  // Validate tweetId
  if (!tweetId ||!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  // Validate user ID
  if (!userId ||!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  try {
    // Check if the tweet exists
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    // Check if the not tweet like
    const like = await Like.findOne({
        user: userId,
        comment: tweetId,
      });
    if(like){
    // Check if the like exists
      await Like.findByIdAndDelete(like._id);
      tweet.likes.pull(like._id);
      await tweet.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            tweet,
            like: null,
          },
          "Tweet unliked successfully"
        )
      );
    } else {
      // If like does not exist, create it
      const newLike = new Like({
        user: userId,
        tweet: tweetId,
      });
      await newLike.save();
      tweet.likes.push(newLike._id);
      await tweet.save();
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            tweet,
            like: newLike,
          },
          "Tweet liked successfully"
        )
      );
    }
  } catch (error) {
    console.log("Error: " + error.message);
    throw new ApiError(500, "Internal srver error");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  if (!userId ||!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  try {
    const likes = await Like.find({ user: userId }).populate('video');
    const likedVideo = likes.map((like) => like.video);
    const videos = await Video.find({ _id: { $in: likedVideo } });
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
        },
        "Liked videos retrieved successfully"
      )
    );
  } catch (error) {
    console.log("Error: " + error.message);
    throw new ApiError(500, "Internal server error");
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
