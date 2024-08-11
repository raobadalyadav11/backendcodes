import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
  createChannel,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file
router.route("/channel").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  createChannel
);
router.route("/stats/:channelId").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router;
