import multer from "multer";
import fs from "fs";

// if (!fs.existsSync("uploads/")) {
//     fs.mkdirSync("uploads/", { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination(_req, _file, cb) {
//         cb(null, "uploads/");
//     },
//     filename(_req, file, cb) {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export default upload;
