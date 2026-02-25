 import multer from 'multer'

 const storage=multer.diskStorage({
          destination:function(req,file,cb){
                    cb(null,"./public/temp")
          },
          filename:function(req,file,cb){
                    cb(null,file.originalname)//agr same naam ki kayi file upload kr di user ne to dikkat ho skti hai tbhi file.fieldname + "-"+uniqueSuffix as+ise likhte hain
          }
 })
//file name return krta hai
export const upload =multer({storage:storage})