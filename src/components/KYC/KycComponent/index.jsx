import { FileText, Check, AlertCircle, Eye, X, Download } from "lucide-react";
import { useState } from "react";
import DocumentUpload from "../DocumentUpload";
import RightViewModal from "@/components/commonComponents/rightViewModal";
import {
  saveAddressDocument,
  savePhotoId,
  saveSellerContract,
} from "@/utils/apiHandler/request";
import { toast } from "react-toastify";

const KycComponent = ({
  photoId,
  address,
  contract,
  onUploadSuccess,
  uploading,
  setUploading,
} = {}) => {
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    title: "",
    fileType: "",
  });

  // Document configuration mapping
  const documentConfig = {
    contract: {
      title: "Contract Document",
      description: "Your signed contract document",
      acceptedFormats: ".pdf,.jpg,.jpeg,.png",
      icon: FileText,
      dataKey: "contract_document",
      statusKey: "contract_status",
    },
    photoId: {
      title: "Photo ID Proof",
      description: "Government issued photo ID",
      acceptedFormats: ".pdf,.jpg,.jpeg,.png",
      icon: FileText,
      dataKey: "photo_document",
      statusKey: "photo_id_status",
    },
    address: {
      title: "Address Proof",
      description: "Address verification document",
      acceptedFormats: ".pdf,.jpg,.jpeg,.png",
      icon: FileText,
      dataKey: "address_document",
      statusKey: "address_status",
    },
  };

  // Get props data mapping
  const propsMapping = {
    contract,
    photoId,
    address,
  };

  const saveDocsPropsMapping = {
    photoId: "photo",
    address: "address",
    contract: "contract",
  };

  // Extract document data from props
  const getDocumentData = (docType) => {
    const propData = propsMapping[docType];
    if (!propData) return null;

    return {
      status: propData.status,
      message: propData.msg,
      data: propData.data || null,
    };
  };

  const getDocumentStatus = (docType) => {
    const docData = getDocumentData(docType);
    if (!docData) return "pending";

    if (docData.status === 1 && docData.data) return "uploaded";
    if (docData.status === 0) return "pending";
    return "error";
  };

  const getFileType = (url) => {
    if (!url) return "unknown";
    const extension = url.split(".").pop()?.toLowerCase();
    if (["pdf"].includes(extension)) return "pdf";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension))
      return "image";
    return "unknown";
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [documentType]: true }));
    const docType = saveDocsPropsMapping[documentType];

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("document_type", docType);

      let response;

      if (docType === "photo") {
        response = await savePhotoId(formData);
      } else if (docType === "address") {
        response = await saveAddressDocument(formData);
      } else if (docType === "contract") {
        response = await saveSellerContract(formData);
      } else {
        throw new Error(`Unknown document type: ${docType}`);
      }

      // Check if the response indicates success
      if (response && response.success !== false) {
        // Call success callback if provided
        if (onUploadSuccess) {
          toast.success(`${documentType} uploaded successfully`);
          onUploadSuccess(documentType, file);
        }

        // Optional: Show success message
        console.log(`${documentType} uploaded successfully`);
      } else {
        // Handle API error response
        const errorMessage =
          response?.message || `Failed to upload ${documentType}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);

      // More user-friendly error handling
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to upload ${documentType}. Please try again.`;

      // You might want to use a toast notification instead of alert
      toast.error("Failed to upload document. Please try again.");

      // Optional: Call error callback if you have one
      // if (onUploadError) {
      //   onUploadError(documentType, error);
      // }
    } finally {
      setUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const handleDownload = (url, filename) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || "document";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab
      window.open(url, "_blank", "noopener noreferrer");
    }
  };

  const openPreview = (url, title) => {
    const fileType = getFileType(url);
    setPreviewModal({ open: true, url, title, fileType });
  };

  const closePreview = () => {
    setPreviewModal({ open: false, url: "", title: "", fileType: "" });
  };

  const renderPreviewContent = () => {
    const { url, title } = previewModal;

    if (!url) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <span>No document available</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col">
        {/* iframe takes most of the height */}
        <div className="flex-1 relative">
          <iframe
            src={url}
            className="w-full h-full border-0 rounded-t-lg"
            title={`Preview: ${title}`}
            sandbox="allow-same-origin allow-scripts"
            onLoad={(e) => {
              // Hide loading indicator
              const loader =
                e.target.parentElement.querySelector(".iframe-loader");
              if (loader) loader.style.display = "none";
            }}
            onError={(e) => {
              // Show error state
              e.target.style.display = "none";
              const errorDiv =
                e.target.parentElement.querySelector(".iframe-error");
              if (errorDiv) errorDiv.style.display = "flex";
            }}
          />

          {/* Loading indicator */}
          <div className="iframe-loader absolute inset-0 flex items-center justify-center bg-gray-50 rounded-t-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-xs text-gray-600">Loading...</p>
            </div>
          </div>

          {/* Error fallback */}
          <div className="iframe-error hidden absolute inset-0 flex-col items-center justify-center text-gray-500 bg-gray-100 rounded-t-lg">
            <span className="text-2xl mb-2">⚠️</span>
            <p className="text-xs text-gray-600 mb-3 text-center px-2">
              Cannot preview document
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => window.open(url, "_blank")}
                className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
              >
                Open in New Tab
              </button>
              <button
                onClick={() => handleDownload(url, title || "document")}
                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Compact action buttons at bottom */}
        <div className="flex-shrink-0 p-2 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-center space-x-3 text-xs">
            <button
              onClick={() => window.open(url, "_blank")}
              className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              Open
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => handleDownload(url, title || "document")}
              className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDocumentCard = (docType) => {
    const config = documentConfig[docType];
    const docData = getDocumentData(docType);
    const status = getDocumentStatus(docType);
    const Icon = config.icon;
    const isUploading = uploading[docType];

    return (
      <div
        key={docType}
        className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4"
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  status === "uploaded"
                    ? "bg-green-100 text-green-600"
                    : status === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{config.title}</h3>
                <p className="text-gray-600 text-sm">{config.description}</p>
              </div>
            </div>

            {status === "uploaded" && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                <span>Uploaded</span>
              </div>
            )}
          </div>

          {status === "uploaded" && docData?.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 font-medium">
                    Document uploaded successfully
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      openPreview(docData.data[config.dataKey], config.title)
                    }
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        docData.data[config.dataKey],
                        `${config.title.replace(/\s+/g, "_")}.pdf`
                      )
                    }
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium p-1 rounded hover:bg-green-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                {docData?.message || "Please upload the document"}
              </p>
              <DocumentUpload
                documentType={docType}
                config={config}
                onUpload={handleFileUpload}
                isUploading={isUploading}
                status={status}
              />
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-red-600 py-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  {docData?.message || "Error loading document"}
                </span>
              </div>
              <DocumentUpload
                documentType={docType}
                config={config}
                onUpload={handleFileUpload}
                isUploading={isUploading}
                status={status}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const completedDocuments = Object.keys(documentConfig).filter(
    (docType) => getDocumentStatus(docType) === "uploaded"
  ).length;
  const totalDocuments = Object.keys(documentConfig).length;
  const progressPercentage = (completedDocuments / totalDocuments) * 100;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KYC Documents</h2>
        <p className="text-gray-600">Upload required verification documents</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {completedDocuments}/{totalDocuments} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {Object.keys(documentConfig).map(renderDocumentCard)}

        {/* Success Message */}
        {completedDocuments === totalDocuments && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">
                  All Documents Uploaded!
                </h3>
                <p className="text-green-700 text-sm">
                  Your KYC verification is complete and under review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {previewModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-[50%] h-[50%] flex flex-col">
            {/* Header - Fixed height */}
            <div className="flex-shrink-0 flex items-center justify-between p-3 border-b">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {previewModal.title}
                </h3>
              </div>
              <button
                onClick={closePreview}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content - Takes remaining height */}
            <div className="flex-1 overflow-hidden">
              {renderPreviewContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KycComponent;
