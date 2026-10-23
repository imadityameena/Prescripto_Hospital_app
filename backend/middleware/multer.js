import multer from "multer";
import fs from "fs/promises";

// Files go to the OS temp folder with a random name (multer's default),
// so two uploads with the same file name can't overwrite each other.
const upload = multer({
    storage: multer.diskStorage({}),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith("image/")) {
            callback(null, true)
        } else {
            callback(new Error("Only image files are allowed"))
        }
    },
});

// Accepts one optional image in `fieldName`. Upload errors are returned as a
// normal JSON message, and ids set by the auth middleware (userId / docId)
// are kept, since multer replaces req.body with the form fields.
const uploadImage = (fieldName) => (req, res, next) => {
    const { userId, docId } = req.body || {}

    upload.single(fieldName)(req, res, (error) => {
        if (error) {
            const message = error.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : error.message
            return res.status(400).json({ success: false, message })
        }
        // always remove the temp file once the response is sent,
        // even if the request was rejected before uploading to Cloudinary
        if (req.file) {
            const tempPath = req.file.path
            res.on("finish", () => fs.unlink(tempPath).catch(() => {}))
        }

        if (userId !== undefined) req.body.userId = userId
        if (docId !== undefined) req.body.docId = docId
        next()
    })
}

export default uploadImage
