import mongoose,{Schema} from 'mongoose';

const likeSchema = new Schema({
          likedBy:{
                   type:Schema.Types.ObjectId,
                   ref:"User",
                   required:true 
          },
          tweet:{
                    type:Schema.Types.ObjectId,
                    ref:"Tweet"
          },
          video:{
                    type:Schema.Types.ObjectId,
                    ref:"Video"
          },
          comment:{
                    type:Schema.Types.ObjectId,
                    ref:"Comment"
          }

},{timestamps:true})

export const Like=mongoose.model("Like",likeSchema)