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
  SearchIcon,
  HardDriveUpload,
  SquareCheck,
} from "lucide-react";
import {
  FetchEventSearch,
  FetchPerformerOrVenueListing,
  getMyListingHistory,
  getViewDetailsPopup,
  updateMyListing,
  deleteMyListing,
  saveListing,
  saveBulkListing,
} from "@/utils/apiHandler/request";
import UploadTickets from "../ModalComponents/uploadTickets";
import InventoryLogsInfo from "../inventoryLogsInfo";
import FloatingLabelInput from "../floatinginputFields";
import { debounce, set } from "lodash";
import SearchedList from "../tradePage/components/searchedList";
import { useRouter } from "next/router";
import reloadIcon from "../../../public/reload.svg";
import Image from "next/image";
import SearchedViewComponent from "../addInventoryPage/searchViewComponent";

import {
  constructTicketsPageHeaders,
  getMatchSpecificFilters,
  createUnifiedFiltersFromMatches,
  constructHeadersFromFilters,
} from "../addInventoryPage/customInventoryTable/utils";
import CommonInventoryTable from "../addInventoryPage/customInventoryTable";
import BulkActionBar from "../addInventoryPage/bulkActionBar";
import Tooltip from "../addInventoryPage/simmpleTooltip";

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
      {activeEntries.length > 0 && (
        <Image
          onClick={onClearAllFilters}
          src={reloadIcon}
          width={30}
          height={30}
          className="cursor-pointer"
          alt="image-logo"
        />
      )}
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
    </div>
  );
};

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
    <div className="flex items-center justify-between px-6 bg-white ">
      {/* Left side - Total items count */}
      <div className="flex items-center gap-4">
        <div className="py-3 pr-4 border-r-[1px] border-r-[#E0E1EA] text-sm text-[#323A70] font-medium">
          {totalItems} Events
        </div>
        <div className="flex items-center gap-4">
          <ActiveFilterPills
            activeFilters={activeFilters}
            filterConfig={filterConfig}
            onFilterChange={onFilterChange}
            onClearAllFilters={onClearAllFilters}
            currentTab="tickets"
          />
        </div>
      </div>

      {/* Right side - View selector, page info and navigation */}
      <div className="flex items-center space-x-6 py-3 border-l-[1px] border-l-[#E0E1EA] pl-4">
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

  // MAIN STATE: Using ticketsByMatch instead of ticketsData
  const [ticketsByMatch, setTicketsByMatch] = useState({});
  console.log(ticketsByMatch, "ticketsByMatchticketsByMatch");
  // Mock data based on your JSON structure
  const mockListingHistory = useMemo(
    () => listingHistoryData?.data || listingHistoryData || [],
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
  console.log(filtersApplied, "filtersAppliedfiltersApplied");
  const [isLoading, setIsLoading] = useState(false);

  // ENHANCED: Global selection state
  const [globalSelectedTickets, setGlobalSelectedTickets] = useState([]);
  const [globalEditingTickets, setGlobalEditingTickets] = useState([]);
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);
  const [loader, setLoader] = useState(false);

  const [viewDetailsPopup, setViewDetailsPopup] = useState({
    show: false,
    rowData: null,
  });
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [collapsedMatches, setCollapsedMatches] = useState({});

  // Debounce timer ref
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (success) {
      toast.success("Listing added successfully");
    }
  }, [success]);

  // Initialize tickets data from mock data - UPDATED FOR ticketsByMatch
  useEffect(() => {
    const ticketsByMatchObj = {};

    mockListingHistory.forEach((item, matchIndex) => {
      const matchInfo = item.match_info || {};
      const tickets = item.tickets || [];

      const transformedTickets = tickets.map((ticket, ticketIndex) => ({
        id: `${matchIndex}-${ticketIndex}`,
        uniqueId: `${matchIndex}_${ticketIndex}`,
        s_no: ticket.s_no || "",
        matchIndex: matchIndex,
        ticketIndex: ticketIndex,
        match_name: matchInfo.match_name || "",
        venue: matchInfo.stadium_name || "",
        tournament: matchInfo.tournament_name || "",
        match_date: new Date(matchInfo.match_date).toLocaleDateString() || "",
        match_time: matchInfo.match_time || "",
        ticket_type: ticket.ticket_type || "",
        ticket_type_id: ticket.ticket_type_id || "",
        ticket_category: ticket.ticket_category || "",
        ticket_category_id: ticket.ticket_category_id || "",
        quantity: ticket.quantity || 0,
        price: ticket.price || 0,
        price_type: ticket.price_type || "GBP",
        currency_symbol: ticket.currency_symbol || "",
        status:
          ticket.status === 1
            ? "Active"
            : ticket.status === 2
            ? "Sold"
            : "Inactive",
        sell_date: ticket.sell_date || "",
        row: ticket.row || "",
        block: ticket.ticket_block || "",
        first_seat: ticket.first_seat || "",
        web_price: ticket.web_price || "",
        home_town: ticket.home_town || "",
        split_type: ticket.split?.name || "",
        split_type_id: ticket.split?.id || "",
        ship_date: ticket.ship_date || "",
        ticket_in_hand: ticket.ticket_in_hand || false,
        listing_note: ticket.listing_note?.map((note) => `${note.id}`),
        rawTicketData: ticket,
        rawMatchData: matchInfo,
        isCloned: false, // Initialize as not cloned
      }));

      if (transformedTickets.length > 0) {
        ticketsByMatchObj[matchIndex] = {
          matchInfo,
          tickets: transformedTickets,
          filters: item.filter,
        };
      }
    });

    setTicketsByMatch(ticketsByMatchObj);
  }, [mockListingHistory]);

  // Helper function to get all tickets as flat array from ticketsByMatch
  const getAllTicketsFromMatches = useCallback(() => {
    const allTickets = [];
    Object.values(ticketsByMatch).forEach((matchData) => {
      allTickets.push(...matchData.tickets);
    });
    return allTickets;
  }, [ticketsByMatch]);

  // NEW: Helper functions for cloned tickets
  const getClonedTickets = useCallback(() => {
    const allTickets = getAllTicketsFromMatches();
    return allTickets.filter((ticket) => ticket.isCloned);
  }, [getAllTicketsFromMatches]);

  const getSelectedClonedTickets = useCallback(() => {
    const allTickets = getAllTicketsFromMatches();
    console.log(allTickets, "allTicketsallTickets",globalSelectedTickets);
    return allTickets.filter(
      (ticket) =>
        globalSelectedTickets.includes(ticket.uniqueId) && ticket.isCloned
    );
  }, [getAllTicketsFromMatches, globalSelectedTickets]);

  const areAllSelectedTicketsCloned = useCallback(() => {
    if (globalSelectedTickets.length === 0) return false;

    const allTickets = getAllTicketsFromMatches();
    const selectedTickets = allTickets.filter((ticket) =>
      globalSelectedTickets.includes(ticket.uniqueId)
    );

    return selectedTickets.every((ticket) => ticket.isCloned);
  }, [getAllTicketsFromMatches, globalSelectedTickets]);

  const hasAnyClonedTicketsSelected = useCallback(() => {
    const selectedClonedTickets = getSelectedClonedTickets();
    return selectedClonedTickets.length > 0;
  }, [getSelectedClonedTickets]);

  // ENHANCED: Global selection handlers - UPDATED FOR ticketsByMatch
  const handleGlobalSelectAll = useCallback(() => {
    const allTickets = getAllTicketsFromMatches();
    const allTicketIds = allTickets.map((ticket) => ticket.uniqueId);
    setGlobalSelectedTickets(allTicketIds);
  }, [getAllTicketsFromMatches]);

  const handleGlobalDeselectAll = useCallback(() => {
    setGlobalSelectedTickets([]);
  }, []);

  // Handle select all for specific match - UPDATED FOR ticketsByMatch
  const handleSelectAllForMatch = useCallback(
    (matchIndex) => {
      const matchData = ticketsByMatch[matchIndex];
      if (!matchData) return;

      const matchTicketIds = matchData.tickets.map((ticket) => ticket.uniqueId);

      // Remove existing selections for this match and add new ones
      setGlobalSelectedTickets((prevSelected) => {
        const filteredGlobalSelection = prevSelected.filter((uniqueId) => {
          const [ticketMatchIndex] = uniqueId.split("_");
          return parseInt(ticketMatchIndex) !== parseInt(matchIndex);
        });
        return [...filteredGlobalSelection, ...matchTicketIds];
      });
    },
    [ticketsByMatch]
  );

  // Handle deselect all for specific match - UPDATED FOR ticketsByMatch
  const handleDeselectAllForMatch = useCallback((matchIndex) => {
    setGlobalSelectedTickets((prevSelected) => {
      return prevSelected.filter((uniqueId) => {
        const [ticketMatchIndex] = uniqueId.split("_");
        return parseInt(ticketMatchIndex) !== parseInt(matchIndex);
      });
    });
  }, []);

  // Get selected rows for a specific match - UPDATED FOR ticketsByMatch
  const getSelectedRowsForMatch = useCallback(
    (matchIndex) => {
      const selectedRows = [];
      globalSelectedTickets.forEach((uniqueId) => {
        const [ticketMatchIndex, ticketIndex] = uniqueId.split("_");
        if (parseInt(ticketMatchIndex) === parseInt(matchIndex)) {
          selectedRows.push(parseInt(ticketIndex));
        }
      });
      return selectedRows;
    },
    [globalSelectedTickets]
  );

  // Handle row selection for individual match tables - UPDATED FOR ticketsByMatch
