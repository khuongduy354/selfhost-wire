import { useState } from "react";
import { API } from "../api";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError("");
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      await API.uploadFile(file);
      setProgress(100);
      setFile(null);
      // Reset input
      const fileInput = document.getElementById(
        "fileInput"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div>
      <h1>File Upload</h1>
      <input type="file" id="fileInput" onChange={handleFileChange} />
      <button onClick={handleFileUpload} id="uploadButton" disabled={!file}>
        Upload
      </button>
      {progress > 0 && <div id="progress">Upload progress: {progress}%</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
