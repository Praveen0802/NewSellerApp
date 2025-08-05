import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import oneHand from "../../../public/onehand.svg";
import greenHand from "../../../public/greenhand.svg";
import uploadListing from "../../../public/uploadlisting.svg";
import Button from "../commonComponents/button";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import Image from "next/image";
import FloatingLabelInput from "../floatinginputFields";
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
  HardDriveUpload,
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import UploadTickets from "../ModalComponents/uploadTickets";
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
import RightViewModal from "../commonComponents/rightViewModal";
import TicketListingQuality from "../TicketInfoPopup";
import CompactInfoCard from "../CompactInfoCard";
import SubjectDescriptionPopup from "../settingPage/subjectDescriptionPopup";
import ListingsMarketplace from "../ModalComponents/listSalesModal";
import ViewMapPopup from "../addInventoryPage/ViewMapPopup";
import BulkActionBar from "../addInventoryPage/bulkActionBar";
import CommonInventoryTable from "../addInventoryPage/customInventoryTable";
import Tooltip from "../addInventoryPage/simmpleTooltip";

const BulkInventory = (props) => {
  const { matchId, response } = props;
  console.log(response, "responseresponseresponse");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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

  // Handle multiple matches
  const allMatchDetails = response?.match_data || [];

  // Modify inventory data structure to handle multiple matches
  const [inventoryDataByMatch, setInventoryDataByMatch] = useState(() => {
    return allMatchDetails.reduce((acc, match) => {
      acc[match.match_id] = [];
      return acc;
    }, {});
  });

  // MODIFIED: Single global selection state that tracks tickets across all matches
  const [globalSelectedTickets, setGlobalSelectedTickets] = useState([]);

  // MODIFIED: Single global edit mode state
  const [globalEditingTickets, setGlobalEditingTickets] = useState([]);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);

  // Create flat ticket list with match info and unique IDs
  const createFlatTicketList = useMemo(() => {
    const flatList = [];
    Object.entries(inventoryDataByMatch).forEach(([matchId, tickets]) => {
      const matchDetails = allMatchDetails.find(
        (m) => m.match_id.toString() === matchId
      );
      tickets.forEach((ticket, index) => {
        flatList.push({
          ...ticket,
          uniqueId: `${matchId}_${index}`, // Unique identifier for global selection
          matchId: matchId,
          matchName: matchDetails?.match_name || "",
          matchDate: matchDetails?.match_date_format || "",
          matchTime: matchDetails?.match_time || "",
          venue: matchDetails?.stadium_name || "",
          originalIndex: index, // Keep track of original position in match
        });
      });
    });
    return flatList;
  }, [inventoryDataByMatch, allMatchDetails]);

  // MODIFIED: Convert uniqueId-based selection to match-specific row indices for each table
  const getSelectedRowsForMatch = (matchId) => {
    const selectedRows = [];
    globalSelectedTickets.forEach((uniqueId) => {
      const [ticketMatchId, originalIndex] = uniqueId.split("_");
      if (ticketMatchId === matchId.toString()) {
        selectedRows.push(parseInt(originalIndex));
      }
    });
    return selectedRows;
  };

  // MODIFIED: Handle row selection for individual match tables
  const handleSetSelectedRowsForMatch = (matchId, newSelectedRows) => {
    // Remove existing selections for this match
    const filteredGlobalSelection = globalSelectedTickets.filter((uniqueId) => {
      const [ticketMatchId] = uniqueId.split("_");
      return ticketMatchId !== matchId.toString();
    });

    // Add new selections for this match
    const newGlobalSelections = newSelectedRows.map(
      (rowIndex) => `${matchId}_${rowIndex}`
    );

    setGlobalSelectedTickets([
      ...filteredGlobalSelection,
      ...newGlobalSelections,
    ]);
  };

  // MODIFIED: Global selection handlers
  const handleGlobalSelectAll = () => {
    const allTicketIds = createFlatTicketList.map((ticket) => ticket.uniqueId);
    setGlobalSelectedTickets(allTicketIds);
  };

  const handleGlobalDeselectAll = () => {
    setGlobalSelectedTickets([]);
  };

  // MODIFIED: Handle select all for specific match
  const handleSelectAllForMatch = (matchId) => {
    const matchInventory = inventoryDataByMatch[matchId] || [];
    const allRowIndices = matchInventory.map((_, index) => index);
    handleSetSelectedRowsForMatch(matchId, allRowIndices);
  };

  // MODIFIED: Handle deselect all for specific match
  const handleDeselectAllForMatch = (matchId) => {
    handleSetSelectedRowsForMatch(matchId, []);
  };

  // MODIFIED: Global edit handlers
  const handleGlobalEdit = () => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to edit");
      return;
    }

    setGlobalEditingTickets(globalSelectedTickets);
    setIsGlobalEditMode(true);

    if (globalSelectedTickets.length === 1) {
      toast.success("Edit mode activated for selected ticket");
    } else {
      toast.success(
        `Bulk edit mode activated for ${globalSelectedTickets.length} tickets`
      );
    }
  };

  const handleGlobalSaveEdit = () => {
    setGlobalEditingTickets([]);
    setIsGlobalEditMode(false);
    setGlobalSelectedTickets([]);

    if (globalEditingTickets.length > 1) {
      toast.success(
        `Changes saved successfully for ${globalEditingTickets.length} tickets`
      );
    } else {
      toast.success("Changes saved successfully");
    }
  };

  const handleGlobalCancelEdit = () => {
    setGlobalEditingTickets([]);
    setIsGlobalEditMode(false);
    setGlobalSelectedTickets([]);
    toast.info("Edit cancelled");
  };

  // MODIFIED: Check if a specific ticket is in edit mode
  const isTicketInEditMode = (matchId, rowIndex) => {
    const uniqueId = `${matchId}_${rowIndex}`;
    return isGlobalEditMode && globalEditingTickets.includes(uniqueId);
  };

  // MODIFIED: Global cell edit handler - Fixed to work across all matches
  const handleGlobalCellEdit = (matchId, rowIndex, columnKey, value, row) => {
    console.log("Global cell edited:", { matchId, rowIndex, columnKey, value });

    let updateValues = {};
    if (columnKey === "ticket_types") {
      updateValues = {
        additional_file_type: "",
        additional_dynamic_content: "",
        qr_links: [],
        upload_tickets: [],
        paper_ticket_details: {},
      };
    }

    if (isGlobalEditMode && globalEditingTickets.length > 0) {
      // In global edit mode, update ALL selected tickets across ALL matches
      setInventoryDataByMatch((prevData) => {
        const newData = { ...prevData };

        // Group editing tickets by match for efficient updates
        const ticketsByMatch = {};
        globalEditingTickets.forEach((uniqueId) => {
          const [ticketMatchId, originalIndex] = uniqueId.split("_");
          const index = parseInt(originalIndex);
          if (!ticketsByMatch[ticketMatchId]) {
            ticketsByMatch[ticketMatchId] = [];
          }
          ticketsByMatch[ticketMatchId].push(index);
        });

        // Update tickets in each match that are in edit mode
        Object.entries(ticketsByMatch).forEach(([editMatchId, indices]) => {
          if (newData[editMatchId]) {
            newData[editMatchId] = newData[editMatchId].map((item, index) => {
              if (indices.includes(index)) {
                return { ...item, [columnKey]: value, ...updateValues };
              }
              return item;
            });
          }
        });

        return newData;
      });
    } else {
      // Single ticket edit mode - only update the specific ticket
      setInventoryDataByMatch((prevData) => ({
        ...prevData,
        [matchId]: prevData[matchId].map((item, index) => {
          if (index === rowIndex) {
            return { ...item, [columnKey]: value, ...updateValues };
          }
          return item;
        }),
      }));
    }
  };

  // Action handlers for individual match mode
  const handleHandAction = (rowData, rowIndex, matchId) => {
    console.log("Hand action clicked for row:", rowData, rowIndex, matchId);
    handleGlobalCellEdit(
      matchId,
      rowIndex,
      "tickets_in_hand",
      !rowData?.tickets_in_hand,
      rowData
    );
  };

  const handleUploadAction = (rowData, rowIndex, matchId) => {
    console.log("Upload action clicked for row:", rowData, rowIndex, matchId);
    const matchDetails = allMatchDetails.find(
      (m) => m.match_id.toString() === matchId.toString()
    );
    setShowUploadPopup({
      show: true,
      rowData,
      rowIndex,
      matchId,
      matchDetails,
    });
  };

  // MODIFIED: Global bulk actions
  const handleGlobalDelete = () => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to delete");
      return;
    }

    console.log("Deleting selected tickets:", globalSelectedTickets);

    // Group tickets by match for deletion
    const ticketsByMatch = {};
    globalSelectedTickets.forEach((uniqueId) => {
      const [matchId, originalIndex] = uniqueId.split("_");
      const index = parseInt(originalIndex);
      if (!ticketsByMatch[matchId]) {
        ticketsByMatch[matchId] = [];
      }
      ticketsByMatch[matchId].push(index);
    });

    // Delete tickets from each match
    setInventoryDataByMatch((prevData) => {
      const newData = { ...prevData };
      Object.entries(ticketsByMatch).forEach(([matchId, indices]) => {
        // Sort indices in descending order to avoid index shifting issues
        const sortedIndices = indices.sort((a, b) => b - a);
        newData[matchId] = [...prevData[matchId]];
        sortedIndices.forEach((index) => {
          newData[matchId].splice(index, 1);
        });
      });
      return newData;
    });

    setGlobalSelectedTickets([]);
    toast.success(
      `${globalSelectedTickets.length} ticket(s) deleted successfully`
    );
  };

  const handleGlobalClone = () => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to clone");
      return;
    }

    console.log("Cloning selected tickets:", globalSelectedTickets);

    // Group tickets by match for cloning
    const ticketsByMatch = {};
    globalSelectedTickets.forEach((uniqueId) => {
      const [matchId, originalIndex] = uniqueId.split("_");
      const index = parseInt(originalIndex);
      if (!ticketsByMatch[matchId]) {
        ticketsByMatch[matchId] = [];
      }
      ticketsByMatch[matchId].push(index);
    });

    // Clone tickets in each match
    setInventoryDataByMatch((prevData) => {
      const newData = { ...prevData };
      Object.entries(ticketsByMatch).forEach(([matchId, indices]) => {
        const ticketsToClone = indices.map((index) => prevData[matchId][index]);
        const clonedTickets = ticketsToClone.map((ticket) => ({
          ...ticket,
          id: Date.now() + Math.random(),
          upload_tickets: [],
          additional_file_type: "",
          additional_dynamic_content: "",
          qr_links: [],
          paper_ticket_details: {},
        }));
        newData[matchId] = [...prevData[matchId], ...clonedTickets];
      });
      return newData;
    });

    setGlobalSelectedTickets([]);
    toast.success(
      `${globalSelectedTickets.length} ticket(s) cloned successfully`
    );
  };

  const [loader, setLoader] = useState(false);

  // MODIFIED: Global publish function
  const handleGlobalPublishLive = async () => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to publish");
      return;
    }

    setLoader(true);

    try {
      // Collect all selected tickets with their match details
      const selectedTicketsData = [];

      globalSelectedTickets.forEach((uniqueId) => {
        const [matchId, originalIndex] = uniqueId.split("_");
        const index = parseInt(originalIndex);
        const matchDetails = allMatchDetails.find(
          (m) => m.match_id.toString() === matchId
        );
        const ticketData = inventoryDataByMatch[matchId][index];

        if (ticketData && matchDetails) {
          selectedTicketsData.push({
            match_id: matchDetails.match_id,
            add_pricetype_addlist: matchDetails.price_type || "EUR",
            ...ticketData,
          });
        }
      });

      const formData = constructFormDataAsFields(selectedTicketsData);

      if (selectedTicketsData.length > 1) {
        await saveBulkListing("", formData);
      } else {
        await saveAddListing("", formData);
      }

      router.push("/my-listings?success=true");
      toast.success(
        `${selectedTicketsData.length} listing(s) published successfully`
      );
      setLoader(false);
    } catch (error) {
      console.error("Error publishing listings:", error);
      toast.error("Error in publishing listing");
      setLoader(false);
    }
  };

  const [searchEventLoader, setSearchEventLoader] = useState(false);
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [showViewPopup, setShowViewPopup] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const router = useRouter();

  const [filtersApplied, setFiltersApplied] = useState({});
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [blockDetailsByCategory, setBlockDetailsByCategory] = useState({});
  const [blockData, setBlockData] = useState([]);
  const filterButtonRef = useRef(null);
  const columnButtonRef = useRef(null);

  const [showTicketInfoPopup, setShowTicketInfoPopup] = useState(false);

  // Enhanced block details fetching for multiple matches
  const getBlockDetails = async (matchId) => {
    try {
      const getBlockData = await fetchBlockDetails("", {
        match_id: matchId,
        category_id: filtersApplied?.ticket_category,
      });
      const blockData = getBlockData?.map((item) => ({
        label: item?.block_id,
        value: item?.id,
      }));

      setBlockDetailsByCategory((prev) => ({
        ...prev,
        [`${matchId}_${filtersApplied?.ticket_category}`]: blockData,
      }));
      setBlockData(blockData);
    } catch (error) {
      console.error("Error fetching block details:", error);
      setBlockDetailsByCategory((prev) => ({
        ...prev,
        [`${matchId}_${filtersApplied?.ticket_category}`]: [],
      }));
    }
  };

  useEffect(() => {
    if (filtersApplied?.ticket_category) {
      allMatchDetails.forEach((match) => {
        getBlockDetails(match.match_id);
      });
    }
  }, [filtersApplied?.ticket_category]);

  // Get block details for specific match
  const getBlockDetailsForMatch = (matchId) => {
    return (
      blockDetailsByCategory[`${matchId}_${filtersApplied?.ticket_category}`] ||
      []
    );
  };

  // KEEP THE ORIGINAL formatDateForInput function (EXACT SAME)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    try {
      let date;
      if (
        typeof dateString === "string" &&
        dateString.match(/^\d{1,2}\s\w+\s\d{4}$/)
      ) {
        date = new Date(dateString);
      } else if (dateString instanceof Date) {
        date = dateString;
      } else if (
        typeof dateString === "string" &&
        dateString.match(/^\d{4}-\d{2}-\d{2}$/)
      ) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }

      if (isNaN(date.getTime())) {
        return "";
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // KEEP THE ORIGINAL filters array construction (EXACT SAME)
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
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
      options: [
        { value: "1", label: "1" },
        { value: "2", label: "2" },
        { value: "3", label: "3" },
        { value: "4", label: "4" },
        { value: "5", label: "5" },
      ],
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, add_qty_addlist: value?.target?.value })),
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
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          split_type: e,
        })),
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, split_details: value })),
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
      parentClassName:
        "flex-shrink flex-basis-[200px] flex-grow max-w-[212px] sm:max-w-[160px] lg:max-w-[212px]",
      className:
        "!py-[9px] !px-[12px] w-full text-xs sm:text-[10px] lg:text-xs",
      labelClassName: "!text-[11px] sm:!text-[10px] lg:!text-[11px]",
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          max_display_qty: e?.target?.value,
        })),
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
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
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
      increasedWidth: "!w-[180px] !min-w-[180px]",
      value: filtersApplied?.ticket_category,
      options: Object.entries(block_data || {}).map(([key, value]) => ({
        value: key,
        label: value,
      })),
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
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
      value: filtersApplied?.ticket_block,
      options: blockData, // Will be dynamically populated per match
      disabled: !filtersApplied?.ticket_category,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[10px] w-full mobile:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
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
      className: "!py-[10px] w-full mobile:text-xs",
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
      value: filtersApplied?.face_value,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs">
            {allMatchDetails[0]?.currency_icon?.[0] || "$"}
          </p>
        </div>
      ),
      className: "!py-[10px] w-full mobile:text-xs",
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
      mandatory: true,
      value: filtersApplied?.add_price_addlist,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      iconBefore: (
        <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
          <p className="text-xs">
            {allMatchDetails[0]?.currency_icon?.[0] || "$"}
          </p>
        </div>
      ),
      className: "!py-[10px] w-full mobile:text-xs",
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
      label: "Benefits",
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
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
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
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[9px] !px-[12px] w-full mobile:text-xs",
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
        startDate: allMatchDetails[0]?.ship_date,
        endDate: allMatchDetails[0]?.ship_date,
      },
      minDate: new Date().toISOString().split("T")[0],
      maxDate: allMatchDetails[0]?.ship_date,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      singleDateMode: true,
      className: "!py-[10px] !px-[12px] w-full mobile:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      onChange: (value) =>
        setFiltersApplied((prev) => ({ ...prev, ship_date: value })),
    },
    {
      type: "checkbox",
      name: "tickets_in_hand",
      label: "Tickets In Hand",
      value: filtersApplied?.tickets_in_hand || false,
      parentClassName: "flex-shrink flex-basis-[200px] flex-grow max-w-[212px]",
      className: "!py-[4px] !px-[12px] w-full mobile:text-xs",
      labelClassName:
        "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
      hideFromTable: true,
      onChange: (e) =>
        setFiltersApplied((prev) => ({
          ...prev,
          tickets_in_hand: e?.target?.checked,
        })),
    },
  ];

  // KEEP THE ORIGINAL allHeaders generation (EXACT SAME)
  const allHeaders = filters.map((filter) => {
    const baseHeader = {
      increasedWidth: filter.increasedWidth || "",
      key: filter.name,
      label: filter.label,
      editable: filter.editable !== false, // Default to true unless explicitly false
      type: filter.type || "text",
      options: filter.options || [],
      showIcon: filter?.showIcon,
      hideFromTable: filter?.hideFromTable,
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

  // Headers for split view (hide match-specific columns since each table shows one match)
  const headers = useMemo(() => {
    return allHeaders.filter(
      (header) => visibleColumns.includes(header.key) && !header?.hideFromTable
    );
  }, [allHeaders, visibleColumns]);

  const getActiveFilters = () => {
    const activeFiltersList = filters.filter((filter) =>
      activeFilters.includes(filter.name)
    );
    return activeFiltersList;
  };

  // Custom sticky columns configuration
  // Custom sticky columns configuration
  const getStickyColumnsForRow = (rowData, rowIndex, matchId) => {
    // Check if we're in global bulk edit mode with multiple tickets selected
    const isBulkEditMode = isGlobalEditMode && globalEditingTickets.length > 1;

    return [
      {
        key: "",
        toolTipContent: "Tickets In Hand",
        icon: (
          <Tooltip content="Tickets In Hand">
            <Image
              src={rowData?.tickets_in_hand ? greenHand : oneHand}
              alt="tick"
              width={16}
              height={16}
              className={`${
                rowData?.tickets_in_hand ? "text-green-500" : "text-gray-400"
              } cursor-pointer hover:text-blue-500 transition-colors`}
              onClick={() => handleHandAction(rowData, rowIndex, matchId)}
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
              width={16}
              height={16}
              className={`${
                isBulkEditMode
                  ? "cursor-not-allowed opacity-50 grayscale"
                  : "cursor-pointer hover:text-blue-500 transition-colors"
              }`}
              onClick={() => {
                if (!isBulkEditMode) {
                  handleUploadAction(rowData, rowIndex, matchId);
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
                    rowIndex,
                    matchId
                  );
                }
              }}
              className={`w-[16px] h-[16px] ${
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

  // KEEP ALL ORIGINAL FUNCTIONS (form data construction, validation, etc.)
  const constructFormDataAsFields = (publishingDataArray) => {
    const formData = new FormData();

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

    publishingDataArray.forEach((publishingData, index) => {
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
        const matchDetails = allMatchDetails.find(
          (m) => m.match_id.toString() === publishingData.match_id?.toString()
        );
        shipDateValue = formatDateForInput(matchDetails?.ship_date);
      }

      formData.append(`data[${index}][ship_date]`, shipDateValue);
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
        publishingData.match_id || ""
      );
      formData.append(
        `data[${index}][add_pricetype_addlist]`,
        publishingData.add_pricetype_addlist || "EUR"
      );
      formData.append(`data[${index}][event]`, publishingData.event || "E");
      formData.append(
        `data[${index}][max_display_qty]`,
        publishingData.max_display_qty || ""
      );

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

  // Function to create inventory item from filter values
  const createInventoryItemFromFilters = () => {
    const newItem = {
      id: Date.now() + Math.random(),
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
          newItem[filter.name] = filtersApplied?.ship_date?.startDate || "";
          ("");
        } else {
          newItem[filter.name] = filter.multiselect ? [] : "";
        }
      }
    });

    newItem.additional_file_type = "";
    newItem.additional_dynamic_content = "";
    newItem.qr_links = [];
    newItem.upload_tickets = [];
    newItem.paper_ticket_details = {};

    return newItem;
  };

  // Validation function
  const validateMandatoryFields = () => {
    const errors = [];
    const mandatoryFields = filters.filter(
      (filter) => filter.mandatory === true
    );

    mandatoryFields.forEach((field) => {
      const fieldValue = filtersApplied[field.name];

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
console.log(validateMandatoryFields(),'validateMandatoryFieldsvalidateMandatoryFieldsvalidateMandatoryFields')
  // Add listings to all matches at once
  const handleAddListings = () => {
    const validation = validateMandatoryFields();

    if (!validation.isValid) {
      const fieldNames = validation.errors
        .map((error) => error.label)
        .join(", ");
      toast.error(`Please fill in all mandatory fields: ${fieldNames}`);
      return;
    }

    const hasFilterValues = Object.values(filtersApplied).some((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value && value.toString().trim() !== "";
    });

    if (!hasFilterValues) {
      toast.error(
        "Please select at least one filter value before adding listings."
      );
      return;
    }

    // Add listings to all matches
    const updatedInventoryData = {};
    allMatchDetails.forEach((match) => {
      const newListing = createInventoryItemFromFilters();
      updatedInventoryData[match.match_id] = [
        ...(inventoryDataByMatch[match.match_id] || []),
        newListing,
      ];
    });

    setInventoryDataByMatch((prev) => ({
      ...prev,
      ...updatedInventoryData,
    }));
  };

  // Handle confirm click for upload popup
  const handleConfirmClick = (data, index) => {
    const { matchId } = showUploadPopup;
    setInventoryDataByMatch((prev) => ({
      ...prev,
      [matchId]: prev[matchId].map((item, i) =>
        i === index ? { ...item, ...data } : item
      ),
    }));
    setShowUploadPopup({
      show: false,
      rowData: null,
      rowIndex: null,
      matchId: null,
      matchDetails: null,
    });
  };

  // Calculate total tickets across all matches
  const getTotalTicketCount = () => {
    return Object.values(inventoryDataByMatch).reduce(
      (total, tickets) => total + tickets.length,
      0
    );
  };

  const totalTicketCount = getTotalTicketCount();

  const handleCloseTicketInfoPopup = () => {
    setShowTicketInfoPopup(false);
  };

  const handleOpenTicketInfoPopup = () => {
    setShowTicketInfoPopup(true);
  };

  const [showRequestPopup, setShowRequestPopup] = useState(false);

  return (
    <div className="bg-[#F5F7FA] w-full max-h-[calc(100vh-100px)] overflow-auto relative min-h-screen">
      {/* Header with selected match info */}
      <ViewMapPopup
        image={allMatchDetails[0]?.venue_image}
        stadiumName={allMatchDetails[0]?.stadium_name}
        onClose={() => setShowViewPopup(false)}
        show={showViewPopup}
        blockData={response?.block_data}
        blockDataColor={response?.block_data_color}
      />

      <div className="bg-white">
        <div className="border-b-[1px] p-5 border-[#E0E1EA] flex justify-between items-center">
          <div className="w-full flex items-center gap-5">
            <div className="text-lg font-semibold text-[#323A70]">
              Bulk Inventory Management
            </div>

            {allMatchDetails.length > 0 && (
              <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center pr-4 border-r-[1px] border-[#DADBE5]">
                  <span className="text-[#3a3c42] truncate text-[14px]">
                    {allMatchDetails.length} Match(es) • {totalTicketCount}{" "}
                    Ticket(s)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {allMatchDetails.length > 0 && (
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
          </div>
        </div>

        {allMatchDetails.length > 0 && (
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

            {/* Add Listings Button - applies to all matches */}
            {totalTicketCount === 0 && (
              <div className="flex justify-end px-5 py-2 border-b-[1px] border-[#E0E1EA]">
                <Button
                  type="primary"
                  classNames={{
                    root: "px-4 py-2.5",
                    label_: "text-sm font-medium",
                  }}
                  onClick={handleAddListings}
                  label="+ Add Listings"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content Area - Split Mode Only */}
      {allMatchDetails.length > 0 && totalTicketCount > 0 && (
        <div
          // style={{ maxHeight: "calc(100vh - 450px)", overflowY: "auto" }}
          className="m-6 pb-[150px] rounded-lg shadow-sm"
        >
          <div>
            {/* Individual Match Accordions (Separate Tables) */}
            {allMatchDetails.map((matchDetails) => {
              const matchId = matchDetails.match_id;
              const inventoryData = inventoryDataByMatch[matchId] || [];

              if (inventoryData.length === 0) return null;

              return (
                <div key={matchId} className="mb-4 last:mb-0">
                  <CommonInventoryTable
                    inventoryData={inventoryData}
                    headers={headers}
                    // Use global selection converted to match-specific indices
                    selectedRows={getSelectedRowsForMatch(matchId)}
                    setSelectedRows={(newSelectedRows) =>
                      handleSetSelectedRowsForMatch(matchId, newSelectedRows)
                    }
                    handleCellEdit={(rowIndex, columnKey, value, row) =>
                      handleGlobalCellEdit(
                        matchId,
                        rowIndex,
                        columnKey,
                        value,
                        row
                      )
                    }
                    handleHandAction={(rowData, rowIndex) =>
                      handleHandAction(rowData, rowIndex, matchId)
                    }
                    handleUploadAction={(rowData, rowIndex) =>
                      handleUploadAction(rowData, rowIndex, matchId)
                    }
                    defaultOpen={true}
                    handleSelectAll={() => handleSelectAllForMatch(matchId)}
                    handleDeselectAll={() => handleDeselectAllForMatch(matchId)}
                    matchDetails={matchDetails}
                    // Use global edit mode but check per ticket
                    isEditMode={isGlobalEditMode}
                    editingRowIndex={
                      isGlobalEditMode
                        ? inventoryData
                            .map((_, index) =>
                              isTicketInEditMode(matchId, index) ? index : null
                            )
                            .filter((index) => index !== null)
                        : null
                    }
                    mode="multiple"
                    showAccordion={true}
                    isCollapsed={false}
                    onToggleCollapse={() => {}}
                    matchIndex={matchId}
                    totalTicketsCount={inventoryData.length}
                    getStickyColumnsForRow={(rowData, rowIndex) =>
                      getStickyColumnsForRow(rowData, rowIndex, matchId)
                    }
                    stickyHeaders={["", "", ""]}
                    stickyColumnsWidth={120}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show message when no matches are available */}
      {allMatchDetails.length === 0 && (
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
              No matches available
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              There are no matches available for bulk inventory management.
            </p>
          </div>
        </div>
      )}

      {/* Show message when no tickets added yet */}
      {allMatchDetails.length > 0 && totalTicketCount === 0 && (
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
              create listings for all {allMatchDetails.length} matches.
            </p>
            <p className="text-sm text-gray-500">
              The table will appear once you add your first listing with the
              selected filter values.
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
            matchDetails: null,
          });
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

      {/* Single Global Bulk Action Bar - Only show when tickets are selected */}
      {globalSelectedTickets.length > 0 && (
        <BulkActionBar
          selectedCount={globalSelectedTickets.length}
          totalCount={totalTicketCount}
          onSelectAll={handleGlobalSelectAll}
          onDeselectAll={handleGlobalDeselectAll}
          onClone={handleGlobalClone}
          onEdit={handleGlobalEdit}
          onDelete={handleGlobalDelete}
          onPublishLive={handleGlobalPublishLive}
          onSaveEdit={handleGlobalSaveEdit}
          onCancelEdit={handleGlobalCancelEdit}
          loading={loader}
          disabled={globalSelectedTickets.length === 0}
          isEditMode={isGlobalEditMode}
        />
      )}

      {showRequestPopup && (
        <SubjectDescriptionPopup
          show={showRequestPopup}
          onClose={() => setShowRequestPopup(false)}
        />
      )}
    </div>
  );
};

export default BulkInventory;
