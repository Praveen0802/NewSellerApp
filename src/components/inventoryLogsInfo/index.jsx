import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import RightViewModal from "../commonComponents/rightViewModal";
import InventoryLogsShimmer from "./InventoryLogsShimmer.jsx"; // Import the shimmer component

const InventoryLogsInfo = ({
  show,
  onClose,
  data = [], // Original prop - for backward compatibility (tickets page)
  orderLogs = [], // New prop for order logs (sales page)
  inventoryLogs = [], // New prop for inventory logs (sales page)
  isLoading = false,
  showTabs = false, // New prop to enable tab functionality (sales page)
}) => {
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [activeTab, setActiveTab] = useState("order"); // "order" or "inventory"

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
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  // Get the current data based on active tab or single data prop (backward compatibility)
  const getCurrentData = () => {
    if (showTabs) {
      return activeTab === "order" ? orderLogs : inventoryLogs;
    }
    // Original functionality - use data prop for tickets page
    return data;
  };

  // Get the first complete json_payload as reference
  const getReferencePayload = () => {
    const currentData = getCurrentData();
    const firstEntry = currentData.find(
      (entry) =>
        entry.json_payload && Object.keys(entry.json_payload).length > 1
    );
    return firstEntry?.json_payload || {};
  };

  // Get all unique fields across all logs
  const getAllFields = () => {
    const currentData = getCurrentData();
    const allFields = new Set();
    currentData.forEach((entry) => {
      if (entry.json_payload) {
        Object.keys(entry.json_payload).forEach((key) => allFields.add(key));
      }
    });
    return Array.from(allFields);
  };

  // Get current state of all fields up to a specific log index
  const getCurrentFieldValues = (upToIndex) => {
    const referencePayload = getReferencePayload();
    const currentValues = { ...referencePayload };
    const currentData = getCurrentData();

    // Apply changes from logs up to the specified index
    for (let i = 0; i <= upToIndex; i++) {
      const logEntry = currentData[i];
      if (logEntry && logEntry.json_payload) {
        Object.entries(logEntry.json_payload).forEach(([key, value]) => {
          currentValues[key] = value;
        });
      }
    }

    return currentValues;
  };

  // Check if a field was changed in the current log
  const isFieldChangedInCurrentLog = (key, logEntry) => {
    return logEntry.json_payload && logEntry.json_payload.hasOwnProperty(key);
  };

  // Toggle accordion expansion
  const toggleLog = (index) => {
    if (isLoading) return; // Prevent interaction during loading

    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedLogs(new Set()); // Reset expanded logs when switching tabs
  };

  const displayData = getCurrentData();
  const allFields = getAllFields();

  return (
    <RightViewModal className="!w-[800px]" show={show} onClose={onClose}>
      <div className="w-full bg-white rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-999">
          <p className="text-lg font-medium text-gray-800">Log Details</p>
          <div
            onClick={() => onClose()}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        {/* Tab Navigation - Only show if showTabs is true (for sales page) */}
        {showTabs && (
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => handleTabChange("order")}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "order"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Order Logs ({orderLogs.length})
            </button>
            <button
              onClick={() => handleTabChange("inventory")}
              className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === "inventory"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Inventory Logs ({inventoryLogs.length})
            </button>
          </div>
        )}

        {/* Conditional Rendering: Shimmer or Content */}
        {isLoading ? (
          <InventoryLogsShimmer count={3} />
        ) : (
          <div className="max-h-[90vh] overflow-y-auto p-3">
            {displayData.map((logEntry, index) => {
              const isExpanded = expandedLogs.has(index);
              const payloadKeys = Object.keys(logEntry.json_payload || {});
              const hasPayload = payloadKeys.length > 0;
              const currentFieldValues = getCurrentFieldValues(index);

              return (
                <div
                  key={index}
                  className="mb-3 border border-[#E0E1EA] rounded-lg overflow-hidden"
                >
                  {/* Log Header */}
                  <div
                    onClick={() => toggleLog(index)}
                    className={`${
                      isExpanded ? "bg-[#343432]" : "bg-[#343432]"
                    } flex justify-between items-center px-3 cursor-pointer`}
                  >
                    <div className="flex-1 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isExpanded ? "text-white" : "text-[#ffff]"
                          }`}
                        >
                          Log #{index + 1}
                        </span>
                        {logEntry.ticket_id && (
                          <span className="text-xs text-white px-2 py-1 rounded-full">
                            Ticket ID: {logEntry.ticket_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasPayload && (
                        <div
                          className={`mt-1 text-xs py-3 ${
                            isExpanded ? "text-white" : "text-[#ffff]"
                          }`}
                        >
                          {payloadKeys.length} change
                          {payloadKeys.length !== 1 ? "s" : ""} recorded
                        </div>
                      )}
                      <div
                        className={`pl-3 ml-2 h-full border-l-[1px] py-3 ${
                          isExpanded
                            ? "border-l-[#51428E]"
                            : " border-l-[#E0E1EA]"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 flex items-center justify-center rounded-full  ${
                            isExpanded ? "bg-[#343432]" : "bg-[#DADBE54D]"
                          }`}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="p-3 bg-white">
                      {allFields.length > 0 ? (
                        <div className="w-full">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Current State:
                          </h4>
                          <div className="flex flex-wrap -mx-2">
                            {/* First Table */}
                            <div className="w-full md:w-1/2 px-2 mb-4">
                              <table className="min-w-full border border-gray-200">
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {allFields
                                    .slice(0, Math.ceil(allFields.length / 2))
                                    .map((key, fieldIndex) => {
                                      const isChangedInCurrentLog =
                                        index > 0 &&
                                        isFieldChangedInCurrentLog(
                                          key,
                                          logEntry
                                        );
                                      const currentValue =
                                        currentFieldValues[key];
                                      const hasValue =
                                        currentValue !== undefined &&
                                        currentValue !== null;

                                      return (
                                        <tr
                                          key={fieldIndex}
                                          className={`hover:bg-gray-50 ${
                                            isChangedInCurrentLog
                                              ? "bg-yellow-100"
                                              : ""
                                          }`}
                                        >
                                          <td
                                            className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-600 border-r border-gray-100 max-w-[150px] truncate"
                                            title={formatKeyName(key)}
                                          >
                                            {formatKeyName(key)}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-800 max-w-[200px] overflow-hidden">
                                            {hasValue ? (
                                              key
                                                ?.toLowerCase()
                                                .includes("link") ? (
                                                <a
                                                  href={currentValue}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline"
                                                >
                                                  Click here
                                                </a>
                                              ) : (
                                                <span
                                                  className={`inline-flex items-center px-2 py-1 rounded text-xs max-w-full truncate ${
                                                    isChangedInCurrentLog
                                                      ? "bg-yellow-200 text-yellow-800 font-semibold"
                                                      : "bg-gray-100"
                                                  }`}
                                                  title={formatValue(
                                                    currentValue
                                                  )}
                                                >
                                                  {formatValue(currentValue)}
                                                </span>
                                              )
                                            ) : (
                                              <span className="text-gray-400 italic text-xs">
                                                Not set
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>

                            {/* Second Table */}
                            <div className="w-full md:w-1/2 px-2 mb-4">
                              <table className="min-w-full border border-gray-200">
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {allFields
                                    .slice(Math.ceil(allFields.length / 2))
                                    .map((key, fieldIndex) => {
                                      const isChangedInCurrentLog =
                                        index > 0 &&
                                        isFieldChangedInCurrentLog(
                                          key,
                                          logEntry
                                        );
                                      const currentValue =
                                        currentFieldValues[key];
                                      const hasValue =
                                        currentValue !== undefined &&
                                        currentValue !== null;

                                      return (
                                        <tr
                                          key={fieldIndex}
                                          className={`hover:bg-gray-50 ${
                                            isChangedInCurrentLog
                                              ? "bg-yellow-100"
                                              : ""
                                          }`}
                                        >
                                          <td
                                            className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-600 border-r border-gray-100 max-w-[150px] truncate"
                                            title={formatKeyName(key)}
                                          >
                                            {formatKeyName(key)}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-800 max-w-[200px] overflow-hidden">
                                            {hasValue ? (
                                              key
                                                ?.toLowerCase()
                                                .includes("link") ? (
                                                <a
                                                  href={currentValue}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline"
                                                >
                                                  Click here
                                                </a>
                                              ) : (
                                                <span
                                                  className={`inline-flex items-center px-2 py-1 rounded text-xs max-w-full truncate ${
                                                    isChangedInCurrentLog
                                                      ? "bg-yellow-200 text-yellow-800 font-semibold"
                                                      : "bg-gray-100"
                                                  }`}
                                                  title={formatValue(
                                                    currentValue
                                                  )}
                                                >
                                                  {formatValue(currentValue)}
                                                </span>
                                              )
                                            ) : (
                                              <span className="text-gray-400 italic text-xs">
                                                Not set
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </table>
                            </div>
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

            {/* No Data Message */}
            {displayData.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p>No log entries found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </RightViewModal>
  );
};

export default InventoryLogsInfo;
