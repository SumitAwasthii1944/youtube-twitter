import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();

app.use(cors({
          origin: process.env.CORS_ORIGIN,
          credentials:true
}));

app.use(express.json({limit:"16kb"}))// limit the size of the request body to 16kb

app.use(express.urlencoded({extended:true, limit:"16kb"}))// limit the size of the request body to 16kb

app.use(express.static("public"))// serve static files from the "public" directory

app.use(cookieParser())// parse cookies


//routes import 

import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users",userRouter)


//routes declaration


export { app }