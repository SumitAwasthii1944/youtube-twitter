import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens = (async (userId) => {
          try {
                    const user=await User.findById(userId)
                    const accessToken=user.generateAccessToken();
                    const refreshToken=user.generateRefreshToken();
                    user.refreshToken=refreshToken;
                    user.accessToken=accessToken;
                    user.save({validateBeforeSave:false})//we dont need to validate password and username here because we checked it earlier

                    return {accessToken,refreshToken}
          } catch (error) {
                    throw new ApiError(500,"something went wrong while generating tokens")
          }
})

const registerUser=asyncHandler( async (req,res) => {

          // get user details from frontend
          //validation - not empty
          // check if user already exists
          //check for images, check for avatar
          //upload them to cloudinary,avatar
          //create user object - create entry in db
          //remove password and refresh token field from response
          //check for user creation
          //return res
          // console.log("BODY:", req.body);
          // console.log("FILES:", req.files);

          const {fullName , email, username,password} =req.body
          //console.log("email: ",email)
          // if(fullName === ""){
          //           throw new ApiError(400,"fullname is required")
          // }saare alg alg bhi check kr skte hain
          if(
                    [fullName,email,username,password].some((field) => //ye check krne ke liye ki field empty to nahi hai aur isme trim() method ka use krke ye bhi check krne ke liye ki field me sirf spaces to nahi hai
                    field?.trim() === "")
          ){
                   throw new ApiError(400,"All fields are required") 
          }
          const existedUser=await User.findOne({
                    $or:[{username},{email}]//jo isse match krega wo mil jaega
          })

          if(existedUser){
                    throw new ApiError(409,"User with email or username already exist")
          }

          
          //const coverImageLocalPath=req.files?.coverImage?.[0]?.path;
          let coverImageLocalPath;
          if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){
                    coverImageLocalPath=req.files.coverImage[0].path
          }

          const avatarLocalPath = req.files?.avatar?.[0]?.path//.files is provided by multer 
          if(!avatarLocalPath){
                    throw new ApiError(400,"Avatar file is required")
          }

          const avatar=await uploadOnCloudinary(avatarLocalPath)
          const coverImage=await uploadOnCloudinary(coverImageLocalPath)

          if(!avatar){
                    throw new ApiError(400,"avatar file is required")
          }

          const user=await User.create({
                    fullName,
                    avatar:avatar.url,
                    coverImage:coverImage?.url || "",
                    email,
                    password,
                    username:username.toLowerCase()
          })
          const createdUser=await User.findById(user._id).select(
                    "-password -refreshToken"//select() is used to specify which fields should be included or excluded in the result. In this case, it is used to exclude the password and refreshToken fields from the user document that is returned in the response. This is done for security reasons, as these fields contain sensitive information that should not be exposed to the client.
          )
          if(!createdUser){
                    throw new ApiError(500,"something went wrong while registering the user")
          }
          return res.status(201).json(
                    new ApiResponse(200,createdUser,"user registered successfully")
          )
})        

const loginUser =asyncHandler(async (req,res) => {
          //req body se data le aao
          //username or email
          //find a user
          //password check?
          //generate access and refresh token
          //send cookie
          const {email,username,password} =req.body;
          if(!(username || email)){//koi ek ho ya tm jisse login karana chaho
                    throw new ApiError(400,"username or password is required")
          }
          const user=await User.findOne({
                    $or:[{username},{email}]//ya to same email wala mile ya username 
          })

          if(!user){
                    throw new ApiError(404,"User not found")
          }

          const isPasswordValid=await user.isPasswordCorrect(password);//we made this method
          if(!isPasswordValid){
                    throw new ApiError(401,"wrong password")
          }

          const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);

          const loggedInUser= await User.findById(user._id).select("-password -refreshToken")

          const options ={//only modifiable by server
                    httpOnly:true,
                    secure:true
          }
          

          return res.status(200)
          .cookie("accessToken",accessToken,options)
          .cookie("refreshToken",refreshToken,options)
          .json(
                    new ApiResponse(200,{
                              user:loggedInUser,accessToken,refreshToken//yhn issliye acces refresh send kiye qki ky pta user token localStorage me save krna chahta ho
                    },"user Logged in successfully")
          )
})

const logoutUser = asyncHandler(async (req,res) => {
          //refersh token ko database se gyb kr do
          await User.findByIdAndUpdate(
                    req.user._id,
                    {
                              $set:{
                                        refreshToken:undefined
                              }
                    },
                    { returnDocument: "after" }

          )

          const options={
                    httpOnly:true,
                    secure:true
          }
          return res
          .status(200)
          .clearCookie("accessToken",options)//from cookie-parser library
          .clearCookie("refreshToken",options)
          .json(new ApiResponse(200,{},"User logged out"))
})
const refreshAccessToken= asyncHandler(async (req,res) => {
          const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

          if(!incomingRefreshToken){
                    throw new ApiError(401,"unauthorized request")
          }
          try {
                    const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
                    const user=await User.findById(decodedToken?._id)
          
                    if(!user){
                              throw new ApiError(401,"inavlid refersh token")
                    }
                    if(incomingRefreshToken !==user?.refreshToken){
                              throw new ApiError(401,"refresh token is expired or used")
                    }
          
                    const options={
                              httpOnly:true,
                              secure:true
                    }
          
                    const {accessToken,refreshToken: newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
          
                    return res
                    .status(200)
                    .cookie("accessToken",accessToken,options)
                    .cookie("refreshToken",newRefreshToken,options)
                    .json(
                              new ApiResponse(
                                        200,
                                        {accessToken,refreshToken:newRefreshToken},
                                        "Access token refreshed"
                              )
                    )
          } catch (error) {
                    throw new ApiError(401,error?.message || "Invalid refresh token")
          }
})

export {
          registerUser,
          loginUser,
          logoutUser,
          refreshAccessToken
}