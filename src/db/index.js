import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(
      `mongodb conneceted DB_Host ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error("mongodb connecton error", error);
    process.exit(1);
  }
};
export default connectDb;
