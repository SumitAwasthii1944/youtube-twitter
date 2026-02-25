

const asyncHandler = (requestHandler) => {
          return (req, res, next) => {
                    Promise.resolve(requestHandler(req,res,next)).catch((err) => next(err))
          }
}



export {asyncHandler}


// const asyncHandler = (fn) => async (req,res,next) => {
//           try {
//                     await fn(req,res,next)
//           } catch (error) {
//                     res.status(error.code || 500).json({
//                               success:false,
//                               message:error.message || "Internal Server Error"
//                     })
//           }
// }// This function takes another function (fn) as an argument and returns a new function that wraps the original function in a try-catch block. This is useful for handling asynchronous operations in Express routes, allowing you to catch any errors that may occur and pass them to the next middleware (error handler) without having to write try-catch blocks in every route handler.