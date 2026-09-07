import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skyline",
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const imagesUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cnic", maxCount: 1 },
]);