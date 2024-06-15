import mongoose, { isValidObjectId } from "mongoose";
import { Subscribtion } from "../models/subscribtion.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  const userId = req.user._id;

  // Validate channelId
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  try {
    // Check if the subscription exists
    const subscription = await Subscribtion.findOne({
      subscribers: userId,
      channel: channelId,
    });

    if (subscription) {
      // If subscription exists, remove it (unsubscribe)
        await Subscribtion.deleteOne({
        _id: subscription._id,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "Unsubscribed successfully")
        );
    } else {
      // If subscription does not exist, create it (subscribe)
      const newSubscription = await Subscribtion.create({
        subscribers: userId,
        channel: channelId,
      });
      return res
        .status(201)
        .json(new ApiResponse(201, newSubscription, "Subscribed successfully"));
    }
  } catch (error) {
    console.error("Error toggling subscription:", error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    console.log("Request params:", req.params); // Add this line to debug
  const { channelId } = req.params;
  console.log("Received channelId:", channelId);

  // TODO: get all subscribers of a channel
// Validate channelId
if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  try {
    // Get all subscribers of a channel
    const subscribers = await Subscribtion.find({ channel: channelId }).populate('subscribers', 'username avatar');

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving subscribers:", error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  // TODO: get all channels to which user has subscribed
    
  // Validate subscriberId
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }
  try {
    const subscriptions = await Subscribtion.find({ subscribers: subscriberId }).populate('channel', 'username', 'avatar');
    return res.status(200).json(new ApiResponse(200, subscriptions, "Subscribed channels retrieved successfully"));
  } catch (error) {
    console.error("Error retrieving subscribed channels:", error.message);
    throw new ApiError(500, "Internal Server Error");
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
