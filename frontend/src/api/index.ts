import { v4 as uuidv4 } from "uuid";

interface UploadProgress {
  chunk: number;
  total: number;
  percentage: number;
}

interface UploadResponse {
  success: boolean;
  message: string;
  filePath?: string;
}

const host =
  process.env.REACT_APP_API_URL ||
  (function () {
    throw new Error("API url not set in REACT environment");
  })();

export const API = {
  host,
  baseUrl: host + "/v1",

  uploadFile: async (
    file: File,
    chunkSize = 5 * 1024 * 1024,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> => {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const uploadId = uuidv4();

    for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
      const start = chunkNumber * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("chunkNumber", chunkNumber.toString());
      formData.append("totalChunks", totalChunks.toString());
      formData.append("uploadId", uploadId);
      formData.append("originalName", file.name);

      try {
        const response = await fetch(`${API.baseUrl}/upload/upload-chunk`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || "Chunk upload failed");
        }

        onProgress?.({
          chunk: chunkNumber + 1,
          total: totalChunks,
          percentage: ((chunkNumber + 1) / totalChunks) * 100,
        });
      } catch (error) {
        throw new Error(
          `Failed to upload chunk ${chunkNumber + 1}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    try {
      const res = await fetch(`${API.baseUrl}/upload/complete-upload`, {
        method: "POST",
        body: JSON.stringify({ uploadId, fileName: file.name }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to finalize upload");
      }

      return await res.json();
    } catch (error) {
      throw new Error(
        `Failed to finalize upload: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
