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
      <div className="">
        <div className="p-4 flex flex-col gap-3 border-b-[1px] border-[#F0F0F5]">
          {/* Loading shimmer for description */}
          <div className="space-y-2">
            <Shimmer className="h-3 w-full" />
            <Shimmer className="h-3 w-3/4" />
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Loading shimmer for SB Pay title */}
            <Shimmer className="h-3 w-16" />
            
            {/* Loading shimmer for account details grid */}
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="space-y-1">
                  <Shimmer className="h-3 w-20" />
                  <div className="flex px-2 py-[3px] rounded-md bg-gray-200 justify-between items-center">
                    <Shimmer className="h-3 w-24" />
                    <Shimmer className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Loading shimmer for warning note */}
            <div className="flex gap-2 items-center bg-red-100 rounded-md px-2 py-[3px]">
              <Shimmer className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1">
                <Shimmer className="h-3 w-full" />
                <Shimmer className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular content when not loading
  return (
    <div className="">
      <div className="p-4 flex flex-col gap-3 border-b-[1px] border-[#F0F0F5]">
        <p className="text-[13px] text-[#343432] text-left font-medium">
          Top up by bank transfer from your funding account. Payments can take
          up to 24 hours to appear in your SB Pay account
        </p>
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-[#343432] text-left font-medium">
            SB Pay
          </p>
          <div className="grid grid-cols-2 gap-4">
            {accountValues?.map((list, listIndex) => {
              return (
                <div key={listIndex}>
                  <p className="text-[12px] text-gray-600">{list?.name}</p>
                  <div className="flex px-2 py-[3px] rounded-md bg-gray-200 justify-between items-center">
                    <p className="text-[12px] text-[#343432] font-semibold">
                      {list?.value}
                    </p>
                    <button
                      onClick={() => handleCopy(list?.value, listIndex)}
                      className="cursor-pointer"
                    >
                      {copiedItem === listIndex ? (
                        <IconStore.check className="stroke-green-500 size-4" />
                      ) : (
                        <IconStore.copy className="stroke-[#323A70] size-4 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 items-center bg-red-100 rounded-md px-2 py-[3px]">
            <IconStore.exclamatory className="stroke-red-500 size-7" />
            <p className="text-[12px] text-red-500">{accountDetails?.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPopupModal;