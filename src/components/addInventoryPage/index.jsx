import React, { useState, useRef, useCallback, useEffect } from "react";
import oneHand from "../../../public/onehand.svg";
import greenHand from "../../../public/greenhand.svg";
import uploadListing from "../../../public/uploadlisting.svg";
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
import { debounce, entries, filter, head, max, set } from "lodash";
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
  SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import UploadTickets from "../ModalComponents/uploadTickets";
import ScrollableAccordionTable from "../TicketsPage/scrollableTable";
import ViewMapPopup from "./ViewMapPopup";
import {
  fetchBlockDetails,
  FetchEventSearch,
  FetchPerformerOrVenueListing,
  saveAddListing,
  saveBulkListing,
} from "@/utils/apiHandler/request";
import { useRouter } from "next/router";
import SearchedList from "../tradePage/components/searchedList";
import FormFields from "../formFieldsComponent";
import { toast } from "react-toastify";
import InventorySearchedList from "./inventorySearchList";
import SearchedViewComponent from "./searchViewComponent";
import BulkActionBar from "./bulkActionBar";
import RightViewModal from "../commonComponents/rightViewModal";
import TicketListingQuality from "../TicketInfoPopup";
import CompactInfoCard from "../CompactInfoCard";
import SubjectDescriptionPopup from "../settingPage/subjectDescriptionPopup";

const MultiSelectEditableCell = ({
  value,
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Select options...",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  // Convert string value to array if needed
  const normalizeValue = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val.includes(",") ? val.split(",").map((v) => v.trim()) : [val];
    }
    return [val];
  };

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(normalizeValue(value));
  }, [value]);

  // Prevent editing if disabled
  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

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
    if (normalizedValue.length === 0) return placeholder;

    return `${normalizedValue.length} item${
      normalizedValue.length !== 1 ? "s" : ""
    } selected`;
  };

  const getSelectedCount = () => {
    const normalizedValue = normalizeValue(editValue);
    return normalizedValue.length;
  };

  if (isEditing && !disabled) {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div
          className={`border rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] transition-colors ${
            isFocused || isDropdownOpen
              ? "border-green-500 ring-2 ring-green-600"
              : "border-[#DADBE5] hover:border-green-600"
          }`}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => !isDropdownOpen && setIsFocused(true)}
          onMouseLeave={() => !isDropdownOpen && setIsFocused(false)}
          tabIndex={0}
        >
          <div className="flex justify-between items-center">
            <span className="truncate text-[#323A70]">
              {getSelectedCount() > 0
                ? `${getSelectedCount()} selected`
                : placeholder}
            </span>
            <ChevronDown
              size={12}
              className={`transform transition-transform text-[#323A70] ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isDropdownOpen && (
          <div
            data-multiselect-dropdown
            className="fixed bg-white border border-[#DADBE5] rounded shadow-lg max-h-48 overflow-y-auto"
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
            <div className="border-b border-[#DADBE5] p-2">
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
                    className="w-3 h-3 text-blue-600 border-[#DADBE5]"
                  />
                  <span className="text-xs text-[#323A70]">{option.label}</span>
                </div>
              );
            })}

            <div className="border-t border-[#DADBE5] p-2 flex justify-end space-x-2">
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

  if (isRowHovered && !disabled) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        <div className="border border-[#DADBE5] rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer hover:border-green-600 hover:ring-2 hover:ring-green-600 transition-colors">
          <div className="flex justify-between items-center">
            <span
              className={`truncate ${
                normalizeValue(value).length > 0
                  ? "text-[#323A70]"
                  : "text-gray-400"
              }`}
            >
              {getDisplayValue()}
            </span>
            <ChevronDown size={12} className="text-[#323A70]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
      onClick={handleClick}
    >
      <span
        className={`text-xs truncate ${
          disabled
            ? "text-gray-400"
            : normalizeValue(value).length > 0
            ? "text-[#323A70]"
            : "text-gray-400"
        }`}
      >
        {getDisplayValue()}
      </span>
    </div>
  );
};

// Updated SimpleEditableCell component with placeholder support
const SimpleEditableCell = ({
  value,
  type = "text",
  options = [],
  onSave,
  className = "",
  isRowHovered = false,
  disabled = false,
  placeholder = "Enter...",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleClick = () => {
    if (disabled) return;
    setIsEditing(true);
  };

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
      return option ? option.label : !value ? placeholder : value;
    }
    if (type === "checkbox") {
      return value ? "Yes" : "No";
    }
    return value || placeholder;
  };

  const hasValue = () => {
    if (type === "checkbox") return true; // Always show Yes/No for checkbox
    if (type === "select") {
      const option = options.find((opt) => opt.value === value);
      return !!option;
    }
    return !!(value && value.toString().trim());
  };

  if (isEditing && !disabled) {
    return (
      <div className="w-full">
        {type === "select" ? (
          <select
            ref={inputRef}
            value={editValue || ""}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`border rounded px-2 py-1 text-xs focus:outline-none bg-white w-full text-[#323A70] transition-colors ${
              isFocused
                ? "border-green-600 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-500"
            }`}
          >
            <option value="">{placeholder}</option>
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
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`w-4 h-4 text-blue-600 bg-gray-100 rounded transition-colors ${
              isFocused
                ? "border-green-500 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-400"
            }`}
          />
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={editValue || ""}
            placeholder={placeholder}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            onMouseEnter={() => setIsFocused(true)}
            onMouseLeave={() => setIsFocused(false)}
            className={`border rounded px-2 py-1 text-xs focus:outline-none w-full bg-white text-[#323A70] transition-colors placeholder:text-gray-400 ${
              isFocused
                ? "border-green-500 ring-2 ring-green-500"
                : "border-[#DADBE5] hover:border-green-400"
            }`}
          />
        )}
      </div>
    );
  }

  if (isRowHovered && !disabled) {
    return (
      <div className={`cursor-pointer ${className}`} onClick={handleClick}>
        {type === "select" ? (
          <select
            value={editValue || ""}
            className="border border-[#DADBE5] rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors"
            onClick={handleClick}
            readOnly
          >
            <option>{getDisplayValue()}</option>
          </select>
        ) : type === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={editValue}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-[#DADBE5] rounded cursor-pointer hover:border-green-600 transition-colors"
              onClick={handleClick}
              readOnly
            />
          </div>
        ) : (
          <input
            type={type}
            value={editValue || ""}
            placeholder={placeholder}
            className="border border-[#DADBE5] rounded px-2 py-1 text-xs focus:outline-none bg-white w-full cursor-pointer text-[#323A70] hover:border-green-600 transition-colors placeholder:text-gray-400"
            onClick={handleClick}
            readOnly
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${className}`}
      onClick={handleClick}
    >
      <span
        className={`text-xs ${
          disabled
            ? "text-gray-400"
            : hasValue()
            ? "text-[#323A70]"
            : "text-gray-400"
        }`}
      >
        {getDisplayValue()}
      </span>
    </div>
  );
};

