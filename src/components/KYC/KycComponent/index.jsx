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
          toast.success(`${documentType} uploaded successfully`);
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
      await downloadFile(url);
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
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
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
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{config.title}</h3>
                <p className="text-gray-600 text-sm">{config.description}</p>
              </div>
            </div>

            {/* Status Badge */}
            {status === "Approved" && (
              <div className="flex items-center space-x-1 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                <span>Approved</span>
              </div>
            )}

            {status === "Pending" && (
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium">
                <AlertCircle className="w-3 h-3" />
                <span>Pending Review</span>
              </div>
            )}

            {status === "Rejected" && (
              <div className="flex items-center space-x-1 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-medium">
                <X className="w-3 h-3" />
                <span>Rejected</span>
              </div>
            )}
          </div>

          {/* Approved Status */}
          {status === "Approved" && docData?.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-green-600" />
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
                    onClick={() =>
                      handleDownload(
                        docData.data[config.dataKey],
                        `${config.title.replace(/\s+/g, "_")}.pdf`
                      )
                    }
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pending Status */}
          {status === "Pending" && docData?.data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-yellow-600" />
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
                    onClick={() =>
                      handleDownload(
                        docData.data[config.dataKey],
                        `${config.title.replace(/\s+/g, "_")}.pdf`
                      )
                    }
                    className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Not Uploaded Status - Add generate option for contract */}
          {status === "not uploaded" && (
            <div>
              <p className="text-sm text-gray-600 mb-3 flex space-x-1">
                Please upload the required document
                {docType === "contract" && (
                  <span
                    className="text-sm ml-2 cursor-pointer flex justify-center items-center -mt-0.5 text-blue-600 underline"
                    onClick={() => openPreview("", config.title)}
                  >
                    (<FileText className="w-4 mr-1" />
                    Preview document)
                  </span>
                )}
              </p>

              {/* Add Generate Document option for contract */}
              {docType === "contract" && (
                <div className="mb-4">
                  <button
                    onClick={handleGenerateContract}
                    className="flex items-center space-x-2 w-full justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-3"
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
                <div className="flex-1">
                  <p className="text-sm font-medium">Document Rejected</p>
                  <p className="text-sm text-red-700 mt-1">
                    {docData?.message ||
                      "Please upload a valid document and try again"}
                  </p>
                </div>
              </div>

              {docData?.data && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-500" />
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
                      className="flex items-center space-x-2 w-full justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-3"
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
                <span className="text-sm">{docData?.message}</span>
              </div>

              {/* Add Generate Document option for contract in error state */}
              {docType === "contract" && (
                <div className="mb-4">
                  <button
                    onClick={handleGenerateContract}
                    className="flex items-center space-x-2 w-full justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-3"
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

  const handleSubmitForApproval = async () => {
    if (hasNotUploaded) {
      console.log("Please upload all required documents before submitting.");
      return; // stop here
    }
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
    }
  };

  const areAllDocumentsApproved = () => {
    const docTypes = Object.keys(documentConfig);
    return docTypes.every(
      (docType) => getDocumentStatus(docType) === "Approved"
    );
  };

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between p-3 sm:p-4">
        <h2 className="pb-2 sm:pb-4 text-base sm:text-lg md:text-xl font-semibold">
          KYC Documents
        </h2>
        {submitForApproval === 0 && (
          <div
            type="button"
            onClick={handleSubmitForApproval}
            disabled={hasNotUploaded}
            className={`px-4 py-2 text-sm sm:text-base rounded-lg transition ${
              hasNotUploaded
                ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-700 cursor-pointer"
            }`}
          >
            Submit for Approval
          </div>
        )}

        {submitForApproval === 1 && areAllDocumentsApproved() && (
          <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            Approved
          </span>
        )}

        {(submitForApproval === 2 ||
          (submitForApproval === 1 && !areAllDocumentsApproved())) && (
          <span className="px-3 py-1 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-full">
            Waiting for Approval
          </span>
        )}
      </div>

      <div className="p-6 sm:p-4 bg-white border-[1px] flex flex-col gap-3 sm:gap-4 border-[#eaeaf1] w-full h-full">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            Upload required verification documents
          </p>
          {/* {renderOverallStatusBadge()} */}
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4 ">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">
              {approvedDocuments}/{totalDocuments} approved
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
        <div className="mb-6 grid grid-cols-1 gap-4">
          <div className="space-y-4 ">
            {Object.keys(documentConfig).map(renderDocumentCard)}

            {/* Success Message */}
            {approvedDocuments === totalDocuments && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">
                      All Documents Approved!
                    </h3>
                    <p className="text-green-700 text-sm">
                      Your KYC verification is complete and approved.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contract Generation Modal */}
        {contractModal.open && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <FileSignature className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
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

        {/* Enhanced Preview Modal */}
        {previewModal.open && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-[70%] h-[85%] flex flex-col max-w-4xl">
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {previewModal.title}
                  </h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded uppercase">
                    {previewModal.fileType}
                  </span>
                </div>
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-gray-100 rounded transition-colors cursor-pointer"
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
