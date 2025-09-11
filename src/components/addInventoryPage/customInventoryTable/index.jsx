// Updated CommonInventoryTable.js with lazy loading and infinite scroll support

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  Calendar1Icon,
  Clock,
  MapPin,
  ChartLine,
  SquareCheck,
  Loader2,
} from "lucide-react";
import ChevronRight from "@/components/commonComponents/filledChevron/chevronRight";
import oneHand from "../../../../public/oneHand.svg";
import successTick from "../../../../public/success-tick-circle.svg";
import listUnpublished from "../../../../public/linkedMenuBar.svg";
import listPublished from "../../../../public/circleTickValue.svg";
import unpublishedListingValue from "../../../../public/unpublishedListingValue.svg";
import successWrong from "../../../../public/success-wrong.svg";
import greenHand from "../../../../public/greenHand.svg";
import uploadListing from "../../../../public/uploadListing.svg";
import { MultiSelectEditableCell, SimpleEditableCell } from "../selectCell";
import { fetchBlockDetails } from "@/utils/apiHandler/request";
import ListingsMarketplace from "@/components/ModalComponents/listSalesModal";
import { dayOfWeek } from "@/utils/helperFunctions";
import ticketService from "../../../../public/ticketService.svg";
import Tooltip from "../simmpleTooltip";

