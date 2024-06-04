import mongoose, { Schema } from "mongoose";

const likeSchema= new Schema({
    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    Comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"Tweet"
    },
    isLiked:{
        type:Boolean,
        default:false,

    }
},
    {
        timestamps:true
    }
)

const Like = mongoose.model("Like", likeSchema);