const handleSetSelectedRowsForMatch = useCallback(
  (matchIndex, newSelectedRows) => {
    // Remove existing selections for this match
    setGlobalSelectedTickets((prevSelected) => {
      const filteredGlobalSelection = prevSelected.filter((uniqueId) => {
        const [ticketMatchIndex] = uniqueId.split("_");
        return parseInt(ticketMatchIndex) !== parseInt(matchIndex);
      });

      // Add new selections for this match with correct format
      const newGlobalSelections = newSelectedRows.map(
        (rowIndex) => `${matchIndex}_${rowIndex}` // Ensure correct format
      );

      console.log("🔍 New global selections for match", matchIndex, ":", newGlobalSelections);
      
      return [...filteredGlobalSelection, ...newGlobalSelections];
    });
  },
  []
);

  // ENHANCED: Global bulk actions - UPDATED FOR ticketsByMatch
  const handleGlobalEdit = useCallback(() => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to edit");
      return;
    }

    // Check if any cloned tickets are selected - they can't be edited
    const hasClonedSelected = hasAnyClonedTicketsSelected();
    if (hasClonedSelected) {
      toast.error(
        "Cloned tickets cannot be edited. Please select only existing tickets."
      );
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
  }, [globalSelectedTickets, hasAnyClonedTicketsSelected]);

  const handleGlobalSaveEdit = useCallback(() => {
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
  }, [globalEditingTickets.length]);

  const handleGlobalCancelEdit = useCallback(() => {
    setGlobalEditingTickets([]);
    setIsGlobalEditMode(false);
    setGlobalSelectedTickets([]);
    toast.info("Edit cancelled");
  }, []);

  const handleGlobalDelete = useCallback(async () => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to delete");
      return;
    }

    try {
      setLoader(true);

      // Get tickets to delete for API call
      const allTickets = getAllTicketsFromMatches();
      const ticketsToDelete = allTickets.filter((ticket) =>
        globalSelectedTickets.includes(ticket.uniqueId)
      );

      // Separate cloned and existing tickets
      const clonedTickets = ticketsToDelete.filter((ticket) => ticket.isCloned);
      const existingTickets = ticketsToDelete.filter(
        (ticket) => !ticket.isCloned
      );

      // For existing tickets, call delete API
      if (existingTickets.length > 0) {
        const ticketIds = existingTickets
          .map((ticket) => ticket.s_no)
          .join(",");
        try {
          await deleteMyListing("", {
            ticket_id: ticketIds,
          });
        } catch (error) {
          console.error("API delete error:", error);
        }
      }

      // Group tickets by match for deletion from state
      const ticketsByMatchIndex = {};
      globalSelectedTickets.forEach((uniqueId) => {
        const [matchIndex, ticketIndex] = uniqueId.split("_");
        if (!ticketsByMatchIndex[matchIndex]) {
          ticketsByMatchIndex[matchIndex] = [];
        }

        // Find the actual index in the tickets array
        const matchData = ticketsByMatch[matchIndex];
        if (matchData) {
          const actualIndex = matchData.tickets.findIndex(
            (ticket) => ticket.uniqueId === uniqueId
          );
          if (actualIndex !== -1) {
            ticketsByMatchIndex[matchIndex].push(actualIndex);
          }
        }
      });

      // Remove tickets from state
      setTicketsByMatch((prevData) => {
        const newData = { ...prevData };

        Object.entries(ticketsByMatchIndex).forEach(([matchIndex, indices]) => {
          if (newData[matchIndex]) {
            // Sort indices in descending order to avoid index shifting
            const sortedIndices = indices.sort((a, b) => b - a);
            const newTickets = [...newData[matchIndex].tickets];

            sortedIndices.forEach((index) => {
              newTickets.splice(index, 1);
            });

            // Remove match if no tickets left
            if (newTickets.length === 0) {
              delete newData[matchIndex];
            } else {
              newData[matchIndex] = {
                ...newData[matchIndex],
                tickets: newTickets,
              };
            }
          }
        });

        return newData;
      });

      setGlobalSelectedTickets([]);

      if (clonedTickets.length > 0 && existingTickets.length > 0) {
        toast.success(
          `${globalSelectedTickets.length} ticket(s) deleted successfully (${existingTickets.length} from server, ${clonedTickets.length} cloned)`
        );
      } else if (clonedTickets.length > 0) {
        toast.success(
          `${clonedTickets.length} cloned ticket(s) removed successfully`
        );
      } else {
        toast.success(
          `${existingTickets.length} ticket(s) deleted successfully`
        );
      }

      // Optionally refresh data from server for existing tickets
      if (existingTickets.length > 0) {
        await fetchData(filtersApplied);
      }
    } catch (error) {
      console.error("Error deleting tickets:", error);
      toast.error("Error deleting tickets");
    } finally {
      setLoader(false);
    }
  }, [
    globalSelectedTickets,
    getAllTicketsFromMatches,
    filtersApplied,
    ticketsByMatch,
  ]);

  const [pendingEdits, setPendingEdits] = useState({}); // { "matchIndex_rowIndex": { field1: value1, field2: value2 } }
  const [originalValues, setOriginalValues] = useState({}); // Store original values for reset

  // UPDATED: Enhanced clone function
