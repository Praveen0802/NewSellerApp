import { useState, useCallback } from "react";
import { toast } from "react-toastify";

const useS3Download = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  const downloadFile = useCallback(async (url, filename = "download") => {
    if (!url) {
      setError("No URL provided");
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      // Fetch the file as a blob
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      // Get the blob data
      const blob = await response.blob();

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create anchor element and trigger download
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = filename;
      anchor.style.display = "none";

      // Append to body, click, and remove
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);

      // Clean up blob URL
      window.URL.revokeObjectURL(blobUrl);
      toast.success("Download successful");
    } catch (err) {
      setError(err.message);
      console.error("Download failed:", err);
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    downloadFile,
    isDownloading,
    error,
  };
};

export default useS3Download;
