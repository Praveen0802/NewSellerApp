import { formatDateTime } from "@/utils/helperFunctions";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import React from "react";

const TransactionPopup = ({ data, onClose, showShimmer = false }) => {
  const renderDetailItem = (label, value) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-[#343432] font-medium text-sm">{value}</span>
    </div>
  );

  // Shimmer loading component
  const ShimmerLoader = () => (
    <div className="m-4 border border-gray-200 rounded-md shadow-sm animate-pulse">
      {/* Header Shimmer */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <div className="h-5 bg-gray-200 rounded w-36 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-7 w-7 bg-gray-200 rounded-full"></div>
      </div>

      {/* Transaction Type and Amount Section Shimmer */}
      <div className="p-4 bg-[#f8f9fd]">
        <div className="flex justify-between items-center mb-1">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="bg-gray-200 rounded-full h-6 w-16"></div>
        </div>
        <div className="h-7 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-36"></div>
      </div>

      {/* Transaction Information Shimmer */}
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>

        {/* Detail Items Shimmer */}
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-28"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </div>

        {/* Description Section Shimmer */}
        <div className="mt-4">
          <div className="h-5 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-4/5 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showShimmer) {
    return <ShimmerLoader />;
  }

  return (
    <div className="m-4 border border-gray-200 rounded-md shadow-sm">
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div>
          <p className="text-[18px] text-[#343432] font-medium">
            Transaction Details
          </p>
          <p className="text-xs text-gray-500">
            {formatDateTime(data?.created_date_time)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="hover:bg-gray-100 p-1 cursor-pointer rounded-full"
        >
          <IconStore.close className="size-5" />
        </button>
      </div>

      <div className="p-4 bg-[#f8f9fd]">
        <div className="flex justify-between items-center mb-1">
          <p className="text-sm text-gray-500">Transaction Type</p>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            {data?.credit_depit}
          </div>
        </div>
        <p className="text-[24px] text-[#343432] font-bold mb-1">
          {data?.price_with_currency}
        </p>
        <p className="text-xs text-gray-500">Reference: {data?.reference_no}</p>
      </div>

      <div className="p-4">
        <p className="font-medium text-[#343432] mb-3">
          Transaction Information
        </p>
        {renderDetailItem("Reference Number", data?.reference_no)}
        {renderDetailItem("Amount", data?.amount)}
        {renderDetailItem("Currency", data?.currency)}
        <div className="mt-4">
          <p className="font-medium text-[#343432] mb-2">Description</p>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-100">
            {data?.description}
          </p>
        </div>
      </div>

      {/* Mobile-specific styling */}
      <style jsx>{`
        @media (max-width: 640px) {
          .text-[18px] {
            font-size: 1rem;
          }
          .text-[24px] {
            font-size: 1.25rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TransactionPopup;
