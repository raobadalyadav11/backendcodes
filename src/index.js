import dotenv, { config } from "dotenv"
import connectDb from "./db/index.js";
dotenv.config({
    path: "./env"
})

connectDb();