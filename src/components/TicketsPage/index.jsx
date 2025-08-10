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
} from "lucide-react";
import {
  FetchEventSearch,
  FetchPerformerOrVenueListing,
  getMyListingHistory,
  getViewDetailsPopup,
  updateMyListing,
  deleteMyListing,
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

        // Add new selections for this match
        const newGlobalSelections = newSelectedRows.map(
          (rowIndex) => `${matchIndex}_${rowIndex}`
        );

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

    setGlobalEditingTickets(globalSelectedTickets);
    setIsGlobalEditMode(true);

    if (globalSelectedTickets.length === 1) {
      toast.success("Edit mode activated for selected ticket");
    } else {
      toast.success(
        `Bulk edit mode activated for ${globalSelectedTickets.length} tickets`
      );
    }
  }, [globalSelectedTickets]);

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
      const ticketIds = ticketsToDelete.map((ticket) => ticket.s_no).join(",");

      // API call to delete tickets
      try {
        await deleteMyListing("", {
          ticket_id: ticketIds,
        });
      } catch (error) {
        console.error("API delete error:", error);
      }

      // Group tickets by match for deletion
      const ticketsByMatchIndex = {};
      globalSelectedTickets.forEach((uniqueId) => {
        const [matchIndex, ticketIndex] = uniqueId.split("_");
        if (!ticketsByMatchIndex[matchIndex]) {
          ticketsByMatchIndex[matchIndex] = [];
        }
        ticketsByMatchIndex[matchIndex].push(parseInt(ticketIndex));
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
      toast.success(
        `${globalSelectedTickets.length} ticket(s) deleted successfully`
      );

      // Optionally refresh data from server
      await fetchData(filtersApplied);
    } catch (error) {
      console.error("Error deleting tickets:", error);
      toast.error("Error deleting tickets");
    } finally {
      setLoader(false);
    }
  }, [globalSelectedTickets, getAllTicketsFromMatches, filtersApplied]);

  const handleGlobalClone = useCallback(() => {
    if (globalSelectedTickets.length === 0) {
      toast.error("Please select tickets to clone");
      return;
    }

    const allTickets = getAllTicketsFromMatches();
    const ticketsToClone = allTickets.filter((ticket) =>
      globalSelectedTickets.includes(ticket.uniqueId)
    );

    // Group cloned tickets by match
    const clonedTicketsByMatch = {};

    ticketsToClone.forEach((ticket) => {
      const matchIndex = ticket.matchIndex;
      if (!clonedTicketsByMatch[matchIndex]) {
        clonedTicketsByMatch[matchIndex] = [];
      }

      const clonedTicket = {
        ...ticket,
        id: `${matchIndex}-${Date.now()}-${Math.random()}`,
        uniqueId: `${matchIndex}_${Date.now()}_${Math.random()}`,
        s_no: `CLONE_${ticket.s_no}`,
        rawTicketData: {
          ...ticket.rawTicketData,
          s_no: `CLONE_${ticket.rawTicketData.s_no}`,
        },
      };

      clonedTicketsByMatch[matchIndex].push(clonedTicket);
    });

    // Add cloned tickets to state
    setTicketsByMatch((prevData) => {
      const newData = { ...prevData };

      Object.entries(clonedTicketsByMatch).forEach(
        ([matchIndex, clonedTickets]) => {
          if (newData[matchIndex]) {
            newData[matchIndex] = {
              ...newData[matchIndex],
              tickets: [...newData[matchIndex].tickets, ...clonedTickets],
            };
          }
        }
      );

      return newData;
    });

    setGlobalSelectedTickets([]);
    toast.success(
      `${globalSelectedTickets.length} ticket(s) cloned successfully`
    );
  }, [globalSelectedTickets, getAllTicketsFromMatches]);

  // Check if a specific ticket is in edit mode - UPDATED FOR ticketsByMatch
  const isTicketInEditMode = useCallback(
    (matchIndex, ticketIndex) => {
      const uniqueId = `${matchIndex}_${ticketIndex}`;
      return isGlobalEditMode && globalEditingTickets.includes(uniqueId);
    },
    [isGlobalEditMode, globalEditingTickets]
  );
  console.log(mockListingHistory, "mockListingHistory");
  // NEW: Construct headers dynamically from filters - REMAINS SAME
  const constructHeadersFromListingHistory = useMemo(() => {
    if (!mockListingHistory || mockListingHistory.length === 0) return [];

    // Get all unique filters from all matches
    const allFilters = mockListingHistory
      .map((match) => match.filter)
      .filter(Boolean);

    // Create headers based on the structure you want
    const headers = [
      { key: "s_no", label: "Listing No", editable: false },
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
      },
      {
        key: "price",
        label: "Price",
        editable: true,
        iconHandling: true,
        type: "number",
      },
      {
        key: "price_type",
        label: "Price Currency",
        editable: false,
        type: "text",
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
      {
        key: "status",
        label: "Status",
        editable: false,
      },
      {
        key: "sell_date",
        label: "Listed Date",
        editable: false,
      },
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
        // if(header?.iconHandling){
        //   header.iconBefore =(
        //     <div className="border-r-[1px] pr-1 border-[#E0E1EA]">
        //       <p className="text-xs sm:text-[10px] lg:text-xs">
        //         {matchDetails?.currency_icon?.[0] || "$"}
        //       </p>
        //     </div>
        //   )
        // }
      });
    }

    return headers;
  }, [mockListingHistory]);

  // Enhanced handleCellEdit to work with ticketsByMatch
  const handleCellEdit = useCallback(
    (rowIndex, columnKey, value, ticket, matchIndexParam) => {
      console.log("Cell edited:", {
        rowIndex,
        columnKey,
        value,
        matchIndex: matchIndexParam,
      });

      const matchIndex = matchIndexParam.toString();

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
        // Update all selected tickets across matches
        setTicketsByMatch((prevData) => {
          const newData = { ...prevData };

          // Group editing tickets by match
          const ticketsByMatchIndex = {};
          globalEditingTickets.forEach((uniqueId) => {
            const [ticketMatchIndex, originalIndex] = uniqueId.split("_");
            if (!ticketsByMatchIndex[ticketMatchIndex]) {
              ticketsByMatchIndex[ticketMatchIndex] = [];
            }
            ticketsByMatchIndex[ticketMatchIndex].push(parseInt(originalIndex));
          });

          // Update only affected matches
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

        // Update all selected tickets via API
        const allTickets = getAllTicketsFromMatches();
        const selectedTickets = allTickets.filter((t) =>
          globalEditingTickets.includes(t.uniqueId)
        );
        const updateParams = { [columnKey]: processedValue };

        selectedTickets.forEach((selectedTicket) => {
          updateCellValues(updateParams, selectedTicket?.rawTicketData?.s_no);
        });
      } else {
        // Single ticket edit - only update specific match
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

        // API call logic
        const updateParams = { [columnKey]: processedValue };
        updateCellValues(updateParams, ticket?.rawTicketData?.s_no);
      }
    },
    [
      isGlobalEditMode,
      globalEditingTickets,
      constructHeadersFromListingHistory,
      getAllTicketsFromMatches,
    ]
  );

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

      return [
        {
          key: "hand",
          icon: (
            <Tooltip content="Tickets in Hand">
              <Hand
                size={14}
                className={`${
                  rowData?.ticket_in_hand ? "text-green-500" : "text-black"
                } hover:text-green-500 cursor-pointer`}
                onClick={() => handleHandAction(rowData, rowIndex)}
              />
            </Tooltip>
          ),
          className: "py-2 text-center border-r border-[#E0E1EA]",
        },
        {
          key: "upload",
          toolTipContent: isBulkEditMode ? "Not Available" : "Upload",
          icon: (
            <Tooltip content={isBulkEditMode ? "Not Available" : "Upload"}>
              <IconStore.upload
                className={`size-4 ${
                  isBulkEditMode
                    ? "cursor-not-allowed opacity-50 grayscale"
                    : "cursor-pointer"
                }`}
              />
            </Tooltip>
          ),
          className: `${
            isBulkEditMode ? "cursor-not-allowed pl-2" : "cursor-pointer pl-2"
          }`,
          tooltipComponent: (
            <p className="text-center">{rowData.ticket_type}</p>
          ),
          onClick: () => {
            if (!isBulkEditMode) {
              handleUploadAction(rowData, rowIndex);
            }
          },
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
    },
    [isGlobalEditMode, globalEditingTickets, handleHandAction]
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
    const fetchViewDetailsPopup = await getViewDetailsPopup("", {
      ticket_id: item?.rawTicketData?.s_no,
    });
    setViewDetailsPopup({
      show: true,
      rowData: fetchViewDetailsPopup,
    });
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
            }}
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
            // isCollapsed={isCollapsed}
            // onToggleCollapse={handleToggleCollapse}
            matchIndex={matchIndex}
            totalTicketsCount={matchData.tickets.length}
            getStickyColumnsForRow={getStickyColumnsForRow}
            stickyHeaders={["", "", "", ""]}
            myListingPage={true}
            stickyColumnsWidth={140}
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

      {/* Global Bulk Action Bar */}
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
          onSaveEdit={handleGlobalSaveEdit}
          onCancelEdit={handleGlobalCancelEdit}
          loading={loader}
          disabled={globalSelectedTickets.length === 0}
          isEditMode={isGlobalEditMode}
          hidepublishLive={true}
        />
      )}

      <UploadTickets
        show={showUploadPopup?.show}
        rowData={showUploadPopup?.rowData}
        matchDetails={showUploadPopup?.matchDetails}
        handleConfirmClick={handleConfirmClick}
        myListingPage={true}
        rowIndex={showUploadPopup?.rowIndex}
        onClose={() => {
          setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
          fetchData({ ...filtersApplied, page: currentPage });
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
