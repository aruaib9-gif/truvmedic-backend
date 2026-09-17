import { v2 as cloudinary } from "cloudinary";
import { env, isConfigured } from "./env.js";

if (isConfigured.cloudinary) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/**
 * Uploads a buffer to Cloudinary and returns its public URL.
 * `resource_type: "auto"` lets one endpoint serve CVs (PDF/DOCX) and images alike.
 */
export function uploadBuffer(buffer, { filename, folder } = {}) {
  if (!isConfigured.cloudinary) {
    return Promise.reject(
      new Error("File uploads are not configured — set CLOUDINARY_* environment variables")
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder ? `${env.cloudinary.folder}/${folder}` : env.cloudinary.folder,
        resource_type: "auto",
        use_filename: Boolean(filename),
        unique_filename: true,
        filename_override: filename,
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}
