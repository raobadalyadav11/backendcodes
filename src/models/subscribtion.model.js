import mongoose, { Schema } from "mongoose";

const subscribeSchema = new Schema(
  {
    subscibe: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Subscribe = mongoose.model("Subscribe", subscribeSchema);
