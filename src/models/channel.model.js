import mongoose, { Schema } from "mongoose";

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subscribers:[ {
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
    videos: [{
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    }],
    avatar:{
        type: String, //cloudinary url for avatar
        required: true,
      },
      coverImgage: {
        type: String, //cloudinary url for cover image
        trim: true,
      },
  
  },
  {
    timestamps: true,
  }
);

export const Channel = mongoose.model("Channel", channelSchema);
