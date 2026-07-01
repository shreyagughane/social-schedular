import cloudinary from "../config/cloudinary.js";

export const uploadImageToCloudinary = async (imageUrl: string) => {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: "ai-posts",
  });

  return result.secure_url;
};