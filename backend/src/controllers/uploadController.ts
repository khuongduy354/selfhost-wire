import { Request, Response } from "express";
import fs from "fs";
import path from "path";

interface UploadMetadata {
  fileName: string;
  totalChunks: number;
  receivedChunks: number;
  chunks: string[];
}

const uploads: Record<string, UploadMetadata> = {};

export const uploadChunk = (req: Request, res: Response) => {
  const { chunkNumber, totalChunks, uploadId, originalName } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded");
  }

  if (!uploads[uploadId]) {
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
};

export const completeUpload = (req: Request, res: Response) => {
  const { uploadId, fileName } = req.body;
  const upload = uploads[uploadId];

  if (!upload || upload.receivedChunks !== upload.totalChunks) {
    return res.status(400).send("Incomplete upload");
  }

  const finalPath = path.join("uploads", fileName);
  const writeStream = fs.createWriteStream(finalPath);

  for (let i = 0; i < upload.totalChunks; i++) {
    const chunkData = fs.readFileSync(upload.chunks[i]);
    writeStream.write(chunkData);
    fs.unlinkSync(upload.chunks[i]);
  }

  writeStream.end();
  delete uploads[uploadId];

  res.status(200).send("File reassembled successfully");
};
