import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadFile from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import { ApiError } from "../utils/ApiError.js";
import cloudinary from "cloudinary";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  // convert page and limit to number
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  // define sorting order
  const sortOrder = sortType === "asc" ? 1 : -1;

  // build the filter object
  const filter = {};
  // add query filter
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  // add user filter
  if (userId) {
    filter.userId = userId;
  }
  try {
    // get total count of videos are available
    const videoCount = await Video.countDocuments(filter);

    // calculate total pages
    const totalPages = Math.ceil(videoCount / limitNumber);

    // get videos
    const videos = await Video.find(filter)
      .sort({
        [sortBy]: sortOrder,
      })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);
    // return response
    res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          page: pageNumber,
          totalPages,
          limit: videoCount,
        },
        "Video fetch Successfully"
      )
    );
  } catch (error) {
    throw ApiError(500, error.message || "Error retrive videos");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  const userId = req.user._id;

  //   console.log(userId);
  // check for required fields
  if (!title || !description) {
    // console.log("title and description are required");
    throw new ApiError(400, "title and description are required");
  }
  // get video files path
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  //   console.log("video file"+videoLocalPath);
  //   console.log("thumbnailImage" +thumbnailLocalPath);
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video and thumnail is required");
  }
  try {
    // upload video to cloudinary
    const videos = await uploadFile(videoLocalPath);
    const thumbnail = await uploadFile(thumbnailLocalPath);
    // console.log(videos);
    if (!videos.url) {
      throw new ApiError(400, "failed to upload video");
    }
    if (!thumbnail.url) {
      throw new ApiError(400, "failed to upload thumbnail");
    }
    // create video
    const newVideo = await Video.create({
      title,
      description,
      videoFile: videos.url,
      thumbnail: thumbnail.url,
      duration: videos?.duration,
      owner: userId,
    });
    if (!newVideo) {
      throw new ApiError(400, "failed to create video");
    }
    await newVideo.save();
    res.status(201).json(
      new ApiResponse(
        201,
        {
          newVideo,
        },
        "Video pulished Successfully"
      )
    );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "error occured published the video"
    );
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  //TODO: check if video exists or not
  //TODO: check if video is published or not
  //TODO: check if video belongs to current user or not
  //TODO: check if video is published or not
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "video ID not found");
  }
  try {
    // find video by id
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "video not found");
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          video,
        },
        "Video fetch Successfully"
      )
    );
  } catch (error) {
    throw new ApiError(400, "Error fetching video");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  //TODO: check if video exists or not
  //TODO: check if video is published or not
  //TODO: check if video belongs to current user or not
  if (!videoId) {
    throw new ApiError(400, "video ID is required");
  }
  try {
    // find video by id
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "video not found");
    }
    // update video details
    const { title, description } = req.body;
    if (!title && !description) {
      throw new ApiError(400, "title and description are required");
    }
    if (title) video.title = title;
    if (description) video.description = description;

    // check if new thumnail is provided
    if (req.files.thumbnail && req.files.thumbnail) {
      const thumbnailLocalPath = req.files.thumbnail[0].path;
      if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail files is required");
      }
      const thumbnail = await uploadFile(thumbnailLocalPath);
      if (!thumbnail.url) {
        throw new ApiError(400, "failed to upload thumbnail");
      }
      video.thumbnailUrl = thumbnail.url;
    }
    // check if new video is provided
    await video.save();
    res.status(200).json(
      new ApiResponse(
        200,
        {
          video,
        },
        "Video updated Successfully"
      )
    );
  } catch (error) {
    throw new ApiError(400, "Error fetching video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId || !isValidObjectId(videoId)) {
    console.log("videoId" + videoId);
    throw new ApiError(400, "video id is required");
  }
  try {
    // find the video by id
    const video = await Video.findById(videoId);

    if (!video && video.owner.toString() !== req.user._id) {
      throw new ApiError(404, "Video not found");
    }
    if (!video.videoFile) {
      throw new ApiError(404, "video url not found");
    }
    // Extract the Cloudinary public ID from the video URL
    const cloudinaryPublicId = video.videoFile
      .split("/")
      .slice(-1)[0]
      .split(".")[0];
    console.log("cloudinaryPublicId: " + cloudinaryPublicId);
    // Delete the video from Cloudinary
    await uploadFile.uploader.destroy(cloudinaryPublicId, {
      resource_type: "video",
    });
    // delete video
   const deleteVideo= await Video.findByIdAndDelete(videoId);
    return res.status(200).json(new ApiResponse(
      200,
      {
        deleteVideo,
      },
      "Video deleted Successfully"
    ))
  } catch (error) {
    // console.log(error);
    throw new ApiError(400, "Error Deleting  video");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle publish status
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is required");
  }
  try {
    // find the video by id
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "video not found");
    }
    // toggle publish status
    video.published = !video.published;
    await video.save();
    res.status(200).json(
      new ApiResponse(
        200,
        {
          video,
        },
        "Video publish status toggled Successfully"
      )
    );
  } catch (error) {
    throw new ApiError(400, "Error fetching video");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
