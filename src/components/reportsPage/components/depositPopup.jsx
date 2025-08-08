import useS3Download from "@/Hooks/useS3Download";
import { formatDateTime } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const DepositPopup = ({ onClose, data, showShimmer = false }) => {
  const formatDescription = (desc) => {
    if (!desc) return "";

    // Extract the date if available
    const dateMatch = desc.match(
      /Deposit request made on (\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/
    );
    const date = dateMatch ? dateMatch[1] : "";

    // Extract any JSON data if available
    const jsonMatch = desc.match(/DATA - (\{.*?\}) -/);
    let jsonData = null;
    if (jsonMatch) {
      try {
        jsonData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        // Ignore parsing errors
      }
    }

    // Return the clean description or the original if parsing fails
    return desc.split(" - DATA -")[0] || desc;
  };

  // Status helper functions - now handles string status values
  const getStatusText = (status) => {
    if (typeof status === "string") {
      return status; // Return the string status as-is (e.g., "Pending", "Approved", etc.)
    }

    // Fallback for numeric status
    switch (status) {
      case 1:
        return "Approved";
      case 2:
        return "Pending";
      case 3:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    const statusText =
      typeof status === "string"
        ? status.toLowerCase()
        : getStatusText(status).toLowerCase();

    switch (statusText) {
      case "approved":
        return "bg-green-100 text-green-800"; // Green for Approved
      case "pending":
        return "text-[#F5A623] bg-[#FFF8EC]"; // Orange for Pending
      case "rejected":
        return "text-[#FF3B30] bg-[#FFEFED]"; // Red for Rejected
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const { downloadFile, isDownloading } = useS3Download();
  // Download proof function
  const handleDownloadProof = async () => {
    if (data?.proof) {
      await downloadFile(
        data.proof,
        `${data?.reference_no}_${data?.amount}_${data?.currency}_deposit-proof`
      );
    }
  };

  // Shimmer loading component
  const ShimmerLoader = () => (
    <div className="flex flex-col h-full animate-pulse">
      {/* Header Shimmer */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div>
          <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
      </div>

      {/* Content Shimmer */}
      <div className="flex-1 overflow-y-auto">
        {/* Amount Card Shimmer */}
        <div className="mx-6 my-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="flex items-baseline">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-12 ml-2"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-36 mt-2"></div>
        </div>

        {/* Transaction Details Shimmer */}
        <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-36"></div>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Reference Number */}
            <div className="flex justify-between items-center px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-28"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            {/* Amount */}
            <div className="flex justify-between items-center px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            {/* Transaction Type */}
            <div className="flex justify-between items-center px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-28"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            {/* Status */}
            <div className="flex justify-between items-center px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              <div className="h-6 bg-gray-200 rounded w-18"></div>
            </div>
            {/* Payment Method */}
            <div className="flex justify-between items-center px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            {/* Created Date */}
            <div className="flex justify-between items-center px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Proof Document Shimmer */}
        <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-center w-full py-2 px-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="h-4 w-4 bg-gray-200 rounded mr-2"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>

        {/* Additional Information Shimmer */}
        <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="h-5 bg-gray-200 rounded w-36"></div>
          </div>
          {/* Notes Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
          {/* Description Section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          {/* Reason Section */}
          <div className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="bg-gray-50 p-3 rounded border border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showShimmer) {
    return <ShimmerLoader />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Transaction Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ref: {data?.reference_no}
          </p>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-gray-100 cursor-pointer p-2 rounded-full transition-colors"
        >
          <IconStore.close className="size-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Amount Card */}
        <div className="mx-6 my-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Amount</span>
            {data?.status && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                  data.status
                )}`}
              >
                {getStatusText(data.status)}
              </span>
            )}
          </div>
          <div className="flex items-baseline">
            <h1 className="text-2xl font-bold text-[#343432]">
              {data?.price_with_currency || data?.amount}
            </h1>
            {data?.currency && !data?.price_with_currency && (
              <span className="text-sm text-gray-600 ml-2">
                {data?.currency}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatDateTime(data?.created_date_time)}
          </p>
        </div>

        {/* Transaction Details */}
        <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">
              Transaction Information
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Reference Number</span>
              <span className="text-sm font-medium text-gray-800">
                {data?.reference_no}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-medium text-gray-800">
                {data?.price_with_currency ||
                  `${data?.amount} ${data?.currency}`}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Transaction Type</span>
              <span className="text-sm font-medium text-gray-800">
                {data?.transactionType}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(
                  data?.status
                )}`}
              >
                {getStatusText(data?.status)}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-medium text-gray-800">
                {data?.payment_transfer_by}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Created Date</span>
              <span className="text-sm font-medium text-gray-800">
                {formatDateTime(data?.created_date_time)}
              </span>
            </div>
          </div>
        </div>

        {/* Proof Document - Only show if proof exists and is not empty */}
        {data?.proof && data?.proof.trim() !== "" && (
          <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">Payment Proof</h3>
            </div>
            <div className="px-4 py-3">
              <button
                onClick={handleDownloadProof}
                className="flex items-center cursor-pointer justify-center w-full py-2 px-4 bg-blue-50 hover:bg-gray-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                <IconStore.download className="size-4 mr-2" />
                <span className="text-sm font-medium">
                  {isDownloading ? "Downloading..." : "Download Proof Document"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Notes and Description */}
        <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">
              Additional Information
            </h3>
          </div>
          {data?.notes && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                {data?.notes}
              </p>
            </div>
          )}
          {data?.description && (
            <div className="px-4 py-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Description
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                {formatDescription(data?.description)}
              </p>
            </div>
          )}
          {data?.approve_reject_reason && (
            <div className="px-4 py-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Reason</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                {data?.approve_reject_reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-specific styling */}
      <style jsx>{`
        @media (max-width: 640px) {
          .mx-6 {
            margin-left: 1rem;
            margin-right: 1rem;
          }
          .px-6 {
            padding-left: 1rem;
            padding-right: 1rem;
          }
          .text-xl {
            font-size: 1rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DepositPopup;
