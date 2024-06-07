import mongoose, { Schema } from "mongoose";

const subscribtionSchema = new Schema(
  {
    subscibe: {
      type: Schema.Types.ObjectId, // one who is subscribed
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // one whom is subscribing
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Subscribe = mongoose.model("Subscribe", subscribtionSchema);
