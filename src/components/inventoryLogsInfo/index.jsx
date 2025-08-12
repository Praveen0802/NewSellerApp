import { ChevronDown, ChevronUp, X } from "lucide-react";
import { useState } from "react";
import RightViewModal from "../commonComponents/rightViewModal";
import InventoryLogsShimmer from "./InventoryLogsShimmer.jsx"; // Import the shimmer component

const InventoryLogsInfo = ({ show, onClose, data = [], isLoading = false }) => {
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
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return String(value);
  };

  // Get the first complete json_payload as reference
  const getReferencePayload = () => {
    const firstEntry = data.find(
      (entry) =>
        entry.json_payload && Object.keys(entry.json_payload).length > 1
    );
    return firstEntry?.json_payload || {};
  };

  // Get all unique fields across all logs
  const getAllFields = () => {
    const allFields = new Set();
    data.forEach((entry) => {
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

    // Apply changes from logs up to the specified index
    for (let i = 0; i <= upToIndex; i++) {
      const logEntry = data[i];
      if (logEntry.json_payload) {
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

  const displayData = data;
  const allFields = getAllFields();

  return (
    <RightViewModal className="!w-[800px]" show={show} onClose={onClose}>
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
                        <span className="text-xs text-white px-2 py-1 rounded-full">
                          Ticket ID: {logEntry.ticket_id}
                        </span>
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