const handleGlobalClone = useCallback(() => {
  if (globalSelectedTickets.length === 0) {
    toast.error("Please select tickets to clone");
    return;
  }

  const allTickets = getAllTicketsFromMatches();
  const ticketsToClone = allTickets.filter((ticket) =>
    globalSelectedTickets.includes(ticket.uniqueId)
  );

  // Check if trying to clone already cloned tickets
  const alreadyClonedSelected = ticketsToClone.some(ticket => ticket.isCloned);
  if (alreadyClonedSelected) {
    toast.error("Cannot clone already cloned tickets. Please select only existing tickets.");
    return;
  }

  // Group cloned tickets by match
  const clonedTicketsByMatch = {};
  const newClonedTicketIds = []; // Track new IDs for selection

  setTicketsByMatch((prevData) => {
    const newData = { ...prevData };

    ticketsToClone.forEach((ticket) => {
      const matchIndex = ticket.matchIndex;
      
      if (!clonedTicketsByMatch[matchIndex]) {
        clonedTicketsByMatch[matchIndex] = [];
      }

      // IMPORTANT: Calculate the correct ticketIndex for the cloned ticket
      const currentTicketsCount = newData[matchIndex]?.tickets.length || 0;
      const newTicketIndex = currentTicketsCount; // This will be the index of the new ticket

      // Create correct uniqueId format: matchIndex_ticketIndex
      const correctUniqueId = `${matchIndex}_${newTicketIndex}`;

      const clonedTicket = {
        ...ticket,
        id: `${matchIndex}-clone-${Date.now()}-${Math.random()}`, // Keep this for internal ID
        uniqueId: correctUniqueId, // FIX: Use correct format
        ticketIndex: newTicketIndex, // Update the ticket index
        s_no: "", // Empty instead of CLONE_ prefix
        isCloned: true, // Mark as cloned item
        rawTicketData: {
          ...ticket.rawTicketData,
          s_no: "", // Empty instead of CLONE_ prefix
        },
      };

      console.log("🔍 Created cloned ticket with uniqueId:", correctUniqueId);
      
      // Add to the match data immediately
      if (newData[matchIndex]) {
        newData[matchIndex] = {
          ...newData[matchIndex],
          tickets: [...newData[matchIndex].tickets, clonedTicket],
        };
      }

      // Track the new ID for selection
      newClonedTicketIds.push(correctUniqueId);
    });

    return newData;
  });

  // Clear current selection and optionally select the cloned tickets
  setGlobalSelectedTickets([]);
  
  // Optional: Auto-select the cloned tickets
  setTimeout(() => {
    setGlobalSelectedTickets(newClonedTicketIds);
    console.log("🔍 Auto-selected cloned tickets:", newClonedTicketIds);
  }, 100);

  toast.success(
    `${globalSelectedTickets.length} ticket(s) cloned successfully`
  );
}, [globalSelectedTickets, getAllTicketsFromMatches]);

  // NEW: Function to construct FormData for cloned tickets (similar to AddInventory)
  const constructFormDataForClonedTickets = useCallback(
    (clonedTicketsArray) => {
      const formData = new FormData();

      // Helper function to transform QR links (same as AddInventory)
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

      // Process each cloned ticket
      clonedTicketsArray.forEach((ticket, index) => {
        // Basic fields mapping
        formData.append(
          `data[${index}][ticket_types]`,
          ticket.ticket_type_id || ""
        );
        formData.append(
          `data[${index}][add_qty_addlist]`,
          ticket.quantity || ""
        );
        formData.append(`data[${index}][home_town]`, ticket.home_town || "");
        formData.append(
          `data[${index}][ticket_category]`,
          ticket.ticket_category_id || ""
        );
        formData.append(`data[${index}][ticket_block]`, ticket.block || "");
        formData.append(
          `data[${index}][add_price_addlist]`,
          ticket.price || ""
        );
        formData.append(`data[${index}][web_price]`, ticket.web_price || "");
        formData.append(
          `data[${index}][max_display_qty]`,
          ticket.quantity || ""
        );
        formData.append(`data[${index}][first_seat]`, ticket.first_seat || "");
        formData.append(`data[${index}][row]`, ticket.row || "");
        formData.append(
          `data[${index}][split_type]`,
          ticket.split_type_id || ""
        );

        // Handle ship date
        let shipDateValue = ticket.ship_date || "";
        if (typeof shipDateValue === "object" && shipDateValue.startDate) {
          shipDateValue = shipDateValue.startDate;
        }
        formData.append(`data[${index}][ship_date]`, shipDateValue);

        formData.append(
          `data[${index}][ticket_in_hand]`,
          ticket.ticket_in_hand ? "1" : "0"
        );
        formData.append(
          `data[${index}][match_id]`,
          ticket.rawMatchData?.m_id || ""
        );
        formData.append(
          `data[${index}][add_pricetype_addlist]`,
          ticket.price_type || "EUR"
        );
        formData.append(`data[${index}][event]`, "E");

        // Handle listing notes (combine restrictions and notes)
        const ticketDetails = ticket.listing_note || [];
        ticketDetails.forEach((detail, detailIndex) => {
          formData.append(
            `data[${index}][ticket_details][${detailIndex}]`,
            detail
          );
        });

        formData.append(
          `data[${index}][ticket_details1]`,
          ticket.split_type_id || ""
        );

        // Handle additional fields if they exist
        if (ticket.additional_file_type) {
          formData.append(
            `data[${index}][additional_file_type]`,
            ticket.additional_file_type
          );
        }
        if (ticket.additional_dynamic_content) {
          formData.append(
            `data[${index}][additional_dynamic_content]`,
            ticket.additional_dynamic_content
          );
        }

        // Handle QR links if they exist
        if (ticket.qr_links) {
          const qrLinksTransformed = transformQRLinks(ticket.qr_links);
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
        }

        // Handle file uploads if they exist
        if (ticket.upload_tickets && ticket.upload_tickets.length > 0) {
          ticket.upload_tickets.forEach((uploadTicket, ticketIndex) => {
            if (uploadTicket.file && uploadTicket.file instanceof File) {
              formData.append(
                `data[${index}][upload_tickets][${ticketIndex}]`,
                uploadTicket.file,
                uploadTicket.name
              );
            }
          });
        }

        if (ticket.pop_upload_tickets) {
          formData.append(
            `data[${index}][pop_upload_tickets]`,
            ticket.pop_upload_tickets.file,
            ticket.pop_upload_tickets.name
          );
        }

        // Handle additional info if it exists
        if (ticket.additional_info) {
          formData.append(
            `data[${index}][additional_file_type]`,
            ticket.additional_info.template || ""
          );
          formData.append(
            `data[${index}][additional_dynamic_content]`,
            ticket.additional_info.dynamicContent || ""
          );

          if (ticket.additional_info.templateFile) {
            formData.append(
              `data[${index}][additional_file]`,
              ticket.additional_info.templateFile,
              "additional_file"
            );
          }
        }

        // Handle courier details if they exist
        if (ticket.courier_type) {
          formData.append(`data[${index}][courier_type]`, ticket.courier_type);
        }
        if (ticket.courier_name) {
          formData.append(`data[${index}][courier_name]`, ticket.courier_name);
        }
        if (ticket.courier_tracking_details) {
          formData.append(
            `data[${index}][courier_tracking_details]`,
            ticket.courier_tracking_details
          );
        }
      });

      return formData;
    },
    []
  );

  // NEW: Publish function for cloned tickets
  const handlePublishClonedTickets = useCallback(async () => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select cloned tickets to publish");
      return;
    }

    const selectedClonedTickets = getSelectedClonedTickets();

    if (selectedClonedTickets.length === 0) {
      toast.error("Please select cloned tickets to publish");
      return;
    }

    if (!areAllSelectedTicketsCloned()) {
      toast.error("Please select only cloned tickets to publish");
      return;
    }

    setLoader(true);
    try {
      // Construct FormData for cloned tickets
      const formData = constructFormDataForClonedTickets(selectedClonedTickets);

      // Use appropriate API based on count (same as AddInventory)
      if (selectedClonedTickets.length > 1) {
        await saveBulkListing("", formData);
      } else {
        await saveListing("", formData);
      }

      // Remove cloned tickets from state after successful publish
      setTicketsByMatch((prevData) => {
        const newData = { ...prevData };

        // Group selected tickets by match for removal
        const ticketsByMatchIndex = {};
        globalSelectedTickets.forEach((uniqueId) => {
          const [matchIndex, ticketIndex] = uniqueId.split("_");
          if (!ticketsByMatchIndex[matchIndex]) {
            ticketsByMatchIndex[matchIndex] = [];
          }

          // Find the actual index in the tickets array
          const matchData = newData[matchIndex];
          if (matchData) {
            const actualIndex = matchData.tickets.findIndex(
              (ticket) => ticket.uniqueId === uniqueId
            );
            if (actualIndex !== -1) {
              ticketsByMatchIndex[matchIndex].push(actualIndex);
            }
          }
        });

        // Remove tickets from state
        Object.entries(ticketsByMatchIndex).forEach(([matchIndex, indices]) => {
          if (newData[matchIndex]) {
            // Sort indices in descending order to avoid index shifting
            const sortedIndices = indices.sort((a, b) => b - a);
            const newTickets = [...newData[matchIndex].tickets];

            sortedIndices.forEach((index) => {
              newTickets.splice(index, 1);
            });

            // Remove match if no tickets left
            if (newTickets.length === 0) {
              delete newData[matchIndex];
            } else {
              newData[matchIndex] = {
                ...newData[matchIndex],
                tickets: newTickets,
              };
            }
          }
        });

        return newData;
      });

      setGlobalSelectedTickets([]);
      toast.success(
        `${selectedClonedTickets.length} cloned ticket(s) published successfully`
      );

      // Optionally refresh data from server
      await fetchData(filtersApplied);
    } catch (error) {
      console.error("Error publishing cloned tickets:", error);
      toast.error("Error publishing cloned tickets");
    } finally {
      setLoader(false);
    }
  }, [
    globalSelectedTickets,
    getSelectedClonedTickets,
    areAllSelectedTicketsCloned,
    constructFormDataForClonedTickets,
    filtersApplied,
  ]);

  // Check if a specific ticket is in edit mode - UPDATED FOR ticketsByMatch
  const isTicketInEditMode = useCallback(
    (matchIndex, ticketIndex) => {
      const uniqueId = `${matchIndex}_${ticketIndex}`;
      return isGlobalEditMode && globalEditingTickets.includes(uniqueId);
    },
    [isGlobalEditMode, globalEditingTickets]
  );

  // NEW: Construct headers dynamically from filters - REMAINS SAME
  const constructHeadersFromListingHistory = useMemo(() => {
    if (!mockListingHistory || mockListingHistory.length === 0) return [];

    // Get all unique filters from all matches
    const allFilters = mockListingHistory
      .map((match) => match.filter)
      .filter(Boolean);

    // Create headers based on the structure you want
    const headers = [
      { key: "s_no", label: "Listing ID", editable: false },
      {
        key: "ticket_type_id",
        label: "Ticket Type",
        editable: true,
        type: "select",
        options: [],
      },
      {
        key: "ticket_category_id",
        label: "Seating Category",
        editable: true,
        type: "select",
        options: [],
      },
      {
        key: "block",
        label: "Section/Block",
        editable: true,
        type: "select",
        options: [],
        dynamicOptions: true,
        dependentOn: ["ticket_category_id", "match_id"],
      },
      {
        key: "home_town",
        label: "Fan Area",
        editable: true,
        type: "select",
        options: [],
      },
      {
        key: "row",
        label: "Row",
        increasedWidth: "!w-[100px] !min-w-[100px] ",
        editable: true,
        type: "text",
      },
      {
        key: "quantity",
        label: "Quantity",
        increasedWidth: "!w-[100px] !min-w-[100px] ",
        editable: true,
        type: "number",
      },
      {
        key: "seat",
        label: "Seat",
        editable: true,
        type: "text",
      },
      {
        key: "web_price",
        label: "Face Value",
        editable: true,
        iconHandling: true,
        type: "number",
        iconBefore: (rowValue) => (
          <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
            <p className="text-xs sm:text-[10px] lg:text-xs">
              {rowValue?.currency_symbol}
            </p>
          </div>
        ),
      },
      {
        key: "price",
        label: "Price",
        editable: true,
        iconHandling: true,
        type: "number",
        iconBefore: (rowValue) => {
          return (
            <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
              <p className="text-xs sm:text-[10px] lg:text-xs">
                {rowValue?.currency_symbol}
              </p>
            </div>
          );
        },
      },
      {
        key: "listing_note",
        label: "Listing Note",
        editable: true,
        type: "multiselect",
        options: [],
      },
      {
        key: "first_seat",
        label: "First Seat",
        editable: true,
        type: "text",
      },
      {
        key: "ship_date",
        label: "Date to Ship",
        editable: true,
        type: "date",
      },
      {
        key: "split_type_id",
        label: "Split Type",
        editable: true,
        type: "select",
        options: [],
      },
      // {
      //   key: "status",
      //   label: "Status",
      //   editable: false,
      // },
      // {
      //   key: "sell_date",
      //   label: "Listed Date",
      //   editable: false,
      // },
    ];

    // Populate options for select fields from filters
    if (allFilters.length > 0) {
      // Get all unique options across all matches
      const allTicketTypes = new Map();
      const allSplitTypes = new Map();
      const allHomeTowns = new Map();
      const allTicketCategories = new Map();
      const allListingNotes = new Map();

      allFilters.forEach((filter) => {
        // Ticket Types
        if (filter.ticket_types) {
          filter.ticket_types.forEach((type) => {
            allTicketTypes.set(type.id.toString(), type.name);
          });
        }

        // Split Types
        if (filter.split_types) {
          filter.split_types.forEach((type) => {
            allSplitTypes.set(type.id.toString(), type.name);
          });
        }

        // Home Towns
        if (filter.home_town) {
          Object.entries(filter.home_town).forEach(([key, value]) => {
            allHomeTowns.set(key, value);
          });
        }

        // Block Data (Ticket Categories)
        if (filter.block_data) {
          Object.entries(filter.block_data).forEach(([key, value]) => {
            allTicketCategories.set(key, value);
          });
        }

        // Listing Notes
        if (filter.restriction_left || filter.restriction_right) {
          [
            ...(filter.restriction_left || []),
            ...(filter.restriction_right || []),
          ].forEach((note) => {
            allListingNotes.set(note.id.toString(), note.name);
          });
        }
      });

      // Update headers with options
      headers.forEach((header) => {
        if (header.key === "ticket_type_id") {
          header.options = Array.from(allTicketTypes.entries()).map(
            ([value, label]) => ({
              value,
              label,
            })
          );
        } else if (header.key === "split_type_id") {
          header.options = Array.from(allSplitTypes.entries()).map(
            ([value, label]) => ({
              value,
              label,
            })
          );
        } else if (header.key === "home_town") {
          header.options = Array.from(allHomeTowns.entries()).map(
            ([value, label]) => ({
              value,
              label,
            })
          );
        } else if (header.key === "ticket_category_id") {
          header.options = Array.from(allTicketCategories.entries()).map(
            ([value, label]) => ({
              value,
              label,
            })
          );
        } else if (header.key === "listing_note") {
          header.options = Array.from(allListingNotes.entries()).map(
            ([value, label]) => ({
              value,
              label,
            })
          );
        }
      });
    }

    return headers;
  }, [mockListingHistory]);

  // Enhanced updateCellValues function with better error handling
  const updateCellValues = async (updatedParams, id) => {
    try {
      console.log(
        "Updating listing with params:",
        updatedParams,
        "for ID:",
        id
      );

      if (!id) {
        console.error("No ID provided for update");
        return;
      }
      const key =
        Object?.keys(updatedParams)[0] == "ticket_type_id"
          ? "ticket_type"
          : Object?.keys(updatedParams)[0] == "ticket_category_id"
          ? "ticket_category"
          : `${Object?.keys(updatedParams)[0]}`;
      const params = {
        [key]: Object?.values(updatedParams)[0],
      };

      const update = await updateMyListing("", id, params);

      if (update?.success) {
        // toast.success("Listing updated successfully");
      } else {
        console.error("Update failed:");
        // toast.error("Failed to update listing");
      }

      return update;
    } catch (error) {
      console.error("Error updating listing:", error);
    }
  };

  const handleCellEdit = useCallback(
    (rowIndex, columnKey, value, ticket, matchIndexParam) => {
      const matchIndex = matchIndexParam.toString();
      const rowKey = `${matchIndex}_${rowIndex}`;

      // Check if trying to edit a cloned ticket
      const currentTicket = ticketsByMatch[matchIndex]?.tickets[rowIndex];
      if (currentTicket?.isCloned) {
        toast.error(
          "Cloned tickets cannot be edited. Please publish them first or select non-cloned tickets."
        );
        return;
      }

      // Find header config
      const headerConfig = constructHeadersFromListingHistory.find(
        (h) => h.key === columnKey
      );

      let processedValue = value;
      if (headerConfig?.type === "select" && headerConfig?.options) {
        const isValidValue = headerConfig.options.some(
          (opt) => opt.value === value
        );
        if (!isValidValue) {
          const optionByLabel = headerConfig.options.find(
            (opt) => opt.label === value
          );
          if (optionByLabel) {
            processedValue = optionByLabel.value;
          }
        }
      }

      if (isGlobalEditMode && globalEditingTickets.length > 0) {
        // EXISTING BULK EDIT LOGIC - unchanged
        setTicketsByMatch((prevData) => {
          const newData = { ...prevData };

          const ticketsByMatchIndex = {};
          globalEditingTickets.forEach((uniqueId) => {
            const [ticketMatchIndex, originalIndex] = uniqueId.split("_");
            if (!ticketsByMatchIndex[ticketMatchIndex]) {
              ticketsByMatchIndex[ticketMatchIndex] = [];
            }
            ticketsByMatchIndex[ticketMatchIndex].push(parseInt(originalIndex));
          });

          Object.entries(ticketsByMatchIndex).forEach(
            ([editMatchIndex, indices]) => {
              if (newData[editMatchIndex]) {
                newData[editMatchIndex] = {
                  ...newData[editMatchIndex],
                  tickets: newData[editMatchIndex].tickets.map(
                    (ticketItem, index) => {
                      if (indices.includes(index)) {
                        return { ...ticketItem, [columnKey]: processedValue };
                      }
                      return ticketItem;
                    }
                  ),
                };
              }
            }
          );

          return newData;
        });

        const allTickets = getAllTicketsFromMatches();
        const selectedTickets = allTickets.filter((t) =>
          globalEditingTickets.includes(t.uniqueId)
        );
        const updateParams = { [columnKey]: processedValue };

        selectedTickets.forEach((selectedTicket) => {
          updateCellValues(updateParams, selectedTicket?.rawTicketData?.s_no);
        });
      } else {
        // NEW: SINGLE EDIT MODE - Store pending changes instead of immediate update

        // Store original value if not already stored
        if (!originalValues[rowKey]) {
          const currentTicket = ticketsByMatch[matchIndex]?.tickets[rowIndex];
          if (currentTicket) {
            setOriginalValues((prev) => ({
              ...prev,
              [rowKey]: { ...currentTicket },
            }));
          }
        }

        // Store the pending edit
        setPendingEdits((prev) => ({
          ...prev,
          [rowKey]: {
            ...prev[rowKey],
            [columnKey]: processedValue,
          },
        }));

        // Update the UI immediately to show the change (optimistic update)
        setTicketsByMatch((prevData) => ({
          ...prevData,
          [matchIndex]: {
            ...prevData[matchIndex],
            tickets: prevData[matchIndex].tickets.map((ticketItem, index) => {
              if (index === rowIndex) {
                return { ...ticketItem, [columnKey]: processedValue };
              }
              return ticketItem;
            }),
          },
        }));
      }
    },
    [
      isGlobalEditMode,
      globalEditingTickets,
      constructHeadersFromListingHistory,
      getAllTicketsFromMatches,
      ticketsByMatch,
      originalValues,
    ]
  );

  // NEW: Handle cancel edit (cross icon clicked)
  const handleCancelEdit = useCallback(
    (matchIndex, rowIndex) => {
      const rowKey = `${matchIndex}_${rowIndex}`;
      const originalRowValues = originalValues[rowKey];

      if (!originalRowValues) return;

      // Revert the UI changes
      setTicketsByMatch((prevData) => ({
        ...prevData,
        [matchIndex]: {
          ...prevData[matchIndex],
          tickets: prevData[matchIndex].tickets.map((ticketItem, index) => {
            if (index === rowIndex) {
              return originalRowValues;
            }
            return ticketItem;
          }),
        },
      }));

      // Clear pending edits and original values for this row
      setPendingEdits((prev) => {
        const newPending = { ...prev };
        delete newPending[rowKey];
        return newPending;
      });

      setOriginalValues((prev) => {
        const newOriginal = { ...prev };
        delete newOriginal[rowKey];
        return newOriginal;
      });

      toast.info("Changes discarded");
    },
    [originalValues]
  );

  const handleConfirmEdit = useCallback(
    async (matchIndex, rowIndex) => {
      const rowKey = `${matchIndex}_${rowIndex}`;
      const pendingChanges = pendingEdits[rowKey];

      if (!pendingChanges || Object.keys(pendingChanges).length === 0) return;

      try {
        const ticket = ticketsByMatch[matchIndex]?.tickets[rowIndex];
        if (!ticket) return;

        // Transform field keys for API (ticket_type_id -> ticket_type, etc.)
        const transformedParams = {};
        Object.entries(pendingChanges).forEach(([key, value]) => {
          const transformedKey =
            key === "ticket_type_id"
              ? "ticket_type"
              : key === "ticket_category_id"
              ? "ticket_category"
              : key === "split_type_id"
              ? "split_type"
              : key;
          transformedParams[transformedKey] = value;
        });

        // Make single API call with all transformed parameters
        const update = await updateMyListing(
          "",
          ticket?.rawTicketData?.s_no,
          transformedParams
        );

        if (update?.success) {
          // Clear pending edits and original values for this row
          setPendingEdits((prev) => {
            const newPending = { ...prev };
            delete newPending[rowKey];
            return newPending;
          });

          setOriginalValues((prev) => {
            const newOriginal = { ...prev };
            delete newOriginal[rowKey];
            return newOriginal;
          });

          toast.success(
            Object.keys(pendingChanges).length > 1
              ? `${
                  Object.keys(pendingChanges).length
                } fields updated successfully`
              : "Field updated successfully"
          );
        } else {
          console.error("Update failed:");
          toast.error("Failed to update field(s)");
          // Revert the changes on error
          handleCancelEdit(matchIndex, rowIndex);
        }
      } catch (error) {
        console.error("Error confirming edit:", error);
        toast.error("Error updating field(s)");
        // Revert the changes on error
        handleCancelEdit(matchIndex, rowIndex);
      }
    },
    [pendingEdits, ticketsByMatch, handleCancelEdit]
  );

  // NEW: Check if a row has pending edits
  const hasPendingEdits = useCallback(
    (matchIndex, rowIndex) => {
      const rowKey = `${matchIndex}_${rowIndex}`;
      return (
        pendingEdits[rowKey] && Object.keys(pendingEdits[rowKey]).length > 0
      );
    },
    [pendingEdits]
  );

  const handleHandAction = useCallback(
    (rowData, rowIndex) => {
      console.log("Hand action clicked for row:", rowData, rowIndex);
      handleCellEdit(
        rowIndex,
        "ticket_in_hand",
        !rowData?.ticket_in_hand,
        rowData,
        rowData?.matchIndex
      );
    },
    [handleCellEdit]
  );

  // Custom sticky columns configuration
  const getStickyColumnsForRow = useCallback(
    (rowData, rowIndex) => {
      const isBulkEditMode =
        isGlobalEditMode && globalEditingTickets.length > 1;
      const hasEdits = hasPendingEdits(rowData?.matchIndex, rowIndex);
      const isCloned = rowData?.isCloned;

      // Base columns
      const baseColumns = [
        {
          key: "hand",
          icon: (
            <Tooltip content="Tickets in Hand">
              <Hand
                size={14}
                className={`${
                  rowData?.ticket_in_hand ? "text-green-500" : "text-black"
                } ${
                  isCloned
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:text-green-500 cursor-pointer"
                }`}
                onClick={() => {
                  if (!isCloned) {
                    handleHandAction(rowData, rowIndex);
                  }
                }}
              />
            </Tooltip>
          ),
          className: "py-2 text-center border-r border-[#E0E1EA]",
        },
        {
          key: "upload",
          toolTipContent:
            isBulkEditMode || isCloned ? "Not Available" : "Upload",
          icon: (
            <Tooltip
              content={isBulkEditMode || isCloned ? "Not Available" : "Upload"}
            >
              <IconStore.upload
                className={`size-4 ${
                  isBulkEditMode || isCloned
                    ? "cursor-not-allowed opacity-50 grayscale"
                    : "cursor-pointer"
                }`}
              />
            </Tooltip>
          ),
          className: `${
            isBulkEditMode || isCloned
              ? "cursor-not-allowed pl-2"
              : "cursor-pointer pl-2"
          }`,
          tooltipComponent: (
            <p className="text-center">{rowData.ticket_type}</p>
          ),
          onClick: () => {
            if (!isBulkEditMode && !isCloned) {
              handleUploadAction(rowData, rowIndex);
            }
          },
        },
        {
          key: "upload_pop",
          toolTipContent:
            isBulkEditMode || isCloned ? "Not Available" : "Upload Pop",
          icon: (
            <Tooltip
              content={
                isBulkEditMode || isCloned ? "Not Available" : "Upload Pop"
              }
            >
              <HardDriveUpload
                onClick={() => {
                  if (!isBulkEditMode && !isCloned) {
                    handleUploadAction(
                      { ...rowData, handleProofUpload: true },
                      rowIndex
                    );
                  }
                }}
                className={`w-[16px] h-[16px] ${
                  isBulkEditMode || isCloned
                    ? "cursor-not-allowed opacity-50 text-gray-400"
                    : "cursor-pointer"
                }`}
              />
            </Tooltip>
          ),
          className: "py-2 text-center border-r border-[#E0E1EA]",
        },
        {
          key: "view",
          icon: (
            <Tooltip content="logs">
              <Clock className="size-4" />
            </Tooltip>
          ),
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

      // NEW: Add confirm/cancel buttons if there are pending edits and not in bulk mode and not cloned
      if (hasEdits && !isBulkEditMode && !isCloned) {
        return [
          // Replace the last two columns with confirm/cancel buttons
          ...baseColumns.slice(0, 2),

          {
            key: "cancel",
            icon: (
              <Tooltip content="Cancel Changes">
                <div
                  className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors"
                  onClick={() =>
                    handleCancelEdit(rowData?.matchIndex, rowIndex)
                  }
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </div>
              </Tooltip>
            ),
            className: "py-2 text-center",
          },
          {
            key: "confirm",
            icon: (
              <Tooltip content="Confirm Changes">
                <div
                  className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors"
                  onClick={() =>
                    handleConfirmEdit(rowData?.matchIndex, rowIndex)
                  }
                >
                  <SquareCheck className="w-4 h-4 text-white" />
                </div>
              </Tooltip>
            ),
            className: "py-2 text-center border-r border-[#E0E1EA]",
          },
        ];
      }

      return baseColumns;
    },
    [
      isGlobalEditMode,
      globalEditingTickets,
      handleHandAction,
      hasPendingEdits,
      handleConfirmEdit,
      handleCancelEdit,
    ]
  );

  // Action handlers for sticky columns
  const handleUploadAction = useCallback((rowData, rowIndex) => {
    console.log("Upload action clicked for row:", rowData, rowIndex);
    setShowUploadPopup({
      show: true,
      rowData: rowData,
      rowIndex,
      matchDetails: rowData?.rawMatchData,
    });
  }, []);

  const handleViewDetails = useCallback(async (item) => {
    console.log("View details:", item?.rawTicketData?.s_no);
    setViewDetailsPopup({
      show: true,
      isLoading: true,
    });
    try {
      const fetchViewDetailsPopup = await getViewDetailsPopup("", {
        ticket_id: item?.rawTicketData?.s_no,
      });
      setViewDetailsPopup({
        show: true,
        rowData: fetchViewDetailsPopup,
      });
    } catch (error) {
      console.error("Error fetching view details:", error);
      toast.error("Error fetching view details");
    } finally {
      setViewDetailsPopup((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const createInitialVisibleColumns = useCallback(() => {
    return constructHeadersFromListingHistory.reduce((acc, header) => {
      acc[header.key] = true;
      return acc;
    }, {});
  }, [constructHeadersFromListingHistory]);

  const [visibleColumns, setVisibleColumns] = useState(
    createInitialVisibleColumns()
  );

  const [columnOrder, setColumnOrder] = useState([]);

  const handleColumnToggle = useCallback((columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  }, []);

  // Memoized function to get filtered headers in the correct order
  const getFilteredHeadersInOrder = useMemo(() => {
    // First, filter headers based on visibility
    const visibleHeadersMap = new Map();
    constructHeadersFromListingHistory.forEach((header) => {
      if (visibleColumns[header.key]) {
        visibleHeadersMap.set(header.key, header);
      }
    });

    // If we have a custom column order, apply it
    if (columnOrder.length > 0) {
      const orderedHeaders = [];
      const usedKeys = new Set();

      // Add headers in the custom order (only if they're visible)
      columnOrder.forEach((columnKey) => {
        const header = visibleHeadersMap.get(columnKey);
        if (header) {
          orderedHeaders.push(header);
          usedKeys.add(columnKey);
        }
      });

      // Add any new visible headers that weren't in the ordered list
      Array.from(visibleHeadersMap.values()).forEach((header) => {
        if (!usedKeys.has(header.key)) {
          orderedHeaders.push(header);
        }
      });

      return orderedHeaders;
    }

    // Fallback to original order if no custom order exists
    return constructHeadersFromListingHistory.filter(
      (header) => visibleColumns[header.key]
    );
  }, [constructHeadersFromListingHistory, visibleColumns, columnOrder]);

  const filteredHeaders = getFilteredHeadersInOrder;

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
          smallTooptip: `${overViewData.tickets} Tickets`,
          key: "active_listings",
        },
        {
          name: "Published Listings",
          value: overViewData.published_listings || 0,
          showCheckbox: true,
          key: "listing_status_published",
        },
        {
          name: "Unpublished Listings",
          value: overViewData.unpublished_listings || 0,
          showCheckbox: true,
          key: "listing_status_unpublished",
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
          name: "team_member",
          label: "Team Members",
          value: filtersApplied?.team_member,
          options:
            response?.filters?.user_info?.map((category) => ({
              value: category?.id,
              label: category?.first_name,
            })) || [],
          parentClassName:
            "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "date",
          name: "eventDate",
          label: "Event Date",
          value: {
            startDate: filtersApplied?.start_date,
            endDate: filtersApplied?.end_date,
          },
          parentClassName:
            "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[9px] !px-[12px] max-md:text-xs",
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
          parentClassName:
            "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "select",
          name: "tournament",
          label: "Tournament",
          value: filtersApplied?.tournament,
          options:
            response?.filters?.tournament?.map((category) => ({
              value: category?.id,
              label: category?.name,
            })) || [],
          parentClassName:
            "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
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
          parentClassName:
            "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] mobile:text-xs",
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
    } else if (filterKey === "eventDate") {
      params = {
        ...params,
        start_date: value?.startDate,
        end_date: value?.endDate,
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

  const handleConfirmClick = useCallback((data, index, rowData) => {
    updateCellValues(data, rowData?.s_no);
    setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
  }, []);

  const [searchValue, setSearchValue] = useState("");
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [searchEventLoader, setSearchEventLoader] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRequestPopup, setShowRequestPopup] = useState(false);

  const debouncedFetchApiCall = useCallback(
    debounce((query) => {
      fetchSearchResults(query);
    }, 300),
    []
  );

  const handleOnChangeEvents = useCallback(
    (e) => {
      const newValue = e.target.value;
      setSearchValue(newValue);
      if (newValue.trim()) {
        debouncedFetchApiCall(newValue);
      } else {
        fetchSearchResults("", true);
      }
    },
    [debouncedFetchApiCall]
  );

  const handleSearchedEventClick = useCallback(
    (event) => {
      setSearchValue(event?.match_name);
      handleFilterChange("match_id", event?.m_id);
      setSearchedEvents([]);
    },
    [handleFilterChange]
  );

  const fetchSearchResults = useCallback(
    async (query, isInitialLoad = false) => {
      try {
        setSearchEventLoader(true);
        setSearchedEvents([]);
        setHasSearched(true);

        const searchQuery = isInitialLoad ? "" : query ? query.trim() : "";

        let response = await FetchPerformerOrVenueListing("", {
          query: searchQuery,
        });
        delete response?.data?.venues;
        delete response?.data?.performers;
        setSearchedEvents(response?.data || []);
        setSearchEventLoader(false);
        setShowSearchDropdown(true);
      } catch (error) {
        setSearchEventLoader(false);
        console.error("Search error:", error);
        setSearchedEvents([]);
        setShowSearchDropdown(true);
      }
    },
    []
  );

  const handleSearchFocus = useCallback(
    (e) => {
      if (!searchValue || searchValue.trim() === "") {
        fetchSearchResults("", true);
      } else if (
        searchedEvents?.length == 0 &&
        searchValue &&
        searchValue.trim()
      ) {
        setShowSearchDropdown(false);
      } else if (searchValue && searchValue.trim()) {
        setShowSearchDropdown(true);
      }
    },
    [searchValue, searchedEvents, fetchSearchResults]
  );

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

  const filterSearch = useCallback(() => {
    return (
      <div className="pb-4">
        <FloatingLabelInput
          key="searchMatch"
          id="searchMatch"
          name="searchMatch"
          keyValue={"searchMatch"}
          value={searchValue}
          checkLength={true}
          onChange={handleOnChangeEvents}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          type="text"
          showDropdown={showSearchDropdown}
          iconBefore={<SearchIcon size={16} />}
          iconBeforeTooltip="Search"
          dropDownComponent={
            <SearchedViewComponent
              searchEventLoader={searchEventLoader}
              searchedEvents={searchedEvents}
              hasSearched={hasSearched}
              searchValue={searchValue}
              handleSearchedEventClick={handleSearchedEventClick}
              show={showRequestPopup}
              setShow={setShowRequestPopup}
            />
          }
          label="Choose Match Event"
          className={`!py-[8px] !text-[#323A70] !text-[14px] ${
            searchValue.length <= 3 && "!pl-[44px]"
          }`}
          paddingClassName=""
          autoComplete="off"
          showDelete={true}
          deleteFunction={async () => {
            setSearchValue("");
            await fetchData({ ...filtersApplied, match_id: "" });
            setShowSearchDropdown(false);
            setHasSearched(false);
          }}
          parentClassName="!w-[400px]"
        />
      </div>
    );
  }, [
    searchValue,
    showSearchDropdown,
    searchEventLoader,
    searchedEvents,
    hasSearched,
    showRequestPopup,
    handleOnChangeEvents,
    handleSearchFocus,
    handleSearchBlur,
    handleSearchedEventClick,
    filtersApplied,
    fetchData,
  ]);

  const handleClearAllFilters = useCallback(() => {
    const clearedFilters = { page: 1 };
    fetchData(clearedFilters);
  }, [fetchData]);

  const router = useRouter();
  const handleAddInventory = useCallback(() => {
    router.push("/add-listings");
  }, [router]);

  const handleColumnsReorder = useCallback((newColumns) => {
    setColumnOrder(newColumns);
  }, []);

  // Initialize column order when headers change
  useEffect(() => {
    if (
      constructHeadersFromListingHistory.length > 0 &&
      columnOrder.length === 0
    ) {
      const initialOrder = constructHeadersFromListingHistory.map(
        (header) => header.key
      );
      setColumnOrder(initialOrder);
    }
  }, [constructHeadersFromListingHistory, columnOrder.length]);

  // Update visible columns when headers change
  useEffect(() => {
    if (constructHeadersFromListingHistory.length > 0) {
      setVisibleColumns(createInitialVisibleColumns());
    }
  }, [constructHeadersFromListingHistory, createInitialVisibleColumns]);

  // Calculate total ticket count across all matches - UPDATED FOR ticketsByMatch
  const getTotalTicketCount = useCallback(() => {
    let totalCount = 0;
    Object.values(ticketsByMatch).forEach((matchData) => {
      totalCount += matchData.tickets.length;
    });
    return totalCount;
  }, [ticketsByMatch]);

  const totalTicketCount = getTotalTicketCount();

  // Render match tables using ticketsByMatch
  const renderMatchTables = useCallback(() => {
    return Object.entries(ticketsByMatch).map(([matchIndex, matchData]) => {
      return (
        <div key={`match-${matchIndex}`} className="not-last:mb-4">
          <CommonInventoryTable
            inventoryData={matchData.tickets}
            headers={filteredHeaders}
            selectedRows={getSelectedRowsForMatch(parseInt(matchIndex))}
            setSelectedRows={(newSelectedRows) =>
              handleSetSelectedRowsForMatch(
                parseInt(matchIndex),
                newSelectedRows
              )
            }
            handleCellEdit={(rowIndex, columnKey, value, ticket) =>
              handleCellEdit(rowIndex, columnKey, value, ticket, matchIndex)
            }
            handleHandAction={handleHandAction}
            handleUploadAction={handleUploadAction}
            handleSelectAll={() => handleSelectAllForMatch(matchIndex)}
            handleDeselectAll={() => handleDeselectAllForMatch(matchIndex)}
            matchDetails={{
              match_name: matchData.matchInfo?.match_name,
              match_date_format: matchData.matchInfo?.match_date,
              match_time: matchData.matchInfo?.match_time,
              stadium_name: matchData.matchInfo?.stadium_name,
              country_name: matchData.matchInfo?.country_name,
              city_name: matchData.matchInfo?.city_name,
              match_id: matchData.matchInfo?.m_id,
              tournament_name: matchData.matchInfo?.tournament_name,
              publishedTickets: `${matchData?.matchInfo?.published}`,
              listingTickets: `${matchData?.matchInfo?.listings}`,
              totalTickets: `${matchData?.matchInfo?.tickets}`,
              unPublishedTickets: matchData?.matchInfo?.unpublished,
            }}
            filters={matchData.filters}
            isEditMode={isGlobalEditMode}
            editingRowIndex={
              isGlobalEditMode
                ? matchData.tickets
                    .map((_, index) =>
                      isTicketInEditMode(matchIndex, index) ? index : null
                    )
                    .filter((index) => index !== null)
                : null
            }
            mode="multiple"
            showAccordion={true}
            matchIndex={matchIndex}
            getStickyColumnsForRow={getStickyColumnsForRow}
            stickyHeaders={["", "", "", ""]}
            myListingPage={true}
            stickyColumnsWidth={140}
            // NEW: Pass the pending edits and handlers
            pendingEdits={pendingEdits}
            onConfirmEdit={handleConfirmEdit}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      );
    });
  }, [
    ticketsByMatch,
    collapsedMatches,
    filteredHeaders,
    getSelectedRowsForMatch,
    handleSetSelectedRowsForMatch,
    handleCellEdit,
    handleHandAction,
    handleUploadAction,
    handleSelectAllForMatch,
    handleDeselectAllForMatch,
    isGlobalEditMode,
    isTicketInEditMode,
    getStickyColumnsForRow,
    pendingEdits,
    handleConfirmEdit,
    handleCancelEdit,
  ]);

  const handleCheckBoxChange = async (key, value) => {
    if (key == "listing_status_published") {
      const params = {
        ...filtersApplied,
        ...(value && { listing_status: 1 }),
      };
      await fetchData(params);
    } else if (key == "listing_status_unpublished") {
      const params = {
        ...filtersApplied,
        ...(value && { listing_status: 0 }),
      };
      await fetchData(params);
    }
  };

  return (
    <div className="bg-[#F5F7FA] w-full max-h-[calc(100vh-100px)] overflow-auto relative ">
      <div className="bg-white">
        <TabbedLayout
          tabs={[]}
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
          onCheckboxToggle={handleCheckBoxChange}
          hideVisibleColumns={false}
          disableTransitions={true}
          useHeaderV2={true}
          onAddInventory={handleAddInventory}
          addInventoryText="Add Inventory"
          isDraggableColumns={true}
          isDraggableFilters={true}
          showColumnSearch={true}
          showFilterSearch={false}
          onColumnsReorder={handleColumnsReorder}
        />

        <div className="border-[1px] border-[#E0E1EA]">
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
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <ShimmerLoader />
      ) : (
        <div className="m-6 pb-[100px]">
          {Object.keys(ticketsByMatch).length > 0 ? (
            renderMatchTables()
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
      )}

      {/* UPDATED: Enhanced Bulk Action Bar with Clone Publishing */}
      {globalSelectedTickets.length > 0 && (
        <BulkActionBar
          selectedCount={globalSelectedTickets.length}
          totalCount={totalTicketCount}
          onSelectAll={handleGlobalSelectAll}
          onDeselectAll={handleGlobalDeselectAll}
          onClone={handleGlobalClone}
          onEdit={handleGlobalEdit}
          onDelete={handleGlobalDelete}
          onPublishLive={() => {
            toast.info("Publish functionality not implemented for this page");
          }}
          onPublishCloned={handlePublishClonedTickets} // NEW: Publish cloned tickets
          onSaveEdit={handleGlobalSaveEdit}
          onCancelEdit={handleGlobalCancelEdit}
          loading={loader}
          disabled={globalSelectedTickets.length === 0}
          isEditMode={isGlobalEditMode}
          hidepublishLive={true}
          // NEW: Props for clone functionality
          hasClonedTickets={getClonedTickets().length > 0}
          selectedClonedCount={getSelectedClonedTickets().length}
          areAllSelectedCloned={areAllSelectedTicketsCloned()}
          hasAnyClonedSelected={hasAnyClonedTicketsSelected()}
        />
      )}

      <UploadTickets
        show={showUploadPopup?.show}
        rowData={showUploadPopup?.rowData}
        matchDetails={showUploadPopup?.matchDetails}
        handleConfirmClick={handleConfirmClick}
        myListingPage={true}
        rowIndex={showUploadPopup?.rowIndex}
        onClose={(showShimmer = true) => {
          setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
          if (showShimmer) {
            fetchData({ ...filtersApplied, page: currentPage });
          }
        }}
      />
      {viewDetailsPopup?.show && (
        <InventoryLogsInfo
          show={viewDetailsPopup?.show}
          data={viewDetailsPopup?.rowData}
          onClose={() => setViewDetailsPopup({ show: false, rowData: null })}
          isLoading={viewDetailsPopup?.isLoading}
        />
      )}
    </div>
  );
};

export default TicketsPage;
