import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import oneHand from "../../../public/oneHand.svg";
import greenHand from "../../../public/greenHand.svg";

import uploadListing from "../../../public/uploadListing.svg";
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
import { addDayOfWeek, dateFormat } from "@/utils/helperFunctions";
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
  HardDriveUpload,
  Menu,
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
  saveListing,
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
import { MultiSelectEditableCell, SimpleEditableCell } from "./selectCell";
import CommonInventoryTable from "./customInventoryTable";
import ListingsMarketplace from "../ModalComponents/listSalesModal";
import Tooltip from "./simmpleTooltip";
import RequestEvent from "./requestFeaturePopup";
import FilterColumnControls from "./filterControls";

const AddInventoryPage = (props) => {
  const { matchId, response } = props;
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [showMobileFilters, setShowMobileFilters] = useState(true);

  // Extract the original response structure (KEEP EXACTLY THE SAME)
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
  const [showMarketPlaceModal, setShowMarketPlaceModal] = useState(false);
  const [searchEventLoader, setSearchEventLoader] = useState(false);
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [searchValue, setSearchValue] = useState(
    matchDetails?.match_name
      ? `${matchDetails?.match_name} - ${matchDetails?.stadium_name}`
      : ""
  );
  const [showTable, setShowTable] = useState(false);

  const router = useRouter();
  const [filtersApplied, setFiltersApplied] = useState({ split_type: "5" });
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [blockDetails, setBlockDetails] = useState([]);
  const filterButtonRef = useRef(null);
  const columnButtonRef = useRef(null);

  const [inventoryData, setInventoryData] = useState([]);
  const [showTicketInfoPopup, setShowTicketInfoPopup] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isTableCollapsed, setIsTableCollapsed] = useState(false);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle accordion toggle for single mode
  const handleToggleCollapse = () => {
    setIsTableCollapsed(!isTableCollapsed);
  };

  // KEEP THE ORIGINAL formatDateForInput function (EXACT SAME)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      // Handle different date formats
      let date;

      // If it's in format "22 August 2025"
      if (
        typeof dateString === "string" &&
        dateString.match(/^\d{1,2}\s\w+\s\d{4}$/)
      ) {
        date = new Date(dateString);
      }
      // If it's already a Date object
      else if (dateString instanceof Date) {
        date = dateString;
      }
      // If it's in YYYY-MM-DD format
      else if (
        typeof dateString === "string" &&
        dateString.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        date = new Date(dateString);
      }
      // Try to parse any other format
      else {
        date = new Date(dateString);
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "";
      }

      // Return in YYYY-MM-DD format for input fields
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // KEEP THE ORIGINAL getBlockDetails function (EXACT SAME)
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

  // KEEP THE ORIGINAL filters array construction (EXACT SAME) with responsive className updates
  const filters = [
    {
      type: "select",
      name: "ticket_types",
      label: "Ticket Type",
      value: filtersApplied?.ticket_types,
      mandatory: true,
      options: [
        ...(ticket_types?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow  md:max-w-[180px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_types: value })),
    },
    {
      type: "number",
      name: "add_qty_addlist",
      label: "Quantity",
      mandatory: true,
      value: filtersApplied?.add_qty_addlist,
      increasedWidth: "!w-[100px]",
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ],
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[120px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          add_qty_addlist: e.target.value,
        })),
    },
    {
      type: "select",
      name: "split_type",
      label: "Split Type",
      increasedWidth: "!w-[120px]",
      mandatory: true,
      value: filtersApplied?.split_type,
      options: [
        ...(split_types?.map((note) => ({
          value: note.id.toString(),
          label: note.name,
        })) || []),
      ],
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[150px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      // onChange: (value) =>
      //   setFiltersApplied((prev) => ({ ...prev, split_type: value })),
      onChange: (value) => {
        setFiltersApplied((prev) => {
          let updated = { ...prev, split_type: value };
          if (value === "6") {
            updated.split_details = "27";
          } else if (prev.split_details === "27") {
            updated.split_details = "";
          }

          return updated;
        });
      },
    },
    {
      type: "select",
      name: "split_details",
      label: "Seating Arrangement",
      mandatory: true,
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
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[180px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      // onChange: (value) =>
      //   setFiltersApplied((prev) => ({ ...prev, split_details: value })),
      onChange: (value) => {
        setFiltersApplied((prev) => {
          let updated = { ...prev, split_details: value };
          if (prev.split_type === "6" && value !== "27") {
            updated.split_type = "5";
          }

          return updated;
        });
      },
    },
    {
      type: "number",
      name: "max_display_qty",
      label: "Max Display Quantity",
      value: filtersApplied?.max_display_qty,
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ],
      increasedWidth: "min-w-[100px]",
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[160px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          max_display_qty: e?.target?.value,
        })),
    },
    {
      type: "select",
      name: "home_town",
      increasedWidth: "!w-[100px]",
      label: "Fan Area",
      value: filtersApplied?.home_town,
      options: Object.entries(home_town || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[140px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, home_town: value })),
    },
    {
      type: "select",
      name: "ticket_category",
      label: "Seating Category",
      mandatory: true,
      increasedWidth:
        "!w-[180px] !min-w-[180px] sm:!w-[160px] sm:!min-w-[160px] lg:!w-[180px] lg:!min-w-[180px]",
      value: filtersApplied?.ticket_category,
      options: Object.entries(block_data || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[180px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
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
      increasedWidth: "!w-[110px]",
      value: filtersApplied?.ticket_block,
      options: blockDetails,
      disabled: !filtersApplied?.ticket_category,

      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[150px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ticket_block: value })),
    },

    {
      type: "text",
      name: "row",
      label: "Row",
      value: filtersApplied?.row,
      increasedWidth: "!w-[100px]",
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[100px] lg:max-w-[212px]",
      className: "!py-[10px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          row: e?.target?.value,
        })),
    },
    {
      type: "number",
      name: "first_seat",
      label: "First Seat",
      increasedWidth: "!w-[110px]",
      value: filtersApplied?.first_seat,
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[120px] lg:max-w-[212px]",
      className: "!py-[10px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          first_seat: e?.target?.value,
        })),
    },
    {
      type: "number",
      name: "face_value",
      label: "Face Value",
      increasedWidth: "!w-[120px]",
      currencyFormat: true,
      value: filtersApplied?.face_value,
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[140px] lg:max-w-[212px]",
      iconBefore: (
        <div className="border-r-[1px] pr-2 border-[#E0E1EA]">
          <p className="text-xs sm:text-[10px] lg:text-xs">
            {matchDetails?.currency_icon?.[0] || "$"}
          </p>
        </div>
      ),
      className: "!py-[10px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          face_value: e?.target?.value,
        })),
    },
    {
      type: "number",
      name: "add_price_addlist",
      label: "Processed Price",
      increasedWidth: "!w-[120px]",
      currencyFormat: true,
      mandatory: true,
      value: filtersApplied?.add_price_addlist,
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[160px] lg:max-w-[212px]",
      iconBefore: (
        <div className="border-r-[1px] pr-2 border-[#E0E1EA]">
          <p className="text-xs sm:text-[10px] lg:text-xs">
            {matchDetails?.currency_icon?.[0] || "$"}
          </p>
        </div>
      ),
      className: "!py-[10px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          add_price_addlist: e?.target?.value,
        })),
    },
    {
      type: "select",
      name: "notes",
      label: "Benifits",
      value: filtersApplied?.notes,
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[140px] lg:max-w-[212px]",
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
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
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
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[160px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, restrictions: value })),
    },

    {
      type: "date",
      name: "ship_date",
      label: "Date to Ship",
      value: filtersApplied?.ship_date || {
        startDate: matchDetails?.ship_date,
        endDate: matchDetails?.ship_date,
      },
      minDate: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      maxDate: matchDetails?.ship_date, // Convert to proper format
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[160px] lg:max-w-[212px]",
      singleDateMode: true,
      className:
        "!pb-[10px] !pt-[12px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ship_date: value })),
    },
    {
      type: "checkbox",
      name: "ticket_in_hand",
      label: "Tickets In Hand",
      value: filtersApplied?.ticket_in_hand || false,
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow md:max-w-[160px] lg:max-w-[212px]",
      className:
        "!py-[4px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      hideFromTable: true,
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          ticket_in_hand: e?.target?.checked,
        })),
    },
  ];

  const columnOrder = [
    "ticket_types",
    "add_qty_addlist",
    "split_type",
    "max_display_qty",
    "ticket_category",
    "ticket_block",
    "row",
    "first_seat",
    "face_value",
    "add_price_addlist",
    "split_details",
    "notes",
    "restrictions",
    "home_town",
    "ship_date",
    "ticket_in_hand",
  ];

  const orderedFilterValues = columnOrder
    .map((name) => filters.find((f) => f.name === name))
    .filter(Boolean);

  // KEEP THE ORIGINAL allHeaders generation (EXACT SAME)
  const allHeaders = orderedFilterValues.map((filter) => {
    const baseHeader = {
      increasedWidth: filter.increasedWidth || "",
      key: filter.name,
      label: filter.label,
      editable: true,
      type: filter.type || "text",
      options: filter.options || [],
      showIcon: filter?.showIcon,
      hideFromTable: filter?.hideFromTable,
      iconBefore: filter.iconBefore || null,
      currencyFormat: filter.currencyFormat || false,
    };

    if (filter.multiselect) {
      baseHeader.type = "multiselect";
    }

    return baseHeader;
  });

  // KEEP THE ORIGINAL state management (EXACT SAME)
  const [activeFilters, setActiveFilters] = useState(() => {
    return filters.map((f) => f.name);
  });
  const [visibleColumns, setVisibleColumns] = useState(() => {
    return allHeaders.map((h) => h.key);
  });

  const headers = allHeaders.filter(
    (header) => visibleColumns.includes(header.key) && !header?.hideFromTable
  );
  const [orderedColumns, setOrderedColumns] = useState(() => {
    if (columnOrder && columnOrder.length > 0) {
      return columnOrder;
    }
    return allHeaders.map((h) => h.key);
  });

  // Initialize with the original filter order
  const [orderedFilters, setOrderedFilters] = useState(() => {
    return filters.map((f) => f.name);
  });

  useEffect(() => {
    console.log("Current orderedFilters:", orderedFilters);
    console.log("Current activeFilters:", activeFilters);
    console.log(
      "Visible filters result:",
      getVisibleFilters().map((f) => f.name)
    );
  }, [orderedFilters, activeFilters]);

  // Custom sticky columns configuration for AddInventory
  const getStickyColumnsForRow = (rowData, rowIndex) => {
    // Check if we're in bulk edit mode (multiple rows selected for editing)
    const isBulkEditMode =
      isEditMode &&
      Array.isArray(editingRowIndex) &&
      editingRowIndex.length > 1;

    return [
      {
        key: "",
        toolTipContent: "Tickets In Hand",
        icon: (
          <Tooltip content="Tickets In Hand">
            <Image
              src={rowData?.ticket_in_hand ? greenHand : oneHand}
              alt="tick"
              width={isMobile ? 14 : 16}
              height={isMobile ? 14 : 16}
              className={`${
                rowData?.ticket_in_hand ? "text-green-500" : "text-gray-400"
              } cursor-pointer hover:text-blue-500 transition-colors`}
              onClick={() => handleHandAction(rowData, rowIndex)}
            />
          </Tooltip>
        ),
        className: "py-2 text-center border-r border-[#E0E1EA]",
      },
      {
        key: "",
        toolTipContent: isBulkEditMode ? "Not Available" : "Upload",
        icon: (
          <Tooltip content={isBulkEditMode ? "Not Available" : "Upload"}>
            <Image
              src={uploadListing}
              alt="tick"
              width={isMobile ? 14 : 16}
              height={isMobile ? 14 : 16}
              className={`${
                isBulkEditMode
                  ? "cursor-not-allowed opacity-50 grayscale"
                  : "cursor-pointer hover:text-blue-500 transition-colors"
              }`}
              onClick={() => {
                if (!isBulkEditMode) {
                  handleUploadAction(rowData, rowIndex);
                }
              }}
            />
          </Tooltip>
        ),
        className: "py-2 text-center",
      },
      {
        key: "",
        toolTipContent: isBulkEditMode ? "Not Available" : "Upload Pop",
        icon: (
          <Tooltip content={isBulkEditMode ? "Not Available" : "Upload Pop"}>
            <HardDriveUpload
              onClick={() => {
                if (!isBulkEditMode) {
                  handleUploadAction(
                    { ...rowData, handleProofUpload: true },
                    rowIndex
                  );
                }
              }}
              className={`${
                isMobile ? "w-[14px] h-[14px]" : "w-[16px] h-[16px]"
              } ${
                isBulkEditMode
                  ? "cursor-not-allowed opacity-50 text-gray-400"
                  : "cursor-pointer"
              }`}
            />
          </Tooltip>
        ),
        className: "py-2 text-center border-r border-[#E0E1EA]",
      },
    ];
  };

  // Filter the filters array based on active filters
  const getActiveFilters = () => {
    const activeFiltersList = filters.filter((filter) =>
      activeFilters.includes(filter.name)
    );
    return activeFiltersList;
  };

  const getAvailableColumns = () => {
    const baseColumns = allHeaders.map((header) => ({
      key: header.key,
      label: header.label,
      isVisible: visibleColumns.includes(header.key),
    }));

    // Apply custom ordering
    const orderedItems = [];
    const usedKeys = new Set();

    // Add columns in the custom order
    orderedColumns.forEach((orderedKey) => {
      const item = baseColumns.find((col) => col.key === orderedKey);
      if (item) {
        orderedItems.push(item);
        usedKeys.add(orderedKey);
      }
    });

    // Add any columns that weren't in the ordered list
    baseColumns.forEach((item) => {
      if (!usedKeys.has(item.key)) {
        orderedItems.push(item);
      }
    });

    return orderedItems;
  };

  // Function to get available filters with proper ordering
  const getAvailableFilters = () => {
    const baseFilters = filters.map((filter) => ({
      key: filter.name,
      label: filter.label,
      type: filter.type,
      isActive: activeFilters.includes(filter.name),
    }));

    // Apply custom ordering
    const orderedItems = [];
    const usedKeys = new Set();

    // Add filters in the custom order
    orderedFilters.forEach((orderedKey) => {
      const item = baseFilters.find((filter) => filter.key === orderedKey);
      if (item) {
        orderedItems.push(item);
        usedKeys.add(orderedKey);
      }
    });

    // Add any filters that weren't in the ordered list
    baseFilters.forEach((item) => {
      if (!usedKeys.has(item.key)) {
        orderedItems.push(item);
      }
    });

    return orderedItems;
  };

  // Get visible filters in the correct order
  const getVisibleFilters = () => {
    // Create a map for quick lookup of filter objects
    const filterMap = filters.reduce((map, filter) => {
      map[filter.name] = filter;
      return map;
    }, {});

    // Get ordered visible filters
    const orderedVisibleFilters = [];

    orderedFilters.forEach((filterName) => {
      // Only include if it's active and exists in the filter map
      if (activeFilters.includes(filterName) && filterMap[filterName]) {
        orderedVisibleFilters.push(filterMap[filterName]);
      }
    });

    // Add any active filters that weren't in the ordered list
    const usedKeys = new Set(orderedVisibleFilters.map((f) => f.name));
    filters.forEach((filter) => {
      if (activeFilters.includes(filter.name) && !usedKeys.has(filter.name)) {
        orderedVisibleFilters.push(filter);
      }
    });

    console.log(
      "getVisibleFilters result:",
      orderedVisibleFilters.map((f) => f.name)
    );
    return orderedVisibleFilters;
  };

  // Get visible headers in the correct order
  const getVisibleHeaders = () => {
    // Create a map for quick lookup of header objects
    const headerMap = allHeaders.reduce((map, header) => {
      map[header.key] = header;
      return map;
    }, {});

    // Get ordered visible headers
    const orderedVisibleHeaders = [];

    orderedColumns.forEach((columnKey) => {
      // Only include if it's visible and exists in the header map
      if (
        visibleColumns.includes(columnKey) &&
        headerMap[columnKey] &&
        !headerMap[columnKey]?.hideFromTable
      ) {
        orderedVisibleHeaders.push(headerMap[columnKey]);
      }
    });

    // Add any visible headers that weren't in the ordered list
    const usedKeys = new Set(orderedVisibleHeaders.map((h) => h.key));
    allHeaders.forEach((header) => {
      if (
        visibleColumns.includes(header.key) &&
        !usedKeys.has(header.key) &&
        !header?.hideFromTable
      ) {
        orderedVisibleHeaders.push(header);
      }
    });

    return orderedVisibleHeaders;
  };

  // Handle filter toggle
  const handleFilterToggle = (filterKey) => {
    console.log("Toggling filter:", filterKey);
    setActiveFilters((prev) => {
      const newActiveFilters = prev.includes(filterKey)
        ? prev.filter((key) => key !== filterKey)
        : [...prev, filterKey];
      console.log("New activeFilters:", newActiveFilters);
      return newActiveFilters;
    });
  };

  // Handle column toggle
  const handleColumnToggle = (columnKey) => {
    console.log("Toggling column:", columnKey);
    setVisibleColumns((prev) => {
      const newVisibleColumns = prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey];
      console.log("New visibleColumns:", newVisibleColumns);
      return newVisibleColumns;
    });
  };

  // Handle filters reordering with proper debugging
  const handleFiltersReorder = (reorderedItems) => {
    const newOrder = reorderedItems.map((item) => item.key);
    console.log("Reordering filters from:", orderedFilters);
    console.log("Reordering filters to:", newOrder);

    setOrderedFilters(newOrder);

    // Force a re-render to ensure the changes are applied immediately
    setTimeout(() => {
      console.log(
        "Filter order updated. Current visible filters:",
        getVisibleFilters().map((f) => f.name)
      );
    }, 100);
  };

  // Handle columns reordering with proper debugging
  const handleColumnsReorder = (reorderedItems) => {
    const newOrder = reorderedItems.map((item) => item.key);
    console.log("Reordering columns from:", orderedColumns);
    console.log("Reordering columns to:", newOrder);

    setOrderedColumns(newOrder);
  };

  // Memoize the visible filters to prevent unnecessary re-renders
  const memoizedVisibleFilters = useMemo(() => {
    return getVisibleFilters();
  }, [orderedFilters, activeFilters, filters]);
  console.log(memoizedVisibleFilters);
  // Memoize the visible headers to prevent unnecessary re-renders
  const memoizedVisibleHeaders = useMemo(() => {
    return getVisibleHeaders();
  }, [orderedColumns, visibleColumns, allHeaders]);

  // Updated handleCellEdit to work with the common component
  const handleCellEdit = (rowIndex, columnKey, value, row, matchIndex) => {
    let updateValues = {};

    // Handle ticket_types changes
    if (columnKey === "ticket_types") {
      updateValues = {
        additional_file_type: "",
        additional_dynamic_content: "",
        qr_links: [],
        upload_tickets: [],
        paper_ticket_details: {},
      };
    }

    // Handle ticket_category changes
    if (columnKey === "ticket_category") {
      updateValues = {
        ticket_block: "",
      };
    }

    setInventoryData((prevData) =>
      prevData.map((item, index) => {
        // In edit mode, if multiple rows are selected, update all selected rows
        if (isEditMode && Array.isArray(editingRowIndex)) {
          // Bulk edit mode: update all selected rows
          if (editingRowIndex.includes(index)) {
            let updatedItem = { ...item, [columnKey]: value, ...updateValues };

            // Handle split_type and split_details interrelation for bulk edit
            if (columnKey === "split_type") {
              if (value === "6") {
                updatedItem.split_details = "27";
              } else if (item.split_details === "27") {
                updatedItem.split_details = "";
              }
            } else if (columnKey === "split_details") {
              if (item.split_type === "6" && value !== "27") {
                updatedItem.split_type = "5";
              }
            }

            return updatedItem;
          }
          return item;
        }
        // Single row edit mode: update only the specific row
        else if (index === rowIndex) {
          let data = { ...item, [columnKey]: value, ...updateValues };

          // Handle split_type and split_details interrelation for single edit
          if (columnKey === "split_type") {
            if (value === "6") {
              data.split_details = "27";
            } else if (item.split_details === "27") {
              data.split_details = "";
            }
          } else if (columnKey === "split_details") {
            if (item.split_type === "6" && value !== "27") {
              data.split_type = "5";
            }
          }

          return data;
        }
        return item;
      })
    );
  };

  const handleEdit = () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to edit");
      return;
    }
    setEditingRowIndex(selectedRows);
    setIsEditMode(true);

    // if (selectedRows.length === 1) {
    //   toast.success("Edit mode activated for selected row");
    // } else {
    //   toast.success(`Bulk edit mode activated for ${selectedRows.length} rows`);
    // }
  };

  // Function to save edit changes
  const handleSaveEdit = () => {
    setEditingRowIndex(null);
    setIsEditMode(false);
    setSelectedRows([]);

    if (Array.isArray(editingRowIndex) && editingRowIndex.length > 1) {
      toast.success(
        `Changes saved successfully for ${editingRowIndex.length} rows`
      );
    } else {
      toast.success("Changes saved successfully");
    }
  };

  // Updated the handleCancelEdit function
  const handleCancelEdit = () => {
    // Optionally restore original values here if you want to implement undo functionality
    setEditingRowIndex(null);
    setIsEditMode(false);
    setSelectedRows([]);
    toast.info("Edit cancelled");
  };

  // Action handlers for sticky columns
  const handleHandAction = (rowData, rowIndex) => {
    console.log("Hand action clicked for row:", rowData, rowIndex);
    handleCellEdit(
      rowIndex,
      "ticket_in_hand",
      !rowData?.ticket_in_hand,
      rowData
    );
  };

  const handleUploadAction = (rowData, rowIndex) => {
    console.log("Upload action clicked for row:", rowData, rowIndex);
    setShowUploadPopup({
      show: true,
      rowData,
      rowIndex,
    });
  };

  // KEEP ALL THE ORIGINAL FUNCTIONS (EXACT SAME)
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

  // Handle select all functionality
  const handleSelectAll = () => {
    const allRowIndices = inventoryData.map((_, index) => index);
    setSelectedRows(allRowIndices);
  };

  const handleDeselectAll = () => {
    setSelectedRows([]);
  };

  // KEEP ALL THE ORIGINAL FUNCTIONS (constructFormDataAsFields, handleDelete, handleClone, etc.)
  const constructFormDataAsFields = (publishingDataArray) => {
    const formData = new FormData();
    console.log(publishingDataArray, "publishingDatapublishingData");
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
        `data[${index}][ticket_block]`,
        publishingData.ticket_block || ""
      );
      formData.append(
        `data[${index}][add_price_addlist]`,
        publishingData.add_price_addlist || ""
      );
      formData.append(
        `data[${index}][add_web_price_addlist]`,
        publishingData.face_value || ""
      );

      formData.append(
        `data[${index}][max_display_qty]`,
        publishingData.max_display_qty || ""
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

      let shipDateValue = "";
      if (publishingData.ship_date) {
        if (
          typeof publishingData.ship_date === "object" &&
          publishingData.ship_date.startDate
        ) {
          shipDateValue = publishingData.ship_date.startDate;
        } else if (typeof publishingData.ship_date === "string") {
          shipDateValue = formatDateForInput(publishingData.ship_date);
        }
      }
      if (!shipDateValue) {
        shipDateValue = publishingData?.ship_date || matchDetails?.ship_date;
      }

      formData.append(`data[${index}][ship_date]`, shipDateValue);
      formData.append(
        `data[${index}][ticket_in_hand]`,
        publishingData.ticket_in_hand ? "1" : "0"
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
          detail?.value || detail
        );
      });
      formData.append(
        `data[${index}][ticket_details1]`,
        publishingData.split_details
      );

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

      if (publishingData.additional_info) {
        formData.append(
          `data[${index}][additional_file_type]`,
          publishingData.additional_info.template || ""
        );
        formData.append(
          `data[${index}][additional_dynamic_content]`,
          publishingData.additional_info.dynamicContent || ""
        );
      }

      if (publishingData?.additional_info?.templateFile) {
        // Debug: Check what you're actually trying to append

        formData.append(
          `data[${index}][additional_file]`,
          publishingData?.additional_info?.templateFile,
          "additional_file"
        );
      }

      if (publishingData.courier_type) {
        formData.append(
          `data[${index}][courier_type]`,
          publishingData.courier_type
        );
      }
      if (publishingData.courier_name) {
        formData.append(
          `data[${index}][courier_name]`,
          publishingData.courier_name
        );
      }
      if (publishingData.courier_tracking_details) {
        formData.append(
          `data[${index}][courier_tracking_details]`,
          publishingData.courier_tracking_details
        );
      }

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
      if (publishingData?.pop_upload_tickets) {
        formData.append(
          `data[${index}][pop_upload_tickets]`,
          publishingData.pop_upload_tickets?.file,
          publishingData.pop_upload_tickets?.name
        );
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
    // setSelectedRows([]);
    // toast.success(`${rowsToClone.length} row(s) cloned successfully`);
  };

  const [loader, setLoader] = useState(false);

  // Enhanced publish function to handle multiple rows
  // Enhanced publish function to handle multiple rows with price validation
  const handlePublishLive = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select rows to publish");
      return;
    }

    // Get selected rows data and validate prices
    const selectedRowsData = [];
    const invalidPriceTickets = [];

    selectedRows.forEach((index) => {
      const rowData = inventoryData[index];
      const ticketPrice = parseFloat(rowData.add_price_addlist) || 0;

      // Check if price is greater than 5
      if (ticketPrice < 5) {
        invalidPriceTickets.push({
          ticketIndex: index + 1,
          currentPrice: ticketPrice,
          rowIndex: index,
        });
      }

      selectedRowsData.push({
        match_id: matchDetails?.match_id || matchId,
        ...rowData,
      });
    });

    // If there are tickets with invalid prices, show error and return
    if (invalidPriceTickets.length > 0) {
      const errorMessage =
        invalidPriceTickets.length === 1
          ? `Cannot publish: Ticket #${invalidPriceTickets[0].ticketIndex} has a processed price of ${invalidPriceTickets[0].currentPrice}. Minimum required price is greater than 5.`
          : `Cannot publish: ${invalidPriceTickets.length} tickets have processed prices of 5 or less. All tickets must have a processed price greater than 5 to publish.`;

      toast.error(errorMessage);

      // Optional: Select only the invalid tickets to highlight them
      const invalidRowIndices = invalidPriceTickets.map(
        (ticket) => ticket.rowIndex
      );
      setSelectedRows(invalidRowIndices);

      return;
    }

    setLoader(true);
    try {
      // Construct FormData for multiple rows
      const formData = constructFormDataAsFields(selectedRowsData);
      if (selectedRows?.length > 1) {
        await saveBulkListing("", formData);
      } else {
        await saveListing("", formData);
      }

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
        if (filter.name === "ship_date") {
          // Default ship_date from matchDetails
          newItem[filter.name] = matchDetails?.ship_date || "";
        } else {
          newItem[filter.name] = filter.multiselect ? [] : "";
        }
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
  const validateMandatoryFields = () => {
    const errors = [];

    // Get all mandatory fields from filters
    const mandatoryFields = filters.filter(
      (filter) => filter.mandatory === true
    );

    // Check each mandatory field
    mandatoryFields.forEach((field) => {
      const fieldValue = filtersApplied[field.name];

      // Check if field is empty or invalid
      if (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      ) {
        errors.push({
          field: field.name,
          label: field.label,
          message: `${field.label} is required`,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  };

  // Updated handleAddListing function with mandatory validation
  const handleAddListing = () => {
    // First validate mandatory fields
    const validation = validateMandatoryFields();

    if (!validation.isValid) {
      // Show error toast with all missing mandatory fields
      const fieldNames = validation.errors
        .map((error) => error.label)
        .join(", ");
      toast.error(`Please fill in all mandatory fields: ${fieldNames}`);
      return;
    }

    // Check if any filter values are present (your existing logic)
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

    // If all validations pass, create the listing
    const newListing = createInventoryItemFromFilters();
    console.log("New listing created:", newListing);
    setInventoryData((prevData) => [...prevData, newListing]);
    setShowTable(true);

    // Show success message
  };

  const handleSearchBlur = (e) => {
    // Only check after a longer delay to allow clicks to process
    setTimeout(() => {
      const activeElement = document.activeElement;
      const searchContainer = document.querySelector(
        '[data-search-container="true"]'
      );
      const dropdown = document.querySelector(
        '[data-dropdown="search-dropdown"]'
      );

      // Check if focus is still within our components
      const isFocusInSearch =
        searchContainer && searchContainer.contains(activeElement);
      const isFocusInDropdown = dropdown && dropdown.contains(activeElement);

      // Only close if focus has moved completely outside
      if (!isFocusInSearch && !isFocusInDropdown) {
        setShowSearchDropdown(false);
      }
    }, 250); // Increased timeout
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
  const handleClickOutside = useCallback((event) => {
    // Get references to the search container and dropdown
    const searchContainer = document.querySelector(
      '[data-search-container="true"]'
    );
    const dropdown = document.querySelector(
      '[data-dropdown="search-dropdown"]'
    );

    // Check if the click is outside both the search container and dropdown
    const isOutsideSearch =
      searchContainer && !searchContainer.contains(event.target);
    const isOutsideDropdown = dropdown && !dropdown.contains(event.target);

    // Only close if click is outside both elements
    if (isOutsideSearch && isOutsideDropdown) {
      setShowSearchDropdown(false);
    }
  }, []);

  // Updated useEffect for click outside handling
  useEffect(() => {
    if (showSearchDropdown) {
      // Use capture phase to handle clicks before they bubble
      document.addEventListener("mousedown", handleClickOutside, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }
  }, [showSearchDropdown, handleClickOutside]);

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
  console.log(
    matchDetails?.match_date_format,
    "matchDetails?.match_date_format"
  );

  const StadiumLocationDisplay = ({ matchDetails = {}, className } = {}) => {
    const { stadium_name, city_name, country_name } = matchDetails;

    const locationParts = [stadium_name, city_name, country_name].filter(
      Boolean
    );

    if (!locationParts.length) return null;
    const label = locationParts.join(", ");
    return (
      <p
        className={`text-[#3a3c42] truncate ${
          isMobile ? "text-[12px] max-w-[200px]" : "text-[14px]"
        } ${className}`.trim()}
        title={label}
      >
        {label}
      </p>
    );
  };

  return (
    <div className="bg-[#F5F7FA] w-full max-md:pb-[150px] max-h-[calc(100vh-100px)] overflow-auto relative min-h-screen">
      {/* Header with selected match info */}
      <ViewMapPopup
        image={matchDetails?.venue_image}
        stadiumName={matchDetails?.stadium_name}
        onClose={() => setShowViewPopup(false)}
        show={showViewPopup}
        blockData={response?.block_data}
        blockDataColor={response?.block_data_color}
      />
      <div className="bg-white">
        <div className="border-b-[1px] p-3 sm:p-4 lg:p-5 border-[#E0E1EA] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-5">
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-5">
            <FloatingLabelInput
              key="searchMatch"
              id="searchMatch"
              name="searchMatch"
              keyValue={"searchMatch"}
              value={searchValue}
              checkLength={true}
              onChange={(e) => handleOnChangeEvents(e)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              type="text"
              showDropdown={showSearchDropdown}
              iconBefore={<SearchIcon size={isMobile ? 14 : 16} />}
              iconBeforeTooltip="Search"
              dropDownComponent={
                <div data-dropdown="search-dropdown">
                  <SearchedViewComponent
                    searchEventLoader={searchEventLoader}
                    searchedEvents={searchedEvents}
                    hasSearched={hasSearched}
                    searchValue={searchValue}
                    handleSearchedEventClick={handleSearchedEventClick}
                    show={showRequestPopup}
                    setShow={setShowRequestPopup}
                    handleBulkNavigateClick={handleBulkNavigateClick}
                    onItemSelect={() => setShowSearchDropdown(false)}
                  />
                </div>
              }
              label="Choose Match Event"
              className={`!py-[8px] !text-[#323A70] ${
                isMobile ? "!text-[12px]" : "!text-[14px]"
              } ${searchValue.length <= 3 && "!pl-[44px]"}`}
              paddingClassName=""
              autoComplete="off"
              showDelete={true}
              deleteFunction={() => {
                setSearchValue("");
                setShowSearchDropdown(false);
                setHasSearched(false);
              }}
              parentClassName={`${isMobile ? "!w-full" : "!w-[40%]"}`}
              data-search-container="true"
              labelClassName="text-[#7D82A4]"
            />

            {matchDetails && (
              <div
                className={`flex ${
                  isMobile ? "flex-col gap-2" : "gap-4"
                } items-start ${isMobile ? "" : "sm:items-center"}`}
              >
                <div
                  className={`flex ${
                    isMobile ? "flex-wrap gap-2" : "gap-4"
                  } items-center`}
                >
                  <div
                    className={`flex gap-2 items-center ${
                      isMobile ? "" : "pr-4 border-r-[1px] border-[#DADBE5]"
                    }`}
                  >
                    <Calendar1Icon
                      size={isMobile ? 14 : 16}
                      className="text-[#343432]"
                    />
                    <p
                      className={`text-[#3a3c42] truncate ${
                        isMobile ? "text-[12px]" : "text-[14px]"
                      }`}
                    >
                      {addDayOfWeek(matchDetails?.match_date_format)}
                    </p>
                  </div>
                  <div
                    className={`flex gap-2 items-center ${
                      isMobile ? "" : "pr-4 border-r-[1px] border-[#DADBE5]"
                    }`}
                  >
                    <Clock
                      size={isMobile ? 14 : 16}
                      className="text-[#343432]"
                    />
                    <p
                      className={`text-[#3a3c42] truncate ${
                        isMobile ? "text-[12px]" : "text-[14px]"
                      }`}
                    >
                      {matchDetails?.match_time}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <MapPin
                      size={isMobile ? 14 : 16}
                      className="text-[#343432]"
                    />
                    {StadiumLocationDisplay({ matchDetails })}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div
            className={`flex items-center ${
              isMobile ? "w-full justify-between" : "gap-4"
            }`}
          >
            {matchDetails && (
              <p
                onClick={() => setShowViewPopup(true)}
                className={`${
                  isMobile ? "text-[12px]" : "text-[13px]"
                } whitespace-nowrap font-semibold text-[#343432] cursor-pointer hover:underline ${
                  isMobile ? "mr-3" : "mr-6"
                }`}
              >
                View Map
              </p>
            )}

            {/* {isMobile && (
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-[#4285F4] text-white rounded-md text-sm font-medium hover:bg-[#3367D6] transition-colors"
              >
                <Menu size={14} />
                {showMobileFilters ? "Hide Filters" : "Show Filters"}
              </button>
            )} */}

            {/* Move FilterColumnControls here - in the header but after View Map */}
            {!isMobile && (
              <FilterColumnControls
                // Filter props
                showFilters={true}
                availableFilters={getAvailableFilters()}
                onFilterToggle={handleFilterToggle}
                onFiltersReorder={handleFiltersReorder}
                isDraggableFilters={true}
                showFilterSearch={true}
                // Column props
                showColumns={true}
                availableColumns={getAvailableColumns()}
                onColumnToggle={handleColumnToggle}
                onColumnsReorder={handleColumnsReorder}
                isDraggableColumns={true}
                showColumnSearch={true}
                // Container props - Updated positioning
                className="flex gap-2"
              />
            )}
          </div>
        </div>

        {/* Rest of your component remains the same */}
        {matchDetails && (
          <>
            <div
              className={`border-b-[1px] border-[#DADBE5] p-3 sm:p-4 lg:p-5 ${
                isMobile && !showMobileFilters ? "hidden" : ""
              }`}
            >
              <div className="flex items-center justify-between max-md:w-full">
                <div
                  className={`flex  max-md:w-full ${
                    isMobile ? "flex-col gap-3" : "flex-wrap gap-5"
                  } items-start ${isMobile ? "" : "sm:items-center"}`}
                >
                  <FormFields
                    key={`form-fields-${orderedFilters.join("-")}`}
                    formFields={memoizedVisibleFilters}
                    filtersApplied={filtersApplied}
                    setFiltersApplied={setFiltersApplied}
                  />
                </div>
              </div>
            </div>
            {/* {inventoryData.length === 0 && ( */}
            <div
              className={`flex ${
                isMobile ? "justify-center" : "justify-end"
              } px-3 sm:px-4 lg:px-5 py-2 border-b-[1px] border-[#E0E1EA]`}
            >
              <Button
                type="primary"
                classNames={{
                  root: `${isMobile ? "px-6 py-3" : "px-4 py-2.5"}`,
                  label_: `${isMobile ? "text-base" : "text-sm"} font-medium`,
                }}
                onClick={handleAddListing}
                label="+ Add Listings"
              />
            </div>
            {/* )} */}
          </>
        )}
      </div>

      {/* Main Content Area with Common Table - Only show when table should be visible */}
      {matchDetails && showTable && inventoryData.length > 0 && (
        <div
          className={`${
            isMobile ? "m-3" : "m-4 lg:m-6"
          } pb-[100px] bg-white rounded-lg shadow-sm`}
        >
          <div>
            <CommonInventoryTable
              key={`inventory-table-${orderedColumns.join("-")}`} // Force re-render when order changes
              inventoryData={inventoryData}
              headers={memoizedVisibleHeaders}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              handleCellEdit={handleCellEdit}
              handleHandAction={handleHandAction}
              handleUploadAction={handleUploadAction}
              handleSelectAll={handleSelectAll}
              handleDeselectAll={handleDeselectAll}
              matchDetails={matchDetails}
              isEditMode={isEditMode}
              filters={response}
              editingRowIndex={editingRowIndex}
              mode="single"
              defaultOpen={true}
              showAccordion={true}
              isCollapsed={isTableCollapsed}
              onToggleCollapse={handleToggleCollapse}
              getStickyColumnsForRow={getStickyColumnsForRow}
              stickyHeaders={["", "", ""]}
              stickyColumnsWidth={120}
            />
          </div>
        </div>
      )}

      {/* Show message when no listings have been added yet */}
      {matchDetails && !showTable && (
        <div
          className={`${
            isMobile ? "m-3" : "m-4 lg:m-6"
          } bg-white rounded-lg shadow-sm ${
            isMobile ? "p-6" : "p-12"
          } text-center`}
        >
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <svg
                className={`mx-auto ${
                  isMobile ? "h-12 w-12" : "h-16 w-16"
                } text-gray-400`}
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
            <h3
              className={`${
                isMobile ? "text-lg" : "text-xl"
              } font-semibold text-gray-900 mb-3`}
            >
              No listings added yet
            </h3>
            <p
              className={`text-gray-600 mb-6 leading-relaxed ${
                isMobile ? "text-sm" : ""
              }`}
            >
              Select your filter preferences above and click "Add Listings" to
              create your first inventory item.
            </p>
            <p className={`text-gray-500 ${isMobile ? "text-xs" : "text-sm"}`}>
              The table will appear once you add your first listing with the
              selected filter values.
            </p>
          </div>
        </div>
      )}
      {showUploadPopup?.show && (
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
      )}

      {showMarketPlaceModal && (
        <ListingsMarketplace
          show={showMarketPlaceModal}
          onClose={() => setShowMarketPlaceModal(false)}
          matchInfo={matchDetails}
        />
      )}

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
        <RequestEvent
          show={showRequestPopup}
          onClose={() => setShowRequestPopup(false)}
        />
      )}
    </div>
  );
};

export default AddInventoryPage;
