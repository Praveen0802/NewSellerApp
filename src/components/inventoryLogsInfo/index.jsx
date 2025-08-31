import { ChevronDown, ChevronUp, X, Info } from "lucide-react";
import { useState } from "react";
import RightViewModal from "../commonComponents/rightViewModal";

// Mock shimmer component
const InventoryLogsShimmer = ({ count }) => (
  <div className="p-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="mb-3 animate-pulse">
        <div className="h-12 bg-gray-200 rounded mb-2"></div>
      </div>
    ))}
  </div>
);

// Utility function for formatting key names
const formatKeyName = (key) => {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
};

// Fixed Truncated Display Component for Arrays
const TruncatedArrayDisplay = ({ items, maxVisible = 3, keyName }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-gray-400 italic text-xs">-</span>;
  }

  const visibleItems = items.slice(0, maxVisible);
  const hiddenItems = items.slice(maxVisible);
  const hasMoreItems = hiddenItems.length > 0;

  return (
    <div className="space-y-1">
      {/* Always visible items */}
      {visibleItems.map((item, idx) => (
        <span
          key={idx}
          className="block px-2 py-1 rounded text-[#323A70] text-[12px] break-all max-w-full font-light"
        >
          {String(item)}
        </span>
      ))}

      {/* Show more indicator with tooltip */}
      {hasMoreItems && (
        <div className="relative">
          <div
            className="flex items-center gap-1 px-2 py-1 rounded text-blue-600 text-[12px] cursor-help hover:bg-blue-50 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
          >
            <Info className="w-3 h-3" />
            <span>+{hiddenItems.length} more items</span>
          </div>

          {/* Fixed Tooltip with Portal-like behavior */}
          {showTooltip && (
            <div
              className="fixed z-[9999] w-80 max-w-screen-sm pointer-events-none"
              style={{
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 pointer-events-auto">
                <div className="font-medium mb-2 text-gray-200 flex justify-between items-center">
                  <span>
                    Additional {formatKeyName(keyName)} ({hiddenItems.length}{" "}
                    items):
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTooltip(false);
                    }}
                    className="text-gray-400 hover:text-white ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {hiddenItems.map((item, idx) => (
                    <div key={idx} className="text-gray-100 break-words">
                      • {String(item)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const InventoryLogsInfo = ({
  show = true,
  onClose = () => {},
  data = [],
  orderLogs = [],
  inventoryLogs = [],
  isLoading = false,
  showTabs = false,
}) => {
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [activeTab, setActiveTab] = useState("order");

  function convertTimestamp(isoTimestamp) {
    const date = new Date(isoTimestamp);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  // Enhanced formatValue function to handle large arrays
  const formatValue = (value, key) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (typeof value === "string" && value.trim() === "") {
      return "-";
    }
    if (
      key === "ticket_file_status" &&
      typeof value === "object" &&
      value !== null
    ) {
      const urls = [];
      Object.values(value).forEach((arr) => {
        if (Array.isArray(arr)) {
          urls.push(...arr);
        }
      });
      return urls.filter((url) => url && url.trim() !== "");
    }
    if (Array.isArray(value)) {
      return value.filter((item) => item && String(item).trim() !== "");
    }
    return String(value);
  };

  const isLink = (value, key) => {
    const linkKeys = ["additional_template", "ticket_file_status"];
    if (linkKeys.includes(key)) return true;
    if (key?.toLowerCase().includes("link")) return true;
    if (
      typeof value === "string" &&
      (value.startsWith("http://") || value.startsWith("https://"))
    ) {
      return true;
    }
    return false;
  };

  // Check if a field is likely to contain large arrays (customize this based on your data)
  const isLargeArrayField = (key) => {
    const largeArrayFields = [
      "ticket_details",
      "restrictions",
      "benefits",
      "amenities",
      "features",
    ];
    return largeArrayFields.some((field) =>
      key.toLowerCase().includes(field.toLowerCase())
    );
  };

  const getCurrentData = () => {
    if (showTabs) {
      return activeTab === "order" ? orderLogs : inventoryLogs;
    }
    // Use sample data for demonstration if no data provided
    return data.length > 0 ? data : [];
  };

  const getReferencePayload = () => {
    const currentData = getCurrentData();
    const firstEntry = currentData.find(
      (entry) =>
        entry.json_payload?.changes &&
        Object.keys(entry.json_payload?.changes).length > 1
    );
    return firstEntry?.json_payload?.changes || {};
  };

  const getAllFields = () => {
    const currentData = getCurrentData();
    const allFields = new Set();
    currentData.forEach((entry) => {
      if (entry.json_payload?.changes) {
        Object.keys(entry.json_payload?.changes).forEach((key) =>
          allFields.add(key)
        );
      }
    });
    return Array.from(allFields);
  };

  const getCurrentFieldValues = (upToIndex) => {
    const referencePayload = getReferencePayload();
    const currentValues = { ...referencePayload };
    const currentData = getCurrentData();

    for (let i = 0; i <= upToIndex; i++) {
      const logEntry = currentData[i];
      if (logEntry && logEntry.json_payload?.changes) {
        Object.entries(logEntry.json_payload?.changes).forEach(
          ([key, value]) => {
            currentValues[key] = value;
          }
        );
      }
    }
    return currentValues;
  };

  const isFieldChangedInCurrentLog = (key, logEntry) => {
    return (
      logEntry.json_payload?.changes &&
      logEntry.json_payload?.changes.hasOwnProperty(key)
    );
  };

  const toggleLog = (index) => {
    if (isLoading) return;
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedLogs(newExpanded);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedLogs(new Set());
  };

  const displayData = getCurrentData();
  const allFields = getAllFields();

  // Enhanced render function for field values
  const renderFieldValue = (key, currentValue, isChangedInCurrentLog) => {
    const hasValue =
      currentValue !== undefined &&
      currentValue !== null &&
      currentValue !== "";

    if (!hasValue) {
      return <span className="text-gray-400 italic text-xs">-</span>;
    }

    const formattedValue = formatValue(currentValue, key);

    // Handle links
    if (isLink(currentValue, key)) {
      return (
        <div className="space-y-1">
          {Array.isArray(formattedValue) ? (
            formattedValue.length > 0 ? (
              formattedValue.map((url, idx) => (
                <div key={idx}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all block"
                  >
                    Click here {formattedValue.length > 1 ? `(${idx + 1})` : ""}
                  </a>
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic text-xs">-</span>
            )
          ) : (
            <a
              href={currentValue}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              Click here
            </a>
          )}
        </div>
      );
    }

    // Handle arrays (including large arrays like ticket_details)
    if (Array.isArray(formattedValue)) {
      if (formattedValue.length === 0) {
        return <span className="text-gray-400 italic text-xs">-</span>;
      }

      // Check if this is a large array field
      if (isLargeArrayField(key) && formattedValue.length > 3) {
        return (
          <TruncatedArrayDisplay
            items={formattedValue}
            maxVisible={3}
            keyName={key}
          />
        );
      } else {
        // Regular array display for smaller arrays
        return (
          <div className="space-y-1">
            {formattedValue.map((item, idx) => (
              <span
                key={idx}
                className={`block px-2 py-1 rounded text-sm break-all max-w-full ${
                  isChangedInCurrentLog
                    ? "bg-green-200 text-green-800 font-semibold"
                    : "font-light"
                }`}
              >
                {String(item)}
              </span>
            ))}
          </div>
        );
      }
    }

    // Handle regular values
    return (
      <span
        className={`inline-block px-2 py-1 rounded text-sm break-all max-w-full ${
          isChangedInCurrentLog
            ? "bg-green-200 text-green-800 font-semibold"
            : "font-light"
        }`}
      >
        {formattedValue}
      </span>
    );
  };
  const hideKeys = ["tracking_file_status"];
  return (
    <RightViewModal className="!w-[800px]" show={show} onClose={onClose}>
      {/* Add relative positioning and ensure overflow is visible */}
      <div className="w-full bg-white rounded-lg relative overflow-visible">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 sticky top-0 bg-white z-50">
          <p className="text-lg font-medium text-gray-800">Log Details</p>
          <div
            onClick={() => onClose()}
            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </div>
        </div>

        {/* Tab Navigation */}
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

        {/* Content with overflow visible */}
        {isLoading ? (
          <InventoryLogsShimmer count={3} />
        ) : (
          <div className="max-h-[90vh] overflow-y-auto p-3 relative">
            {displayData.map((logEntry, index) => {
              const isExpanded = expandedLogs.has(index);
              const payloadKeys = Object.keys(
                logEntry.json_payload?.changes || {}
              );
              const hasPayload = payloadKeys.length > 0;
              const currentFieldValues = getCurrentFieldValues(index);

              return (
                <div
                  key={index}
                  className="mb-3 border border-[#E0E1EA] rounded-[6px] overflow-visible relative"
                >
                  {/* Log Header */}
                  <div
                    onClick={() => toggleLog(index)}
                    className={`${
                      isExpanded ? "bg-[#343432]" : "bg-white"
                    } flex justify-between items-center px-3 cursor-pointer`}
                  >
                    <div className="flex-1 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium ${
                            isExpanded ? "text-white" : "text-[#323A70]"
                          }`}
                        >
                          Log #{index + 1}
                        </span>
                        {logEntry.ticket_id && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isExpanded ? "text-white" : "text-[#323A70]"
                            }`}
                          >
                            Ticket ID: {logEntry.ticket_id}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {hasPayload && (
                        <div
                          className={`mt-1 text-xs py-3 ${
                            isExpanded ? "text-white" : "text-[#323A70]"
                          }`}
                        >
                          {convertTimestamp(logEntry.created_at)}
                        </div>
                      )}
                      <div
                        className={`pl-3 ml-2 h-full border-l-[1px] py-3 ${
                          isExpanded
                            ? "border-l-[#51428E]"
                            : "border-l-[#E0E1EA]"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 flex items-center justify-center rounded-full ${
                            isExpanded ? "bg-[#343432]" : "bg-[#DADBE54D]"
                          }`}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-white" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#323A70]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content with overflow visible */}
                  {isExpanded && (
                    <div className="p-3 bg-white overflow-visible relative">
                      {allFields.length > 0 ? (
                        <div className="w-full overflow-visible">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Current State:
                          </h4>
                          <div className="flex flex-wrap gap-2 overflow-visible">
                            {/* First Table */}
                            <div className="flex-1 min-w-0 max-w-[calc(50%-0.25rem)] overflow-visible">
                              <div className="overflow-visible">
                                <table className="w-full table-fixed rounded-md border border-gray-200">
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
                                        if (hideKeys?.includes(key))
                                          return null;
                                        return (
                                          <tr
                                            key={fieldIndex}
                                            className={`${
                                              isChangedInCurrentLog
                                                ? "bg-green-100"
                                                : "hover:bg-gray-50"
                                            }`}
                                          >
                                            <td
                                              className="w-2/5 px-2 py-2 text-[12px] text-[#7D82A4] font-light border-r border-gray-100 truncate align-top"
                                              title={formatKeyName(key)}
                                            >
                                              {formatKeyName(key)}
                                            </td>
                                            <td className="w-3/5 px-2 py-2 text-[#323A70] text-[12px] font-normal align-top overflow-visible">
                                              <div className="break-all overflow-visible">
                                                {renderFieldValue(
                                                  key,
                                                  currentValue,
                                                  isChangedInCurrentLog
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Second Table */}
                            <div className="flex-1 min-w-0 max-w-[calc(50%-0.25rem)] overflow-visible">
                              <div className="overflow-visible">
                                <table className="w-full table-fixed rounded-md border border-gray-200">
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
                                        if (hideKeys?.includes(key))
                                          return null;
                                        return (
                                          <tr
                                            key={fieldIndex}
                                            className={`${
                                              isChangedInCurrentLog
                                                ? "bg-green-100"
                                                : "hover:bg-gray-50"
                                            }`}
                                          >
                                            <td
                                              className="w-2/5 px-2 py-2 text-[12px] text-[#7D82A4] font-light border-r border-gray-100 truncate align-top"
                                              title={formatKeyName(key)}
                                            >
                                              {formatKeyName(key)}
                                            </td>
                                            <td className="w-3/5 px-2 py-2 text-[#323A70] text-[12px] font-normal align-top overflow-visible">
                                              <div className="break-all overflow-visible">
                                                {renderFieldValue(
                                                  key,
                                                  currentValue,
                                                  isChangedInCurrentLog
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                  </tbody>
                                </table>
                              </div>
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
