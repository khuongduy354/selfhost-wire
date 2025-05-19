import { Router } from "express";
import multer from "multer";
import { uploadChunk, completeUpload } from "../controllers/uploadController";

const router = Router();
const upload = multer({ dest: "uploads/tmp/" });

router.post("/upload-chunk", upload.single("file"), uploadChunk);
router.post("/complete-upload", completeUpload);

export default router;
