import KycDocumentComponent from "@/components/SignupPage/KycDocumentComponent";
import useS3Download from "@/Hooks/useS3Download";
import {
  getZohoDocsDownload,
  getZohoDocStatus,
  saveAddressDocument,
  savePhotoId,
  saveSellerBusinessDocuments,
  saveSellerContract,
  submitKycForApproval,
} from "@/utils/apiHandler/request";
import { getCookie } from "@/utils/helperFunctions/cookie";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileSignature,
  FileText,
  RefreshCcw,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DocumentUpload from "../DocumentUpload";
import RenderPreviewContent from "../renderPreviewContent";

const KycComponent = ({
  photoId,
  address,
  contract,
  business_document,
  onUploadSuccess,
  uploading,
  setUploading,
  isBusiness,
} = {}) => {
  const { currentUser } = useSelector((state) => state.currentUser);
  const { kycStatus } = useSelector((state) => state.common);
  console.log(kycStatus, "kycStatuskycStatuskycStatus");
  const [previewModal, setPreviewModal] = useState({
    open: false,
    url: "",
    title: "",
    fileType: "",
  });
  const [submitForApproval, setSubmitForApproval] = useState(false);
  useEffect(() => {
    if (kycStatus?.kyc_status !== undefined) {
      setSubmitForApproval(kycStatus.kyc_status);
    }
  }, [kycStatus]);

  console.log(kycStatus.kyc_status,'kycStatus.kyc_statuskycStatus.kyc_status')
  // New state for contract generation modal
  const [contractModal, setContractModal] = useState({
    open: false,
    status: null, // to track KYC status from iframe
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
      statusKey: "photo_status",
    },
    address: {
      title: "Address Proof",
      description: "Address verification document",
      acceptedFormats: ".pdf,.jpg,.jpeg,.png",
      icon: FileText,
      dataKey: "address_document",
      statusKey: "address_status",
    },
    ...(isBusiness && {
      business_document: {
        title: "Business Documents",
        description: "Business documents",
        acceptedFormats: ".pdf,.jpg,.jpeg,.png",
        icon: FileText,
        dataKey: "business_document",
        statusKey: "business_status",
      },
    }),
  };

  // Get props data mapping
  const propsMapping = {
    contract,
    photoId,
    address,
    business_document,
  };

  const saveDocsPropsMapping = {
    photoId: "photo",
    address: "address",
    contract: "contract",
    business_document: "business_document",
  };

  // Explicit success label mapping per requirements
  const successLabelMap = {
    contract: 'Contract Document',
    photoId: 'Photo ID Proof Document',
    address: 'Address Proof Document',
  business_document: 'Business Document',
  };

  // Helper to compute a clean filename for downloads based on document type & URL
  const computeFileName = (docType, url, title) => {
    const rawLabel = successLabelMap[docType] || title || docType || 'Document';
    const base = rawLabel
      .replace(/document$/i, 'Document') // normalize casing
      .replace(/[^A-Za-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'Document';
    let ext = 'pdf';
    if (url) {
      try {
        const cleaned = url.split('?')[0].split('#')[0];
        const lastDot = cleaned.lastIndexOf('.');
        if (lastDot !== -1 && lastDot < cleaned.length - 1) {
          const cand = cleaned.substring(lastDot + 1).toLowerCase();
            // basic whitelist
          if (/^(pdf|jpg|jpeg|png|gif|webp|svg|doc|docx|xls|xlsx|csv|txt|rtf|zip)$/i.test(cand)) {
            ext = cand;
          }
        }
      } catch (e) {
        // swallow
      }
    }
    return `${base}.${ext}`;
  };

  // Helper: format document type for user-facing messages (Title Case + ensure 'Document')
  const formatDocumentTypeForDisplay = (raw) => {
    if (!raw) return "";
    let name = raw.replace(/_/g, " "); // underscores to spaces
    name = name.replace(/([a-z])([A-Z])/g, '$1 $2'); // camelCase spacing
    name = name
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    if (!/document(s)?$/i.test(name)) {
      name = `${name} Document`;
    }
    return name;
  };

  // Extract document data from props
  const getDocumentData = (docType) => {
    const propData = propsMapping[docType];
    console.log(propData,'propDatapropDatapropData')
    if (!propData) return null;
    return {
      status: propData.status,
      message: propData.msg,
      data: propData.data || null,
    };
  };

  // Fixed function to get document status correctly
  const getDocumentStatus = (docType) => {
    const docData = getDocumentData(docType);

    if (!docData || !docData.data) {
      return "not uploaded";
    }

    const config = documentConfig[docType];
    const statusKey = config.statusKey;
    const status = docData.data[statusKey];

    const statusMapping = {
      "not uploaded": "not uploaded",
      Approved: "Approved",
      Rejected: "Rejected",
      Pending: "Pending",
    };

    return statusMapping[status] || "not uploaded";
  };

  // Function to calculate overall KYC status
  const getOverallKycStatus = () => {
    const docTypes = Object.keys(documentConfig);
    const statuses = docTypes.map((docType) => getDocumentStatus(docType));

    const approved = statuses.filter((status) => status === "Approved").length;
    const rejected = statuses.filter((status) => status === "Rejected").length;
    const pending = statuses.filter((status) => status === "Pending").length;
    const notUploaded = statuses.filter(
      (status) => status === "not uploaded"
    ).length;

    if (approved === docTypes.length) {
      return "Approved";
    } else if (rejected > 0) {
      return "Rejected";
    } else if (pending > 0 && notUploaded === 0) {
      return "Pending";
    } else if (pending > 0 || (approved > 0 && notUploaded > 0)) {
      return "In Progress";
    } else {
      return "Not Started";
    }
  };

  // Function to render overall status badge
  const renderOverallStatusBadge = () => {
    const overallStatus = getOverallKycStatus();

    const statusConfig = {
      Approved: {
        icon: CheckCircle,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
        label: "Approved",
      },
      Pending: {
        icon: Clock,
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
        label: "Pending Review",
      },
      "In Progress": {
        icon: Clock,
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        label: "In Progress",
      },
      Rejected: {
        icon: X,
        bgColor: "bg-red-100",
        textColor: "text-red-600",
        label: "Action Required",
      },
      "Not Started": {
        icon: AlertCircle,
        bgColor: "bg-gray-100",
        textColor: "text-gray-600",
        label: "Not Started",
      },
    };

    const config = statusConfig[overallStatus];
    const Icon = config.icon;

    return (
      <div
        className={`flex items-center space-x-2 ${config.bgColor} ${config.textColor} px-3 py-2 rounded-full text-sm font-medium`}
      >
        <Icon className="w-4 h-4" />
        <span>{config.label}</span>
      </div>
    );
  };

  const getFileType = (url) => {
    if (!url) return "unknown";

    const lowerUrl = url.toLowerCase();
    const hasExplicitExtension = url.includes(".");

    // File type mappings
    const fileTypeMappings = {
      // Document types
      pdf: "pdf",
      doc: "doc",
      docx: "doc",
      txt: "doc",
      rtf: "doc",
      odt: "doc",

      // Spreadsheet types
      xls: "sheet",
      xlsx: "sheet",
      csv: "sheet",
      ods: "sheet",

      // Data types
      json: "json",
      xml: "json",

      // Archive types
      zip: "zip",
      rar: "zip",
      "7z": "zip",
      tar: "zip",
      gz: "zip",

      // Image types
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      bmp: "image",
      webp: "image",
      svg: "image",

      // Presentation types
      ppt: "presentation",
      pptx: "presentation",
      odp: "presentation",
    };

    // First try to get the extension the standard way if it exists
    let extension = "";
    if (hasExplicitExtension) {
      extension = url.split(".").pop()?.toLowerCase() || "";
      if (fileTypeMappings[extension]) {
        return fileTypeMappings[extension];
      }
    }

    // If no explicit extension or not recognized, check last few characters
    const lastChars = lowerUrl.slice(-5); // Check last 5 characters

    // Check for known extensions in last few chars
    for (const [ext, type] of Object.entries(fileTypeMappings)) {
      if (new RegExp(`${ext}[^a-z0-9]*$`).test(lastChars)) {
        return type;
      }
    }

    // Default return for unknown file types
    return "unknown";
  };

  // Handle contract generation
  const handleGenerateContract = () => {
    setContractModal({ open: true, status: null });
  };

  // Handle KYC success (close modal and refresh contract data)
  const handleKycSuccess = async () => {
    setContractModal({ open: false, status: "completed" });
    toast.success("Contract generated successfully!");

    // Refresh contract data after successful generation
    if (onUploadSuccess) {
      await onUploadSuccess("contract", null);
    }
  };

  // Handle contract modal status change
  const handleContractStatusChange = (status) => {
    setContractModal((prev) => ({ ...prev, status }));
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [documentType]: true }));
    const docType = saveDocsPropsMapping[documentType];

    try {
      console.log(file, "kkkkkkkkk", docType);
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
      } else if (docType === "business_document") {
        response = await saveSellerBusinessDocuments(formData);
      } else {
        throw new Error(`Unknown document type: ${docType}`);
      }

      if (response && response.success !== false) {
        if (onUploadSuccess) {
          const successLabel = successLabelMap[documentType] || formatDocumentTypeForDisplay(documentType);
          toast.success(`${successLabel} uploaded successfully`);
          onUploadSuccess(documentType, file);
        }
        console.log(`${documentType} uploaded successfully`);
      } else {
        const errorMessage =
          response?.message || `Failed to upload ${documentType}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        `Failed to upload ${documentType}. Please try again.`;
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploading((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const { downloadFile, isDownloading } = useS3Download();

  const handleDownload = async (url, filename) => {
    try {
      console.log('Initiating download', { url, filename });
      await downloadFile(url, filename);
    } catch (error) {
      toast.error("Failed to download document. Please try again.");
    }
  };

  const openPreview = (url, title) => {
    const fileType = getFileType(url);
    setPreviewModal({ open: true, url, title, fileType });
  };

  const closePreview = () => {
    setPreviewModal({ open: false, url: "", title: "", fileType: "" });
  };

  const renderDocumentCard = (docType) => {
    const config = documentConfig[docType];
    const docData = getDocumentData(docType);
    const status = getDocumentStatus(docType);
    console.log("docData ---- status ----", config, docData, status, docType);
    const Icon = config.icon;
    const isUploading = uploading[docType];

    return (
      <div
        key={docType}
        className="bg-white rounded-lg border border-gray-200 shadow-sm mb-4"
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div
                className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${
                  status === "Approved"
                    ? "bg-green-100 text-green-600"
                    : status === "Rejected"
                    ? "bg-red-100 text-red-600"
                    : status === "Pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : status === "error"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{config.title}</h3>
                <p className="text-gray-600 text-xs sm:text-sm truncate">{config.description}</p>
              </div>
            </div>

            {/* Status Badge */}
            {status === "Approved" && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2">
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">Approved</span>
                <span className="sm:hidden">✓</span>
              </div>
            )}

            {status === "Pending" && (
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2">
                <AlertCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Pending Review</span>
                <span className="sm:hidden">⏳</span>
              </div>
            )}

            {status === "Rejected" && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2">
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Rejected</span>
                <span className="sm:hidden">✗</span>
              </div>
            )}
          </div>

          {/* Approved Status */}
          {status === "Approved" && docData?.data && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-700 font-medium">
                    Document approved successfully
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      openPreview(docData.data[config.dataKey], config.title)
                    }
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-700 text-sm font-medium p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = docData.data[config.dataKey];
                      const fileName = computeFileName(docType, url, config.title);
                      console.log('Downloading KYC document', { docType, url, fileName, status });
                      handleDownload(url, fileName);
                    }}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">↓</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Status */}
          {status === "Pending" && docData?.data && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-sm text-yellow-700 font-medium">
                    Document uploaded - Under review
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      openPreview(docData.data[config.dataKey], config.title)
                    }
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-700 text-sm font-medium p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      const url = docData.data[config.dataKey];
                      const fileName = computeFileName(docType, url, config.title);
                      console.log('Downloading KYC document', { docType, url, fileName, status });
                      handleDownload(url, fileName);
                    }}
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">↓</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Not Uploaded Status - Add generate option for contract */}
          {status === "not uploaded" && (
            <div>
              <p className="text-sm text-gray-600 mb-3 flex flex-wrap items-center">
                Please upload the required document
                {docType === "contract" && (
                  <span
                    className="text-sm ml-2 cursor-pointer flex justify-center items-center text-blue-600 underline"
                    onClick={() => openPreview("", config.title)}
                  >
                    (<FileText className="w-4 mr-1" />
                    <span className="hidden sm:inline">Preview document</span>
                    <span className="sm:inline hidden">Preview</span>)
                  </span>
                )}
              </p>

              {/* Add Generate Document option for contract */}
              {docType === "contract" && (
                <div className="mb-4">
                  <button
                    onClick={handleGenerateContract}
                    className="flex items-center space-x-2 w-full justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-3 text-sm"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Sign in Document</span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center mb-3">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="px-3 text-xs text-gray-500 bg-white">
                      OR
                    </div>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                </div>
              )}

              {/* Existing upload component */}
              <DocumentUpload
                documentType={docType}
                config={config}
                onUpload={handleFileUpload}
                isUploading={isUploading}
                status={status}
              />
            </div>
          )}

          {/* Rejected Status */}
          {status === "Rejected" && (
            <div className="space-y-3">
              <div className="flex items-start space-x-2 text-red-600 py-2 bg-red-50 p-3 rounded-lg border border-red-200">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Document Rejected</p>
                  <p className="text-sm text-red-700 mt-1 break-words">
                    {docData?.message ||
                      "Please upload a valid document and try again"}
                  </p>
                </div>
              </div>

              {docData?.data && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 rounded-lg border space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700">
                      Current rejected document
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        openPreview(docData.data[config.dataKey], config.title)
                      }
                      className="flex items-center space-x-1 text-gray-600 hover:text-blue-700 text-sm font-medium p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Re-upload component */}
              <div className="border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50">
                <div className="text-center mb-3">
                  <RefreshCcw className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-red-700 mb-1">
                    Upload New Document
                  </p>
                  <p className="text-xs text-red-600">
                    Please ensure your document meets all requirements
                  </p>
                </div>

                {/* Add Generate Document option for contract in rejected state */}
                {docType === "contract" && (
                  <div className="mb-4">
                    <button
                      onClick={handleGenerateContract}
                      className="flex items-center space-x-2 w-full justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-3 text-sm"
                    >
                      <FileSignature className="w-4 h-4" />
                      <span>Generate Document</span>
                    </button>

                    {/* Divider */}
                    <div className="flex items-center mb-3">
                      <div className="flex-1 border-t border-red-300"></div>
                      <div className="px-3 text-xs text-red-600 bg-red-50">
                        OR
                      </div>
                      <div className="flex-1 border-t border-red-300"></div>
                    </div>
                  </div>
                )}

                {/* Existing upload component */}
                <DocumentUpload
                  documentType={docType}
                  config={config}
                  onUpload={handleFileUpload}
                  isUploading={isUploading}
                  status={status}
                />
              </div>
            </div>
          )}

          {/* Error Status */}
          {status === "error" && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 py-2">
                <span className="text-sm break-words">{docData?.message}</span>
              </div>

              {/* Add Generate Document option for contract in error state */}
              {docType === "contract" && (
                <div className="mb-4">
                  <button
                    onClick={handleGenerateContract}
                    className="flex items-center space-x-2 w-full justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-3 text-sm"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Generate Document</span>
                  </button>

                  {/* Divider */}
                  <div className="flex items-center mb-3">
                    <div className="flex-1 border-t border-gray-300"></div>
                    <div className="px-3 text-xs text-gray-500 bg-white">
                      OR
                    </div>
                    <div className="flex-1 border-t border-gray-300"></div>
                  </div>
                </div>
              )}

              {/* Existing upload component */}
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

  // Update progress calculation to count only approved documents
  const approvedDocuments = Object.keys(documentConfig).filter(
    (docType) => getDocumentStatus(docType) === "Approved"
  ).length;
  const totalDocuments = Object.keys(documentConfig).length;
  const progressPercentage = (approvedDocuments / totalDocuments) * 100;
  const hasNotUploaded = Object.keys(documentConfig).some(
    (docType) => getDocumentStatus(docType) === "not uploaded"
  );

  // Add this helper function to your component
// Add this helper function to your component
const getSubmitButtonState = () => {
  const docTypes = Object.keys(documentConfig);
  const statuses = docTypes.map((docType) => getDocumentStatus(docType));
  
  const hasNotUploaded = statuses.some(status => status === "not uploaded");
  const hasRejected = statuses.some(status => status === "Rejected");
  const hasPending = statuses.some(status => status === "Pending");
  const allApproved = statuses.every(status => status === "Approved");
  
  // Button should be disabled when:
  // 1. There are documents not uploaded yet
  // 2. There are rejected documents (user needs to re-upload first)
  // 3. All documents are already approved (no need to resubmit)
  // 4. Already submitted for approval and waiting (submitForApproval === 2)
  const shouldDisable = hasNotUploaded || 
                       hasRejected ||
                       (allApproved && submitForApproval === 1) || 
                       submitForApproval === 2;
  
  // Button text logic
  let buttonText = "Submit for Approval";
  let icon = FileText;
  
  if (hasNotUploaded) {
    buttonText = "Complete Upload";
    icon = AlertCircle;
  } else if (hasRejected) {
    buttonText = "Fix Rejected Documents";
    icon = AlertCircle;
  } else if (allApproved && submitForApproval === 1) {
    buttonText = "Already Approved";
    icon = CheckCircle;
  } else if (submitForApproval === 2) {
    buttonText = "Waiting for Review";
    icon = Clock;
  } else if (hasPending) {
    buttonText = "Submit for Approval";
    icon = FileText;
  }
  
  return {
    disabled: shouldDisable,
    text: buttonText,
    icon: icon,
    hasNotUploaded,
    hasRejected,
    hasPending,
    allApproved
  };
};

// Add loading state - add this to your component state
const [isSubmitting, setIsSubmitting] = useState(false);

// Updated handleSubmitForApproval function
const handleSubmitForApproval = async () => {
  const { hasNotUploaded, hasRejected } = getSubmitButtonState();
  
  if (hasNotUploaded) {
    toast.error("Please upload all required documents before submitting.");
    return;
  }
  
  if (hasRejected) {
    toast.error("Please fix all rejected documents before submitting.");
    return;
  }
  
  setIsSubmitting(true); // Start loading
  
  try {
    const token = getCookie("auth_token") || currentUser?.token;
    const userId = getCookie("user_token");
    console.log("User ID from cookie:", userId);
    
    const body = {
      user_id: userId,
    };
    
    const response = await submitKycForApproval(token, body);
    setSubmitForApproval(2); // Set to "Waiting for Approval"
    toast.success("KYC submitted for approval successfully!");
  } catch (error) {
    console.error("KYC submission failed", error);
    toast.error("Failed to submit KYC. Please try again.");
  } finally {
    setIsSubmitting(false); // Stop loading
  }
};

// Spinner component for loading state
const Spinner = ({ className = "w-4 h-4" }) => (
  <svg 
    className={`animate-spin ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4"
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Updated button component for desktop
const SubmitButton = () => {
  const buttonState = getSubmitButtonState();
  const Icon = buttonState.icon;
  const isDisabled = buttonState.disabled || isSubmitting;
  
  return (
    <button
      onClick={handleSubmitForApproval}
      disabled={isDisabled}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
        isDisabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 shadow-sm hover:shadow-md"
      }`}
    >
      {isSubmitting ? (
        <>
          <Spinner />
          <span>Submitting...</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          <span>{buttonState.text}</span>
        </>
      )}
    </button>
  );
};

// For mobile version
const MobileSubmitButton = () => {
  const buttonState = getSubmitButtonState();
  const Icon = buttonState.icon;
  const isDisabled = buttonState.disabled || isSubmitting;
  
  return (
    <button
      onClick={handleSubmitForApproval}
      disabled={isDisabled}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        isDisabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-gray-900 text-white hover:bg-gray-800"
      }`}
    >
      {isSubmitting ? (
        <>
          <Spinner />
          <span className="hidden sm:inline">Submitting...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        <>
          <Icon className="w-4 h-4" />
          <span className="hidden sm:inline">{buttonState.text}</span>
          <span className="sm:hidden">
            {buttonState.hasNotUploaded ? "Complete" : 
             buttonState.hasRejected ? "Fix Docs" : "Submit"}
          </span>
        </>
      )}
    </button>
  );
};

  const areAllDocumentsApproved = () => {
    const docTypes = Object.keys(documentConfig);
    return docTypes.every(
      (docType) => getDocumentStatus(docType) === "Approved"
    );
  };

  return (
    <div className="w-full h-full">
      {/* Mobile-First Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between px-4 py-4 lg:px-6">
          {/* Left Section - Title */}
          <div className="flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              KYC Documents
            </h2>
          </div>

          {/* Center Section - Progress Bar */}
          <div className="flex-1 max-w-md mx-6 lg:mx-8">
            <div className="bg-gray-50 rounded-lg border flex flex-col gap-1 border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Progress</span>
                <span className="text-sm font-semibold text-gray-900">
                  {approvedDocuments}/{totalDocuments} approved
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Right Section - Status Badge and Submit Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Status Badge */}
            {submitForApproval === 1 && areAllDocumentsApproved() && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                <span>Approved</span>
              </div>
            )}

            {(submitForApproval === 2 ||
              (submitForApproval === 1 && !areAllDocumentsApproved())) && (
              <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg">
                <Clock className="w-4 h-4" />
                <span>Waiting for Approval</span>
              </div>
            )}

            {/* Submit Button */}
            {/* <SubmitButton /> */}
          </div>
        </div>

        {/* Mobile Header */}
        <div className="lg:hidden">
          {/* Top Row - Title and Status */}
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-lg font-semibold text-gray-900">
              KYC Documents
            </h2>
            
            {/* Mobile Status Badge */}
            {submitForApproval === 1 && areAllDocumentsApproved() && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="w-3 h-3" />
                <span>Approved</span>
              </div>
            )}

            {(submitForApproval === 2 ||
              (submitForApproval === 1 && !areAllDocumentsApproved())) && (
              <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md">
                <Clock className="w-3 h-3" />
                <span>Pending</span>
              </div>
            )}
          </div>

          {/* Bottom Row - Progress and Button */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-3">
              {/* Progress Section */}
              <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 px-3 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">Progress</span>
                  <span className="text-xs font-semibold text-gray-900">
                    {approvedDocuments}/{totalDocuments}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Mobile Submit Button */}
              <MobileSubmitButton />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 bg-white border-[1px] flex flex-col gap-3 sm:gap-4 border-[#eaeaf1] w-full h-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <p className="text-gray-600 text-sm sm:text-base">
            Upload required verification documents
          </p>
        </div>

        {/* Document List - Mobile Responsive Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.keys(documentConfig).map(renderDocumentCard)}

            {/* Success Message */}
            {/* {approvedDocuments === totalDocuments && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                      All Documents Approved!
                    </h3>
                    <p className="text-green-700 text-sm">
                      Your KYC verification is complete and approved.
                    </p>
                  </div>
                </div>
              </div>
            )} */}
          </div>
            {/* Centered compact submit button below cards */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs flex justify-center">
                <SubmitButton />
              </div>
            </div>
        </div>

        {/* Contract Generation Modal - Mobile Responsive */}
        {contractModal.open && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b">
                <div className="flex items-center space-x-2">
                  <FileSignature className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Generate Contract Document
                  </h3>
                  {contractModal.status && (
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded uppercase text-blue-800">
                      {contractModal.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    setContractModal({ open: false, status: null });
                    const token = getCookie("auth_token") || "";
                    if (token) {
                      const zohoRequestId = localStorage.getItem("request_id");
                      const body = {
                        id: zohoRequestId,
                      };
                      const response = await getZohoDocStatus(token, body);
                      const requestStatus =
                        response?.data?.requests?.request_status;
                      if (requestStatus == "completed") {
                        await getZohoDocsDownload(token, body);
                      }
                    }
                    window.location.reload();
                  }}
                  className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Iframe Content */}
              <div className="flex-1 overflow-y-auto">
                <KycDocumentComponent
                  currentUser={currentUser}
                  onStatusChange={handleContractStatusChange}
                  onKycSuccess={handleKycSuccess}
                />
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Preview Modal - Mobile Responsive */}
        {previewModal.open && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[95vh] sm:h-[85vh] flex flex-col">
              <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {previewModal.title}
                  </h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase flex-shrink-0">
                    {previewModal.fileType}
                  </span>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer ml-2"
                  title="Close"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                {RenderPreviewContent({
                  previewModal,
                  handleDownload,
                  isDownloading,
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KycComponent;