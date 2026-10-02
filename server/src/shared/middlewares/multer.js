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

export const maintenancePhotoUpload = upload.single("photo");

export const imagesUpload = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cnic", maxCount: 1 },
]);

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "skyline/documents",
    resource_type: "auto", // allows PDFs alongside images
    allowed_formats: ["jpg", "png", "jpeg", "webp", "pdf"],
  },
});
const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — leases/scans run bigger than avatars
});

export const singleDocumentUpload = documentUpload.single("file");
