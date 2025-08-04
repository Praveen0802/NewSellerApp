import React, { useState, useEffect } from "react";
import useKycHook from "./useKycHook"; // Adjust the import path as needed

const KycDocumentComponent = ({ currentUser, onStatusChange }) => {
  const {
    kycUrl,
    kycLoader,
    ownerLoader,
    kycStatus,
    error,
    hasInitialized, // Get this from the hook now
    getZohoDocs,
    checkIsDocsSubmitted,
  } = useKycHook({ currentUser });

  const [showIframe, setShowIframe] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  console.log("error", error);
  console.log("kycLoader", kycLoader);
  console.log("kycUrl", kycUrl);
  console.log("hasInitialized", hasInitialized);

  // Notify parent component about status changes
  useEffect(() => {
    if (onStatusChange && kycStatus) {
      onStatusChange(kycStatus);
    }
  }, [kycStatus, onStatusChange]);

  // Show iframe when URL is available
  useEffect(() => {
    if (kycUrl && !error.zohoEmbed) {
      setShowIframe(true);
      setIframeError(false);
    }
  }, [kycUrl, error.zohoEmbed]);

  const handleIframeError = () => {
    setIframeError(true);
    console.error("Failed to load KYC document iframe");
  };

  const handleRetry = async () => {
    if (!currentUser?.email || !currentUser?.first_name) return;

    const payload = {
      recipient_name: currentUser.first_name,
      recipient_email: currentUser.email,
    };

    try {
      await getZohoDocs(payload);
    } catch (error) {
      console.error("Retry failed:", error);
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

  const renderStatusBadge = () => {
    if (!kycStatus) return null;

    const statusConfig = {
      completed: { color: "bg-green-100 text-green-800", text: "Completed" },
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Pending" },
      rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
      in_progress: { color: "bg-blue-100 text-blue-800", text: "In Progress" },
      submitted: { color: "bg-blue-100 text-blue-800", text: "Submitted" },
    };

    const config = statusConfig[kycStatus] || {
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

  // FIXED: Check for errors FIRST, but only after initialization
  if (
    hasInitialized &&
    (error.zohoEmbed || error.zohoDocStatus || iframeError)
  ) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        {renderStatusBadge()}
        {renderError()}
      </div>
    );
  }

  // Show iframe when URL is available and no errors
  if (showIframe && kycUrl && !error.zohoEmbed && hasInitialized) {
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
            className="px-3 py-1 text-blue-600 hover:text-blue-800 underline"
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
