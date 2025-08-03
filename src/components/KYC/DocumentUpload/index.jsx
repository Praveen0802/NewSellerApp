import { Upload } from "lucide-react";
import { useRef } from "react";

const DocumentUpload = ({
  documentType,
  config,
  onUpload,
  isUploading = false,
  status = "pending",
} = {}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(documentType, file);
      // Clear the input value to allow re-uploading the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (status === "uploaded") {
    return null; // Don't show upload when document is already uploaded
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 hover:border-blue-400 transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        id={`upload-${documentType}`}
        accept={config.acceptedFormats}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <label
        htmlFor={`upload-${documentType}`}
        className="cursor-pointer flex items-center justify-center space-x-2"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : (
          <Upload className="w-4 h-4 text-gray-400" />
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-600">
            {isUploading ? "Uploading..." : "Click to upload"}
          </span>
          <span className="text-xs text-gray-500">
            {config.acceptedFormats.replace(/\./g, "").toUpperCase()}
          </span>
        </div>
      </label>
    </div>
  );
};

export default DocumentUpload;
