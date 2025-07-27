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
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import UploadTickets from "../ModalComponents/uploadTickets";
import ScrollableAccordionTable from "../TicketsPage/scrollableTable";
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
import ViewMapPopup from "../addInventoryPage/ViewMapPopup";

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
            className="fixed bg-white border border-gray-300 rounded shadow-lg  overflow-y-auto"
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
    return value;
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

  const filteredHeaders = headers?.filter((header) =>
    header.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {filteredHeaders?.map((header, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{header.label}</span>
              <input
                type="checkbox"
                checked={visibleColumns.includes(header.key)}
                onChange={() => onColumnToggle(header.key)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              headers?.forEach((header) => {
                if (!visibleColumns.includes(header.key)) {
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

const BulkInventory = (props) => {
  const { matchId, response } = props;
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
  console.log(response,'ooooooooooo')
  
  // CHANGE 1: Handle multiple matches
  const allMatchDetails = response?.match_data || [];
  const [expandedMatches, setExpandedMatches] = useState(() => {
    // Initially expand all matches
    return allMatchDetails.reduce((acc, match, index) => {
      acc[match.match_id] = true;
      return acc;
    }, {});
  });

  // CHANGE 2: Modify inventory data structure to handle multiple matches
  const [inventoryDataByMatch, setInventoryDataByMatch] = useState(() => {
    // Initialize empty inventory for each match
    return allMatchDetails.reduce((acc, match) => {
      acc[match.match_id] = [];
      return acc;
    }, {});
  });

  // CHANGE 3: Modify selected rows to handle multiple matches
  const [selectedRowsByMatch, setSelectedRowsByMatch] = useState(() => {
    return allMatchDetails.reduce((acc, match) => {
      acc[match.match_id] = [];
      return acc;
    }, {});
  });

  const [searchEventLoader, setSearchEventLoader] = useState(false);
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [showTableByMatch, setShowTableByMatch] = useState(() => {
    return allMatchDetails.reduce((acc, match) => {
      acc[match.match_id] = false;
      return acc;
    }, {});
  });

  const router = useRouter();

  const [filtersApplied, setFiltersApplied] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [blockDetailsByCategory, setBlockDetailsByCategory] = useState({});
  const [blockDetails, setBlockDetails] = useState([]);
  const filterButtonRef = useRef(null);
  const columnButtonRef = useRef(null);

  
  // Enhanced block details fetching for multiple matches
  const getBlockDetails = async (matchId) => {
    const getBlockData = await fetchBlockDetails('', {
      match_id: matchId,
      category_id: filtersApplied?.ticket_category,
    });
    const blockData = getBlockData?.map((item) => ({
      label: item?.block_id,
      value: item?.id,
    }));
    
    setBlockDetailsByCategory(prev => ({
      ...prev,
      [`${matchId}_${filtersApplied?.ticket_category}`]: blockData
    }));
  };
console.log(blockDetailsByCategory,'blockDetailsByCategory')
  useEffect(() => {
    if (filtersApplied?.ticket_category) {
      // Fetch block details for all matches
      allMatchDetails.forEach(match => {
        getBlockDetails(match.match_id);
      });
    }
  }, [filtersApplied?.ticket_category]);

  // Get block details for specific match
  const getBlockDetailsForMatch = (matchId) => {
    return blockDetailsByCategory[`${matchId}_${filtersApplied?.ticket_category}`] || [];
  };

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
      parentClassName: "!w-[250px]",
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
      ],
      parentClassName: "!w-[250px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, add_qty_addlist: value })),
    },
    {
      type: "select",
      name: "home_town",
      label: "Home Town",
      value: filtersApplied?.home_town,
      options: Object.entries(home_town || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName: "!w-[250px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, home_town: value })),
    },
    {
      type: "select",
      name: "ticket_category",
      label: "Ticket Category",
      value: filtersApplied?.ticket_category,
      options: Object.entries(block_data || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName: "!w-[250px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_category: value, ticket_block: "" })),
    },
    {
      type: "select",
      name: "ticket_block", 
      label: "Ticket Block",
      value: filtersApplied?.ticket_block,
      options: [], // Will be dynamically populated per match
      disabled: !filtersApplied?.ticket_category,
      parentClassName: "!w-[250px]",
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
      parentClassName: "!w-[250px]",
      iconBefore: (
        <div>
          <p className="text-xs">{allMatchDetails[0]?.price_type || "$"}</p>
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
      name: "row",
      label: "Row",
      value: filtersApplied?.row,
      parentClassName: "!w-[250px]",
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
      parentClassName: "!w-[250px]",
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
      parentClassName: "!w-[250px]",
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
      multiselect: true,
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
      parentClassName: "!w-[250px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_details: value })),
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
      parentClassName: "!w-[250px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_type: value })),
    },
    {
      type: "checkbox",
      name: "tickets_in_hand",
      label: "Tickets In Hand",
      value: filtersApplied?.tickets_in_hand || false,
      parentClassName: "!w-[250px]",
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

  // Toggle match accordion
  const toggleMatchAccordion = (matchId) => {
    setExpandedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };

  // Sticky columns configuration - Hand and Upload icons for each row
  const getStickyColumnsForRow = (rowData, rowIndex, matchId) => {
    console.log(rowData, "rowDatarowData");
    return [
      {
        key: "",
        icon: (
          <Hand
            size={14}
            className={`${
              rowData?.tickets_in_hand ? "text-green-500" : "text-black"
            } hover:text-green-500 cursor-pointer`}
            onClick={() => handleHandAction(rowData, rowIndex, matchId)}
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
              rowData?.ticket_types ? "text-green-500" : "text-gray-300"
            } cursor-pointer`}
            onClick={() => handleUploadAction(rowData, rowIndex, matchId)}
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
  const handleHandAction = (rowData, rowIndex, matchId) => {
    console.log("Hand action clicked for row:", rowData, rowIndex, matchId);
    handleCellEdit(matchId, rowIndex, "tickets_in_hand", !rowData?.tickets_in_hand);
  };

  const handleUploadAction = (rowData, rowIndex, matchId) => {
    console.log("Upload action clicked for row:", rowData, rowIndex, matchId);
    const matchDetails = allMatchDetails.find(m => m.match_id.toString() === matchId.toString());
    setShowUploadPopup({
      show: true,
      rowData,
      rowIndex,
      matchId,
      matchDetails,
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
  }, [inventoryDataByMatch]);

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
  }, [inventoryDataByMatch]);

  const fetchApiCall = async (query) => {
    if (!query.trim()) return;

    try {
      setSearchEventLoader(true);
      setSearchedEvents([]);
      const response = await FetchEventSearch("", { query });
      setSearchedEvents(response?.events);
      setSearchEventLoader(false);
    } catch (error) {
      setSearchEventLoader(false);
      console.error("Search error:", error);
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

  // Modified cell edit handler for specific match
  const handleCellEdit = (matchId, rowIndex, columnKey, value) => {
    console.log("Cell edited:", { matchId, rowIndex, columnKey, value });
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
    setInventoryDataByMatch((prevData) => ({
      ...prevData,
      [matchId]: prevData[matchId].map((item, index) =>
        index === rowIndex
          ? { ...item, [columnKey]: value, ...updatevalues }
          : item
      )
    }));
  };

  // Custom cell renderer that handles both regular and multiselect types
  const renderEditableCell = (row, header, rowIndex, matchId, isRowHovered) => {
    if (header.type === "multiselect") {
      return (
        <MultiSelectEditableCell
          value={row[header.key]}
          options={header.options || []}
          onSave={(value) => handleCellEdit(matchId, rowIndex, header.key, value)}
          className={header.className || ""}
          isRowHovered={isRowHovered}
        />
      );
    }

    return (
      <SimpleEditableCell
        value={row[header.key]}
        type={header.type || "text"}
        options={header.options || []}
        onSave={(value) => handleCellEdit(matchId, rowIndex, header.key, value)}
        className={header.className || ""}
        isRowHovered={isRowHovered}
      />
    );
  };

  // Modified select all for specific match
  const handleSelectAllForMatch = (matchId) => {
    const matchInventory = inventoryDataByMatch[matchId] || [];
    const allRowIndices = matchInventory.map((_, index) => index);
    setSelectedRowsByMatch(prev => ({
      ...prev,
      [matchId]: allRowIndices
    }));
  };

  const handleDeselectAllForMatch = (matchId) => {
    setSelectedRowsByMatch(prev => ({
      ...prev,
      [matchId]: []
    }));
  };

  // CHANGE 4: Enhanced form data construction for multiple matches
  const constructFormDataForMultipleMatches = (allPublishingData) => {
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

    // Process each match's data
    allPublishingData.forEach((matchData, matchIndex) => {
      const { match_id, inventoryItems } = matchData;
      
      inventoryItems.forEach((publishingData, itemIndex) => {
        const dataIndex = `${matchIndex}`;
        
        // Add basic fields
        formData.append(`data[${dataIndex}][ticket_types]`, publishingData.ticket_types);
        formData.append(`data[${dataIndex}][add_qty_addlist]`, publishingData.add_qty_addlist);
        formData.append(`data[${dataIndex}][home_town]`, publishingData.home_town);
        formData.append(`data[${dataIndex}][ticket_category]`, publishingData.ticket_category);
        formData.append(`data[${dataIndex}][ticket_block]`, 3);
        formData.append(`data[${dataIndex}][add_price_addlist]`, publishingData.add_price_addlist);
        formData.append(`data[${dataIndex}][row]`, publishingData.row);
        formData.append(`data[${dataIndex}][split_type]`, publishingData.split_type);
        formData.append(`data[${dataIndex}][additional_file_type]`, publishingData.additional_file_type);
        formData.append(`data[${dataIndex}][additional_dynamic_content]`, publishingData.additional_dynamic_content);
        formData.append(`data[${dataIndex}][match_id]`, match_id);
        formData.append(`data[${dataIndex}][add_pricetype_addlist]`, publishingData.add_pricetype_addlist);
        formData.append(`data[${dataIndex}][event]`, publishingData.event);
        // Add ticket_details (combination of notes and restrictions)
        const ticketDetails = [
          ...(publishingData.notes || []),
          ...(publishingData.restrictions || []),
        ];
        ticketDetails.forEach((detail, index) => {
          formData.append(`data[${dataIndex}][ticket_details][${index}]`, detail);
        });

        // Add ticket_details1 (split_details)
        if (publishingData.split_details) {
          publishingData.split_details.forEach((detail, index) => {
            formData.append(`data[${dataIndex}][ticket_details1][${index}]`, detail);
          });
        }

        // Add transformed QR links
        const qrLinksTransformed = transformQRLinks(publishingData.qr_links);
        if (qrLinksTransformed.qr_link_android) {
          formData.append(`data[${dataIndex}][qr_link_android]`, qrLinksTransformed.qr_link_android);
        }
        if (qrLinksTransformed.qr_link_ios) {
          formData.append(`data[${dataIndex}][qr_link_ios]`, qrLinksTransformed.qr_link_ios);
        }

        // Add paper_ticket_details as JSON string
        // formData.append(`data[${dataIndex}][paper_ticket_details]`, JSON.stringify(publishingData.paper_ticket_details));

        // Handle file uploads
        if (publishingData.upload_tickets && publishingData.upload_tickets.length > 0) {
          publishingData.upload_tickets.forEach((ticket, index) => {
            if (ticket.file && ticket.file instanceof File) {
              formData.append(`data[${dataIndex}][upload_tickets][${index}]`, ticket.file, ticket.name);
            }
          });
        }
      });
    });

    return formData;
  };

  const inspectFormData = (formData) => {
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (key === "data") {
        console.log(`${key}:`, JSON.parse(value));
      } else {
        console.log(`${key}:`, value);
      }
    }
  };

  // Modified delete handler for specific match
  const handleDeleteForMatch = (matchId) => {
    const selectedRows = selectedRowsByMatch[matchId] || [];
    console.log("Deleting selected rows for match:", matchId, selectedRows);
    
    setInventoryDataByMatch((prevData) => ({
      ...prevData,
      [matchId]: prevData[matchId].filter((_, index) => !selectedRows.includes(index))
    }));
    
    setSelectedRowsByMatch(prev => ({
      ...prev,
      [matchId]: []
    }));
  };

  const [loader, setLoader] = useState(false);
  
  // Modified publish handler for multiple matches
  const handlePublishLive = async () => {
    setLoader(true);
    
    // Collect all selected inventory items from all matches
    const allPublishingData = [];
    
    Object.keys(selectedRowsByMatch).forEach(matchId => {
      const selectedRows = selectedRowsByMatch[matchId];
      const matchInventory = inventoryDataByMatch[matchId];
      const matchDetails = allMatchDetails.find(m => m.match_id.toString() === matchId);
      
      if (selectedRows.length > 0 && matchInventory.length > 0) {
        const selectedItems = selectedRows.map(rowIndex => ({
          ...matchInventory[rowIndex],
          add_pricetype_addlist: matchDetails?.price_type || "EUR",
          event: "E",
        }));
        
        allPublishingData.push({
          match_id: matchId,
          inventoryItems: selectedItems
        });
      }
    });

    if (allPublishingData.length === 0) {
      toast.error("No items selected for publishing");
      setLoader(false);
      return;
    }

    const formData = constructFormDataForMultipleMatches(allPublishingData);

    try {
      await saveBulkListing("", formData);
      router.push("/my-listings?success=true");
      setLoader(false);
    } catch {
      toast.error("Error in publishing listing");
      setLoader(false);
    }
  };

  // Function to create inventory item from filter values
  const createInventoryItemFromFilters = () => {
    const newItem = {};

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

    return newItem;
  };

  // Modified add listing function to work with specific match
  const handleAddListingForMatch = (matchId) => {
    const hasFilterValues = Object.values(filtersApplied).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.trim() !== "";
    });

    if (!hasFilterValues) {
      alert("Please select at least one filter value before adding a listing.");
      return;
    }

    const newListing = createInventoryItemFromFilters();
    setInventoryDataByMatch((prevData) => ({
      ...prevData,
      [matchId]: [...(prevData[matchId] || []), newListing]
    }));
    
    setShowTableByMatch(prev => ({
      ...prev,
      [matchId]: true
    }));
  };

  // Modified Custom Table Component for specific match
  const CustomInventoryTable = ({ matchDetails, matchId }) => {
    const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
    const inventoryData = inventoryDataByMatch[matchId] || [];
    const selectedRows = selectedRowsByMatch[matchId] || [];

    return (
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-lg mb-2 overflow-hidden relative"
      >
        {/* Table Header */}
        <div className="bg-[#343432] text-white px-3 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button onClick={() => toggleMatchAccordion(matchId)}>
                  {expandedMatches[matchId] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <h3 className="font-medium text-sm truncate max-w-xs">
                  {matchDetails?.match_name || "Match Details"}
                </h3>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <Calendar1Icon size={11} />
                  <span className="truncate">
                    {matchDetails?.match_date_format}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={11} />
                  <span className="truncate">{matchDetails?.match_time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={11} />
                  <span className="truncate max-w-xs">
                    {matchDetails?.stadium_name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Table Content */}
        {expandedMatches[matchId] && (
          <div className="w-full bg-white relative" style={{ overflow: "visible" }}>
            {/* Add Listings Button for this match */}
            {inventoryData.length === 0 && (
              <div className="flex justify-end px-4 py-2 border-b-[1px] border-[#E0E1EA]">
                <Button
                  type="blueType"
                  classNames={{
                    root: "px-2 md:px-3 py-1.5 md:py-2",
                    label_: "text-xs md:text-sm font-medium",
                  }}
                  onClick={() => handleAddListingForMatch(matchId)}
                  label="+ Add Listings"
                />
              </div>
            )}

            {/* Table content - only show if there are inventory items */}
            {inventoryData.length > 0 && (
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
                        <th className="px-2 py-2 text-left text-gray-600 font-medium whitespace-nowrap text-xs w-12">
                          <input
                            type="checkbox"
                            checked={
                              selectedRows.length === inventoryData.length &&
                              inventoryData.length > 0
                            }
                            onChange={
                              selectedRows.length > 0
                                ? () => handleDeselectAllForMatch(matchId)
                                : () => handleSelectAllForMatch(matchId)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        {headers.map((header) => (
                          <th
                            key={header.key}
                            className="px-2 py-2 text-left text-gray-600 font-medium whitespace-nowrap text-xs min-w-[120px]"
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
                            key={`${matchId}-${rowIndex}`}
                            className={`border-b border-gray-200 transition-colors ${
                              isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
                            }`}
                            onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                            onMouseLeave={() => setHoveredRowIndex(null)}
                          >
                            <td className="py-2 px-2 text-xs whitespace-nowrap w-12">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  const newSelectedRows = isSelected
                                    ? selectedRows.filter(index => index !== rowIndex)
                                    : [...selectedRows, rowIndex];
                                  setSelectedRowsByMatch(prev => ({
                                    ...prev,
                                    [matchId]: newSelectedRows
                                  }));
                                }}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </td>
                            {headers.map((header) => (
                              <td
                                key={`${matchId}-${rowIndex}-${header.key}`}
                                className="py-2 px-2 text-xs whitespace-nowrap overflow-hidden text-ellipsis align-middle min-w-[120px]"
                              >
                                {header.editable ? (
                                  renderEditableCell(
                                    row,
                                    header,
                                    rowIndex,
                                    matchId,
                                    true //hoveredRowIndex === rowIndex
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
                              className="py-2 px-2 text-left text-gray-600 text-xs border-r border-gray-200 font-medium whitespace-nowrap text-center"
                              style={{ width: "50px" }}
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData.map((row, rowIndex) => {
                          const stickyColumns = getStickyColumnsForRow(row, rowIndex, matchId);

                          return (
                            <tr
                              key={`sticky-${matchId}-${rowIndex}`}
                              className="border-b border-gray-200 bg-white hover:bg-gray-50"
                            >
                              {stickyColumns.map((column, colIndex) => (
                                <td
                                  key={`sticky-${matchId}-${rowIndex}-${colIndex}`}
                                  className={`py-2 text-sm align-middle text-center border-r border-gray-200 ${
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
            )}

            {/* No listings message for this match */}
            {inventoryData.length === 0 && (
              <div className="p-2 text-center">
                
                 
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Filters added for this match
                  </h3>
                 
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleConfirmClick = (data, index) => {
    const { matchId } = showUploadPopup;
    console.log(index, "indexindexindex");
    setInventoryDataByMatch(prev => ({
      ...prev,
      [matchId]: prev[matchId].map((item, i) =>
        i === index ? { ...item, ...data } : item
      )
    }));
    setShowUploadPopup({ show: false, rowData: null, rowIndex: null, matchId: null, matchDetails: null });
  };

  // Calculate total selected items across all matches
  const getTotalSelectedCount = () => {
    return Object.values(selectedRowsByMatch).reduce((total, rows) => total + rows.length, 0);
  };

  const totalSelectedCount = getTotalSelectedCount();

  return (
    <div className="bg-[#F5F7FA] w-full h-full relative">
      {/* Header with selected match info */}
      <ViewMapPopup
        onClose={() => setShowViewPopup(false)}
        show={showViewPopup}
      />
      
      <div className="bg-white">
        {allMatchDetails.length > 0 && (
          <>
            {/* Filter Section with Control Icons - Shared across all matches */}
            <div className="border-b-[1px] border-[#DADBE5] p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-4 items-center">
                  <FormFields
                    formFields={getActiveFilters()}
                    filtersApplied={filtersApplied}
                    setFiltersApplied={setFiltersApplied}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content Area with Multiple Match Tables */}
      {allMatchDetails.length > 0 && (
        <div
          className="m-6 bg-white rounded"
          style={{
            marginBottom: "80px",
            position: "relative",
            overflow: "visible",
          }}
        >
          <div >
            {allMatchDetails.map((matchDetails) => (
              <CustomInventoryTable 
                key={matchDetails.match_id}
                matchDetails={matchDetails}
                matchId={matchDetails.match_id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show message when no matches are available */}
      {allMatchDetails.length === 0 && (
        <div className="m-6 bg-white rounded p-8 text-center">
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
              No matches available
            </h3>
            <p className="text-gray-500 mb-4">
              There are no matches available for bulk inventory management.
            </p>
          </div>
        </div>
      )}

      {/* Upload Popup */}
      <UploadTickets
        show={showUploadPopup?.show}
        rowData={showUploadPopup?.rowData}
        matchDetails={showUploadPopup?.matchDetails}
        handleConfirmClick={handleConfirmClick}
        rowIndex={showUploadPopup?.rowIndex}
        onClose={() => {
          setShowUploadPopup({ 
            show: false, 
            rowData: null, 
            rowIndex: null, 
            matchId: null, 
            matchDetails: null 
          });
        }}
      />

      {/* Sticky Bottom Container - Only visible when there are selected rows across any match */}
      {totalSelectedCount > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg"
          style={{ zIndex: 9999 }}
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {totalSelectedCount} item(s) selected across all matches
              </span>
              <button
                onClick={() => {
                  Object.keys(selectedRowsByMatch).forEach(matchId => {
                    const selectedRows = selectedRowsByMatch[matchId];
                    if (selectedRows.length > 0) {
                      handleDeleteForMatch(matchId);
                    }
                  });
                }}
                className="flex items-center space-x-1 text-sm text-gray-700 hover:text-gray-900 px-3 py-1 hover:bg-gray-100 rounded"
              >
                <Trash2 size={16} />
                <span>Delete Selected</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                loading={loader}
                onClick={handlePublishLive}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium"
              >
                <span>PUBLISH LIVE ({totalSelectedCount})</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkInventory;