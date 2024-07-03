import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscribtion } from "../models/subscribtion.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Channel } from "../models/channel.model.js";
import { User } from "../models/user.model.js";
import uploadFile from "../utils/cloudinary.js"

const createChannel = asyncHandler(async (req, res) => {
  //TODO: create channel
  console.log(req.body);
  const { name, description } = req.body;
  const userId = req.user._id;
  // console.log("Request Body:", JSON.stringify(req.body));
  // console.log("User: " + userId);
  // console.log("name: " + name);
  // console.log("description: " + description);
 
  if (!name || !description) {
    throw new ApiError(
      400,
      "Name, description are required"
    );
  }
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  // Check if the channel already exists
  const channel = await Channel.findOne({ name });
  if (channel) {
    throw new ApiError(400, "Channel already exists");
  }
  try {
    const avatarChannelLocalImage = req.files?.avatar[0]?.path;
    if (!avatarChannelLocalImage) {
      throw new ApiError(400, "avatar files is required");
    }
    const channelCoverImageLocalImage = req.files?.coverImage[0]?.path;
    // upload image on cloudinary server
    const avatarChannelImage = await uploadFile(avatarChannelLocalImage);
    if (!avatarChannelImage.url) {
      throw new ApiError(400, "failed to upload channel avatar");
    }
    const channelCoverImage = await uploadFile(channelCoverImageLocalImage);
    if (!channelCoverImage.url) {
      throw new ApiError(400, "failed to upload coverImage");
    }

    // Create the channel
    const channel = await Channel.create({
      name,
      description,
      avatar: avatarChannelImage.url,
      coverImage:  channelCoverImage.url || "",
      owner: userId,
      videos: [],
      subscribers: [],
    });
    // Save the channel
    await channel.save();
    // Return the created channel
    return res
      .status(201)
      .json(new ApiResponse(201, channel, "Channel created successfully"));
  } catch (error) {
    console.log("Error: " + error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});
const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;
  // Validate channelId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  try {
    // Check if the channel exists
    const channel = await Channel.findById(channelId);
    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }
    // get the total number of videos
    const videos = await Video.countDocuments({ channel: channelId });
    // get the total number of subscribers
    const subscribers = await Subscribtion.countDocuments({
      channel: channelId,
    });

    // get the total number of video viewers
    const totalViews = await Video.aggregate([
      { $match: { channel: channelId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    // get the total number of likes
    const likes = await Like.countDocuments({ channel: channelId });
    // get statistics
    const stats = {
      videos: videos,
      subscribers: subscribers,
      totalViews: totalViews[0].totalViews,
      likes: likes,
    };
    // Return the stats
    return res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Channel stats retrieved successfully")
      );
  } catch (error) {
    console.log("Error: " + error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId}=req.params.channel;
  if (!channelId){
    throw new ApiError(404, "Channel doesnot exits");
  }o
  const findChannel=  await Channel.findById(channelId);
  findChannel
  
});

export { getChannelStats, getChannelVideos, createChannel };
