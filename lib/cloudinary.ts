import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/** Upload une image depuis un buffer ou une URL. */
export async function uploadImage(
  source: Buffer | string,
  options: { folder?: string; publicId?: string } = {}
) {
  const folder = options.folder ?? "noscoins";
  const toUpload = Buffer.isBuffer(source)
    ? `data:image/webp;base64,${source.toString("base64")}`
    : source;

  const result = await cloudinary.uploader.upload(toUpload, {
    folder,
    public_id: options.publicId,
    overwrite: true,
    transformation: [
      { quality: "auto:best", fetch_format: "auto" },
      { width: 1200, crop: "limit" },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

/** Upload un document KYC (PDF, JPEG, PNG). */
export async function uploadDocument(
  source: Buffer | string,
  options: { userId: string; docType: string }
) {
  const toUpload = Buffer.isBuffer(source)
    ? `data:application/octet-stream;base64,${source.toString("base64")}`
    : source;

  const result = await cloudinary.uploader.upload(toUpload, {
    folder: `noscoins/kyc/${options.userId}`,
    resource_type: "auto",
    public_id: `${options.docType}_${Date.now()}`,
  });

  return { url: result.secure_url, publicId: result.public_id };
}

/** Supprime un asset Cloudinary. */
export async function deleteAsset(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}
