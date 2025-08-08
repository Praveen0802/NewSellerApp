import { Download, ExternalLink } from "lucide-react";

const RenderPreviewContent = ({
  previewModal,
  handleDownload,
  isDownloading = false,
} = {}) => {
  const { url, title, fileType } = previewModal;

  if (!url) {
    return (
      <iframe
        src="/seller_documents.pdf" // Path to your local PDF in public/assets
        title="Default PDF Preview"
        className="w-full h-full"
      />
    );
  }

  // Handle PDF files differently
  if (fileType === "pdf") {
    return (
      <div className="w-full h-full flex flex-col">
        {/* PDF Preview Container */}
        <div className="flex-1 relative bg-gray-100">
          {/* Try to render PDF using Google Docs Viewer first */}
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              url
            )}&embedded=true`}
            className="w-full h-full border-0"
            title={`Preview: ${title}`}
            onLoad={(e) => {
              const loader =
                e.target.parentElement.querySelector(".pdf-loader");
              if (loader) loader.style.display = "none";
            }}
            onError={(e) => {
              console.log("Google Docs viewer failed, showing fallback");
              e.target.style.display = "none";
              const fallback =
                e.target.parentElement.querySelector(".pdf-fallback");
              if (fallback) fallback.style.display = "flex";
            }}
          />

          {/* Loading indicator */}
          <div className="pdf-loader absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading PDF...</p>
              <p className="text-xs text-gray-500 mt-1">
                This may take a moment
              </p>
            </div>
          </div>

          {/* PDF Fallback */}
          <div className="pdf-fallback hidden absolute inset-0 flex-col items-center justify-center text-gray-600 bg-gray-100">
            <div className="text-center max-w-md p-6">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                PDF Document
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                This PDF cannot be previewed in the browser. You can download it
                or open it in a new tab.
              </p>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => window.open(url, "_blank")}
                  className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in New Tab</span>
                </button>
                <button
                  onClick={() => handleDownload(url, title || "document.pdf")}
                  className="flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons for PDF */}
        <div className="flex-shrink-0 p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <button
              onClick={() => window.open(url, "_blank")}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-700 underline cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in New Tab</span>
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => handleDownload(url, title || "document.pdf")}
              className="flex items-center space-x-1 text-green-600 hover:text-green-700 underline cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle image files
  if (fileType === "image") {
    return (
      <div className="w-full h-full flex flex-col">
        {/* Image container */}
        <div className="flex-1 relative bg-gray-100 flex items-center justify-center p-4">
          <img
            src={url}
            alt={title}
            className="max-w-full max-h-full object-contain rounded"
            onLoad={(e) => {
              const loader =
                e.target.parentElement.querySelector(".image-loader");
              if (loader) loader.style.display = "none";
            }}
            onError={(e) => {
              e.target.style.display = "none";
              const error =
                e.target.parentElement.querySelector(".image-error");
              if (error) error.style.display = "flex";
            }}
          />

          {/* Loading indicator */}
          <div className="image-loader absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-600">Loading image...</p>
            </div>
          </div>

          {/* Error fallback */}
          <div className="image-error hidden absolute inset-0 flex-col items-center justify-center text-gray-500 bg-gray-100">
            <span className="text-4xl mb-2">🖼️</span>
            <p className="text-sm text-gray-600 mb-3 text-center px-2">
              Cannot load image
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => window.open(url, "_blank")}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => handleDownload(url, title || "image")}
                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons for images */}
        <div className="flex-shrink-0 p-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-3 text-xs">
            <button
              onClick={() => window.open(url, "_blank")}
              className="text-gray-600 hover:text-blue-700 underline cursor-pointer"
            >
              Open
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => handleDownload(url, title || "image")}
              className="text-gray-600 hover:text-blue-700 underline cursor-pointer"
            >
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle unknown file types
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-100">
      <div className="text-center p-6">
        <span className="text-4xl mb-4 block">📄</span>
        <p className="text-sm text-gray-600 mb-4">
          Cannot preview this file type
        </p>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => window.open(url, "_blank")}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Open in New Tab
          </button>
          <button
            onClick={() => handleDownload(url, title || "document")}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenderPreviewContent;
