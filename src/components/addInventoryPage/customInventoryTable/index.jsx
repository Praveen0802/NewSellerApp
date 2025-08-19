// Fixed CommonInventoryTable.js with working increasedWidth

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
  // NEW: Props for edit confirmation
  pendingEdits = {}, // Object containing pending edits
  onConfirmEdit, // Function to handle confirm
  onCancelEdit, // Function to handle cancel
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

  // OPTIMIZED: Dynamic options state with better structure
  const [dynamicOptions, setDynamicOptions] = useState({});

  // OPTIMIZED: More granular tracking of fetched options to prevent duplicate calls
  const [fetchedOptionsCache, setFetchedOptionsCache] = useState(new Set());
  const [isFetchingOptions, setIsFetchingOptions] = useState(new Set());

  // NEW: Animation states for accordion
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Refs for sticky table functionality
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mainTableRef = useRef(null);
  const stickyTableRef = useRef(null);

  // NEW: Function to check if row has pending edits
  const hasPendingEdits = useCallback(
    (matchIdx, rowIndex) => {
      const rowKey = `${matchIdx}_${rowIndex}`;
      return (
        pendingEdits[rowKey] && Object.keys(pendingEdits[rowKey]).length > 0
      );
    },
    [pendingEdits]
  );

  // NEW: Dynamic sticky columns width calculation
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
      minWidth: isMobile ? "100px" : "130px",
      width: isMobile ? "100px" : "130px",
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

  // Handle accordion toggle with smooth animation
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
  }, [isCollapsed, isAnimating]);

  // Effect to calculate content height when data changes
  useEffect(() => {
    if (!isCollapsed && contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setContentHeight(height);
    }
  }, [inventoryData, isCollapsed]);

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
            const options = await fetchBlockDetails("", {
              match_id: matchId,
              category_id: categoryId,
            }).then((res) =>
              res && Array.isArray(res)
                ? res.map((item) => ({ label: item.block_id, value: item.id }))
                : []
            );

            setDynamicOptions((prev) => ({
              ...prev,
              [cacheKey]: { matchId, categoryId, options },
            }));
          } catch (error) {
            console.error("Error fetching dynamic options:", error);
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
    [dynamicOptions, fetchedOptionsCache]
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
                <Tooltip content={`${matchDetails?.listingTickets} Listing`}>
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
          </div>
        </div>
      )}

      {/* Animated Table Content Container */}
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          height: isCollapsed
            ? 0
            : contentHeight === "auto"
            ? "auto"
            : `${contentHeight}px`,
          opacity: isCollapsed ? 0 : 1,
        }}
      >
        {/* Table Content */}
        <div
          className="w-full bg-white relative"
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
                      } border-r border-[#DADBE5]`}
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
                          } text-gray-600 border-[#DADBE5] rounded focus:ring-blue-500 ${
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
                        className={`border-b border-[#DADBE5] transition-colors ${
                          isSelected
                            ? "bg-[#EEF1FD]"
                            : "bg-white hover:bg-gray-50"
                        } ${isRowDisabled ? "opacity-60 bg-gray-50" : ""}`}
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
                              } text-gray-600 border-[#DADBE5] rounded focus:ring-blue-500 ${
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
              style={{ minWidth: isMobile ? "800px" : "1200px" }}
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
                        } border-r border-[#DADBE5]`}
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
                            } whitespace-nowrap overflow-hidden text-ellipsis align-middle border-r border-[#DADBE5] ${
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
                                    alt="tick"
                                    className="cursor-pointer  transition-colors"
                                  />
                                </div>
                              </div>
                            </td>
                            <td colSpan={2} className={``}>
                              <div className="flex justify-start pl-2 items-center h-full">
                                <div
                                  className=""
                                  onClick={() =>
                                    onConfirmEdit(matchIndex, rowIndex)
                                  }
                                  title="Confirm Changes"
                                >
                                  <Image
                                    src={successTick}
                                    width={24}
                                    height={24}
                                    alt="tick"
                                    className="cursor-pointer  transition-colors"
                                  />
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
                              } ${isRowDisabled ? "pointer-events-none" : ""} ${
                                isSelected ? "bg-[#EEF1FD]" : ""
                              } ${column.className || ""}`}
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
