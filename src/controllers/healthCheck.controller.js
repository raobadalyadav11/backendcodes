import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponce.js";
import asyncHandler from "../utils/asyncHandler.js"
import { isValidObjectId } from "mongoose"


const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    // const userId=req.params;
    // if(!userId){
    //     throw new ApiError(400, "Bad request")
    // }
    // if(!isValidObjectId(userId)){
    //     throw new ApiError(400, "Bad request")
    // }

    return res.status(200).json(new ApiResponse(
        200,
        {},
        "Everything is okk"
    ))
})

export {
    healthcheck
    }
    