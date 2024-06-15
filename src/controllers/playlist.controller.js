import mongoose, { isValidObjectId } from "mongoose";
import { PlayList } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.params.userId || req.user._id;
  // console.log("Request body:", req.body);
  // console.log("User ID:", userId);
  try {
    // Validate required fields
    if (!name || !description) {
      throw new ApiError(400, "Name and description are required");
    }

    // Validate user ID
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user ID");
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Create playlist
    const playlist = new PlayList({
      name,
      description,
      owner: user._id,
      videos: [],
    });

    // Save the playlist to the database
    await playlist.save();

    // Return playlist
    return res
      .status(201)
      .json(
        new ApiResponse(201, { playlist }, "Playlist created successfully")
      );
  } catch (error) {
    console.error("Error creating playlist:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  try {
    // Check if userId is a valid ObjectId
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid User ID");
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Get playlists of the user
    const playlists = await PlayList.find({ owner: userId });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { playlists },
          "User playlists retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error retrieving user playlists:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  //TODO: check if playlist exists or not
  //TODO: check if playlist is published or not
  //TODO: check if playlist belongs to current user or not
  //TODO: check if playlist is published or not
  console.log(playlistId);
  if (!playlistId) {
    throw new ApiError(400, "playlist ID is required");
  }
  try {
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, { playlist }, "Playlist retrieved successfully")
      );
  } catch (error) {
    console.error("Error retrieving playlist:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  //TODO: add video to playlist
  // Validate playlistId and videoId.
  // Check if the playlist exists.
  // Check if the video exists.
  // Add the video to the playlist.
  // Save the updated playlist.
  // Return a response.
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  try {
    // Check if the playlist exists
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    // Add the video to the playlist if it's not already added
    if (!playlist.videos.includes(videoId)) {
      playlist.videos.push(videoId);
    } else {
      throw new ApiError(400, "Video already exists in the playlist");
    }

    // Save the updated playlist
    const updatedPlaylist = await playlist.save();

    // Return the updated playlist
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedPlaylist },
          "Video added to playlist successfully"
        )
      );
  } catch (error) {
    console.error("Error adding video to playlist:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  //   Validate playlistId and videoId.
  // Check if the playlist exists.
  // Check if the video exists.
  // Remove the video from the playlist.
  // Save the updated playlist.
  // Return a response.
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  try {
    // Check if the playlist exists
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    // Check if the video exists
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    // Remove the video from the playlist if it exists
    if (playlist.videos.includes(videoId)) {
      playlist.videos.pull(videoId);
    } else {
      throw new ApiError(400, "Video does not exist in the playlist");
    }
    // Save the updated playlist
    const updatedPlaylist = await playlist.save();
    // Return the updated playlist
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { updatedPlaylist },
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    console.error("Error removing video from playlist:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  //   Validate the playlistId.
  // Check if the playlist exists.
  // Delete the playlist.
  // Return a response.
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  try {
    // Check if the playlist exists
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    // Delete the playlist
    const deletePlaylist = await PlayList.findByIdAndDelete(playlistId);
    // Return a response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletePlaylist },
          "Playlist deleted successfully"
        )
      );
  } catch (error) {
    console.error("Error deleting playlist:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  //   Validate the playlistId.
  // Validate the required fields (name and description).
  // Check if the playlist exists.
  // Update the playlist with the new details.
  // Return a response.
  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  try {
    // Check if the playlist exists
    const playlist = await PlayList.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    // Update the playlist details
    playlist.name = name;
    playlist.description = description;

    // Save the updated playlist
    const updatedPlaylist = await playlist.save();

    // Return a success response
    return res.status(200).json(
      new ApiResponse(
        200,
        {updatedPlaylist},
        "Playlist updated successfully"
      )
    );
  } catch (error) {
    console.error("Error updating playlist:", error.message);
    throw new ApiError(500, error.message || "Internal Server Error");
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
