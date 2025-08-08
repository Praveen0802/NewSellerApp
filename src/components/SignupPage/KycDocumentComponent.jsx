import React, { useState, useEffect } from "react";
import useKycHook from "./useKycHook"; // Adjust the import path as needed
import { toast } from "react-toastify";

const KycDocumentComponent = ({
  currentUser,
  onStatusChange,
  onKycSuccess = () => {},
} = {}) => {
  const {
    kycUrl,
    kycLoader,
    ownerLoader,
    kycStatus,
    isPolling,
    error,
    hasInitialized,
    downloadLoader,
    requestId,
    getZohoDocs,
    checkIsDocsSubmitted,
    downloadKycDocument,
  } = useKycHook({ currentUser });

  // let kycStatus = "completed";

  const [showIframe, setShowIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);


  // Notify parent component about status changes
  useEffect(() => {
    if (onStatusChange && kycStatus) {
      onStatusChange(kycStatus);
    }
  }, [kycStatus, onStatusChange]);

  // Show iframe when URL is available and status is not completed
  useEffect(() => {
    if (
      kycUrl &&
      !error.zohoEmbed &&
      kycStatus?.toLowerCase() !== "completed"
    ) {
      setShowIframe(true);
      setIframeError(false);
    }
  }, [kycUrl, error.zohoEmbed, kycStatus]);

  const handleIframeError = () => {
    setIframeError(true);
    console.error("Failed to load KYC document iframe");
  };

  const handleRetry = async () => {
    if (!currentUser?.email || !currentUser?.first_name) return;

    const payload = {
      recipient_name: currentUser.first_name,
      recipient_email: currentUser.email,
      testing: true, // Optional: Set to true for testing purposes
    };

    try {
      await getZohoDocs(payload);
    } catch (error) {
      console.error("Retry failed:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await downloadKycDocument();
      toast.info(
        "You will be redirected to the KYC document in a few seconds."
      );
      onKycSuccess?.();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderLoader = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600 text-center">
        {!hasInitialized
          ? "Initializing KYC document..."
          : kycLoader
          ? "Loading KYC document..."
          : "Checking document status..."}
      </p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="text-red-600 mb-4">
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error Loading Document
      </h3>
      <p className="text-red-600 text-center mb-4">
        {iframeError
          ? "Failed to load the document. Please check your internet connection."
          : error.zohoEmbed
          ? "Failed to fetch KYC document. Please try again."
          : error.download
          ? "Failed to download document. Please try again."
          : "Unable to check document status. Please try again."}
      </p>
      <button
        onClick={handleRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        disabled={kycLoader || ownerLoader}
      >
        Try Again
      </button>
    </div>
  );

  const renderCompletedState = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-green-50 rounded-lg border border-green-200">
      <div className="text-green-600 mb-4">
        <svg
          className="w-16 h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-green-800 mb-2">
        KYC Document Completed
      </h3>
      <p className="text-green-700 text-center mb-6">
        Your KYC document has been successfully completed and verified.
      </p>
      <button
        onClick={handleDownload}
        disabled={downloadLoader}
        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
      >
        {downloadLoader ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Download KYC Document</span>
          </>
        )}
      </button>
      {requestId && (
        <p className="text-xs text-gray-500 mt-3">Document ID: {requestId}</p>
      )}
    </div>
  );

  const renderStatusBadge = () => {
    if (!kycStatus) return null;

    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", text: "Completed" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      in_progress: { color: "bg-gray-100 text-blue-800", text: "In Progress" },
      submitted: { color: "bg-gray-100 text-blue-800", text: "Submitted" },
    };

    const config = statusConfig[kycStatus.toLowerCase()] || {
      color: "bg-gray-100 text-gray-800",
      text: kycStatus,
    };

    return (
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">KYC Document</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
        >
          {config.text}
        </span>
      </div>
    );
  };

  // Check if KYC is completed and should show download state
  const isCompleted = kycStatus?.toLowerCase() === "completed";

  // Show completed state with download button
  if (hasInitialized && isCompleted && !showIframe) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {renderStatusBadge()}
        {renderCompletedState()}
      </div>
    );
  }

  // Check for errors FIRST, but only after initialization
  if (
    hasInitialized &&
    (error.zohoEmbed || error.zohoDocStatus || iframeError) &&
    !isCompleted
  ) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {renderStatusBadge()}
        {renderError()}
      </div>
    );
  }

  // Show iframe when URL is available and no errors (and not completed)
  if (
    showIframe &&
    kycUrl &&
    !error.zohoEmbed &&
    hasInitialized &&
    !isCompleted
  ) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 h-screen flex flex-col">
        {renderStatusBadge()}

        {/* Iframe Container */}
        <div className="relative bg-white rounded-lg shadow-lg border flex-1 min-h-0">
          {/* Loading overlay for iframe */}
          {(kycLoader || ownerLoader) && (
            <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center z-10">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">Updating...</p>
              </div>
            </div>
          )}

          <iframe
            src={kycUrl}
            title="KYC Document"
            className="w-full h-full border-0 rounded-lg"
            frameBorder="0"
            allowFullScreen
            onError={handleIframeError}
            onLoad={() => setIframeError(false)}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            style={{ overflow: "hidden" }}
          />
        </div>

        {/* Footer with actions */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600 flex-shrink-0">
          <p>Please complete the document signing process above.</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-gray-600 hover:text-blue-800 underline"
            disabled={kycLoader || ownerLoader}
          >
            Refresh Document
          </button>
        </div>
      </div>
    );
  }

  // Show loader while still initializing or loading (and no errors)
  if (!hasInitialized || (kycLoader && !error.zohoEmbed)) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {renderStatusBadge()}
        {renderLoader()}
      </div>
    );
  }

  // Fallback state - initialized but no URL and no errors
  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {renderStatusBadge()}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-center">No KYC document available.</p>
        {currentUser?.email && currentUser?.first_name && (
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={kycLoader || ownerLoader}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default KycDocumentComponent;
