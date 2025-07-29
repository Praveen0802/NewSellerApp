import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { toast } from "react-toastify";
import TabbedLayout from "../tabbedLayout";
import Button from "../commonComponents/button";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import {
  ChevronUp,
  ChevronDown,
  Copy,
  Edit,
  Trash2,
  Download,
  Calendar1Icon,
  Clock,
  LocateIcon,
  MapPin,
  Loader2,
  Hand,
  Upload,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  FetchEventSearch,
  getMyListingHistory,
  getViewDetailsPopup,
  updateMyListing,
} from "@/utils/apiHandler/request";
import UploadTickets from "../ModalComponents/uploadTickets";
import InventoryLogsInfo from "../inventoryLogsInfo";
import FloatingLabelInput from "../floatinginputFields";
import { debounce, set } from "lodash";
import SearchedList from "../tradePage/components/searchedList";
import { useRouter } from "next/router";

const ShimmerCard = () => (
  <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden animate-pulse">
    {/* Header Shimmer */}
    <div className="bg-gray-300 px-3 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <div className="w-48 h-4 bg-gray-400 rounded"></div>
          <div className="flex items-center space-x-3">
            <div className="w-20 h-3 bg-gray-400 rounded"></div>
            <div className="w-16 h-3 bg-gray-400 rounded"></div>
            <div className="w-24 h-3 bg-gray-400 rounded"></div>
          </div>
        </div>
        <div className="w-16 h-3 bg-gray-400 rounded"></div>
      </div>
    </div>

    {/* Table Content Shimmer */}
    <div className="w-full bg-white">
      <div className="relative">
        {/* Table Header Shimmer */}
        <div className="bg-gray-100 border-b border-gray-200 p-3">
          <div className="flex space-x-4">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="w-24 h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>

        {/* Table Rows Shimmer */}
        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b border-gray-200 p-3">
            <div className="flex space-x-4 items-center">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              {Array.from({ length: 8 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="w-24 h-4 bg-gray-200 rounded"
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ShimmerLoader = () => (
  <div className="m-6 max-h-[calc(100vh-300px)] overflow-y-auto">
    {Array.from({ length: 2 }).map((_, index) => (
      <ShimmerCard key={index} />
    ))}
  </div>
);

// Custom MultiSelect Component for table cells
const MultiSelectEditableCell = ({
  value,
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Convert string value to array if needed
  const normalizeValue = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      // If it's a comma-separated string, split it
      return val.includes(",") ? val.split(",").map((v) => v.trim()) : [val];
    }
    return [val];
  };

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(normalizeValue(value));
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const dropdown = document.querySelector("[data-multiselect-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (isDropdownOpen) {
        const dropdown = document.querySelector("[data-multiselect-dropdown]");
        if (dropdown && dropdown.contains(event.target)) {
          return;
        }

        let currentElement = event.target;
        while (currentElement && currentElement !== document) {
          if (
            currentElement.hasAttribute &&
            currentElement.hasAttribute("data-multiselect-dropdown")
          ) {
            return;
          }
          currentElement = currentElement.parentElement;
        }

        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  const handleSave = () => {
    const normalizedCurrent = normalizeValue(value);
    const normalizedEdit = normalizeValue(editValue);

    if (JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedEdit)) {
      onSave(normalizedEdit);
    }
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const handleCancel = () => {
    setEditValue(normalizeValue(value));
    setIsEditing(false);
    setIsDropdownOpen(false);
  };

  const handleOptionToggle = (optionValue) => {
    const currentValues = normalizeValue(editValue);
    let newValues;

    if (currentValues.includes(optionValue)) {
      newValues = currentValues.filter((val) => val !== optionValue);
    } else {
      newValues = [...currentValues, optionValue];
    }

    setEditValue(newValues);
  };

  const handleSelectAll = () => {
    setEditValue(options.map((opt) => opt.value));
  };

  const handleDeselectAll = () => {
    setEditValue([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const getDisplayValue = () => {
    const normalizedValue = normalizeValue(value);
    if (normalizedValue.length === 0) return "Select options...";

    return `${normalizedValue.length} item${
      normalizedValue.length !== 1 ? "s" : ""
    } selected`;
  };

  const getSelectedCount = () => {
    const normalizedValue = normalizeValue(editValue);
    return normalizedValue.length;
  };

  if (isEditing) {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div
          className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white w-full cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <div className="flex justify-between items-center">
            <span className="truncate">
              {getSelectedCount() > 0
                ? `${getSelectedCount()} selected`
                : "Select options..."}
            </span>
            <ChevronDown
              size={12}
              className={`transform transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isDropdownOpen && (
          <div
            data-multiselect-dropdown
            className="fixed bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto"
            style={{
              zIndex: 9999,
              top:
                dropdownRef.current?.getBoundingClientRect()?.bottom +
                window.scrollY +
                4,
              left:
                dropdownRef.current?.getBoundingClientRect()?.left +
                window.scrollX,
              width: dropdownRef.current?.getBoundingClientRect()?.width,
              minWidth: "200px",
            }}
            onScroll={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="border-b border-gray-200 p-2">
              <div className="flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectAll();
                  }}
                  className="text-xs px-2 py-1 text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeselectAll();
                  }}
                  className="text-xs px-2 py-1 text-red-600 hover:text-red-800"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {options.map((option) => {
              const isSelected = normalizeValue(editValue).includes(
                option.value
              );
              return (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
                    isSelected ? "bg-blue-50" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionToggle(option.value);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-3 h-3 text-blue-600"
                  />
                  <span className="text-xs">{option.label}</span>
                </div>
              );
            })}

            <div className="border-t border-gray-200 p-2 flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="text-xs px-2 py-1 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave();
                }}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isRowHovered) {
    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <div className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer">
          <div className="flex justify-between items-center">
            <span className="truncate">{getDisplayValue()}</span>
            <ChevronDown size={12} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-xs truncate">{getDisplayValue()}</span>
    </div>
  );
};

// Simple Editable Cell Component (fallback for non-multiselect)
const SimpleEditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    // Ensure we're saving the actual value, not the label
    let valueToSave = editValue;

    // For select fields, make sure we're getting the value
    if (type === "select" && options.length > 0) {
      // If editValue is already a value from options, use it directly
      const existingOption = options.find((opt) => opt.value === editValue);
      if (existingOption) {
        valueToSave = editValue;
      } else {
        // If somehow we have a label, convert it back to value
        const optionByLabel = options.find((opt) => opt.label === editValue);
        valueToSave = optionByLabel ? optionByLabel.value : editValue;
      }
    }

    if (valueToSave !== value) {
      onSave(valueToSave); // Always save the value, not the label
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleSelectChange = (e) => {
    // Always store the value, not the label
    setEditValue(e.target.value);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select && type !== "select") {
        inputRef.current.select();
      }
    }
  }, [isEditing, type]);

  const getDisplayValue = () => {
    if (type === "select" && options.length > 0) {
      const option = options.find((opt) => opt.value === value);
      return option ? option.label : value;
    }
    return value || "";
  };

  if (isEditing) {
    return (
      <div className="w-full">
        {type === "select" ? (
          <select
            ref={inputRef}
            value={editValue || ""} // Ensure we're using the value
            onChange={handleSelectChange}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 bg-white w-full"
          >
            <option value="">Select option...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 w-full bg-white"
          />
        )}
      </div>
    );
  }

  if (isRowHovered) {
    return (
      <div
        className={`cursor-pointer ${className}`}
        onClick={() => setIsEditing(true)}
      >
        {type === "select" ? (
          <div className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer flex justify-between items-center">
            <span>{getDisplayValue()}</span>
            <ChevronDown size={12} />
          </div>
        ) : (
          <input
            type={type}
            value={getDisplayValue()}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer"
            onClick={() => setIsEditing(true)}
            readOnly
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer ${className}`}
      onClick={() => setIsEditing(true)}
    >
      <span className="text-xs">{getDisplayValue()}</span>
    </div>
  );
};

const ActiveFilterPills = ({
  activeFilters,
  filterConfig,
  onFilterChange,
  onClearAllFilters,
  currentTab,
}) => {
  const getFilterDisplayValue = (filterKey, value, config) => {
    if (!value) return null;

    const filterConfig = config?.find((f) => f.name === filterKey);
    if (!filterConfig) return null;

    if (filterConfig.type === "select" && filterConfig.options) {
      const option = filterConfig.options.find((opt) => opt.value === value);
      return option ? option.label : value;
    }

    return value;
  };

  const getActiveFilterEntries = () => {
    const entries = [];
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (key === "page" || !value || value === "") return;

      const displayValue = getFilterDisplayValue(
        key,
        value,
        filterConfig[currentTab]
      );
      if (displayValue) {
        entries.push({ key, value, displayValue });
      }
    });
    return entries;
  };

  const activeEntries = getActiveFilterEntries();

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {activeEntries.map(({ key, value, displayValue }) => (
        <div
          key={key}
          className="inline-flex items-center gap-1 px-3 py-1 border-1 border-gray-300  rounded-sm text-sm"
        >
          <span className="font-medium capitalize">
            {key.replace(/_/g, " ")}:
          </span>
          <span>{displayValue}</span>
          <button
            onClick={() => onFilterChange(key, "", activeFilters, currentTab)}
            className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {activeEntries.length > 1 && (
        <button
          onClick={onClearAllFilters}
          className="px-2 py-1 text-xs text-red-600 hover:text-red-800 underline"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

// Pagination Component
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  itemsPerPage = 50,
  totalItems = 3,
  onPageChange,
  onItemsPerPageChange,
  activeFilters,
  filterConfig,
  onFilterChange,
  onClearAllFilters,
  currentTab,
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
      {/* Left side - Total items count */}
      <div className="flex items-center gap-4 text-sm text-gray-700">
        <span className="font-medium">{totalItems} Events</span>
        <ActiveFilterPills
          activeFilters={activeFilters}
          filterConfig={filterConfig}
          onFilterChange={onFilterChange}
          onClearAllFilters={onClearAllFilters}
          currentTab="tickets"
        />
      </div>

      {/* Right side - View selector, page info and navigation */}
      <div className="flex items-center space-x-6">
        {/* View selector */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span>View</span>
          <select
            value={itemsPerPage}
            onChange={(e) =>
              onItemsPerPageChange &&
              onItemsPerPageChange(parseInt(e.target.value))
            }
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page info */}
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span>Page</span>
          <span className="font-medium">{currentPage}</span>
          <span>of</span>
          <span className="font-medium">{totalPages}</span>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onPageChange && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-1.5 rounded border ${
              currentPage === 1
                ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 bg-white"
            }`}
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => onPageChange && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-1.5 rounded border ${
              currentPage === totalPages
                ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                : "border-gray-300 text-gray-600 hover:bg-gray-50 bg-white"
            }`}
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TicketsPage = (props) => {
  const { success = "", response } = props;
  console.log(response, "responseresponse");

  // Memoize the overview data to prevent unnecessary re-renders
  const overViewData = useMemo(
    () => response?.overview || {},
    [response?.overview]
  );

  const [listingHistoryData, setListingHistoryData] = useState(
    response?.listingHistory
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Mock data based on your JSON structure - you would replace this with actual API calls
  const mockListingHistory = useMemo(
    () => listingHistoryData?.data || [],
    [listingHistoryData]
  );

  // Update pagination info when data changes
  useEffect(() => {
    if (listingHistoryData?.pagination) {
      setCurrentPage(listingHistoryData.pagination.current_page);
      setTotalItems(listingHistoryData.pagination.total);
      setTotalPages(listingHistoryData.pagination.last_page);
      setItemsPerPage(listingHistoryData.pagination.per_page);
    }
  }, [listingHistoryData]);

  const [filtersApplied, setFiltersApplied] = useState({
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [viewDetailsPopup, setViewDetailsPopup] = useState({
    show: false,
    rowData: null,
  });

  // State for tickets data - this will hold the editable data
  const [ticketsData, setTicketsData] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  // Debounce timer ref
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (success) {
      toast.success("Listing added successfully");
    }
  }, [success]);

  // Initialize tickets data from mock data
  useEffect(() => {
    const transformedData = [];

    mockListingHistory.forEach((item, matchIndex) => {
      const matchInfo = item.match_info || {};
      const tickets = item.tickets || [];

      tickets.forEach((ticket, ticketIndex) => {
        transformedData.push({
          id: `${matchIndex}-${ticketIndex}`,
          matchIndex: matchIndex,
          ticketIndex: ticketIndex,
          match_name: matchInfo.match_name || "N/A",
          venue: matchInfo.stadium_name || "N/A",
          tournament: matchInfo.tournament_name || "N/A",
          match_date:
            new Date(matchInfo.match_date).toLocaleDateString() || "N/A",
          match_time: matchInfo.match_time || "N/A",
          ticket_type: ticket.ticket_type || "N/A",
          ticket_category: ticket.ticket_category || "N/A",
          quantity: ticket.quantity || 0,
          price: ticket.price || 0,
          price_currency: ticket.price_type || "GBP",
          status:
            ticket.status === 1
              ? "Active"
              : ticket.status === 2
              ? "Sold"
              : "Inactive",
          sell_date: ticket.sell_date || "N/A",
          row: ticket.row || "N/A",
          block: ticket.ticket_block || "N/A",
          listing_notes:
            ticket.listing_note?.map((note) => note.name).join(", ") || "N/A",
          rawTicketData: ticket,
          rawMatchData: matchInfo,
        });
      });
    });

    setTicketsData(transformedData);
  }, [mockListingHistory]);

  // Define table headers with editable configuration - matching AddInventory headers
  const headers = [
    { key: "match_name", label: "Match Name", editable: false },
    { key: "venue", label: "Venue", editable: false },
    { key: "tournament", label: "Tournament", editable: false },
    { key: "match_date", label: "Match Date", editable: false },
    {
      key: "ticket_type",
      label: "Ticket Type",
      editable: true,
      type: "select",
      options:
        response?.filters?.ticket_types?.map((category) => ({
          value: category?.id,
          label: category?.name,
        })) || [],
    },
    {
      key: "ticket_category",
      label: "Category",
      editable: true,
      type: "select",
      options:
        response?.filters?.ticket_category?.map((category) => ({
          value: category?.id,
          label: category?.name,
        })) || [],
    },
    { key: "quantity", label: "Quantity", editable: true, type: "number" },
    { key: "price", label: "Price", editable: true, type: "number" },
    {
      key: "status",
      label: "Status",
      editable: false,
      type: "select",
    },
    { key: "sell_date", label: "Listed Date", editable: false },
    { key: "row", label: "Row", editable: true, type: "text" },
    { key: "block", label: "Block", editable: true, type: "text" },
  ];

  // Group tickets by match for the accordion-style display
  const groupedTicketsData = useMemo(() => {
    const grouped = [];

    // Group tickets by matchIndex
    const groupedByMatch = ticketsData.reduce((acc, ticket) => {
      const matchIndex = ticket.matchIndex;
      if (!acc[matchIndex]) {
        acc[matchIndex] = {
          matchIndex,
          matchInfo: ticket.rawMatchData,
          tickets: [],
        };
      }
      acc[matchIndex].tickets.push(ticket);
      return acc;
    }, {});

    // Convert to array
    Object.values(groupedByMatch).forEach((group) => {
      grouped.push({
        ...group,
        ticketCount: group.tickets.length,
      });
    });

    return grouped;
  }, [ticketsData]);

  const handleCellEdit = (matchIndex, ticketId, columnKey, value, ticket) => {
    console.log("Cell edited:", {
      matchIndex,
      ticketId,
      columnKey,
      value,
      valueType: typeof value,
      ticket: ticket?.rawTicketData?.s_no,
    });

    // Find the header configuration for this column
    const headerConfig = headers.find((h) => h.key === columnKey);

    // For select fields, ensure we're working with the value, not label
    let processedValue = value;
    if (headerConfig?.type === "select" && headerConfig?.options) {
      // If value is already a valid option value, use it
      const isValidValue = headerConfig.options.some(
        (opt) => opt.value === value
      );
      if (!isValidValue) {
        // Try to find by label and convert to value
        const optionByLabel = headerConfig.options.find(
          (opt) => opt.label === value
        );
        if (optionByLabel) {
          processedValue = optionByLabel.value;
          console.warn(
            `Converted label "${value}" to value "${processedValue}" for column ${columnKey}`
          );
        }
      }
    }

    // Update local state
    setTicketsData((prevData) =>
      prevData.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, [columnKey]: processedValue }
          : ticket
      )
    );

    // Prepare update parameters
    const updateParams = { [columnKey]: processedValue };

    console.log("Sending update params:", updateParams);

    // Call API update
    updateCellValues(updateParams, ticket?.rawTicketData?.s_no);
  };

  // Enhanced updateCellValues function with better error handling
  const updateCellValues = async (updatedParams, id) => {
    try {
      console.log(
        "Updating listing with params:",
        updatedParams,
        "for ID:",
        id
      );

      // Validate that we have an ID
      if (!id) {
        console.error("No ID provided for update");
        toast.error("Unable to update: Missing ticket ID");
        return;
      }

      const update = await updateMyListing("", id, updatedParams);

      if (update?.success) {
        toast.success("Listing updated successfully");
      } else {
        console.error("Update failed:", update);
        toast.error("Failed to update listing");
      }

      return update;
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error("Error updating listing");
      throw error;
    }
  };

  const handleHandAction = (rowData, rowIndex) => {
    console.log("Hand action clicked for row:", rowData, rowIndex);
    handleCellEdit(
      rowData?.matchIndex,
      rowData?.id,
      "tickets_in_hand",
      !rowData?.tickets_in_hand,
      rowData
    );
    // Implement your hand action logic here (e.g., drag/move functionality)
  };

  // Custom cell renderer that handles both regular and multiselect types
  const renderEditableCell = (ticket, header, isRowHovered) => {
    if (header.type === "multiselect") {
      return (
        <MultiSelectEditableCell
          value={ticket[header.key]}
          options={header.options || []}
          onSave={(value) =>
            handleCellEdit(
              ticket.matchIndex,
              ticket.id,
              header.key,
              value,
              ticket
            )
          }
          className={header.className || ""}
          isRowHovered={isRowHovered}
        />
      );
    }

    return (
      <SimpleEditableCell
        value={ticket[header.key]}
        type={header.type || "text"}
        options={header.options || []}
        onSave={(value) =>
          handleCellEdit(
            ticket.matchIndex,
            ticket.id,
            header.key,
            value,
            ticket
          )
        }
        className={header.className || ""}
        isRowHovered={isRowHovered}
      />
    );
  };

  // Create sticky columns configuration for each row
  const getStickyColumnsForRow = (rowData, rowIndex) => {
    return [
      {
        key: "",
        icon: (
          <Hand
            size={14}
            className={`${
              rowData?.tickets_in_hand ? "text-green-500" : "text-black"
            } hover:text-green-500 cursor-pointer`}
            onClick={() => handleHandAction(rowData, rowIndex)}
          />
        ),
        className: "py-2 text-center border-r border-[#E0E1EA]",
      },
      {
        key: "upload",
        icon: <IconStore.upload className="size-4" />,
        className: "cursor-pointer pl-2",
        tooltipComponent: <p className="text-center">{rowData.ticket_type}</p>,
        onClick: () => handleUploadAction(rowData, rowIndex),
      },
      {
        key: "view",
        icon: <Eye className="size-4" />,
        className: "cursor-pointer px-2",
        tooltipComponent: (
          <p className="text-center">
            Expected Delivery Date:
            <br />
            {rowData.match_date}
          </p>
        ),
        tooltipPosition: "top",
        onClick: () => handleViewDetails(rowData),
      },
    ];
  };

  // Sticky column headers
  const stickyHeaders = ["", "", ""];
  const stickyColumnsWidth = 150;

  // Action handlers for sticky columns
  const handleUploadAction = (rowData, rowIndex) => {
    console.log("Upload action clicked for row:", rowData, rowIndex);
    // Implement your upload action logic here
    setShowUploadPopup({
      show: true,
      rowData: rowData,
      rowIndex,
      matchDetails: rowData?.rawMatchData,
    });
  };

  const handleViewDetails = async (item) => {
    console.log("View details:", item?.rawTicketData?.s_no);
    const fetchViewDetailsPopup = await getViewDetailsPopup("", {
      ticket_id: item?.rawTicketData?.s_no,
    });
    setViewDetailsPopup({
      show: true,
      rowData: fetchViewDetailsPopup,
    });
    // Implement view details logic
  };

  const handleEditListing = (item) => {
    console.log("Edit listing:", item);
    // Implement edit logic
  };

  const handleDeleteListing = (item) => {
    console.log("Delete listing:", item);
    // Implement delete logic
  };

  const createInitialVisibleColumns = useCallback(() => {
    return headers.reduce((acc, header) => {
      acc[header.key] = true;
      return acc;
    }, {});
  }, [headers]);

  const [visibleColumns, setVisibleColumns] = useState(
    createInitialVisibleColumns()
  );

  const filteredHeaders = headers.filter(
    (header) => visibleColumns[header.key]
  );

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Memoize the configuration for list items (stats cards)
  const listItemsConfig = useMemo(
    () => ({
      tickets: [
        {
          name: "Total Events",
          value: overViewData.events || 0,
          key: "total_listings",
        },
        {
          name: "Listings",
          value: overViewData.listings || 0,
          key: "active_listings",
        },
        {
          name: "Tickets",
          value: overViewData.tickets || 0,
          key: "total_value",
        },
        {
          name: "Published Listings",
          value: overViewData.published_listings || 0,
          showCheckbox: true,
          key: "total_tickets",
        },
        {
          name: "Unpublished Listings",
          value: overViewData.unpublished_listings || 0,
          key: "total_tickets_unpublished",
        },
      ],
    }),
    [overViewData]
  );

  // Memoize the configuration for filters
  const filterConfig = useMemo(
    () => ({
      tickets: [
        {
          type: "select",
          name: "category",
          label: "Category",
          value: filtersApplied?.category,
          options:
            response?.filters?.category?.map((category) => ({
              value: category?.id,
              label: category?.name,
            })) || [],
          parentClassName: "!w-[15%]",
          className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "select",
          name: "seat_category",
          label: "Seat Category",
          value: filtersApplied?.seat_category,
          options:
            response?.filters?.ticket_category?.map((category) => ({
              value: category?.id,
              label: category?.name,
            })) || [],
          parentClassName: "!w-[15%]",
          className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "select",
          name: "ticket_type",
          label: "Ticket Type",
          value: filtersApplied?.ticket_type,
          options:
            response?.filters?.ticket_types?.map((category) => ({
              value: category?.id,
              label: category?.name,
            })) || [],
          parentClassName: "!w-[15%]",
          className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "select",
          name: "tournament",
          label: "tournament",
          value: filtersApplied?.tournament,
          options:
            response?.filters?.tournament?.map((category) => ({
              value: category?.id,
              label: category?.name,
            })) || [],
          parentClassName: "!w-[15%]",
          className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "select",
          name: "Team Members",
          label: "team_member",
          value: filtersApplied?.team_member,
          options:
            response?.filters?.user_info?.map((category) => ({
              value: category?.id,
              label: category?.first_name,
            })) || [],
          parentClassName: "!w-[15%]",
          className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
      ],
    }),
    [filtersApplied, response]
  );

  const handleFilterChange = async (
    filterKey,
    value,
    allFilters,
    currentTab
  ) => {
    console.log("Filter changed:", {
      filterKey,
      value,
      allFilters,
      currentTab,
    });

    let params = {};

    // Handle different filter types
    if (filterKey === "matchDate") {
      params = {
        ...params,
        match_date_from: value?.startDate,
        match_date_to: value?.endDate,
      };
    } else if (filterKey === "listingDate") {
      params = {
        ...params,
        listing_date_from: value?.startDate,
        listing_date_to: value?.endDate,
      };
    } else {
      params = {
        ...params,
        [filterKey]: value,
      };
    }

    const updatedFilters = {
      ...filtersApplied,
      ...params,
      page: 1, // Reset to first page when filters change
    };

    await fetchData(updatedFilters);
  };

  // Handle pagination changes
  const handlePageChange = async (newPage) => {
    const updatedFilters = {
      ...filtersApplied,
      page: newPage,
    };
    await fetchData(updatedFilters);
  };

  const handleItemsPerPageChange = async (newItemsPerPage) => {
    const updatedFilters = {
      ...filtersApplied,
      page: 1, // Reset to first page when changing items per page
      per_page: newItemsPerPage,
    };
    await fetchData(updatedFilters);
  };

  // Unified data fetching function
  const fetchData = async (filters) => {
    setIsLoading(true);
    try {
      const handleApiCall = await getMyListingHistory("", filters);
      setListingHistoryData(handleApiCall);
      setFiltersApplied(filters);
      console.log(handleApiCall, "handleApiCallhandleApiCall");
    } catch (error) {
      console.error("Filter change error:", error);
      toast.error("Error fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleRowSelectionChange = (newSelectedRows) => {
    console.log("Row selection changed:", newSelectedRows);
    setSelectedRows(newSelectedRows);
  };

  const handleSelectAll = () => {
    const allRowIndices = ticketsData.map((_, index) => index);
    setSelectedRows(allRowIndices);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };

  // Enhanced Custom Table Component for each match with accordion functionality
  const CustomMatchTable = ({ matchData }) => {
    const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
    const [isExpanded, setIsExpanded] = useState(true);
    const { matchInfo, tickets } = matchData;

    const toggleExpanded = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden relative">
        {/* Clickable Table Header with Accordion */}
        <div
          className="bg-[#343432] text-white px-3 py-2.5 cursor-pointer"
          onClick={toggleExpanded}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`transform transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                >
                  <ChevronDown size={14} />
                </div>
                <h3 className="font-medium text-sm truncate max-w-xs">
                  {matchInfo?.match_name || "Match Details"}
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar1Icon size={11} />
                  <span className="truncate">
                    {matchInfo?.match_date
                      ? new Date(matchInfo.match_date).toLocaleDateString()
                      : "TBD"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={11} />
                  <span className="truncate">
                    {matchInfo?.match_time || "TBD"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={11} />
                  <span className="truncate max-w-xs">
                    {`${matchInfo?.stadium_name} , ${matchInfo?.country_name} , ${matchInfo?.city_name}` ||
                      "TBD"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-gray-300">
                {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Table Content with Sticky Columns */}
        {isExpanded && (
          <div className="w-full bg-white relative transition-all duration-300 ease-in-out">
            {/* Main scrollable table container */}
            <div className="relative">
              {/* Main Table */}
              <div
                className="w-full overflow-x-auto"
                style={{ paddingRight: `${stickyColumnsWidth}px` }}
              >
                <table
                  className="w-full border-none"
                  style={{ minWidth: "1200px" }}
                >
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-2 py-3 text-left text-gray-600 font-medium whitespace-nowrap text-xs w-12">
                        <input
                          type="checkbox"
                          checked={
                            selectedRows.length === tickets.length &&
                            tickets.length > 0
                          }
                          onChange={
                            selectedRows.length > 0
                              ? handleDeselectAll
                              : handleSelectAll
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      {filteredHeaders.map((header) => (
                        <th
                          key={header.key}
                          className="px-2 py-3 text-left text-gray-600 font-medium whitespace-nowrap text-xs min-w-[120px]"
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate">{header.label}</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket, rowIndex) => {
                      const globalRowIndex = ticketsData.findIndex(
                        (t) => t.id === ticket.id
                      );
                      const isSelected = selectedRows.includes(globalRowIndex);

                      return (
                        <tr
                          key={ticket.id}
                          className={`border-b border-gray-200 transition-colors ${
                            isSelected
                              ? "bg-blue-50"
                              : "bg-white hover:bg-gray-50"
                          }`}
                          onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                          onMouseLeave={() => setHoveredRowIndex(null)}
                          style={{ height: "48px" }} // Fixed row height
                        >
                          <td className="py-3 px-2 text-xs whitespace-nowrap w-12 align-middle">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                const newSelectedRows = isSelected
                                  ? selectedRows.filter(
                                      (index) => index !== globalRowIndex
                                    )
                                  : [...selectedRows, globalRowIndex];
                                setSelectedRows(newSelectedRows);
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          {filteredHeaders.map((header) => (
                            <td
                              key={`${rowIndex}-${header.key}`}
                              className="py-3 px-2 text-xs whitespace-nowrap overflow-hidden text-ellipsis align-middle min-w-[120px]"
                            >
                              {header.editable ? (
                                renderEditableCell(
                                  ticket,
                                  header,
                                  true
                                  // hoveredRowIndex === rowIndex
                                )
                              ) : (
                                <span className="text-xs">
                                  {ticket[header.key]}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Sticky right columns - Fixed positioning and alignment */}
              <div
                className="absolute top-0 right-0 bg-white border-l border-gray-200 shadow-lg overflow-hidden"
                style={{
                  width: `${stickyColumnsWidth}px`,
                  height: "auto",
                }}
              >
                {/* Sticky Header */}
                <div
                  className="bg-gray-50 border-b border-gray-200 flex"
                  style={{ height: "45px" }}
                >
                  {stickyHeaders.map((header, idx) => (
                    <div
                      key={`sticky-header-${idx}`}
                      className="flex-1 py-3 px-2 text-left text-gray-600 text-xs border-r last:border-r-0 border-gray-200 font-medium whitespace-nowrap text-center flex items-center justify-center"
                      style={{ minWidth: "50px" }}
                    >
                      {header}
                    </div>
                  ))}
                </div>

                {/* Sticky Body Rows */}
                {tickets.map((ticket, rowIndex) => {
                  const stickyColumns = getStickyColumnsForRow(
                    ticket,
                    rowIndex
                  );
                  const globalRowIndex = ticketsData.findIndex(
                    (t) => t.id === ticket.id
                  );
                  const isSelected = selectedRows.includes(globalRowIndex);

                  return (
                    <div
                      key={`sticky-${ticket.id}`}
                      className={`border-b border-gray-200 flex transition-colors ${
                        isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                      }`}
                      style={{ height: "48px" }} // Match the main table row height
                      onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                    >
                      {stickyColumns.map((column, colIndex) => (
                        <div
                          key={`sticky-${rowIndex}-${colIndex}`}
                          className={`flex-1 py-3 px-2 text-sm border-r last:border-r-0 border-gray-200 cursor-pointer flex items-center justify-center ${
                            column?.className || ""
                          }`}
                          style={{ minWidth: "50px" }}
                          onClick={column.onClick}
                        >
                          {column.icon}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleConfirmClick = (data, index, rowData) => {
    updateCellValues(data, rowData?.s_no);
    setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
  };

  const [searchValue, setSearchValue] = useState("");
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [searchEventLoader, setSearchEventLoader] = useState(false);

  const fetchApiCall = async (query) => {
    if (!query.trim()) return;

    try {
      setSearchEventLoader(true);
      setSearchedEvents([]);
      const response = await FetchEventSearch("", { query });
      setSearchedEvents(response?.events || []);
      setSearchEventLoader(false);
    } catch (error) {
      setSearchEventLoader(false);
      console.error("Search error:", error);
      setSearchedEvents([]);
    }
  };

  const debouncedFetchApiCall = useCallback(
    debounce((query) => {
      fetchApiCall(query);
    }, 300),
    []
  );

  const handleOnChangeEvents = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    debouncedFetchApiCall(newValue);
  };

  const handleSearchedEventClick = (event) => {
    handleFilterChange("match_id", event?.m_id);
    setSearchedEvents([]);
  };

  const searchedViewComponent = () => {
    return (
      <>
        {searchedEvents?.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto p-5 flex flex-col gap-3 shadow-sm border border-[#E0E1EA]">
            {searchedEvents?.map((item, index) => {
              return (
                <div
                  key={index}
                  onClick={() => handleSearchedEventClick(item)}
                  className="hover:scale-105 cursor-pointer transition-transform duration-300"
                >
                  <SearchedList item={item} />
                </div>
              );
            })}
          </div>
        )}
        {searchEventLoader && (
          <div className="max-h-[300px] items-center justify-center overflow-y-auto p-5 flex flex-col gap-3 shadow-sm border border-[#E0E1EA]">
            <Loader2 className="animate-spin" />
          </div>
        )}
      </>
    );
  };

  const filterSearch = () => {
    return (
      <div className="m-4">
        <FloatingLabelInput
          key="searchMatch"
          id="searchMatch"
          name="searchMatch"
          keyValue={"searchMatch"}
          value={searchValue}
          onChange={(e) => handleOnChangeEvents(e)}
          type="text"
          showDropdown={true}
          dropDownComponent={searchedViewComponent()}
          label="Search Match"
          className={"!py-[8px] !px-[14px] !text-[#323A70] !text-[14px] "}
          paddingClassName=""
          autoComplete="off"
          showDelete={true}
          deleteFunction={() => {
            setSearchValue("");
          }}
          parentClassName="!w-[40%]"
        />
      </div>
    );
  };

  const handleClearAllFilters = () => {
    const clearedFilters = { page: 1 }; // Keep only page
    fetchData(clearedFilters);
  };

  const router = useRouter();
  const handleAddInventory = () => {
    router.push("/add-listings");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <TabbedLayout
          tabs={[]} // No tabs needed as per your requirement
          initialTab="tickets"
          listItemsConfig={listItemsConfig}
          filterConfig={filterConfig}
          onTabChange={() => {}}
          customComponent={filterSearch}
          onColumnToggle={handleColumnToggle}
          visibleColumns={visibleColumns}
          onFilterChange={handleFilterChange}
          currentFilterValues={{ ...filtersApplied, page: "" }}
          showSelectedFilterPills={false}
          onCheckboxToggle={() => {}}
          hideVisibleColumns={false} // Show column controls
          disableTransitions={true} // New prop to disable transitions
          useHeaderV2={true}
          onAddInventory={handleAddInventory}
        />

        {/* Pagination Component - Positioned below filters */}
        {groupedTicketsData.length > 0 && (
          <div className="border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              activeFilters={filtersApplied}
              filterConfig={filterConfig}
              onFilterChange={handleFilterChange}
              onClearAllFilters={handleClearAllFilters}
              currentTab="tickets"
            />
          </div>
        )}
      </div>

      {/* Main Content Area with Custom Tables */}
      {isLoading ? (
        <ShimmerLoader />
      ) : (
        <>
          <div className="m-6 max-h-[calc(100vh-400px)] overflow-y-auto">
            {groupedTicketsData.length > 0 ? (
              groupedTicketsData.map((matchData, index) => (
                <CustomMatchTable
                  key={`match-${matchData.matchIndex}`}
                  matchData={matchData}
                />
              ))
            ) : (
              <div className="bg-white rounded p-8 text-center">
                <div className="max-w-md mx-auto">
                  <div className="mb-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tickets found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no tickets to display at the moment.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Remove the pagination from bottom since it's now in the header area */}
        </>
      )}

      <UploadTickets
        show={showUploadPopup?.show}
        rowData={showUploadPopup?.rowData}
        matchDetails={showUploadPopup?.matchDetails}
        handleConfirmClick={handleConfirmClick}
        rowIndex={showUploadPopup?.rowIndex}
        onClose={() => {
          setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
        }}
      />
      {viewDetailsPopup?.show && (
        <InventoryLogsInfo
          show={viewDetailsPopup?.show}
          data={viewDetailsPopup?.rowData}
          onClose={() => setViewDetailsPopup({ show: false, rowData: null })}
        />
      )}
    </div>
  );
};

export default TicketsPage;
