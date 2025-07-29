import React, { useState, useRef, useCallback, useEffect } from "react";
import Button from "../commonComponents/button";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import blueLocation from "../../../public/blue-location.svg";
import Image from "next/image";
import blueCalendar from "../../../public/blue-calendar.svg";
import blueTicket from "../../../public/blue-ticket.svg";
import hamburger from "../../../public/hamburger.svg";
import blueClock from "../../../public/blue-clock.svg";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import { dateFormat } from "@/utils/helperFunctions";
import { debounce, entries, filter, set } from "lodash";
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
  Check,
  X,
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import UploadTickets from "../ModalComponents/uploadTickets";
import ScrollableAccordionTable from "../TicketsPage/scrollableTable";
import ViewMapPopup from "./ViewMapPopup";
import {
  fetchBlockDetails,
  FetchEventSearch,
  saveAddListing,
  saveBulkListing,
} from "@/utils/apiHandler/request";
import { useRouter } from "next/router";
import SearchedList from "../tradePage/components/searchedList";
import FormFields from "../formFieldsComponent";
import { toast } from "react-toastify";

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
    if (editValue !== value) {
      onSave(editValue);
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
    if (type === "checkbox") {
      return value ? "Yes" : "No";
    }
    return value || "";
  };

  if (isEditing) {
    return (
      <div className="w-full">
        {type === "select" ? (
          <select
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
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
        ) : type === "checkbox" ? (
          <input
            ref={inputRef}
            type="checkbox"
            checked={editValue}
            onChange={(e) => setEditValue(e.target.checked)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue}
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
          <select
            value={editValue}
            className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer"
            onClick={() => setIsEditing(true)}
            readOnly
          >
            <option>{getDisplayValue()}</option>
          </select>
        ) : type === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editValue}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded cursor-pointer"
              onClick={() => setIsEditing(true)}
              readOnly
            />
          </div>
        ) : (
          <input
            type={type}
            value={editValue}
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

// Filter Dropdown Component
const FilterDropdown = ({
  isOpen,
  onClose,
  activeFilters,
  onFilterToggle,
  filterConfig,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-y-auto z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Search filters</h3>
        </div>

        <div className="p-4">
          {filterConfig?.map((filter, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{filter.label}</span>
              <input
                type="checkbox"
                checked={activeFilters.includes(filter.name)}
                onChange={() => onFilterToggle(filter.name)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              const allFilterNames =
                filterConfig?.map((filter) => filter.name) || [];
              allFilterNames.forEach((filterName) => {
                if (!activeFilters.includes(filterName)) {
                  onFilterToggle(filterName);
                }
              });
            }}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            🔄 Restore defaults
          </button>
        </div>
      </div>
    </>
  );
};

// Column Dropdown Component
const ColumnDropdown = ({
  isOpen,
  onClose,
  headers,
  visibleColumns,
  onColumnToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  // More robust filtering with proper null checks
  const filteredHeaders = (headers || []).filter((header) => {
    if (!header || !header.label) return false;
    return header.label.toLowerCase().includes(searchTerm.toLowerCase().trim());
  });

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-96 overflow-y-auto z-50">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Search columns</h3>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search columns"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {filteredHeaders.length === 0 && searchTerm ? (
            <div className="text-sm text-gray-500 py-4 text-center">
              No columns found matching "{searchTerm}"
            </div>
          ) : (
            filteredHeaders.map((header, index) => (
              <div
                key={header.key || index}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-700">{header.label}</span>
                <input
                  type="checkbox"
                  checked={visibleColumns?.includes(header.key) || false}
                  onChange={() => onColumnToggle(header.key)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              (headers || []).forEach((header) => {
                if (header?.key && !visibleColumns?.includes(header.key)) {
                  onColumnToggle(header.key);
                }
              });
            }}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            🔄 Restore defaults
          </button>
        </div>
      </div>
    </>
  );
};

const AddInventoryPage = (props) => {
  const { matchId, response } = props;
  console.log(response, "responseresponseresponse");

  const {
    block_data = {},
    home_town = {},
    notes_left = [],
    notes_right = [],
    restriction_left = [],
    restriction_right = [],
    split_details_left = [],
    split_details_right = [],
    split_types = [],
    ticket_types = [],
  } = response || {};

  const dispatch = useDispatch();
  const matchDetails = response?.match_data?.[0];
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchEventLoader, setSearchEventLoader] = useState(false);
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [searchValue, setSearchValue] = useState(
    matchDetails?.match_name || ""
  );
  const [showTable, setShowTable] = useState(false);

  const router = useRouter();

  const [filtersApplied, setFiltersApplied] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [blockDetails, setBlockDetails] = useState([]);
  const filterButtonRef = useRef(null);
  const columnButtonRef = useRef(null);

  const [inventoryData, setInventoryData] = useState([]);

  const getBlockDetails = async () => {
    try {
      const getBlockData = await fetchBlockDetails("", {
        match_id: matchId,
        category_id: filtersApplied?.ticket_category,
      });
      const blockData = getBlockData?.map((item) => ({
        label: item?.block_id,
        value: item?.id,
      }));
      setBlockDetails(blockData);
    } catch (error) {
      console.error("Error fetching block details:", error);
      setBlockDetails([]);
    }
  };

  useEffect(() => {
    if (filtersApplied?.ticket_category) {
      getBlockDetails();
    }
  }, [filtersApplied?.ticket_category, matchId]);

  // Refs for sticky table functionality
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mainTableRef = useRef(null);
  const stickyTableRef = useRef(null);

  // State for tracking scroll and shadows
  const [hasScrolled, setHasScrolled] = useState(false);

  // Define filters array with complete configuration
  const filters = [
    {
      type: "select",
      name: "ticket_types",
      label: "Ticket Types",
      value: filtersApplied?.ticket_types,
      options: [
        ...(ticket_types?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_types: value })),
    },
    {
      type: "select",
      name: "add_qty_addlist",
      label: "Quantity",
      value: filtersApplied?.add_qty_addlist,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ],
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, add_qty_addlist: value })),
    },
    {
      type: "select",
      name: "split_type",
      label: "Split Types",
      value: filtersApplied?.split_type,
      options: [
        ...(split_types?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_type: value })),
    },
    {
      type: "select",
      name: "home_town",
      label: "Fan Area",
      value: filtersApplied?.home_town,
      options: Object.entries(home_town || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, home_town: value })),
    },
    {
      type: "select",
      name: "ticket_category",
      label: "Category",
      value: filtersApplied?.ticket_category,
      options: Object.entries(block_data || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({
          ...prev,
          ticket_category: value,
          ticket_block: "",
        })),
    },
    {
      type: "select",
      name: "ticket_block",
      label: "Section/Block",
      value: filtersApplied?.ticket_block,
      options: blockDetails,
      disabled: !filtersApplied?.ticket_category,
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_block: value })),
    },
    {
      type: "text",
      name: "add_price_addlist",
      label: "Price",
      value: filtersApplied?.add_price_addlist,
      parentClassName: "!w-[180px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs ">{matchDetails?.price_type || "$"}</p>
        </div>
      ),
      className: "!py-[6px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          add_price_addlist: e?.target?.value,
        })),
    },
    {
      type: "text",
      name: "first_seat",
      label: "First Seat",
      value: filtersApplied?.first_seat,
      parentClassName: "!w-[180px]",
      className: "!py-[6px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          first_seat: e?.target?.value,
        })),
    },
    {
      type: "text",
      name: "face_value",
      label: "Face Value",
      value: filtersApplied?.face_value,
      parentClassName: "!w-[180px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs ">{matchDetails?.price_type || "$"}</p>
        </div>
      ),
      className: "!py-[6px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          face_value: e?.target?.value,
        })),
    },
    {
      type: "text",
      name: "payout_price",
      label: "Payout Price",
      value: filtersApplied?.payout_price,
      parentClassName: "!w-[180px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs ">{matchDetails?.price_type || "$"}</p>
        </div>
      ),
      className: "!py-[6px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          payout_price: e?.target?.value,
        })),
    },
    {
      type: "text",
      name: "row",
      label: "Row",
      value: filtersApplied?.row,
      parentClassName: "!w-[180px]",
      className: "!py-[6px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          row: e?.target?.value,
        })),
    },
    {
      type: "select",
      name: "notes",
      label: "Listing Notes",
      value: filtersApplied?.notes,
      parentClassName: "!w-[180px]",
      multiselect: true,
      options: [
        ...(notes_left?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
        ...(notes_right?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, notes: value })),
    },
    {
      type: "select",
      name: "restrictions",
      label: "Restrictions",
      value: filtersApplied?.restrictions,
      multiselect: true,
      options: [
        ...(restriction_left?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
        ...(restriction_right?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, restrictions: value })),
    },
    {
      type: "select",
      name: "split_details",
      label: "Split Details",
      value: filtersApplied?.split_details,
      options: [
        ...(split_details_left?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
        ...(split_details_right?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_details: value })),
    },
    {
      type: "date",
      name: "date_to_ship",
      label: "Date to Ship",
      value: filtersApplied?.date_to_ship,
      parentClassName: "!w-[180px]",
      singleDateMode: true,
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, date_to_ship: value })),
    },
    {
      type: "checkbox",
      name: "tickets_in_hand",
      label: "Tickets In Hand",
      value: filtersApplied?.tickets_in_hand || false,
      parentClassName: "!w-[180px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          tickets_in_hand: e?.target?.checked,
        })),
    },
  ];

  // Generate allHeaders dynamically from filters array only
  const allHeaders = filters.map((filter) => {
    const baseHeader = {
      key: filter.name,
      label: filter.label,
      editable: true,
      type: filter.type || "text",
      options: filter.options || [],
    };

    if (filter.multiselect) {
      baseHeader.type = "multiselect";
    }

    return baseHeader;
  });

  // Sticky columns configuration - Hand and Upload icons for each row
  const getStickyColumnsForRow = (rowData, rowIndex) => {
    return [
      {
        key: "",
        icon: (
          <Hand
            size={14}
            className={`${
              rowData?.tickets_in_hand ? "text-green-500" : "text-gray-400"
            } hover:text-green-500 cursor-pointer transition-colors`}
            onClick={() => handleHandAction(rowData, rowIndex)}
          />
        ),
        className: "py-2 text-center border-r border-[#E0E1EA]",
      },
      {
        key: "",
        icon: (
          <Upload
            size={16}
            className={`${
              rowData?.upload_tickets && rowData.upload_tickets.length > 0
                ? "text-green-500"
                : "text-gray-400"
            } cursor-pointer hover:text-blue-500 transition-colors`}
            onClick={() => handleUploadAction(rowData, rowIndex)}
          />
        ),
        className: "py-2 text-center",
      },
    ];
  };

  // Sticky column headers
  const stickyHeaders = ["", ""];
  const stickyColumnsWidth = 100; // 50px per column * 2 columns

  // Action handlers for sticky columns
  const handleHandAction = (rowData, rowIndex) => {
    console.log("Hand action clicked for row:", rowData, rowIndex);
    handleCellEdit(rowIndex, "tickets_in_hand", !rowData?.tickets_in_hand);
  };

  const handleUploadAction = (rowData, rowIndex) => {
    console.log("Upload action clicked for row:", rowData, rowIndex);
    setShowUploadPopup({
      show: true,
      rowData,
      rowIndex,
    });
  };

  // Generate filterConfig dynamically from filters array
  const filterConfig = filters.map((filter) => ({
    name: filter.name,
    label: filter.label,
    type: filter.type,
  }));

  // State for active filters and visible columns - initialize with default values
  const [activeFilters, setActiveFilters] = useState(() => {
    return filterConfig.map((f) => f.name);
  });
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return allHeaders.map((h) => h.key);
  });

  // Filter headers based on visible columns
  const headers = allHeaders.filter((header) =>
    visibleColumns.includes(header.key)
  );

  // Filter the filters array based on active filters
  const getActiveFilters = () => {
    const activeFiltersList = filters.filter((filter) =>
      activeFilters.includes(filter.name)
    );
    return activeFiltersList;
  };

  // Sticky table scroll synchronization
  const checkHorizontalScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft } = scrollContainerRef.current;
    setHasScrolled(scrollLeft > 0);
  };

  // Synchronize row heights between main and sticky tables
  useEffect(() => {
    const syncRowHeights = () => {
      if (!mainTableRef.current || !stickyTableRef.current) return;

      const mainRows = mainTableRef.current.querySelectorAll("tbody tr");
      const stickyRows = stickyTableRef.current.querySelectorAll("tbody tr");

      if (mainRows.length !== stickyRows.length) return;

      // Reset heights first
      mainRows.forEach((row) => (row.style.height = "auto"));
      stickyRows.forEach((row) => (row.style.height = "auto"));

      // Sync header heights
      const mainHeaderRow = mainTableRef.current.querySelector("thead tr");
      const stickyHeaderRow = stickyTableRef.current.querySelector("thead tr");

      if (mainHeaderRow && stickyHeaderRow) {
        const headerHeight = mainHeaderRow.offsetHeight;
        stickyHeaderRow.style.height = `${headerHeight}px`;
      }

      // Sync body row heights
      requestAnimationFrame(() => {
        mainRows.forEach((row, index) => {
          if (index < stickyRows.length) {
            const stickyRow = stickyRows[index];
            const mainRowHeight = row.offsetHeight;
            const stickyRowHeight = stickyRow.offsetHeight;
            const maxHeight = Math.max(mainRowHeight, stickyRowHeight);
            row.style.height = `${maxHeight}px`;
            stickyRow.style.height = `${maxHeight}px`;
          }
        });
      });
    };

    const timer = setTimeout(() => {
      syncRowHeights();
    }, 0);

    const resizeObserver = new ResizeObserver(() => {
      syncRowHeights();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", syncRowHeights);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener("resize", syncRowHeights);
    };
  }, [inventoryData]);

  // Set up scroll event listener for sticky table
  useEffect(() => {
    if (scrollContainerRef.current) {
      checkHorizontalScrollability();
      scrollContainerRef.current.addEventListener(
        "scroll",
        checkHorizontalScrollability
      );

      return () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener(
            "scroll",
            checkHorizontalScrollability
          );
        }
      };
    }
  }, [inventoryData]);

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

  // Create debounced version of the API call
  const debouncedFetchApiCall = useCallback(
    debounce((query) => {
      fetchApiCall(query);
    }, 300),
    []
  );

  const handleSearchedEventClick = (event) => {
    router.push(`/add-listings/${event?.m_id}`);
  };

  const handleOnChangeEvents = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    debouncedFetchApiCall(newValue);
  };

  // Handle filter toggle from dropdown
  const handleFilterToggle = (filterName) => {
    setActiveFilters((prev) => {
      if (prev.includes(filterName)) {
        return prev.filter((f) => f !== filterName);
      } else {
        return [...prev, filterName];
      }
    });
  };

  // Handle column toggle from dropdown
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(columnKey)) {
        return prev.filter((c) => c !== columnKey);
      } else {
        return [...prev, columnKey];
      }
    });
  };

  // Updated handleCellEdit to use rowIndex directly
  const handleCellEdit = (rowIndex, columnKey, value) => {
    console.log("Cell edited:", { rowIndex, columnKey, value });
    let updatevalues = {};
    if (columnKey == "ticket_types") {
      updatevalues = {
        additional_file_type: "",
        additional_dynamic_content: "",
        qr_links: [],
        upload_tickets: [],
        paper_ticket_details: {},
      };
    }
    setInventoryData((prevData) =>
      prevData.map((item, index) =>
        index === rowIndex
          ? { ...item, [columnKey]: value, ...updatevalues }
          : item
      )
    );
  };

  // Custom cell renderer that handles both regular and multiselect types
  const renderEditableCell = (row, header, rowIndex, isRowHovered) => {
    if (header.type === "multiselect") {
      return (
        <MultiSelectEditableCell
          value={row[header.key]}
          options={header.options || []}
          onSave={(value) => handleCellEdit(rowIndex, header.key, value)}
          className={header.className || ""}
          // isRowHovered={isRowHovered}
          isRowHovered={true}
        />
      );
    }

    return (
      <SimpleEditableCell
        value={row[header.key]}
        type={header.type || "text"}
        options={header.options || []}
        onSave={(value) => handleCellEdit(rowIndex, header.key, value)}
        className={header.className || ""}
        // isRowHovered={isRowHovered}
        isRowHovered={true}
      />
    );
  };

  // Handle select all functionality
  const handleSelectAll = () => {
    const allRowIndices = inventoryData.map((_, index) => index);
    setSelectedRows(allRowIndices);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };

  // Enhanced function to construct FormData dynamically for multiple rows
  const constructFormDataAsFields = (publishingDataArray) => {
    const formData = new FormData();

    // Helper function to transform QR links
    const transformQRLinks = (qrLinks) => {
      if (!qrLinks || qrLinks.length === 0) {
        return {};
      }

      const androidLinks = [];
      const iosLinks = [];

      qrLinks.forEach((link) => {
        if (link.qr_link_android) {
          androidLinks.push(link.qr_link_android);
        }
        if (link.qr_link_ios) {
          iosLinks.push(link.qr_link_ios);
        }
      });

      const result = {};
      if (androidLinks.length > 0) {
        result.qr_link_android = androidLinks.join(",");
      }
      if (iosLinks.length > 0) {
        result.qr_link_ios = iosLinks.join(",");
      }

      return result;
    };

    // Process each row of data
    publishingDataArray.forEach((publishingData, index) => {
      // Add basic fields
      formData.append(
        `data[${index}][ticket_types]`,
        publishingData.ticket_types || ""
      );
      formData.append(
        `data[${index}][add_qty_addlist]`,
        publishingData.add_qty_addlist || ""
      );
      formData.append(
        `data[${index}][home_town]`,
        publishingData.home_town || ""
      );
      formData.append(
        `data[${index}][ticket_category]`,
        publishingData.ticket_category || ""
      );
      formData.append(
        `data[${index}][ticket_block]`,
        publishingData.ticket_block || ""
      );
      formData.append(
        `data[${index}][add_price_addlist]`,
        publishingData.add_price_addlist || ""
      );
      formData.append(
        `data[${index}][face_value]`,
        publishingData.face_value || ""
      );
      formData.append(
        `data[${index}][payout_price]`,
        publishingData.payout_price || ""
      );
      formData.append(
        `data[${index}][first_seat]`,
        publishingData.first_seat || ""
      );
      formData.append(`data[${index}][row]`, publishingData.row || "");
      formData.append(
        `data[${index}][split_type]`,
        publishingData.split_type || ""
      );
      formData.append(
        `data[${index}][date_to_ship]`,
        publishingData.date_to_ship || ""
      );
      formData.append(
        `data[${index}][tickets_in_hand]`,
        publishingData.tickets_in_hand ? "1" : "0"
      );
      formData.append(
        `data[${index}][additional_file_type]`,
        publishingData.additional_file_type || ""
      );
      formData.append(
        `data[${index}][additional_dynamic_content]`,
        publishingData.additional_dynamic_content || ""
      );
      formData.append(
        `data[${index}][match_id]`,
        publishingData.match_id || matchId
      );
      formData.append(
        `data[${index}][add_pricetype_addlist]`,
        matchDetails?.price_type || "EUR"
      );
      formData.append(`data[${index}][event]`, publishingData.event || "E");

      // Add ticket_details (combination of notes and restrictions)
      const ticketDetails = [
        ...(publishingData.notes || []),
        ...(publishingData.restrictions || []),
      ];
      ticketDetails.forEach((detail, detailIndex) => {
        formData.append(
          `data[${index}][ticket_details][${detailIndex}]`,
          detail
        );
      });
      formData.append(`data[${index}][ticket_details1]`,publishingData.split_details);
      // Add ticket_details1 (split_details)
      // if (publishingData.split_details) {
      //   publishingData.split_details.forEach((detail, detailIndex) => {
      //     formData.append(
      //       `data[${index}][ticket_details1][${detailIndex}]`,
      //       detail
      //     );
      //   });
      // }

      // Add transformed QR links
      const qrLinksTransformed = transformQRLinks(publishingData.qr_links);
      if (qrLinksTransformed.qr_link_android) {
        formData.append(
          `data[${index}][qr_link_android]`,
          qrLinksTransformed.qr_link_android
        );
      }
      if (qrLinksTransformed.qr_link_ios) {
        formData.append(
          `data[${index}][qr_link_ios]`,
          qrLinksTransformed.qr_link_ios
        );
      }

      // Add paper_ticket_details as JSON string
      // formData.append(
      //   `data[${index}][paper_ticket_details]`,
      //   JSON.stringify(publishingData.paper_ticket_details || {})
      // );

      // Handle file uploads
      if (
        publishingData.upload_tickets &&
        publishingData.upload_tickets.length > 0
      ) {
        publishingData.upload_tickets.forEach((ticket, ticketIndex) => {
          if (ticket.file && ticket.file instanceof File) {
            formData.append(
              `data[${index}][upload_tickets][${ticketIndex}]`,
              ticket.file,
              ticket.name
            );
          }
        });
      }
    });

    return formData;
  };

  // Enhanced delete function
  const handleDelete = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to delete");
      return;
    }

    console.log("Deleting selected rows:", selectedRows);
    setInventoryData((prevData) =>
      prevData.filter((_, index) => !selectedRows.includes(index))
    );
    setSelectedRows([]);
    toast.success(`${selectedRows.length} row(s) deleted successfully`);
  };

  // Clone functionality
  const handleClone = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to clone");
      return;
    }

    console.log("Cloning selected rows:", selectedRows);
    const rowsToClone = selectedRows.map((index) => inventoryData[index]);
    const clonedRows = rowsToClone.map((row) => ({
      ...row,
      // Generate unique ID for cloned row or remove ID to let backend handle
      id: Date.now() + Math.random(),
      // Reset unique fields for cloned rows
      upload_tickets: [],
      additional_file_type: "",
      additional_dynamic_content: "",
      qr_links: [],
      paper_ticket_details: {},
    }));

    setInventoryData((prevData) => [...prevData, ...clonedRows]);
    setSelectedRows([]);
    toast.success(`${rowsToClone.length} row(s) cloned successfully`);
  };

  const [loader, setLoader] = useState(false);

  // Enhanced publish function to handle multiple rows
  const handlePublishLive = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to publish");
      return;
    }

    setLoader(true);
    try {
      // Get selected rows data
      const selectedRowsData = selectedRows.map((index) => {
        const rowData = inventoryData[index];
        return {
          match_id: matchDetails?.match_id || matchId,
          ...rowData,
        };
      });

      // Construct FormData for multiple rows
      const formData = constructFormDataAsFields(selectedRowsData);
      // if (selectedRows?.length > 1) {
      await saveBulkListing("", formData);
      // } else {
      //   await saveAddListing("", formData);
      // }

      router.push("/my-listings?success=true");
      toast.success(`${selectedRows.length} listing(s) published successfully`);
      setLoader(false);
    } catch (error) {
      console.error("Error publishing listings:", error);
      toast.error("Error in publishing listing");
      setLoader(false);
    }
  };

  // Function to create inventory item from filter values
  const createInventoryItemFromFilters = () => {
    const newItem = {
      id: Date.now() + Math.random(), // Temporary ID for frontend
    };

    filters.forEach((filter) => {
      const filterValue = filtersApplied[filter.name];

      if (
        filterValue !== undefined &&
        filterValue !== null &&
        filterValue !== ""
      ) {
        if (Array.isArray(filterValue) && filterValue.length === 0) {
          newItem[filter.name] = [];
        } else {
          newItem[filter.name] = filterValue;
        }
      } else {
        newItem[filter.name] = filter.multiselect ? [] : "";
      }
    });

    // Initialize additional fields that may not be in filters
    newItem.additional_file_type = "";
    newItem.additional_dynamic_content = "";
    newItem.qr_links = [];
    newItem.upload_tickets = [];
    newItem.paper_ticket_details = {};

    return newItem;
  };

  // Modified Add listing function to use filter values
  const handleAddListing = () => {
    const hasFilterValues = Object.values(filtersApplied).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== "";
    });

    if (!hasFilterValues) {
      toast.error(
        "Please select at least one filter value before adding a listing."
      );
      return;
    }

    const newListing = createInventoryItemFromFilters();
    setInventoryData((prevData) => [...prevData, newListing]);
    setShowTable(true);
    toast.success("New listing added successfully");
  };

  // Enhanced Custom Table Component with sticky columns
  const CustomInventoryTable = () => {
    const [hoveredRowIndex, setHoveredRowIndex] = useState(null);

    return (
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-lg mb-2 overflow-hidden relative shadow-sm"
      >
        {/* Table Header */}
        <div className="bg-[#343432] text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-sm truncate max-w-xs">
                  {matchDetails?.match_name || "Match Details"}
                </h3>
              </div>
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar1Icon size={12} />
                  <span className="truncate">
                    {matchDetails?.match_date_format}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span className="truncate">{matchDetails?.match_time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={12} />
                  <span className="truncate max-w-xs">
                    {matchDetails?.stadium_name} , {matchDetails?.country_name}{" "}
                    , {matchDetails?.city_name}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* Table Content with Sticky Columns */}
        <div
          className="w-full bg-white relative"
          style={{ overflow: "visible" }}
        >
          {/* Main scrollable table container */}
          <div
            ref={scrollContainerRef}
            className="w-full overflow-x-auto"
            style={{ paddingRight: `${stickyColumnsWidth}px` }}
          >
            <table
              ref={mainTableRef}
              className="w-full border-none"
              style={{ minWidth: "1200px" }}
            >
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-3 text-left text-gray-600 font-medium whitespace-nowrap text-xs w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === inventoryData.length &&
                        inventoryData.length > 0
                      }
                      onChange={
                        selectedRows.length > 0
                          ? handleDeselectAll
                          : handleSelectAll
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  {headers.map((header) => (
                    <th
                      key={header.key}
                      className="px-3 py-3 text-left text-gray-600 font-medium whitespace-nowrap text-xs min-w-[140px]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="truncate">{header.label}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((row, rowIndex) => {
                  const isSelected = selectedRows.includes(rowIndex);

                  return (
                    <tr
                      key={row.id || rowIndex}
                      className={`border-b border-gray-200 transition-colors ${
                        isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                      }`}
                      onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                      onMouseLeave={() => setHoveredRowIndex(null)}
                    >
                      <td className="py-3 px-3 text-xs whitespace-nowrap w-12">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            const newSelectedRows = isSelected
                              ? selectedRows.filter(
                                  (index) => index !== rowIndex
                                )
                              : [...selectedRows, rowIndex];
                            setSelectedRows(newSelectedRows);
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      {headers.map((header) => (
                        <td
                          key={`${rowIndex}-${header.key}`}
                          className="py-3 px-3 text-xs whitespace-nowrap overflow-hidden text-ellipsis align-middle min-w-[140px]"
                        >
                          {header.editable ? (
                            renderEditableCell(
                              row,
                              header,
                              rowIndex,
                              hoveredRowIndex === rowIndex
                            )
                          ) : (
                            <span className={header.className || ""}>
                              {row[header.key]}
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

          {/* Sticky right columns */}
          <div
            className={`absolute top-0 right-0 h-full bg-white border-l border-gray-200 ${
              hasScrolled ? "shadow-md" : ""
            }`}
            style={{ width: `${stickyColumnsWidth}px` }}
          >
            <div className="h-full">
              <table
                ref={stickyTableRef}
                className="w-full h-full border-collapse"
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {stickyHeaders.map((header, idx) => (
                      <th
                        key={`sticky-header-${idx}`}
                        className="py-3 px-2 text-left text-gray-600 text-xs border-r border-gray-200 font-medium whitespace-nowrap text-center"
                        style={{ width: "50px" }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row, rowIndex) => {
                    const stickyColumns = getStickyColumnsForRow(row, rowIndex);

                    return (
                      <tr
                        key={`sticky-${row.id || rowIndex}`}
                        className="border-b border-gray-200 bg-white hover:bg-gray-50"
                      >
                        {stickyColumns.map((column, colIndex) => (
                          <td
                            key={`sticky-${rowIndex}-${colIndex}`}
                            className={`py-3 text-sm align-middle text-center border-r border-gray-200 ${
                              column?.className || ""
                            }`}
                            style={{ width: "50px" }}
                          >
                            <div className="flex justify-center">
                              {column.icon}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
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

  // This comes right after searchedViewComponent()
  const handleConfirmClick = (data, index) => {
    setInventoryData(
      inventoryData.map((item, i) =>
        i === index ? { ...item, ...data } : item
      )
    );
    setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
  };

  const selectedCount = selectedRows.length;

  return (
    <div className="bg-[#F5F7FA] w-full h-full relative min-h-screen">
      {/* Header with selected match info */}
      <ViewMapPopup
        onClose={() => setShowViewPopup(false)}
        show={showViewPopup}
      />
      <div className="bg-white">
        <div className="border-b-[1px] p-5 border-[#E0E1EA] flex justify-between items-center">
          <div className="w-full flex items-center gap-5">
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
                router.push("/add-listings");
              }}
              parentClassName="!w-[40%]"
            />
            {matchDetails && (
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center">
                  <Calendar1Icon size={16} className="text-[#595c6d]" />
                  <p className="text-[#3a3c42] text-[14px]">
                    {matchDetails?.match_date_format}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Clock size={16} className="text-[#595c6d]" />
                  <p className="text-[#3a3c42] text-[14px]">
                    {matchDetails?.match_time}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <MapPin size={16} className="text-[#595c6d]" />
                  <p className="text-[#3a3c42] text-[14px]">
                    {matchDetails?.stadium_name} , {matchDetails?.country_name}{" "}
                    , {matchDetails?.city_name}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            {matchDetails && (
              <p
                onClick={() => setShowViewPopup(true)}
                className="text-[13px] whitespace-nowrap font-semibold text-[#0137D5] cursor-pointer hover:underline mr-6"
              >
                View Map
              </p>
            )}
            {/* Control Icons */}
            <div className="flex gap-3 relative">
              {/* Filter Icon */}
              <button
                ref={filterButtonRef}
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowColumnDropdown(false);
                }}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Filter options"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
                </svg>
              </button>

              {/* Column Icon */}
              <button
                ref={columnButtonRef}
                onClick={() => {
                  setShowColumnDropdown(!showColumnDropdown);
                  setShowFilterDropdown(false);
                }}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Column options"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="6" height="18" />
                  <rect x="11" y="3" width="6" height="18" />
                  <rect x="19" y="3" width="2" height="18" />
                </svg>
              </button>

              {/* Filter Dropdown */}
              <FilterDropdown
                isOpen={showFilterDropdown}
                onClose={() => setShowFilterDropdown(false)}
                filterConfig={filterConfig}
                activeFilters={activeFilters}
                onFilterToggle={handleFilterToggle}
              />

              {/* Column Dropdown */}
              <ColumnDropdown
                isOpen={showColumnDropdown}
                onClose={() => setShowColumnDropdown(false)}
                headers={allHeaders}
                visibleColumns={visibleColumns}
                onColumnToggle={handleColumnToggle}
              />
            </div>
          </div>
        </div>
        {matchDetails && (
          <>
            {/* Filter Section with Control Icons */}
            <div className="border-b-[1px] border-[#DADBE5] p-5">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-5 items-center ">
                  <FormFields
                    formFields={getActiveFilters()}
                    filtersApplied={filtersApplied}
                    setFiltersApplied={setFiltersApplied}
                  />
                </div>
              </div>
            </div>

            {/* Add Listings Button */}
            {inventoryData.length === 0 && (
              <div className="flex justify-end px-5 py-3 border-b-[1px] border-[#E0E1EA]">
                <Button
                  type="blueType"
                  classNames={{
                    root: "px-4 py-2.5",
                    label_: "text-sm font-medium",
                  }}
                  onClick={handleAddListing}
                  label="+ Add Listings"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content Area with Custom Table - Only show when table should be visible */}
      {matchDetails && showTable && inventoryData.length > 0 && (
        <div
          className="m-6 bg-white rounded-lg shadow-sm"
          style={{
            marginBottom: "100px",
            maxHeight: "calc(100vh - 400px)",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
            <CustomInventoryTable />
          </div>
        </div>
      )}

      {/* Show message when no listings have been added yet */}
      {matchDetails && !showTable && (
        <div className="m-6 bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              No listings added yet
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Select your filter preferences above and click "Add Listings" to
              create your first inventory item.
            </p>
            <p className="text-sm text-gray-500">
              The table will appear once you add your first listing with the
              selected filter values.
            </p>
          </div>
        </div>
      )}

      <UploadTickets
        show={showUploadPopup?.show}
        rowData={showUploadPopup?.rowData}
        matchDetails={matchDetails}
        handleConfirmClick={handleConfirmClick}
        rowIndex={showUploadPopup?.rowIndex}
        onClose={() => {
          setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
        }}
      />

      {/* Enhanced Sticky Bottom Container - Only visible when there are selected rows */}
      {selectedCount > 0 && inventoryData?.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-1">
              {/* Select All Button */}
              <button
                onClick={handleSelectAll}
                disabled={selectedRows.length === inventoryData.length}
                className={`flex items-center space-x-2 text-sm px-3 py-2 rounded-md transition-colors ${
                  selectedRows.length === inventoryData.length
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                }`}
              >
                <Check size={16} />
                <span>Select all</span>
              </button>

              {/* Deselect All Button */}
              <button
                onClick={handleDeselectAll}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X size={16} />
                <span>Deselect all</span>
              </button>

              {/* Clone Button */}
              <button
                onClick={handleClone}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Copy size={16} />
                <span>Clone</span>
              </button>

              {/* Edit Button */}
              <button
                onClick={() => {
                  // Placeholder for edit functionality
                  toast.info("Edit functionality coming soon");
                }}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>

              {/* Delete Button */}
              <button
                onClick={handleDelete}
                className="flex items-center space-x-2 text-sm text-red-600 hover:text-red-800 px-3 py-2 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Selection Counter */}
              <span className="text-sm text-gray-600 font-medium">
                {selectedCount} of {inventoryData.length} selected
              </span>

              {/* Cancel Button */}
              <button
                onClick={handleDeselectAll}
                className="px-4 py-2 text-sm border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md transition-colors font-medium"
              >
                Cancel
              </button>

              {/* Publish Live Button */}
              <button
                onClick={handlePublishLive}
                disabled={loader}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  loader
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {loader ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>PUBLISHING...</span>
                  </div>
                ) : (
                  "PUBLISH LIVE"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddInventoryPage;
