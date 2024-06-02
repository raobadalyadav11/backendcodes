import dotenv, { config } from "dotenv";
import connectDb from "./db/index.js";
dotenv.config({
  path: "./env",
});

connectDb()
  .then(() => {
    console.log("databses is connected");
  })
  .catch(() => {
    console.error("databses is not connected");
  });
