import mongoose,{Schema} from 'mongoose'

const tweetSchema = new Schema({
          owner:{
                    type:Schema.Types.ObjectId,
                    ref:"User"
          },
          content:{
                    type:String,
                    required:true
          },
          thumbnail:{
                    type:String,//cloudinary url
          }

},{timestamps:true})

export const Tweet=monngoose.model("Tweet",tweetSchema)