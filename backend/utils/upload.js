import fs from "fs/promises";
import { v2 as cloudinary } from "cloudinary";

// Uploads a temp file to Cloudinary, then deletes the temp file
const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, { resource_type: "image" })
        return result.secure_url
    } finally {
        await fs.unlink(file.path).catch(() => {})
    }
}

// Parses a JSON address sent as a form field. Returns null if it isn't valid.
const parseAddress = (value) => {
    try {
        const address = typeof value === "string" ? JSON.parse(value) : value
        if (!address || typeof address !== "object") return null
        return { line1: String(address.line1 || ""), line2: String(address.line2 || "") }
    } catch {
        return null
    }
}

export { uploadToCloudinary, parseAddress }
