import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      index: true,
      trim: true,
      maxlength: 140,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    likes:[{
      type: Schema.Types.ObjectId,
      ref: "Like",
      // required: true,
    }]
  },
  {
    timestamps: true,
  }
);

export const Tweet = mongoose.model("Tweet", tweetSchema);
