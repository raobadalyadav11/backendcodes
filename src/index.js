import dotenv, { config } from "dotenv";
import connectDb from "./db/index.js";
import app from "./app.js"
dotenv.config({
  path: "./env",
});

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 3000,()=>{
      console.log(`server running on http://localhost:${process.env.PORT}`);
    })
  })
  .catch(() => {
    console.error("databses is not connected");
  });
