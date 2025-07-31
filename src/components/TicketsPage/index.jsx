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
} from "lucide-react";
import {
  FetchEventSearch,
  FetchPerformerOrVenueListing,
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
      {activeEntries.length > 1 && <Image onClick={onClearAllFilters} src={reloadIcon} width={30} height={30} alt="image-logo" />}
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

// Pagination Component - keep the same as before
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
        <div className="py-3 pr-4 border-r-[1px] border-r-[#E0E1EA] text-sm text-[#323A70] font-medium">{totalItems} Events</div>
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

  // Mock data based on your JSON structure
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

  // State for tickets data
  const [ticketsData, setTicketsData] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [collapsedMatches, setCollapsedMatches] = useState({});

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
          s_no: ticket.s_no || "N/A",
          matchIndex: matchIndex,
          ticketIndex: ticketIndex,
          match_name: matchInfo.match_name || "N/A",
          venue: matchInfo.stadium_name || "N/A",
          tournament: matchInfo.tournament_name || "N/A",
          match_date:
            new Date(matchInfo.match_date).toLocaleDateString() || "N/A",
          match_time: matchInfo.match_time || "N/A",
          ticket_type: ticket.ticket_type || "N/A",
          ticket_type_id: ticket.ticket_type_id || "",
          ticket_category: ticket.ticket_category || "N/A",
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
          sell_date: ticket.sell_date || "N/A",
          row: ticket.row || "N/A",
          block: ticket.ticket_block || "N/A",
          first_seat: ticket.first_seat || "N/A",
          face_value: ticket.face_value || "N/A",
          home_town: ticket.home_town || "N/A",
          split_type: ticket.split?.name || "N/A",
          split_type_id: ticket.split?.id || "",
          ship_date: ticket.ship_date || "N/A",
          tickets_in_hand: ticket.ticket_in_hand || false,
          listing_note:
            ticket.listing_note?.map((note) => `${note.id}`),
          rawTicketData: ticket,
          rawMatchData: matchInfo,
        });
      });
    });

    setTicketsData(transformedData);
  }, [mockListingHistory]);

  // NEW: Construct headers dynamically from filters
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
        editable: true,
        type: "text",
      },
      {
        key: "quantity",
        label: "Quantity",
        editable: true,
        type: "select",
        options: [
          { value: "1", label: "1" },
          { value: "2", label: "2" },
          { value: "3", label: "3" },
          { value: "4", label: "4" },
          { value: "5", label: "5" },
        ],
      },
      {
        key: "seat",
        label: "Seat",
        editable: true,
        type: "text",
      },
      {
        key: "face_value",
        label: "Face Value",
        editable: true,
        type: "text",
      },
      {
        key: "price",
        label: "Price",
        editable: true,
        type: "text",
      },
      {
        key: "price_type",
        label: "Price Currency",
        editable: false,
        type: "text",
      },
      {
        key: "web_price",
        label: "Web Price",
        editable: true,
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
          [...filter.restriction_left, ...filter.restriction_right].forEach(
            (note) => {
              allListingNotes.set(note.id.toString(), note.name);
            }
          );
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

  // Group tickets by match for the accordion-style display using CommonInventoryTable
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
          filters: mockListingHistory[matchIndex]?.filter,
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
  }, [ticketsData, mockListingHistory]);

  console.log("groupedTicketsData", groupedTicketsData);

  // Enhanced handleCellEdit to work with multiple matches and use match-specific filters
  const handleCellEdit = (rowIndex, columnKey, value, ticket, matchIndex) => {
    console.log("Cell edited:", {
      rowIndex,
      columnKey,
      value,
      valueType: typeof value,
      ticket: ticket?.rawTicketData?.s_no,
      matchIndex,
    });

    // Find the header configuration for this column
    const headerConfig = constructHeadersFromListingHistory.find(
      (h) => h.key === columnKey
    );

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
      prevData.map((ticketItem) =>
        ticketItem.id === ticket.id
          ? { ...ticketItem, [columnKey]: processedValue }
          : ticketItem
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
      rowIndex,
      "tickets_in_hand",
      !rowData?.tickets_in_hand,
      rowData,
      rowData?.matchIndex
    );
  };

  // Custom sticky columns configuration for TicketsPage (HIDE CHEVRON DOWN)
  const getStickyColumnsForRow = (rowData, rowIndex) => {
    return [
      {
        key: "hand",
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
      // REMOVED THE CHEVRON DOWN FROM HERE
    ];
  };

  // Action handlers for sticky columns
  const handleUploadAction = (rowData, rowIndex) => {
    console.log("Upload action clicked for row:", rowData, rowIndex);
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
    return constructHeadersFromListingHistory.reduce((acc, header) => {
      acc[header.key] = true;
      return acc;
    }, {});
  }, [constructHeadersFromListingHistory]);

  const [visibleColumns, setVisibleColumns] = useState(
    createInitialVisibleColumns()
  );

  const [columnOrder, setColumnOrder] = useState([]);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // NEW: Memoized function to get filtered headers in the correct order
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
          parentClassName: "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] mobile:text-xs",
          labelClassName: "!text-[11px]",
        },
        // {
        //   type: "select",
        //   name: "seat_category",
        //   label: "Seat Category",
        //   value: filtersApplied?.seat_category,
        //   options:
        //     response?.filters?.ticket_category?.map((category) => ({
        //       value: category?.id,
        //       label: category?.name,
        //     })) || [],
        //   parentClassName: "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
        //   className: "!py-[6px] !px-[12px] max-md:text-xs",
        //   labelClassName: "!text-[11px]",
        // },
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
          parentClassName: "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
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
          parentClassName: "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] max-md:text-xs",
          labelClassName: "!text-[11px]",
        },
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
          parentClassName: "flex-grow flex-shrink flex-basis-[15%] md:p-0 pb-3 w-full md:!max-w-[15%]",
          className: "!py-[6px] !px-[12px] max-md:text-xs",
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

  const handleConfirmClick = (data, index, rowData) => {
    updateCellValues(data, rowData?.s_no);
    setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
  };

  const [searchValue, setSearchValue] = useState("");
  const [searchedEvents, setSearchedEvents] = useState([]);
  const [searchEventLoader, setSearchEventLoader] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRequestPopup, setShowRequestPopup] = useState(false);

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
      fetchSearchResults(query);
    }, 300),
    []
  );

  const handleOnChangeEvents = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);

    if (newValue.trim()) {
      debouncedFetchApiCall(newValue);
    } else {
      // If search is cleared, fetch initial results
      fetchSearchResults("", true);
    }
  };

  const handleSearchedEventClick = (event) => {
    setSearchValue(event?.match_name)
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
  const fetchSearchResults = async (query, isInitialLoad = false) => {
      try {
        setSearchEventLoader(true);
        setSearchedEvents([]);
        setHasSearched(true);
  
        // For initial load or empty query, send empty string to get default/popular results
        const searchQuery = isInitialLoad ? "" : query ? query.trim() : "";
  
        console.log("Making API call with searchQuery:", searchQuery); // Debug log
  
        let response = await FetchPerformerOrVenueListing("", {
          query: searchQuery,
        });
        delete response?.data?.venues;
        delete response?.data?.performers;
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

    const handleSearchFocus = (e) => {
    if (!searchValue || searchValue.trim() === "") {
      // First time focus without any search value - call with empty query
      fetchSearchResults("", true);
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
  const handleSearchBlur = () => {
    // Delay hiding dropdown to allow for clicks
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 150);
  };
  

  const filterSearch = () => {
    return (
      <div className="pb-4">
        {/* <FloatingLabelInput
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
        /> */}
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
                  // handleBulkNavigateClick={handleBulkNavigateClick}
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
              parentClassName="!w-[550px]"
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

  const handleColumnsReorder = (newColumns) => {
    setColumnOrder(newColumns);
  };

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

  // Enhanced Custom Match Table Component using CommonInventoryTable
  const CustomMatchTable = ({ matchData }) => {
    const { matchInfo, tickets, matchIndex, filters } = matchData;
    const [isCollapsed, setIsCollapsed] = useState(
      collapsedMatches[matchIndex] ?? true
    );

    const handleToggleCollapse = () => {
      const newState = !isCollapsed;
      console.log("Toggle collapse", newState);
      setIsCollapsed(newState);
      setCollapsedMatches((prev) => ({
        ...prev,
        [matchIndex]: newState,
      }));
    };

    // Convert match info to the format expected by CommonInventoryTable
    const matchDetails = {
      match_name: matchInfo?.match_name,
      match_date_format: new Date(matchInfo?.match_date).toLocaleDateString(),
      match_time: matchInfo?.match_time,
      stadium_name: matchInfo?.stadium_name,
      country_name: matchInfo?.country_name,
      city_name: matchInfo?.city_name,
    };

    return (
      <CommonInventoryTable
        inventoryData={tickets}
        headers={filteredHeaders}
        selectedRows={selectedRows.filter((index) => {
          const ticket = ticketsData[index];
          return ticket && ticket.matchIndex === matchIndex;
        })}
        setSelectedRows={setSelectedRows}
        handleCellEdit={handleCellEdit}
        handleHandAction={handleHandAction}
        handleUploadAction={handleUploadAction}
        handleSelectAll={handleSelectAll}
        handleDeselectAll={handleDeselectAll}
        matchDetails={matchDetails}
        isEditMode={false}
        editingRowIndex={null}
        mode="multiple"
        showAccordion={true}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        matchIndex={matchIndex}
        totalTicketsCount={tickets.length}
        getStickyColumnsForRow={getStickyColumnsForRow}
        stickyHeaders={["", "", ""]} // Removed empty header for chevron
        stickyColumnsWidth={150}
      />
    );
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
          addInventoryText="Add Inventory"
          isDraggableColumns={true}
          isDraggableFilters={true}
          showColumnSearch={true}
          showFilterSearch={false}
          onColumnsReorder={handleColumnsReorder}
        />

        {/* Pagination Component - Positioned below filters */}
        {groupedTicketsData.length > 0 && (
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
        )}
      </div>

      {/* Main Content Area with Common Tables */}
      {isLoading ? (
        <ShimmerLoader />
      ) : (
        <>
          <div className="m-6 max-h-[calc(100vh-460px)] overflow-y-auto">
            {groupedTicketsData.length > 0 ? (
              groupedTicketsData.map((matchData, index) => (
                <div key={`match-${matchData.matchIndex}`} className="not-last:mb-4">
                  <CustomMatchTable matchData={matchData} />
                </div>
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