const CommonInventoryTable = ({
  inventoryData,
  headers,
  selectedRows,
  setSelectedRows,
  handleCellEdit,
  handleHandAction,
  handleUploadAction,
  handleSelectAll,
  handleDeselectAll,
  matchDetails,
  isEditMode = false,
  editingRowIndex = null,
  totalTickets = 0,
  // New props for different modes
  mode = "single", // "single" for AddInventory, "multiple" for TicketsPage
  showAccordion = true,
  defaultOpen = false,
  onToggleCollapse,
  filters = {},
  // For multiple matches mode
  matchIndex,
  totalTicketsCount,
  // Sticky columns configuration
  getStickyColumnsForRow,
  stickyHeaders = ["", ""],
  stickyColumnsWidth = 100,
  // Hide chevron down arrow
  hideChevronDown = false,
  // Props for edit confirmation
  pendingEdits = {}, // Object containing pending edits
  onConfirmEdit, // Function to handle confirm
  onCancelEdit, // Function to handle cancel
  // NEW: Props for lazy loading and infinite scroll
  isLoading = false, // Loading state for this specific match
  onLoadMore, // Function to load more tickets
  hasMoreData = false, // Whether there are more tickets to load
}) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [hasScrolledLeft, setHasScrolledLeft] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showMarketPlaceModal, setShowMarketPlaceModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultOpen ? false : true);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // NEW: Loading state for infinite scroll
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // OPTIMIZED: Dynamic options state with better structure
  const [dynamicOptions, setDynamicOptions] = useState({});

  // OPTIMIZED: More granular tracking of fetched options to prevent duplicate calls
  const [fetchedOptionsCache, setFetchedOptionsCache] = useState(new Set());
  const [isFetchingOptions, setIsFetchingOptions] = useState(new Set());

  // Animation states for accordion
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Refs for sticky table functionality
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mainTableRef = useRef(null);
  const stickyTableRef = useRef(null);

  // NEW: Ref for infinite scroll detection
  const loadMoreTriggerRef = useRef(null);

  // Function to check if row has pending edits
  const hasPendingEdits = useCallback(
    (matchIdx, rowIndex) => {
      const rowKey = `${matchIdx}_${rowIndex}`;
      return (
        pendingEdits[rowKey] && Object.keys(pendingEdits[rowKey]).length > 0
      );
    },
    [pendingEdits]
  );

  // Dynamic sticky columns width calculation
  const calculateStickyWidth = useCallback(() => {
    // Check if any row has pending edits
    const hasAnyPendingEdits = inventoryData.some((_, rowIndex) =>
      hasPendingEdits(matchIndex, rowIndex)
    );

    // If in bulk edit mode, return normal width
    const isBulkEditMode =
      isEditMode &&
      (Array.isArray(editingRowIndex) ? editingRowIndex.length > 1 : false);

    if (isBulkEditMode) {
      return stickyColumnsWidth;
    }

    // If any row has pending edits, increase width for confirm/cancel buttons
    return hasAnyPendingEdits
      ? Math.max(stickyColumnsWidth, 160)
      : stickyColumnsWidth;
  }, [
    inventoryData,
    matchIndex,
    hasPendingEdits,
    isEditMode,
    editingRowIndex,
    stickyColumnsWidth,
  ]);

  const dynamicStickyWidth = calculateStickyWidth();

  // Function to get column width styles
  const getColumnWidth = (header) => {
    if (header.increasedWidth) {
      // Extract width value from the increasedWidth string
      const widthMatch = header.increasedWidth.match(
        /!?w-\[(\d+px)\]|!?w-(\d+)/
      );
      if (widthMatch) {
        const width = widthMatch[1] || `${widthMatch[2] * 4}px`; // Convert rem to px if needed
        return {
          width: width,
          minWidth: width,
          maxWidth: width,
        };
      }
      // For other formats like min-w-[100px]
      const minWidthMatch = header.increasedWidth.match(/!?min-w-\[(\d+px)\]/);
      if (minWidthMatch) {
        return {
          minWidth: minWidthMatch[1],
          width: minWidthMatch[1],
        };
      }
    }

    // Default responsive widths
    return {
      minWidth: isMobile ? "100px" : isTablet ? "120px" : "130px",
      width: isMobile ? "100px" : isTablet ? "120px" : "130px",
    };
  };

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // UPDATED: Handle accordion toggle with lazy loading integration
  const handleAccordionToggle = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);

    if (isCollapsed) {
      setIsCollapsed(false);
      setTimeout(() => {
        if (contentRef.current) {
          const height = contentRef.current.scrollHeight;
          setContentHeight(height);
        }
      }, 0);

      // NEW: Trigger onToggleCollapse for lazy loading
      if (onToggleCollapse) {
        onToggleCollapse(matchIndex);
      }
    } else {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
        contentRef.current.offsetHeight;
        setContentHeight(0);
      }

      setTimeout(() => {
        setIsCollapsed(true);
      }, 300);
    }

    setTimeout(() => {
      setIsAnimating(false);
      if (!isCollapsed) {
        setContentHeight("auto");
      }
    }, 300);
  }, [isCollapsed, isAnimating, onToggleCollapse, matchIndex]);

  // Effect to calculate content height when data changes
  useEffect(() => {
    if (!isCollapsed && contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [inventoryData, isCollapsed]);

  // NEW: Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMoreData || !onLoadMore || isLoadingMore) return;

    const currentTrigger = loadMoreTriggerRef.current;
    if (!currentTrigger) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          onLoadMore().finally(() => {
            setIsLoadingMore(false);
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(currentTrigger);

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [hasMoreData, onLoadMore, isLoadingMore]);

  // Default sticky columns configuration for single mode
  const getDefaultStickyColumnsForRow = (rowData, rowIndex) => {
    return [
      {
        key: "",
        icon: (
          <Image
            src={rowData?.tickets_in_hand ? greenHand : oneHand}
            alt="tick"
            width={isMobile ? 14 : 16}
            height={isMobile ? 14 : 16}
            className={`${
              rowData?.tickets_in_hand ? "text-green-500" : "text-gray-400"
            } cursor-pointer hover:text-blue-500 transition-colors`}
            onClick={() => handleHandAction(rowData, rowIndex)}
          />
        ),
        className: "py-2 text-center border-r border-[#E0E1EA]",
      },
      {
        key: "",
        icon: (
          <Image
            src={uploadListing}
            alt="tick"
            width={isMobile ? 14 : 16}
            height={isMobile ? 14 : 16}
            className="cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => handleUploadAction(rowData, rowIndex)}
          />
        ),
        className: "py-2 text-center",
      },
    ];
  };

  const getStickyColumns =
    getStickyColumnsForRow || getDefaultStickyColumnsForRow;

  // OPTIMIZED: fetchDynamicOptions function with caching
  // OPTIMIZED: fetchDynamicOptions function with caching and using filters data
  const fetchDynamicOptions = useCallback(
    async (row, header) => {
      if (!header.dynamicOptions) return;

      switch (header.key) {
        case "block":
          const matchId = row.rawTicketData?.match_id;
          const categoryId = row.ticket_category_id;

          if (!matchId || !categoryId) {
            return;
          }

          // Create a unique cache key for this combination
          const cacheKey = `${header.key}-${matchId}-${categoryId}`;

          // Check if we already have this data or are currently fetching it
          if (
            fetchedOptionsCache.has(cacheKey) ||
            (dynamicOptions?.block?.categoryId === categoryId &&
              dynamicOptions?.block?.matchId === matchId)
          ) {
            return;
          }

          // Mark as being fetched to prevent duplicate calls
          setFetchedOptionsCache((prev) => new Set([...prev, cacheKey]));

          try {
            // UPDATED: Use block_details from filters instead of API call
            let options = [];

            // Get block_details from filters for this specific category
            if (filters?.block_details && filters.block_details[categoryId]) {
              options = filters.block_details[categoryId].map((item) => ({
                label: item.block_id,
                value: item.id,
              }));
            }

            setDynamicOptions((prev) => ({
              ...prev,
              [cacheKey]: { matchId, categoryId, options },
            }));
          } catch (error) {
            console.error("Error processing dynamic options:", error);
            // Remove from cache on error so it can be retried
            setFetchedOptionsCache((prev) => {
              const newSet = new Set(prev);
              newSet.delete(cacheKey);
              return newSet;
            });
          }
          break;
        default:
          break;
      }
    },
    [dynamicOptions, fetchedOptionsCache, filters]
  );

  // OPTIMIZED: Effect to fetch dynamic options only when accordion is open and data is available
  useEffect(() => {
    // Only fetch when accordion is open (not collapsed)
    if (isCollapsed || inventoryData.length === 0 || headers.length === 0) {
      return;
    }

    const fetchAllDynamicOptions = async () => {
      // Get unique combinations to avoid duplicate API calls
      const uniqueCombinations = new Map();

      for (const row of inventoryData) {
        for (const header of headers) {
          if (header.dynamicOptions && header.key === "block") {
            const matchId = row.rawTicketData?.match_id;
            const categoryId = row.ticket_category_id;

            if (matchId && categoryId) {
              const key = `${matchId}-${categoryId}`;
              if (!uniqueCombinations.has(key)) {
                uniqueCombinations.set(key, { row, header });
              }
            }
          }
        }
      }

      // Fetch options for unique combinations only
      for (const [key, { row, header }] of uniqueCombinations) {
        await fetchDynamicOptions(row, header);
      }
    };

    fetchAllDynamicOptions();
  }, [inventoryData, headers, isCollapsed, fetchDynamicOptions]);

  useEffect(() => {
    return () => {
      setIsFetchingOptions({});
      setDynamicOptions({});
    };
  }, [matchDetails?.match_id]);

  // Function to check scroll capabilities and update state
  const checkScrollCapabilities = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    setHasScrolledLeft(scrollLeft > 0);
    setHasScrolled(scrollLeft > 0);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (!scrollContainerRef.current || !canScrollLeft) return;

    const container = scrollContainerRef.current;
    const scrollAmount = Math.min(
      isMobile ? 200 : 300,
      container.clientWidth / 3
    );

    container.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollContainerRef.current || !canScrollRight) return;

    const container = scrollContainerRef.current;
    const scrollAmount = Math.min(
      isMobile ? 200 : 300,
      container.clientWidth / 3
    );

    container.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  // Set up scroll event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollCapabilities();

    const handleScroll = () => {
      checkScrollCapabilities();
    };

    container.addEventListener("scroll", handleScroll);

    const handleResize = () => {
      setTimeout(checkScrollCapabilities, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [inventoryData]);

  // Check scroll capabilities when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      checkScrollCapabilities();
    }, 100);

    return () => clearTimeout(timer);
  }, [inventoryData, isCollapsed]);

  // Synchronize row heights between main and sticky tables
  useEffect(() => {
    const syncRowHeights = () => {
      if (!mainTableRef.current || !stickyTableRef.current) return;

      const mainRows = mainTableRef.current.querySelectorAll("tbody tr");
      const stickyRows = stickyTableRef.current.querySelectorAll("tbody tr");

      if (mainRows.length !== stickyRows.length) return;

      mainRows.forEach((row) => (row.style.height = "auto"));
      stickyRows.forEach((row) => (row.style.height = "auto"));

      const mainHeaderRow = mainTableRef.current.querySelector("thead tr");
      const stickyHeaderRow = stickyTableRef.current.querySelector("thead tr");

      if (mainHeaderRow && stickyHeaderRow) {
        const headerHeight = mainHeaderRow.offsetHeight;
        stickyHeaderRow.style.height = `${headerHeight}px`;
      }

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

  // Render editable cell function
  const renderEditableCell = (
    row,
    header,
    rowIndex,
    isRowHovered,
    isDisabled = false
  ) => {
    const isRowEditable =
      !isEditMode ||
      (Array.isArray(editingRowIndex)
        ? editingRowIndex.includes(rowIndex)
        : editingRowIndex === rowIndex);
    const shouldShowAsEditable = isRowEditable && !isDisabled;

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

    const fieldKey = `${header?.key}-${row?.rawTicketData?.match_id}-${row?.ticket_category_id}`;

    const fetchOptions = () =>
      (header.dynamicOptions
        ? dynamicOptions[fieldKey]?.options
        : header.options) || [];

    if (header.type === "multiselect") {
      return (
        <MultiSelectEditableCell
          value={row[header.key]}
          options={header.options || []}
          onSave={(value) =>
            handleCellEdit(rowIndex, header.key, value, row, matchIndex)
          }
          className={header.className || ""}
          isRowHovered={shouldShowAsEditable}
          disabled={!isRowEditable || isDisabled}
          placeholder="Select options..."
          alwaysShowAsEditable={true}
        />
      );
    }

    return (
      <SimpleEditableCell
        rowValue={row}
        value={row[header.key]}
        type={header.type || "text"}
        options={fetchOptions()}
        onSave={(value) =>
          handleCellEdit(rowIndex, header.key, value, row, matchIndex)
        }
        className={header.className || ""}
        isRowHovered={shouldShowAsEditable}
        disabled={!isRowEditable || isDisabled}
        placeholder={getPlaceholder()}
        iconBefore={header.iconBefore || null}
        currencyFormat={header.currencyFormat || false}
        decimalValue={header.decimalValue || false}
        alwaysShowAsEditable={true}
      />
    );
  };

  const renderMatchLocation = (matchDetails) => {
    if (!matchDetails) return null;

    const { stadium_name, city_name, country_name } = matchDetails;

    const location = [
      stadium_name ? `${stadium_name},` : "",
      city_name ? `${city_name},` : "",
      country_name ? `${country_name}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span className="text-white max-w-xs truncate text-xs" title={location}>
        {location}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="border border-gray-200 rounded-lg overflow-hidden relative shadow-sm"
    >
      {/* Accordion Header */}
      {showAccordion && (
        <div
          className="bg-[#343432] cursor-pointer"
          onClick={handleAccordionToggle}
        >
          <div className="flex items-center justify-between">
            {/* Mobile Layout */}
            {isMobile ? (
              <div className="flex flex-col w-full">
                {/* Top Row - Event Info */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#51428E]">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-white text-sm leading-tight truncate"
                      title={
                        matchDetails?.match_name &&
                        matchDetails?.tournament_name
                          ? `${matchDetails.match_name} - ${matchDetails.tournament_name}`
                          : matchDetails?.match_name || "Match Details"
                      }
                    >
                      {matchDetails?.match_name || "Match Details"}
                    </h3>
                    {matchDetails?.tournament_name && (
                      <div className="text-xs text-white opacity-80 truncate mt-0.5">
                        {matchDetails.tournament_name}
                      </div>
                    )}
                  </div>

                  {/* Chevron */}
                  <div
                    className={`bg-[#FFFFFF26] rounded-full cursor-pointer transition-transform duration-200 flex-shrink-0 p-1.5 ml-3 ${
                      isAnimating ? "scale-95" : "hover:scale-105"
                    }`}
                  >
                    <ChevronDown
                      size={12}
                      className={`text-white transition-transform duration-300 ease-in-out ${
                        !isCollapsed ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Bottom Row - Date, Time, Location, Stats, Action */}
                <div className="flex items-center px-4 py-2">
                  {/* Date & Time */}
                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <Calendar1Icon
                        size={12}
                        className="text-white flex-shrink-0"
                      />
                      <span className="text-white text-xs">
                        {dayOfWeek(matchDetails?.match_date_format)?.split(
                          ","
                        )[0] || ""}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={12} className="text-white flex-shrink-0" />
                      <span className="text-white text-xs">
                        {matchDetails?.match_time}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center space-x-1 flex-1 min-w-0 ml-3">
                    <MapPin size={12} className="text-white flex-shrink-0" />
                    <span className="text-white text-xs truncate">
                      {[
                        matchDetails?.stadium_name
                          ? `${matchDetails.stadium_name},`
                          : "",
                        matchDetails?.city_name
                          ? `${matchDetails.city_name},`
                          : "",
                        matchDetails?.country_name
                          ? `${matchDetails.country_name}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                    {matchDetails?.totalTickets && (
                      <Tooltip
                        content={`${matchDetails?.totalTickets} Tickets`}
                      >
                        <div className="flex gap-1 items-center">
                          <Image
                            src={ticketService}
                            width={12}
                            height={12}
                            alt="tickets"
                            className="flex-shrink-0"
                          />
                          <span className="text-white text-xs">
                            {matchDetails?.totalTickets}
                          </span>
                        </div>
                      </Tooltip>
                    )}

                    {matchDetails?.listingTickets && (
                      <Tooltip
                        content={`${matchDetails?.listingTickets} Listing`}
                      >
                        <div className="flex gap-1 items-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                            <SquareCheck size={8} className="text-white" />
                          </div>
                          <span className="text-white text-xs">
                            {matchDetails?.listingTickets}
                          </span>
                        </div>
                      </Tooltip>
                    )}
                  </div>

                  {/* Market Data Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMarketPlaceModal(true);
                    }}
                    className="flex items-center justify-center bg-[#FFFFFF26] border border-[#FFFFFF3A] text-[#FFFFFF] p-2 rounded-md cursor-pointer ml-2 flex-shrink-0"
                    title="Market Data"
                  >
                    <ChartLine size={14} className="text-[#64EAA5]" />
                  </button>
                </div>
              </div>
            ) : (
              // Desktop Layout
              <>
                <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
                  {mode === "single" ? (
                    <div
                      className={`flex ${
                        isMobile ? "w-[40px]" : "w-[50px]"
                      } justify-center ${
                        isMobile ? "py-3" : "py-4"
                      } border-r-[1px] border-[#51428E] items-center`}
                    >
                      <div
                        className={`${
                          isMobile ? "w-3 h-3" : "w-4 h-4"
                        } border-2 border-white rounded-full flex items-center justify-center`}
                      >
                        <div
                          className={`${
                            isMobile ? "w-1.5 h-1.5" : "w-2 h-2"
                          } bg-white rounded-full`}
                        ></div>
                      </div>
                    </div>
                  ) : null}

                  <div
                    className={`flex items-center space-x-2 sm:space-x-4 ${
                      isMobile
                        ? "py-3 px-2"
                        : `py-4 ${mode == "single" ? "" : "px-4"}`
                    } border-r-[1px] border-[#51428E] ${
                      isMobile ? "w-[200px]" : "w-[280px]"
                    }`}
                  >
                    <h3
                      className={`font-medium ${
                        isMobile ? "text-xs" : "text-sm"
                      } text-white truncate`}
                    >
                      {matchDetails?.match_name || "Match Details"}
                      {matchDetails?.tournament_name
                        ? ` - ${matchDetails?.tournament_name}`
                        : ""}
                    </h3>
                  </div>

                  <div
                    className={`flex items-center ${
                      isMobile ? "space-x-2" : "space-x-4 sm:space-x-6"
                    } text-xs`}
                  >
                    <div
                      className={`flex items-center space-x-1 sm:space-x-2 ${
                        isMobile ? "py-3 pr-2" : "py-4 pr-4"
                      } ${
                        isMobile ? "w-[130px]" : "w-[170px]"
                      } border-r-[1px] border-[#51428E]`}
                    >
                      <Calendar1Icon
                        size={isMobile ? 12 : 14}
                        className="text-white"
                      />
                      <span
                        className={`text-white ${
                          isMobile ? "text-[10px]" : "text-xs"
                        } truncate`}
                      >
                        {dayOfWeek(matchDetails?.match_date_format)}
                      </span>
                    </div>

                    <div
                      className={`flex items-center space-x-1 sm:space-x-2 ${
                        isMobile ? "py-3 pr-2" : "py-4 pr-4"
                      } border-r-[1px] border-[#51428E] ${
                        isMobile ? "w-[70px]" : "w-[90px]"
                      }`}
                    >
                      <Clock size={isMobile ? 12 : 14} className="text-white" />
                      <span
                        className={`text-white ${
                          isMobile ? "text-[10px]" : "text-xs"
                        } truncate`}
                      >
                        {matchDetails?.match_time}
                      </span>
                    </div>

                    {!isMobile && (
                      <div className="flex items-center space-x-2 py-4 pr-4">
                        <MapPin size={14} className="text-white" />
                        {renderMatchLocation(matchDetails)}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center ${
                    isMobile ? "space-x-2 pr-2" : "space-x-4 pr-4"
                  }`}
                >
                  {matchDetails?.listingTickets && (
                    <Tooltip
                      content={`${matchDetails?.listingTickets} Listing`}
                    >
                      <div className="flex w-[30px] gap-1 items-center">
                        <Image
                          src={listUnpublished}
                          width={20}
                          height={20}
                          alt="logo"
                        />
                        <span className={`text-white  text-[12px] text-right`}>
                          {matchDetails?.listingTickets}
                        </span>
                      </div>
                    </Tooltip>
                  )}
                  {matchDetails?.unPublishedTickets > 0 && (
                    <Tooltip
                      content={`${matchDetails?.unPublishedTickets} Un Published`}
                    >
                      <div className="flex w-[30px] gap-1 items-center">
                        <Image
                          src={unpublishedListingValue}
                          width={20}
                          height={20}
                          alt="logo"
                        />
                        <span className={`text-white  text-[12px] text-right`}>
                          {matchDetails?.unPublishedTickets}
                        </span>
                      </div>
                    </Tooltip>
                  )}
                  {matchDetails?.publishedTickets && (
                    <Tooltip
                      content={`${matchDetails?.publishedTickets} Published`}
                    >
                      <div className="flex gap-1 w-[30px] items-center">
                        <Image
                          src={listPublished}
                          width={20}
                          height={20}
                          alt="logo"
                        />
                        <span className={`text-white text-[12px] text-right`}>
                          {matchDetails?.publishedTickets}
                        </span>
                      </div>
                    </Tooltip>
                  )}

                  {matchDetails?.totalTickets && (
                    <Tooltip content={`${matchDetails?.totalTickets} Tickets`}>
                      <div className="flex gap-1 w-[30px] items-center">
                        <Image
                          src={ticketService}
                          width={16}
                          height={16}
                          alt="logo"
                        />
                        <span className={`text-white text-[12px] text-right`}>
                          {matchDetails?.totalTickets}
                        </span>
                      </div>
                    </Tooltip>
                  )}
                  {!isMobile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMarketPlaceModal(true);
                      }}
                      className="flex items-center gap-1 bg-[#FFFFFF26] border border-[#FFFFFF3A] text-[#FFFFFF] text-sm p-2 rounded-md cursor-pointer"
                    >
                      <ChartLine size={16} className="text-[#64EAA5]" />
                      Market Data
                    </button>
                  )}

                  <div
                    className={`bg-[#FFFFFF26] ${
                      isMobile ? "p-1.5" : "p-2"
                    } rounded-full cursor-pointer transition-transform duration-200 ${
                      isAnimating ? "scale-95" : "hover:scale-105"
                    }`}
                  >
                    <ChevronDown
                      size={isMobile ? 12 : 14}
                      className={`text-white transition-transform duration-300 ease-in-out ${
                        !isCollapsed ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Animated Table Content Container */}
      <div
        ref={contentRef}
        className="transition-all max-h-[500px] overflow-auto hideScrollbar duration-300 ease-in-out"
        style={{
          height: isCollapsed
            ? 0
            : contentHeight === "auto"
            ? "auto"
            : `${contentHeight}px`,
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {/* NEW: Loading State Display */}
        {isLoading && inventoryData.length === 0 ? (
          <div className="flex items-center justify-center p-8 bg-white">
            <div className="flex items-center space-x-2">
              <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
              <span className="text-gray-600">Loading tickets...</span>
            </div>
          </div>
        ) : inventoryData.length === 0 && !isLoading ? (
          <div className="flex items-center justify-center p-8 bg-white">
            <div className="text-center">
              <div className="text-gray-500 mb-2">No tickets found</div>
              <div className="text-sm text-gray-400">
                This match has no tickets to display
              </div>
            </div>
          </div>
        ) : (
          /* Table Content */
          <div
            className="w-full bg-white relative "
            style={{ overflow: "visible" }}
          >
            {/* Sticky Left Column for Checkbox */}
            <div
              className={`absolute top-0 left-0 h-full bg-white border-r border-[#DADBE5] z-30 transition-shadow duration-200 ${
                hasScrolledLeft ? "shadow-md" : ""
              }`}
              style={{ width: isMobile ? `40px` : `50px` }}
            >
              <div className="h-full">
                <table className="w-full h-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#DADBE5]">
                      <th
                        className={`${
                          isMobile ? "px-2 py-2" : "px-3 py-3"
                        } text-center text-[#7D82A4] font-medium whitespace-nowrap ${
                          isMobile ? "text-[10px]" : "text-xs"
                        } border-r border-[#DADBE5] ${
                          isEditMode ? "cursor-not-allowed" : "cursor-pointer"
                        }`}
                        onClick={(e) => {
                          if (isEditMode) return;

                          // Prevent toggling if clicking directly on the checkbox
                          if (e.target.type === "checkbox") return;

                          // Use the same logic as the checkbox onChange
                          if (selectedRows.length > 0) {
                            handleDeselectAll();
                          } else {
                            handleSelectAll();
                          }
                        }}
                      >
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
                            className={`${
                              isMobile ? "w-3 h-3" : "w-4 h-4"
                            } text-gray-600 accent-[#343432] border-[#DADBE5] rounded focus:ring-blue-500 ${
                              isEditMode
                                ? "cursor-not-allowed opacity-50"
                                : "cursor-pointer"
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
                        isEditMode &&
                        (Array.isArray(editingRowIndex)
                          ? !editingRowIndex.includes(rowIndex)
                          : editingRowIndex !== rowIndex);

                      return (
                        <tr
                          key={`sticky-left-${row.id || rowIndex}`}
                          className={`border-b border-[#DADBE5] transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#EEF1FD]"
                              : "bg-white hover:bg-gray-50"
                          } ${
                            isRowDisabled
                              ? "opacity-60 bg-gray-50 cursor-not-allowed"
                              : ""
                          }`}
                          onClick={(e) => {
                            if (isRowDisabled) return;

                            // Prevent toggling if clicking directly on the checkbox
                            if (e.target.type === "checkbox") return;

                            const newSelectedRows = isSelected
                              ? selectedRows.filter(
                                  (index) => index !== rowIndex
                                )
                              : [...selectedRows, rowIndex];
                            setSelectedRows(newSelectedRows);
                          }}
                        >
                          <td
                            className={`${
                              isMobile ? "py-1.5 px-2" : "py-2 px-3"
                            } text-center whitespace-nowrap border-r border-[#DADBE5]`}
                          >
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
                                className={`${
                                  isMobile ? "w-3 h-3" : "w-4 h-4"
                                } accent-[#343432] border-[#DADBE5] rounded focus:ring-blue-500 ${
                                  isRowDisabled
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
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
                paddingLeft: isMobile ? `40px` : `50px`,
                paddingRight: `${dynamicStickyWidth}px`,
              }}
            >
              <table
                ref={mainTableRef}
                className="w-full border-none"
                style={{
                  minWidth: isMobile ? "800px" : isTablet ? "1000px" : "1200px",
                }}
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-[#DADBE5]">
                    {headers.map((header) => {
                      const columnStyles = getColumnWidth(header);
                      return (
                        <th
                          key={header.key}
                          className={`${
                            isMobile ? "px-2 py-2" : "px-3 py-3"
                          } text-left text-[#7D82A4] font-medium whitespace-nowrap ${
                            isMobile ? "text-[10px]" : "text-xs"
                          }  border-r border-[#DADBE5]`}
                          style={columnStyles}
                        >
                          <div className="flex justify-between items-center">
                            <span className="truncate text-[#7D82A4]">
                              {header.label}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {inventoryData.map((row, rowIndex) => {
                    const isSelected = selectedRows.includes(rowIndex);
                    const isRowDisabled =
                      isEditMode &&
                      (Array.isArray(editingRowIndex)
                        ? !editingRowIndex.includes(rowIndex)
                        : editingRowIndex !== rowIndex);

                    return (
                      <tr
                        key={row.id || rowIndex}
                        className={`border-b border-[#DADBE5] transition-colors ${
                          isSelected
                            ? "bg-[#EEF1FD]"
                            : "bg-white hover:bg-gray-50"
                        } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
                      >
                        {headers.map((header) => {
                          const columnStyles = getColumnWidth(header);
                          return (
                            <td
                              key={`${rowIndex}-${header.key}`}
                              className={`${
                                isMobile
                                  ? "py-1.5 px-2 text-[10px]"
                                  : "py-2 px-3 text-xs"
                              } whitespace-nowrap ${
                                header?.increasedWidth
                              }  overflow-hidden text-ellipsis align-middle border-r border-[#DADBE5] ${
                                isRowDisabled ? "bg-gray-50" : ""
                              } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                              style={columnStyles}
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
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* NEW: Infinite Scroll Trigger and Load More Button */}
              {hasMoreData && (
                <div className="w-full">
                  {/* Invisible trigger for intersection observer */}
                  <div ref={loadMoreTriggerRef} className="h-1 w-full" />

                  {/* Loading indicator or load more button */}
                  <div className="flex justify-center py-4">
                    {isLoadingMore ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                        <span className="text-gray-600">
                          Loading more tickets...
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (onLoadMore && !isLoadingMore) {
                            setIsLoadingMore(true);
                            onLoadMore().finally(() => {
                              setIsLoadingMore(false);
                            });
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        disabled={isLoadingMore}
                      >
                        Load More Tickets
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Right Column for Action Icons */}
            <div
              className={`absolute top-0 right-0 h-full bg-white border-l border-[#DADBE5] z-20 transition-shadow duration-200 ${
                hasScrolled ? "shadow-md" : ""
              }`}
              style={{ width: `${dynamicStickyWidth}px` }}
            >
              <div className="h-full">
                <table
                  ref={stickyTableRef}
                  className="w-full h-full border-collapse"
                >
                  <thead>
                    <tr className="bg-gray-50 border-b border-[#DADBE5]">
                      {/* Always show 4 headers for consistency */}
                      {stickyHeaders.map((header, index) => (
                        <th
                          key={`sticky-header-${index}`}
                          className={`${
                            isMobile ? "py-1.5 px-1" : "py-2 px-2"
                          } text-left text-[#7D82A4] ${
                            isMobile ? "text-[10px]" : "text-xs"
                          } whitespace-nowrap text-center`}
                          style={{
                            width: `${
                              dynamicStickyWidth / stickyHeaders.length
                            }px`,
                            minWidth: `${
                              dynamicStickyWidth / stickyHeaders.length
                            }px`,
                            maxWidth: `${
                              dynamicStickyWidth / stickyHeaders.length
                            }px`,
                          }}
                        >
                          <div className="flex items-center justify-center">
                            {!hideChevronDown &&
                              index === stickyHeaders.length - 1 && (
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scrollLeft();
                                    }}
                                    disabled={!canScrollLeft}
                                    className={`${
                                      isMobile ? "p-0.5" : "p-1"
                                    } rounded transition-colors ${
                                      canScrollLeft
                                        ? "text-[#7D82A4] hover:bg-gray-200 cursor-pointer"
                                        : "text-gray-300 cursor-not-allowed"
                                    }`}
                                    title="Scroll Left"
                                  >
                                    <ChevronRight
                                      size={isMobile ? 12 : 14}
                                      className="rotate-180"
                                      color={canScrollLeft ? "" : "#B4B7CB"}
                                    />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      scrollRight();
                                    }}
                                    disabled={!canScrollRight}
                                    className={`${
                                      isMobile ? "p-0.5" : "p-1"
                                    } rounded transition-colors ${
                                      canScrollRight
                                        ? "text-[#7D82A4] hover:bg-gray-200 cursor-pointer"
                                        : "text-gray-300 cursor-not-allowed"
                                    }`}
                                    title="Scroll Right"
                                  >
                                    <ChevronRight
                                      size={isMobile ? 12 : 14}
                                      color={canScrollRight ? "" : "#B4B7CB"}
                                    />
                                  </button>
                                </div>
                              )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((row, rowIndex) => {
                      const isRowDisabled =
                        isEditMode &&
                        (Array.isArray(editingRowIndex)
                          ? !editingRowIndex.includes(rowIndex)
                          : editingRowIndex !== rowIndex);
                      const isSelected = selectedRows.includes(rowIndex);

                      // Check if this specific row has pending edits
                      const hasRowPendingEdits = hasPendingEdits(
                        matchIndex,
                        rowIndex
                      );
                      const isBulkEditMode =
                        isEditMode &&
                        (Array.isArray(editingRowIndex)
                          ? editingRowIndex.length > 1
                          : false);

                      // Get sticky columns (always the original 4 columns)
                      const stickyColumns = getStickyColumns(row, rowIndex);

                      return (
                        <tr
                          key={`sticky-${row.id || rowIndex}`}
                          className={`border-b border-[#DADBE5] transition-colors ${
                            isSelected
                              ? "bg-[#EEF1FD]"
                              : "bg-white hover:bg-gray-50"
                          } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""} `}
                        >
                          {hasRowPendingEdits && !isBulkEditMode ? (
                            // For rows with pending edits: show 2 columns with colspan=2 each (centered)
                            <>
                              <td
                                colSpan={2}
                                className={`${
                                  isMobile ? " text-xs" : " text-sm"
                                } align-middle text-left ${
                                  isRowDisabled ? "pointer-events-none" : ""
                                } ${isSelected ? "bg-[#EEF1FD]" : ""}`}
                              >
                                <div className="flex justify-end pr-2 items-center h-full">
                                  <div
                                    onClick={() =>
                                      onCancelEdit(matchIndex, rowIndex)
                                    }
                                    title="Cancel Changes"
                                  >
                                    <Image
                                      src={successWrong}
                                      width={24}
                                      height={24}
                                      alt="cancel"
                                      className="cursor-pointer  transition-colors"
                                    />
                                  </div>
                                </div>
                              </td>
                              <td colSpan={2} className={``}>
                                <div className="flex justify-start pl-2 items-center h-full">
                                  <div
                                    className=""
                                    onClick={async () => {
                                      setConfirmLoading(true);
                                      await onConfirmEdit(matchIndex, rowIndex);
                                      setConfirmLoading(false);
                                    }}
                                    title="Confirm Changes"
                                  >
                                    {confirmLoading ? (
                                      <Loader2 className="animate-spin" />
                                    ) : (
                                      <Image
                                        src={successTick}
                                        width={24}
                                        height={24}
                                        alt="confirm"
                                        className="cursor-pointer  transition-colors"
                                      />
                                    )}
                                  </div>
                                </div>
                              </td>
                            </>
                          ) : (
                            // For normal rows: show original 4 columns
                            stickyColumns.map((column, colIndex) => (
                              <td
                                key={`sticky-${rowIndex}-${colIndex}`}
                                className={`${
                                  isMobile ? "py-1.5 text-xs" : "py-2 text-sm"
                                } align-middle text-center ${
                                  colIndex < stickyColumns.length - 1
                                    ? "border-r border-[#DADBE5]"
                                    : ""
                                } ${
                                  isRowDisabled ? "pointer-events-none" : ""
                                } ${isSelected ? "bg-[#EEF1FD]" : ""} ${
                                  column.className || ""
                                }`}
                                style={{
                                  width: `${
                                    dynamicStickyWidth / stickyColumns.length
                                  }px`,
                                  minWidth: `${
                                    dynamicStickyWidth / stickyColumns.length
                                  }px`,
                                  maxWidth: `${
                                    dynamicStickyWidth / stickyColumns.length
                                  }px`,
                                }}
                                onClick={column.onClick}
                              >
                                <div className="flex justify-center items-center h-full">
                                  {column.icon}
                                </div>
                              </td>
                            ))
                          )}
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

      {showMarketPlaceModal && (
        <ListingsMarketplace
          show={showMarketPlaceModal}
          onClose={() => setShowMarketPlaceModal(false)}
          matchInfo={matchDetails}
          filters={filters}
        />
      )}
    </div>
  );
};

export default CommonInventoryTable;
