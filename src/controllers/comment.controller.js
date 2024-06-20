import { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import asyncHandler from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponce.js"
import {Video} from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    const {page = 1, limit = 10} = req.query;
    console.log("video id: " + videoId);
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "video id is required");
    }
    try {
        // find comment for specified video
        const query={video:videoId};
        // count total comments
        const totalComment=await Comment.countDocuments(query);
        // calculate pagination value
        const startIndex=(page-1)*limit;
        const endIndex=page*limit;
        // fetch comment with pagination value
        const comments=await Comment.find(query).populate('owner','username avatar') // populate owner detal
        .sort({createdAt:-1}) // sort by newest comments first
        .skip(startIndex).limit(limit);

        // prepare pagination response
        const totalPage=Math.ceil(totalComment/limit);
        const currentComment=comments.slice(startIndex, endIndex);

        // send pagination response
        return res.status(200).json(new ApiResponse(200,{comments:currentComment,
            totalPage,
            totalPage,
            currentPage:page,
        
        },"comment retrieved successfully"))

    } catch (error) {
        console.log("Error getting comments",error.message);
      throw new ApiError(400, "Internal server Error")  ;
    }
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;
    const {userId}=req.user._id;
    console.log("video id: " + videoId);
    console.log("content: " + content);
    console.log("user id: " + userId);
    if(!videoId ||!isValidObjectId(videoId)){
        throw new ApiError(400, "video id is required");
    }
    if(!content){
        throw new ApiError(400, "comment is required");
    }
    // create a new comment
    try {
        const comment=await Comment.create({
            video:videoId,
            owner:userId,
            content:content
        })
        // save the comment
        const newComment=await comment.save();

        // add comment to video
        const video=await Video.findById(videoId);
        if(!video){
            throw new ApiError(404, "video not found");
        }
        // add comment id to video comments array
        video.comments=video.comments||[];
        video.comments.push(newComment._id);
        await video.save();
        // send response
        return res.status(200).json(new ApiResponse(200,{newComment},"comment added successfully"))
    } catch (error) {
        console.log("Error adding comment"+ error);
      throw new ApiError(400, "Internal server Error")  ;
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params;
    const {content} = req.body;
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400, "comment id is invalid");
    }
    if(!content){
        throw new ApiError(400, "comment is required");
    }
    try {
        // find comment by id
        const updatedComment=await Comment.findByIdAndUpdate(commentId,{content},{new:true});
        if(!updatedComment){
            throw new ApiError(404, "comment not found");
        }
        // update comment
        updatedComment.content=content;
        await updatedComment.save();
        // send response
        return res.status(200).json(new ApiResponse(200,{updatedComment},"comment updated successfully"))
    } catch (error) {
        console.log("Error updating comment"+ error.message);
        throw new ApiError(500, "Internal error comment updating")
    }

})    

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params;
    if(!commentId ||!isValidObjectId(commentId)){
        throw new ApiError(400, "comment id is invalid");
    }
    try {
        // find comment by id
        const deletedComment=await Comment.findByIdAndDelete(commentId);
        if(!deletedComment){
            throw new ApiError(404, "comment not found");
        }
        // delete comment from video
        const video=await Video.findById(deletedComment.video);
        if(!video){
            throw new ApiError(404, "video not found");
        }
        // delete comment id from video comments array
        video.comments=video.comments||[];
        video.comments=video.comments.filter(id=>id!=commentId);
        await video.save();
        // send response
        return res.status(200).json(new ApiResponse(200,{deletedComment},"comment deleted successfully"))
    } catch (error) {
        console.log('Error deleting comment'+ error.message);
        throw new ApiError(400, "Internal error deleting comment")
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }