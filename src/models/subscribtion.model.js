import mongoose, { Schema } from "mongoose";

const subscribtionSchema = new Schema(
  {
    subscribers: {
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

export const Subscribtion = mongoose.model("Subscribtion", subscribtionSchema);