const AddInventoryPage = (props) => {
  const { matchId, response } = props;
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
  const [showTicketInfoPopup, setShowTicketInfoPopup] = useState(false);

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
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  // State for tracking scroll and shadows
  const [hasScrolled, setHasScrolled] = useState(false);
  // Define filters array with complete configuration
  const filters = [
    {
      type: "select",
      name: "ticket_types",
      label: "Ticket Types",
      value: filtersApplied?.ticket_types,
      mandatory: true,
      options: [
        ...(ticket_types?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_types: value })),
    },
    {
      type: "select",
      name: "add_qty_addlist",
      label: "Quantity",
      mandatory: true,
      value: filtersApplied?.add_qty_addlist,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ],
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, add_qty_addlist: value })),
    },
    {
      type: "select",
      name: "split_type",
      label: "Split Type",
      mandatory: true,
      value: filtersApplied?.split_type,
      options: [
        ...(split_types?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_type: value })),
    },
    {
      type: "select",
      name: "ticket_category",
      label: "Seat Category",
      increasedWidth: "!w-[220px] !min-w-[220px]",
      value: filtersApplied?.ticket_category,
      options: Object.entries(block_data || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_block: value })),
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, home_town: value })),
    },
    {
      type: "text",
      name: "row",
      label: "Row",
      value: filtersApplied?.row,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          row: e?.target?.value,
        })),
    },
    {
      type: "text",
      name: "first_seat",
      label: "First Seat",
      value: filtersApplied?.first_seat,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs ">{matchDetails?.currency_icon?.[0] || "$"}</p>
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
      name: "add_price_addlist",
      label: "Processed Price",
      value: filtersApplied?.add_price_addlist,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs ">{matchDetails?.currency_icon?.[0] || "$"}</p>
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, restrictions: value })),
    },
    {
      type: "select",
      name: "notes",
      label: "Benifits",
      value: filtersApplied?.notes,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
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
      name: "split_details",
      label: "Seating Arrangement",
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_details: value })),
    },
    {
      type: "date",
      name: "ship_date",
      label: "Date to Ship",
      value: filtersApplied?.ship_date || {
        startDate: matchDetails?.ship_date,
        endDate: matchDetails?.ship_date,
      },
      // Convert Date object to YYYY-MM-DD string format
      minDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      maxDate: matchDetails?.ship_date, // Assuming this is already in YYYY-MM-DD format
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      singleDateMode: true,
      className: "!py-[10px] !px-[12px] w-full mobile:text-xs",
      labelClassName: "!text-[11px]",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ship_date: value })),
    },
    {
      type: "checkbox",
      name: "tickets_in_hand",
      label: "Tickets In Hand",
      value: filtersApplied?.tickets_in_hand || false,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
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
      increasedWidth: filter.increasedWidth || "",
      key: filter.name,
      label: filter.label,
      editable: true,
      type: filter.type || "text",
      options: filter.options || [],
      showIcon: filter?.showIcon,
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
          <>
            <Image
              src={rowData?.tickets_in_hand ? greenHand : oneHand}
              alt="tick"
              width={16}
              height={16}
              className={`${
                rowData?.tickets_in_hand ? "text-green-500" : "text-gray-400"
              } cursor-pointer hover:text-blue-500 transition-colors`}
              onClick={() => handleHandAction(rowData, rowIndex)}
            />
          </>
        ),
        className: "py-2 text-center border-r border-[#E0E1EA]",
      },
      {
        key: "",
        icon: (
          <>
            <Image
              src={uploadListing}
              alt="tick"
              width={16}
              height={16}
              className={` cursor-pointer hover:text-blue-500 transition-colors`}
              onClick={() => handleUploadAction(rowData, rowIndex)}
            />
          </>
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

  const fetchApiCall = async (query, isInitialLoad = false) => {
    try {
      setSearchEventLoader(true);
      setSearchedEvents([]);
      setHasSearched(true);

      // For initial load or empty query, send empty string to get default/popular results
      const searchQuery = isInitialLoad ? "" : query ? query.trim() : "";

      console.log("Making API call with searchQuery:", searchQuery); // Debug log

      const response = await FetchPerformerOrVenueListing("", {
        query: searchQuery,
      });

      console.log("Search response:", response);
      setSearchedEvents(response?.data || []);
      setSearchEventLoader(false);
      setShowSearchDropdown(true);
    } catch (error) {
      setSearchEventLoader(false);
      console.error("Search error:", error);
      setSearchedEvents([]);
      setShowSearchDropdown(true);
    }
  };

  // Create debounced version of the API call
  const debouncedFetchApiCall = useCallback(
    debounce((query) => {
      if (query.trim()) {
        fetchApiCall(query);
      }
    }, 300),
    []
  );

  const handleSearchFocus = (e) => {
    if (!searchValue || searchValue.trim() === "") {
      // First time focus without any search value - call with empty query
      fetchApiCall("", true);
    } else if (
      searchedEvents?.length == 0 &&
      searchValue &&
      searchValue.trim()
    ) {
      setShowSearchDropdown(false);
    } else if (searchValue && searchValue.trim()) {
      // If there's already a search value, show existing results
      setShowSearchDropdown(true);
    }
  };

  const handleOnChangeEvents = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    if (newValue.trim()) {
      debouncedFetchApiCall(newValue);
    } else {
      // If search is cleared, fetch initial results
      fetchApiCall("", true);
    }
  };

  const handleSearchedEventClick = (event) => {
    router.push(`/add-listings/${event?.m_id}`);
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

  const handleEdit = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select a row to edit");
      return;
    }

    if (selectedRows.length > 1) {
      toast.error("Please select only one row to edit");
      return;
    }

    const rowIndex = selectedRows[0];
    setEditingRowIndex(rowIndex);
    setIsEditMode(true);
    toast.success("Edit mode activated for selected row");
  };

  // Function to save edit changes
  const handleSaveEdit = () => {
    setEditingRowIndex(null);
    setIsEditMode(false);
    setSelectedRows([]);
    toast.success("Changes saved successfully");
  };

  // Function to cancel edit
  const handleCancelEdit = () => {
    // Optionally restore original values here if you want to implement undo functionality
    setEditingRowIndex(null);
    setIsEditMode(false);
    setSelectedRows([]);
    toast.info("Edit cancelled");
  };

  const renderTableRow = (row, rowIndex) => {
    const isSelected = selectedRows.includes(rowIndex);
    const isRowDisabled = isEditMode && editingRowIndex !== rowIndex;

    return (
      <tr
        key={row.id || rowIndex}
        className={`border-b border-gray-200 transition-colors ${
          isSelected ? "bg-blue-50" : "bg-white hover:bg-gray-50"
        } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
        onMouseEnter={() => !isRowDisabled && setHoveredRowIndex(rowIndex)}
        onMouseLeave={() => setHoveredRowIndex(null)}
      >
        <td className="py-2 px-3 text-xs whitespace-nowrap w-12 border border-r-1 border-gray-200">
          <input
            type="checkbox"
            checked={isSelected}
            disabled={isRowDisabled}
            onChange={(e) => {
              if (isRowDisabled) return;
              e.stopPropagation();
              const newSelectedRows = isSelected
                ? selectedRows.filter((index) => index !== rowIndex)
                : [...selectedRows, rowIndex];
              setSelectedRows(newSelectedRows);
            }}
            className={`w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${
              isRowDisabled ? "cursor-not-allowed opacity-50" : ""
            }`}
          />
        </td>
        {headers.map((header) => (
          <td
            key={`${rowIndex}-${header.key}`}
            className={`py-2 px-3 text-xs ${
              header?.increasedWidth ? header?.increasedWidth : "min-w-[140px]"
            } whitespace-nowrap overflow-hidden text-ellipsis align-middle min-w-[140px] border-r border-gray-200 ${
              isRowDisabled ? "bg-gray-50" : ""
            }`}
          >
            {header.editable ? (
              renderEditableCell(
                row,
                header,
                rowIndex,
                hoveredRowIndex === rowIndex && !isRowDisabled,
                isRowDisabled
              )
            ) : (
              <span
                className={`${header.className || ""} ${
                  isRowDisabled ? "text-gray-400" : ""
                }`}
              >
                {row[header.key]}
              </span>
            )}
          </td>
        ))}
      </tr>
    );
  };

  const renderEditableCell = (
    row,
    header,
    rowIndex,
    isRowHovered,
    isDisabled = false
  ) => {
    // Check if this row is editable
    const isRowEditable = !isEditMode || editingRowIndex === rowIndex;
    const shouldShowAsEditable =
      isRowEditable &&
      (isRowHovered || (isEditMode && editingRowIndex === rowIndex));

    // Get placeholder text based on header type and label
    const getPlaceholder = () => {
      if (header.type === "select" || header.type === "multiselect") {
        return "Select...";
      }
      if (header.type === "text") {
        if (
          header.label.toLowerCase().includes("price") ||
          header.label.toLowerCase().includes("value")
        ) {
          return "Enter amount";
        }
        if (header.label.toLowerCase().includes("seat")) {
          return "Enter seat";
        }
        if (header.label.toLowerCase().includes("row")) {
          return "Enter row";
        }
        return "Enter...";
      }
      if (header.type === "date") {
        return "Select date";
      }
      if (header.type === "checkbox") {
        return "No";
      }
      return "Enter...";
    };

    if (header.type === "multiselect") {
      return (
        <MultiSelectEditableCell
          value={row[header.key]}
          options={header.options || []}
          onSave={(value) => handleCellEdit(rowIndex, header.key, value)}
          className={header.className || ""}
          isRowHovered={true} //isRowHovered={shouldShowAsEditable}
          disabled={!isRowEditable || isDisabled}
          placeholder="Select options..."
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
        isRowHovered={true} //{shouldShowAsEditable}
        disabled={!isRowEditable || isDisabled}
        placeholder={getPlaceholder()}
      />
    );
  };

  // Custom cell renderer that handles both regular and multiselect types

  // Handle select all functionality
  const handleSelectAll = () => {
    const allRowIndices = inventoryData.map((_, index) => index);
    setSelectedRows(allRowIndices);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };
  console.log(filtersApplied?.ship_date, "lllllllllll");
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
        `data[${index}][first_seat]`,
        publishingData.first_seat || ""
      );
      formData.append(`data[${index}][row]`, publishingData.row || "");
      formData.append(
        `data[${index}][split_type]`,
        publishingData.split_type || ""
      );
      console.log(
        publishingData.ship_date?.startDate,
        "publishingData.ship_date?.startDatepublishingData.ship_date?.startDate"
      );
      formData.append(
        `data[${index}][ship_date]`,
        publishingData.ship_date?.startDate || matchDetails?.ship_date || ""
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
      formData.append(
        `data[${index}][ticket_details1]`,
        publishingData.split_details
      );
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
      // await saveBulkListing("", formData);
      // } else {
      await saveAddListing("", formData);
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
    setSelectedRows([0]);

    if (!hasFilterValues) {
      toast.error(
        "Please select at least one filter value before adding a listing."
      );
      return;
    }

    const newListing = createInventoryItemFromFilters();
    setInventoryData((prevData) => [...prevData, newListing]);
    setShowTable(true);
  };

  // Enhanced Custom Table Component with working scroll functionality
  const CustomInventoryTable = () => {
    const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
    const [hasScrolledLeft, setHasScrolledLeft] = useState(false);
    const [isTableCollapsed, setIsTableCollapsed] = useState(false);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Function to check scroll capabilities and update state
    const checkScrollCapabilities = () => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // Can scroll left if we've scrolled right
      setCanScrollLeft(scrollLeft > 0);

      // Can scroll right if there's more content to the right
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding issues

      // Update hasScrolledLeft state
      setHasScrolledLeft(scrollLeft > 0);
    };

    // Scroll functions
    const scrollLeft = () => {
      if (!scrollContainerRef.current || !canScrollLeft) return;

      const container = scrollContainerRef.current;
      const scrollAmount = Math.min(300, container.clientWidth / 3); // Scroll by 300px or 1/3 of visible width

      container.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    };

    const scrollRight = () => {
      if (!scrollContainerRef.current || !canScrollRight) return;

      const container = scrollContainerRef.current;
      const scrollAmount = Math.min(300, container.clientWidth / 3); // Scroll by 300px or 1/3 of visible width

      container.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    };

    // Set up scroll event listener
    useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      // Initial check
      checkScrollCapabilities();

      // Add scroll event listener
      const handleScroll = () => {
        checkScrollCapabilities();
      };

      container.addEventListener("scroll", handleScroll);

      // Check on resize as well
      const handleResize = () => {
        setTimeout(checkScrollCapabilities, 100); // Small delay to ensure layout is updated
      };

      window.addEventListener("resize", handleResize);

      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleResize);
      };
    }, [inventoryData]); // Re-run when data changes

    // Check scroll capabilities when table data changes
    useEffect(() => {
      const timer = setTimeout(() => {
        checkScrollCapabilities();
      }, 100); // Small delay to ensure DOM is updated

      return () => clearTimeout(timer);
    }, [inventoryData, isTableCollapsed]);

    const stickyLeftWidth = 60; // Width for checkbox column

    return (
      <div
        ref={containerRef}
        className="border border-gray-200 rounded-lg overflow-hidden relative shadow-sm"
      >
        {/* Updated Accordion Header with working scroll buttons */}
        <div
          className="bg-[#343432]  cursor-pointer"
          onClick={() => setIsTableCollapsed(!isTableCollapsed)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Radio button */}
              <div className="flex w-[50px] justify-center py-4 border-r-[1px] border-[#51428E] items-center">
                <div className="w-4 h-4 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Match name with pipe separator */}
              <div className="flex items-center  space-x-4 py-4 pr-4 border-r-[1px] border-[#51428E]">
                <h3 className="font-medium text-sm text-white">
                  {matchDetails?.match_name || "Match Details"}
                </h3>
              </div>

              {/* Match details with pipe separators and more spacing */}
              <div className="flex items-center space-x-6 text-xs ">
                <div className="flex items-center space-x-2 py-4 pr-4 border-r-[1px] border-[#51428E]">
                  <Calendar1Icon size={14} className="text-white" />
                  <span className="text-white">
                    {matchDetails?.match_date_format}
                  </span>
                </div>

                <div className="flex items-center space-x-2 py-4 pr-4 border-r-[1px] border-[#51428E]">
                  <Clock size={14} className="text-white" />
                  <span className="text-white">{matchDetails?.match_time}</span>
                </div>

                <div className="flex items-center space-x-2 py-4 pr-4 border-r-[1px] border-[#51428E]">
                  <MapPin size={14} className="text-white" />
                  <span className="text-white max-w-xs truncate">
                    {matchDetails?.stadium_name}, {matchDetails?.country_name},{" "}
                    {matchDetails?.city_name}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4 pr-4">
              {/* Accordion Toggle - Remove scroll buttons from here */}
              <div className="bg-[#FFFFFF26] p-2 rounded-full cursor-pointer">
                <ChevronDown
                  size={18}
                  className={`text-white transition-transform duration-200 ${
                    isTableCollapsed ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {!isTableCollapsed && (
          <div
            className="w-full bg-white relative"
            style={{ overflow: "visible" }}
          >
            {/* Sticky Left Column for Checkbox */}
            <div
              className={`absolute top-0 left-0 h-full bg-white border-r border-[#DADBE5] z-30 transition-shadow duration-200 ${
                hasScrolledLeft ? "shadow-md" : ""
              }`}
              style={{ width: `50px` }}
            >
              <div className="h-full">
                <table className="w-full h-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#DADBE5]">
                      <th className="px-3 py-3 text-center text-[#7D82A4] font-medium whitespace-nowrap text-xs border-r border-[#DADBE5]">
                        <div className="flex justify-center items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedRows.length === inventoryData.length &&
                              inventoryData.length > 0
                            }
                            disabled={isEditMode}
                            onChange={
                              selectedRows.length > 0
                                ? handleDeselectAll
                                : handleSelectAll
                            }
                            className={`w-4 h-4 text-blue-600 border-[#DADBE5] rounded focus:ring-blue-500 ${
                              isEditMode ? "cursor-not-allowed opacity-50" : ""
                            }`}
                          />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((row, rowIndex) => {
                      const isSelected = selectedRows.includes(rowIndex);
                      const isRowDisabled =
                        isEditMode && editingRowIndex !== rowIndex;

                      return (
                        <tr
                          key={`sticky-left-${row.id || rowIndex}`}
                          className={`border-b border-[#DADBE5] transition-colors ${
                            isSelected
                              ? "bg-[#EEF1FD]"
                              : "bg-white hover:bg-gray-50"
                          } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                          onMouseEnter={() =>
                            !isRowDisabled && setHoveredRowIndex(rowIndex)
                          }
                          onMouseLeave={() => setHoveredRowIndex(null)}
                        >
                          <td className="py-2 px-3 text-center whitespace-nowrap border-r border-[#DADBE5]">
                            <div className="flex justify-center items-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isRowDisabled}
                                onChange={(e) => {
                                  if (isRowDisabled) return;
                                  e.stopPropagation();
                                  const newSelectedRows = isSelected
                                    ? selectedRows.filter(
                                        (index) => index !== rowIndex
                                      )
                                    : [...selectedRows, rowIndex];
                                  setSelectedRows(newSelectedRows);
                                }}
                                className={`w-4 h-4 text-blue-600 border-[#DADBE5] rounded focus:ring-blue-500 ${
                                  isRowDisabled
                                    ? "cursor-not-allowed opacity-50"
                                    : ""
                                }`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Main scrollable table container */}
            <div
              ref={scrollContainerRef}
              className="w-full overflow-x-auto hideScrollbar"
              style={{
                paddingLeft: `50px`,
                paddingRight: `50px`,
              }}
            >
              <table
                ref={mainTableRef}
                className="w-full border-none"
                style={{ minWidth: "1200px" }}
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-[#DADBE5]">
                    {headers.map((header) => (
                      <th
                        key={header.key}
                        className={`px-3 py-3 ${
                          header?.increasedWidth
                            ? header?.increasedWidth
                            : "min-w-[140px]"
                        } text-left text-[#7D82A4] font-medium whitespace-nowrap text-xs border-r border-[#DADBE5]`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="truncate text-[#7D82A4]">
                            {header.label}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row, rowIndex) => {
                    const isSelected = selectedRows.includes(rowIndex);
                    const isRowDisabled =
                      isEditMode && editingRowIndex !== rowIndex;

                    return (
                      <tr
                        key={row.id || rowIndex}
                        className={`border-b border-[#DADBE5] transition-colors ${
                          isSelected
                            ? "bg-[#EEF1FD]"
                            : "bg-white hover:bg-gray-50"
                        } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                        onMouseEnter={() =>
                          !isRowDisabled && setHoveredRowIndex(rowIndex)
                        }
                        onMouseLeave={() => setHoveredRowIndex(null)}
                      >
                        {headers.map((header) => (
                          <td
                            key={`${rowIndex}-${header.key}`}
                            className={`py-2 px-3 text-xs ${
                              header?.increasedWidth
                                ? header?.increasedWidth
                                : "min-w-[140px]"
                            } whitespace-nowrap overflow-hidden text-ellipsis align-middle border-r border-[#DADBE5] ${
                              isRowDisabled ? "bg-gray-50" : ""
                            } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                          >
                            {header.editable ? (
                              renderEditableCell(
                                row,
                                header,
                                rowIndex,
                                true,
                                isRowDisabled
                              )
                            ) : (
                              <span
                                className={`${header.className || ""} ${
                                  isRowDisabled
                                    ? "text-gray-400"
                                    : "text-[#323A70]"
                                }`}
                              >
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

            <div
              className={`absolute top-0 right-0 h-full bg-white border-l border-[#DADBE5] z-20 transition-shadow duration-200 ${
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
                    <tr className="bg-gray-50 border-b border-[#DADBE5]">
                      {/* Hand icon column header - Empty header with just text */}
                      <th
                        className="py-2 px-2 text-left text-[#7D82A4] text-xs border-r border-[#DADBE5] font-medium whitespace-nowrap text-center"
                        style={{
                          width: "50px",
                          minWidth: "50px",
                          maxWidth: "50px",
                        }}
                      >
                        <div className="flex items-center justify-center">
                          <span className="text-[#7D82A4] text-xs"></span>
                        </div>
                      </th>

                      {/* Upload icon column header with scroll navigation */}
                      <th
                        className="py-2 px-2 text-left text-[#7D82A4] text-xs font-medium whitespace-nowrap text-center relative"
                        style={{
                          width: "50px",
                          minWidth: "50px",
                          maxWidth: "50px",
                        }}
                      >
                        {/* Scroll Navigation Arrows in table header */}
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollLeft();
                            }}
                            disabled={!canScrollLeft}
                            className={`p-1 rounded transition-colors ${
                              canScrollLeft
                                ? "text-[#7D82A4] hover:bg-gray-200 cursor-pointer"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="Scroll Left"
                          >
                            <ChevronLeft size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollRight();
                            }}
                            disabled={!canScrollRight}
                            className={`p-1 rounded transition-colors ${
                              canScrollRight
                                ? "text-[#7D82A4] hover:bg-gray-200 cursor-pointer"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            title="Scroll Right"
                          >
                            <ChevronRight size={12} />
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((row, rowIndex) => {
                      const isRowDisabled =
                        isEditMode && editingRowIndex !== rowIndex;
                      const isSelected = selectedRows.includes(rowIndex);

                      return (
                        <tr
                          key={`sticky-${row.id || rowIndex}`}
                          className={`border-b border-[#DADBE5] transition-colors ${
                            isSelected
                              ? "bg-[#EEF1FD]"
                              : "bg-white hover:bg-gray-50"
                          } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                        >
                          {/* Hand icon column */}
                          <td
                            className={`py-2 text-sm align-middle text-center border-r border-[#DADBE5] ${
                              isRowDisabled ? "pointer-events-none" : ""
                            } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                            style={{
                              width: "50px",
                              minWidth: "50px",
                              maxWidth: "50px",
                            }}
                          >
                            <div className="flex justify-center items-center">
                              <Image
                                src={row?.tickets_in_hand ? greenHand : oneHand}
                                alt="hand status"
                                width={16}
                                height={16}
                                className={`${
                                  row?.tickets_in_hand
                                    ? "text-green-500"
                                    : "text-gray-400"
                                } cursor-pointer hover:opacity-75 transition-opacity`}
                                onClick={() => handleHandAction(row, rowIndex)}
                              />
                            </div>
                          </td>

                          {/* Upload icon column */}
                          <td
                            className={`py-2 text-sm align-middle text-center ${
                              isRowDisabled ? "pointer-events-none" : ""
                            } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                            style={{
                              width: "50px",
                              minWidth: "50px",
                              maxWidth: "50px",
                            }}
                          >
                            <div className="flex justify-center items-center h-full">
                              <Image
                                src={uploadListing}
                                alt="upload"
                                width={16}
                                height={16}
                                className="cursor-pointer hover:opacity-75 transition-opacity"
                                onClick={() =>
                                  handleUploadAction(row, rowIndex)
                                }
                              />
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
        )}
      </div>
    );
  };

  const handleSearchBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 150);
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

  const handleCloseTicketInfoPopup = () => {
    setShowTicketInfoPopup(false);
  };

  const handleOpenTicketInfoPopup = () => {
    setShowTicketInfoPopup(true);
  };

  const handleBulkNavigateClick = (route) => {
    router.push(`/bulk-listings${route}`);
  };

  const [showRequestPopup, setShowRequestPopup] = useState(false);
  return (
    <div className="bg-[#F5F7FA] w-full h-full relative min-h-screen">
      {/* Header with selected match info */}
      <ViewMapPopup
        image={matchDetails?.venue_image}
        stadiumName={matchDetails?.stadium_name}
        onClose={() => setShowViewPopup(false)}
        show={showViewPopup}
        blockData={block_data}
        blockDataColor={response?.block_data_color}
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
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              type="text"
              showDropdown={showSearchDropdown}
              iconBefore={<SearchIcon size={16} />}
              iconBeforeTooltip="Search" // Pass tooltip text here
              dropDownComponent={
                <SearchedViewComponent
                  searchEventLoader={searchEventLoader}
                  searchedEvents={searchedEvents}
                  hasSearched={hasSearched}
                  searchValue={searchValue}
                  handleSearchedEventClick={handleSearchedEventClick}
                  show={showRequestPopup}
                  setShow={setShowRequestPopup}
                  handleBulkNavigateClick={handleBulkNavigateClick}
                />
              }
              label="Choose Match Event"
              className={`!py-[8px] !text-[#323A70] !text-[14px] ${
                searchValue.length <= 3 && "!pl-[44px]"
              }`}
              paddingClassName=""
              autoComplete="off"
              showDelete={true}
              deleteFunction={() => {
                setSearchValue("");
                setShowSearchDropdown(false);
                setHasSearched(false);
              }}
              parentClassName="!w-[500px]"
            />

            {matchDetails && (
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center pr-4 border-r-[1px] border-[#DADBE5]">
                  <Calendar1Icon size={16} className="text-[#595c6d]" />
                  <p className="text-[#3a3c42] truncate text-[14px]">
                    {matchDetails?.match_date_format}
                  </p>
                </div>
                <div className="flex gap-2 items-center pr-4 border-r-[1px] border-[#DADBE5]">
                  <Clock size={16} className="text-[#595c6d]" />
                  <p className="text-[#3a3c42] truncate text-[14px]">
                    {matchDetails?.match_time}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <MapPin size={16} className="text-[#595c6d]" />
                  <p className="text-[#3a3c42] truncate text-[14px]">
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
            <CompactInfoCard
              title="Listing Visibility"
              progress={20}
              segments={5}
              tooltipText="Click to learn more"
              handleClick={handleOpenTicketInfoPopup}
            />
            {/* Control Icons */}
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
              <div className="flex justify-end px-5 py-2 border-b-[1px] border-[#E0E1EA]">
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
        <div className="m-6 bg-white rounded-lg shadow-sm">
          <div style={{ maxHeight: "calc(100vh - 450px)", overflowY: "auto" }}>
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

      {showTicketInfoPopup && (
        <RightViewModal
          show={showTicketInfoPopup}
          onClose={handleCloseTicketInfoPopup}
        >
          <TicketListingQuality onClose={handleCloseTicketInfoPopup} />
        </RightViewModal>
      )}

      {/* Enhanced Sticky Bottom Container - Only visible when there are selected rows */}
      {
        <BulkActionBar
          selectedCount={selectedCount}
          totalCount={inventoryData.length}
          onSelectAll={handleSelectAll}
          onDeselectAll={handleDeselectAll}
          onClone={handleClone}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPublishLive={handlePublishLive}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          loading={loader}
          disabled={!(selectedCount > 0 && inventoryData?.length > 0)}
          isEditMode={isEditMode}
        />
      }
      {showRequestPopup && (
        <SubjectDescriptionPopup
          show={showRequestPopup}
          onClose={() => setShowRequestPopup(false)}
        />
      )}
    </div>
  );
};

export default AddInventoryPage;
