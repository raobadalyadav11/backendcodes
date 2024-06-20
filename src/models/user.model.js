import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url for avatar
      required: true,
    },
    coverImgage: {
      type: String, //cloudinary url for cover image
      
    },
    wathHistory: [{
      type: Schema.Types.ObjectId,
      ref: "Video",
    }],
    tweets: [{
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    }],
    password: {
      type: String,
      required: [true, "password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAcessToken = function () {
  return jwt.sign({
     id: this._id ,
    email: this.email,
    username: this.username,
    fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY_SECRET_KEY,
  });
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({
     id: this._id ,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY_SECRET_KEY,
  });
};

export const  User = mongoose.model("User", userSchema);