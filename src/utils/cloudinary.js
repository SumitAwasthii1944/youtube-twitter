import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // 🔥 Normalize Windows path
        const normalizedPath = localFilePath.replace(/\\/g, "/");

        // console.log("Uploading file from:", normalizedPath);
        // console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);

        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto",
        });

        //console.log("File uploaded successfully:", response.url);
        fs.unlinkSync(localFilePath)//ye line local file ko delete krne ke liye hai, kyuki ek baar file cloudinary pe upload ho jaye to local file ki jarurat nhi hoti, aur ye storage space bachata hai
        return response;

    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error.message);
        return null;
    }
};

export { uploadOnCloudinary };
