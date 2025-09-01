import { IconStore } from "@/utils/helperFunctions/iconStore";
import React, { useState } from "react";

// Shimmer component
const Shimmer = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-300 rounded ${className}`}></div>
);

const TopPopupModal = ({ bankAccountDetails, isLoading = false }) => {
  // State to track which item has been recently copied
  const [copiedItem, setCopiedItem] = useState(null);

  const accountDetails = {
    accountName: bankAccountDetails?.bank_account_details?.account_name,
    iban: bankAccountDetails?.bank_account_details?.iban,
    swift: bankAccountDetails?.bank_account_details?.swiftcode || "-",
    refernce: bankAccountDetails?.bank_account_details?.reference,
    note: "Please include the reference when making the bank transfer. This ensures your funds are transferred directly to your SB pay wallet",
    fundingAccount: {
      name: "first Abu Dhabi Bank",
      ticket: "Ticket Services DMCCC",
      accNo: "AEYSHJSHJHSJHS",
    },
  };

  const accountValues = [
    { name: "Account Name", value: accountDetails?.accountName },
    { name: "IBAN", value: accountDetails?.iban },
    { name: "Swift", value: accountDetails?.swift },
    { name: "Reference", value: accountDetails?.refernce },
  ];

  // Function to handle copying with visual feedback
  const handleCopy = (value, index) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedItem(index);
        setTimeout(() => setCopiedItem(null), 2000); // Reset after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // Shimmer loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="p-4 sm:p-4 flex flex-col gap-3 sm:gap-3 border-b-[1px] border-[#F0F0F5]">
          {/* Loading shimmer for description */}
          <div className="space-y-2">
            <Shimmer className="h-4 sm:h-3 w-full" />
            <Shimmer className="h-4 sm:h-3 w-4/5 sm:w-3/4" />
            <Shimmer className="h-4 sm:h-3 w-3/5 sm:hidden" />
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Loading shimmer for SB Pay title */}
            <Shimmer className="h-4 sm:h-3 w-20 sm:w-16" />
            
            {/* Loading shimmer for account details grid - Single column on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Shimmer className="h-3 w-24 sm:w-20" />
                  <div className="flex px-3 sm:px-2 py-2 sm:py-[3px] rounded-md bg-gray-200 justify-between items-center">
                    <Shimmer className="h-4 sm:h-3 w-32 sm:w-24" />
                    <Shimmer className="h-5 sm:h-4 w-5 sm:w-4" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading shimmer for warning note */}
            <div className="flex gap-3 sm:gap-2 items-start sm:items-center bg-red-100 rounded-md px-3 sm:px-2 py-2 sm:py-[3px]">
              <Shimmer className="h-8 w-8 sm:h-7 sm:w-7 rounded-full shrink-0 mt-0.5 sm:mt-0" />
              <div className="flex-1 space-y-2 sm:space-y-1">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-4/5 sm:w-2/3" />
                <Shimmer className="h-3 w-3/5 sm:hidden" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular content when not loading
  return (
    <div className="w-full">
      <div className="p-4 sm:p-4 flex flex-col gap-4 sm:gap-3 border-b-[1px] border-[#F0F0F5]">
        {/* Description text - Better mobile readability */}
        <p className="text-sm sm:text-[13px] text-[#343432] text-left font-medium leading-relaxed sm:leading-normal">
          Top up by bank transfer from your funding account. Payments can take
          up to 24 hours to appear in your SB Pay account
        </p>
        
        <div className="flex flex-col gap-4 sm:gap-4">
          {/* SB Pay title */}
          <p className="text-sm sm:text-[13px] text-[#343432] text-left font-medium">
            SB Pay
          </p>
          
          {/* Account details grid - Single column on mobile, 2 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {accountValues?.map((list, listIndex) => {
              return (
                <div key={listIndex} className="w-full">
                  <p className="text-sm sm:text-[12px] text-gray-600 mb-1 font-medium">
                    {list?.name}
                  </p>
                  <div className="flex px-3 sm:px-2 py-2 sm:py-[3px] rounded-md bg-gray-200 justify-between items-center min-h-[40px] sm:min-h-auto">
                    <p className="text-sm sm:text-[12px] text-[#343432] font-semibold break-all pr-2 leading-tight">
                      {list?.value}
                    </p>
                    <button
                      onClick={() => handleCopy(list?.value, listIndex)}
                      className="cursor-pointer p-1 shrink-0 hover:bg-gray-300 rounded transition-colors"
                      aria-label={`Copy ${list?.name}`}
                    >
                      {copiedItem === listIndex ? (
                        <IconStore.check className="stroke-green-500 size-5 sm:size-4" />
                      ) : (
                        <IconStore.copy className="stroke-[#323A70] size-5 sm:size-4 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Warning note - Better mobile layout */}
          <div className="flex gap-3 sm:gap-2 items-start sm:items-center bg-red-100 rounded-md px-3 sm:px-2 py-3 sm:py-[3px]">
            <IconStore.exclamatory className="stroke-red-500 size-6 sm:size-7 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm sm:text-[12px] text-red-500 leading-relaxed sm:leading-normal">
              {accountDetails?.note}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPopupModal;