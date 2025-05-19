import { Request, Response } from "express";
import fs from "fs";
import { logger } from "../helper/logger";
import path from "path";

interface UploadMetadata {
  fileName: string;
  totalChunks: number;
  receivedChunks: number;
  chunks: string[];
}

const uploads: Record<string, UploadMetadata> = {};

export const uploadChunk = (req: Request, res: Response) => {
  try {
    const { chunkNumber, totalChunks, uploadId, originalName } = req.body;
    const file = req.file;

    logger.info(
      "uploadController",
      `Received chunk ${
        chunkNumber + 1
      } of ${totalChunks} for upload ID ${uploadId}`
    );

    if (!file) {
      return res.status(400).send("No file uploaded");
    }

    if (!uploads[uploadId]) {
      logger.info(
        "uploadController",
        `Starting new upload session for ID ${uploadId} with file ${originalName}`
      );
      uploads[uploadId] = {
        fileName: originalName,
        totalChunks: parseInt(totalChunks),
        receivedChunks: 0,
        chunks: [],
      };
    }

    uploads[uploadId].chunks[parseInt(chunkNumber)] = file.path;
    uploads[uploadId].receivedChunks++;

    res.status(200).send("Chunk received");
  } catch (error) {
    throw new Error("Error in uploadChunk: " + error);
  }
};

export const completeUpload = (req: Request, res: Response) => {
  try {
    const { uploadId, fileName } = req.body;
    const upload = uploads[uploadId];

    logger.info(
      "uploadController",
      `Completing upload for ID ${uploadId} with file ${fileName}`
    );

    if (!upload || upload.receivedChunks !== upload.totalChunks) {
      return res.status(400).send("Incomplete upload");
    }

    const finalPath = path.join("uploads", fileName);
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < upload.totalChunks; i++) {
      logger.info(
        "uploadController",
        `Writing chunk ${i + 1} of ${upload.totalChunks} to final file`
      );
      const chunkData = fs.readFileSync(upload.chunks[i]);
      writeStream.write(chunkData);
      fs.unlinkSync(upload.chunks[i]);
    }

    writeStream.end();
    delete uploads[uploadId];

    res
      .status(200)
      .json({ message: "Upload completed successfully", fileName });
  } catch (error) {
    throw new Error("Error in completeUpload: " + error);
  }
};
