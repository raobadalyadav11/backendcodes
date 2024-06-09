import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser"
const app = express();

app.use(
  cors({
    origin: process.env.CORS_URL,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "10kb",
    extended: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);
app.use(express.static("public"));

app.use(cookiesParser());

// routes imports
import userRouter from "./routes/user.routes.js"

// routes declarations 

app.use("/api/v1/users", userRouter);

// http://localhost:8000/api/v1/users/register


export default app;