import { formatDateTime } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const DepositPopup = ({ onClose, data }) => {
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

  // Download proof function
  const handleDownloadProof = () => {
    const createdAnchor = document.createElement("a");
    createdAnchor.href = data?.proof;
    createdAnchor.download = "Download";
    createdAnchor.click();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Transaction Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">Ref: {data?.referenceNo}</p>
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
              {data?.amount}
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatDateTime(data?.date)}
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
                {data?.referenceNo}
              </span>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-sm font-medium text-gray-800">
                {data?.amount}
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
                {data?.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Proof Document */}
        {data?.proof && (
          <div className="mx-6 mb-4 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">Payment Proof</h3>
            </div>
            <div className="px-4 py-3">
              <button
                onClick={handleDownloadProof}
                className="flex items-cente cursor-pointer justify-center w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors border border-blue-200"
              >
                <IconStore.download className="size-4 mr-2" />
                <span className="text-sm font-medium">
                  Download Proof Document
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
            <div className="px-4 py-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                {data?.notes}
              </p>
            </div>
          )}
          {data?.description && (
            <div className="px-4 py-3">
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
