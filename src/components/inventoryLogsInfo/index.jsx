import React, { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import RightViewModal from "../commonComponents/rightViewModal";

const InventoryLogsInfo = ({ show, onClose, data = [] }) => {
  const [expandedLogs, setExpandedLogs] = useState(new Set());

  // Function to clean and format key names
  const formatKeyName = (key) => {
    return key
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/\b\w/g, (l) => l.toUpperCase()) // Capitalize first letter of each word
      .trim();
  };

  // Function to format value display
  const formatValue = (value) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "string" && value.trim() === "") {
      return "Empty";
    }
    return String(value);
  };

  // Toggle accordion expansion
  const toggleLog = (index) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const displayData = data;

  return (
    <RightViewModal className="!w-[670px]" show={show} onClose={onClose}>
      <div className="w-full bg-white rounded-lg">
        <div className="flex justify-between items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-999">
          <p className="text-lg font-medium text-gray-800">Log Details</p>
          <div
            onClick={() => onClose()}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        {/* Logs Accordion */}
        <div className="max-h-[90vh] overflow-y-auto p-3">
          {displayData.map((logEntry, index) => {
            const isExpanded = expandedLogs.has(index);
            const payloadKeys = Object.keys(logEntry.json_payload || {});
            const hasPayload = payloadKeys.length > 0;

            return (
              <div
                key={index}
                className="mb-3 border border-[#E0E1EA] rounded-lg overflow-hidden"
              >
                <div
                  onClick={() => toggleLog(index)}
                  className={`${isExpanded ? "bg-[#130061]" :"bg-[#FFFFFF]"} flex justify-between items-center px-3 cursor-pointer`}
                >
                  <div className="flex-1 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isExpanded ? "text-white":"text-[#323A70]"}`}>
                        Log #{index + 1}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Ticket ID: {logEntry.ticket_id}
                      </span>
                    </div>
                    
                  </div>
                  <div className="flex items-center gap-1">
                    {hasPayload && (
                      <div className={`mt-1 text-xs py-3 ${isExpanded ? "text-white":"text-[#323A70]"}`}>
                        {payloadKeys.length} change
                        {payloadKeys.length !== 1 ? "s" : ""} recorded
                      </div>
                    )}
                    <div className={`pl-3 ml-2 h-full border-l-[1px] py-3 ${isExpanded ? "border-l-[#51428E]":" border-l-[#E0E1EA]"}`}>
                      <div className={`h-6 w-6 flex items-center justify-center rounded-full  ${isExpanded ? "bg-[#362679]":"bg-[#DADBE54D]"}`}>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#323A70]" />
                      )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="p-3 bg-white">
                    {hasPayload ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Changes Made:
                        </h4>
                        <div className={`grid gap-1 ${Object.entries(logEntry.json_payload).length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {Object.entries(logEntry.json_payload).map(
                            ([key, value], payloadIndex) => (
                              <div
                                key={payloadIndex}
                                className="border border-blue-100 "
                              >
                                <div className="grid grid-cols-2 content-stretch h-full">
                                  <div className="p-2 text-sm text-gray-600 border-r border-blue-100">
                                    {formatKeyName(key)}
                                  </div>
                                  <div className="p-2 text-sm text-gray-800 font-medium">
                                    {key?.includes('link') ? (
                                      <a
                                        href={value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 cursor-pointer"
                                      >{'Click here'}
                                      </a>
                                    ):
                                    (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs">
                                      {formatValue(value)}
                                    </span>)}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic py-3 text-center border border-blue-100 rounded-md">
                        No changes recorded in this log entry
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {displayData.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            <p>No log entries found</p>
          </div>
        )}
      </div>
    </RightViewModal>
  );
};

export default InventoryLogsInfo;
