import React, { useEffect, useMemo, useRef, useState } from "react";
import chevronDown from "../../../../public/chevron-down.svg";
import Image from "next/image";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import ChevronRight from "@/components/commonComponents/filledChevron/chevronRight";
import TooltipWrapper from "@/components/TooltipWrapper";

// Utility function to format dates
export const formatDate = (dateString, format = "default") => {
  if (!dateString) return "";

  // Check if it's a valid date string
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Return original if not a valid date

  const options = {
    default: {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
    dateOnly: {
      year: "numeric",
      month: "short",
      day: "2-digit",
    },
    timeOnly: {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
    full: {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    },
  };

  return date.toLocaleDateString("en-US", options[format] || options.default);
};

// Function to detect if a string is a date format
const isDateString = (value) => {
  if (typeof value !== "string") return false;

  // Common date patterns
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{6})?Z?$/, // ISO format
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // SQL datetime format
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, // Simple datetime format (YYYY-MM-DD HH:MM)
    /^\d{4}-\d{2}-\d{2}$/, // Date only format
  ];

  // First check if it matches any pattern
  const matchesPattern = datePatterns.some((pattern) => pattern.test(value));

  if (!matchesPattern) return false;

  // For the HH:MM format, append :00 seconds for validation
  let testValue = value;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) {
    testValue = value + ":00";
  }

  return !isNaN(Date.parse(testValue));
};

// Shimmer loading component for table cells
const ShimmerCell = ({ width = "100%" }) => (
  <div
    className="animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded h-6"
    style={{ width }}
  ></div>
);

// No Records Found component
const NoRecordsFound = () => (
  <tr className="border-b border-[#E0E1EA] bg-white">
    <td colSpan="100%" className="py-12 text-center text-[#7D82A4] font-medium">
      No records found
    </td>
  </tr>
);

// Sort icon component
const SortIcon = ({ sortState, onClick }) => {
  const getSortIcon = () => {
    switch (sortState) {
      case "ASC":
        return (
          <div className="flex flex-col items-center justify-center w-3 h-4">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent border-b-blue-600"></div>
          </div>
        );
      case "DESC":
        return (
          <div className="flex flex-col items-center justify-center w-3 h-4">
            <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-l-transparent border-r-transparent border-t-blue-600"></div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center w-4 h-5 gap-0.5">
            {/* Up arrow */}
            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-b-[4px] border-l-transparent border-r-transparent border-b-gray-400"></div>
            {/* Down arrow */}
            <div className="w-0 h-0 border-l-[3px] border-r-[3px] border-t-[4px] border-l-transparent border-r-transparent border-t-gray-400"></div>
          </div>
        );
    }
  };

  return (
    <button
      onClick={onClick}
      className="ml-2 hover:bg-gray-100 rounded p-1 transition-colors flex items-center justify-center"
      aria-label={`Sort ${
        sortState === "ASC"
          ? "descending"
          : sortState === "DESC"
          ? "none"
          : "ascending"
      }`}
    >
      {getSortIcon()}
    </button>
  );
};

const StickyDataTable = ({
  headers,
  data,
  rightStickyColumns = [],
  rightStickyHeaders = [],
  loading = false,
  fetchScrollEnd = null, // Original prop, kept for compatibility
  onScrollEnd = null, // New prop name,
  handleTicketMouseEnter = () => {},
  handleTicketMouseLeave = () => {},
  dateFormatConfig = {}, // New prop for date formatting configuration
  onSort = null, // New prop for handling sort operations
  currentSort = null, // Current sort state { sortableKey: string, sort_order: 'ASC'|'DESC' }
  stickyColumnWidth = 50, // NEW: Width per sticky column in pixels (default: 50px)
  stickyColumnsConfig = {}, // NEW: Configuration object for sticky columns
}) => {
  // Use whichever callback is provided
  const scrollEndCallback = onScrollEnd || fetchScrollEnd;

  // Internal sort state management (fallback if no external state provided)
  const [internalSortState, setInternalSortState] = useState(null);

  // Use external sort state if provided, otherwise use internal
  const sortState = currentSort || internalSortState;

  // Calculate the width of sticky columns based on configuration
  const maxStickyColumnsLength =
    rightStickyColumns.length > 0
      ? Math.max(
          ...rightStickyColumns.map((cols) =>
            Array.isArray(cols) ? cols.length : 0
          ),
          0
        )
      : 0;

  // NEW: Calculate sticky columns width with configuration
  const stickyColumnsWidth = useMemo(() => {
    // If stickyColumnsConfig has totalWidth, use that
    if (stickyColumnsConfig.totalWidth) {
      return stickyColumnsConfig.totalWidth;
    }

    // If stickyColumnsConfig has individual column widths, sum them up
    if (
      stickyColumnsConfig.columnWidths &&
      Array.isArray(stickyColumnsConfig.columnWidths)
    ) {
      return stickyColumnsConfig.columnWidths.reduce(
        (sum, width) => sum + width,
        0
      );
    }

    // Fallback to the old calculation with configurable width per column
    return maxStickyColumnsLength * stickyColumnWidth;
  }, [maxStickyColumnsLength, stickyColumnWidth, stickyColumnsConfig]);

  // Split headers into regular and sticky columns
  const regularHeaders = headers.filter(
    (header) => !["actions", "buy"].includes(header.key)
  );

  // Refs for container and tables
  const containerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const mainTableRef = useRef(null);
  const stickyTableRef = useRef(null);

  // Track scroll position for shadow effect and navigation
  const [hasScrolled, setHasScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Flag to prevent multiple triggers of the scroll end callback
  const hasCalledScrollEnd = useRef(false);

  // Reference to the parent element that might have vertical scrolling
  const parentScrollRef = useRef(null);

  // Function to get the appropriate date format for a column
  const getDateFormat = (columnKey) => {
    return dateFormatConfig[columnKey] || "default";
  };

  // Function to format cell value based on its type
  const formatCellValue = (value, columnKey) => {
    if (isDateString(value)) {
      return formatDate(value, getDateFormat(columnKey));
    }
    return value;
  };

  // Handle sort click
  const handleSortClick = (header) => {
    if (!header.sortable || !header.sortableKey) return;

    // Get current sort order - handle cases where sortState is null or undefined
    const currentSortOrder =
      sortState?.sortableKey === header.sortableKey
        ? sortState?.sort_order
        : null;

    let newSortOrder;
    // Handle the sorting cycle: null/undefined -> ASC -> DESC -> null
    if (!currentSortOrder) {
      // No sort or different column - start with ASC
      newSortOrder = "ASC";
    } else if (currentSortOrder === "ASC") {
      // Currently ascending - switch to descending
      newSortOrder = "DESC";
    } else if (currentSortOrder === "DESC") {
      // Currently descending - remove sort
      newSortOrder = null;
    } else {
      // Fallback - start with ASC
      newSortOrder = "ASC";
    }

    const newSortState = newSortOrder
      ? {
          sortableKey: header.sortableKey,
          sort_order: newSortOrder,
        }
      : null;

    // Update internal state
    setInternalSortState(newSortState);

    // Call external sort handler if provided
    if (onSort && typeof onSort === "function") {
      onSort(newSortState);
    }
  };

  // Get sort state for a specific header
  const getSortStateForHeader = (header) => {
    if (!sortState || sortState.sortableKey !== header.sortableKey) {
      return null;
    }
    return sortState.sort_order;
  };

  // Generate shimmer loading rows
  const renderShimmerRows = (count = 10) => {
    return Array(count)
      .fill(0)
      .map((_, rowIndex) => ({
        id: `shimmer-${rowIndex}`,
        isShimmer: true,
      }));
  };

  // Check if data is empty (when not loading)
  const isDataEmpty = !loading && (!data || data.length === 0);

  // Data to display - either real data, shimmer placeholders, or empty array for "no records" state
  const displayData = loading
    ? renderShimmerRows()
    : isDataEmpty
    ? [{ isEmpty: true }] // Single row for "No records found" message
    : data;

  // Reset the scroll end flag when data changes or loading state changes
  useEffect(() => {
    hasCalledScrollEnd.current = false;
  }, [data, loading]);

  // Try to find the scrollable parent element (for vertical scrolling)
  useEffect(() => {
    // Find the first parent with overflow-y: auto/scroll
    const findScrollableParent = (element) => {
      if (!element) return null;

      // Check if the document is the scrollable container
      if (element === document.documentElement || element === document.body) {
        return window;
      }

      const style = window.getComputedStyle(element);
      const overflowY = style.getPropertyValue("overflow-y");

      if (overflowY === "auto" || overflowY === "scroll") {
        return element;
      }

      return findScrollableParent(element.parentElement);
    };

    // Try to find the scrollable parent once the component mounts
    if (containerRef.current) {
      parentScrollRef.current = findScrollableParent(containerRef.current);

      // If no scrollable parent is found, default to window
      if (!parentScrollRef.current) {
        parentScrollRef.current = window;
      }
    }
  }, []);

  // Synchronize row heights on load and resize
  useEffect(() => {
    const syncRowHeights = () => {
      if (!mainTableRef.current || !stickyTableRef.current) return;

      // Get header elements first
      const mainHeaderRow = mainTableRef.current.querySelector("thead tr");
      const stickyHeaderRow = stickyTableRef.current.querySelector("thead tr");

      // Skip if headers aren't available yet
      if (!mainHeaderRow || !stickyHeaderRow) return;

      const mainRows = mainTableRef.current.querySelectorAll("tbody tr");
      const stickyRows = stickyTableRef.current.querySelectorAll("tbody tr");

      // Ensure we have the same number of rows to sync
      if (mainRows.length !== stickyRows.length) {
        return;
      }

      // Use a single RAF to batch all DOM operations and prevent flickering
      requestAnimationFrame(() => {
        // First, sync header heights without resetting
        const mainHeaderHeight = mainHeaderRow.offsetHeight;
        const stickyHeaderHeight = stickyHeaderRow.offsetHeight;
        const maxHeaderHeight = Math.max(mainHeaderHeight, stickyHeaderHeight);

        // Only update if there's a significant difference to avoid constant updates
        if (Math.abs(mainHeaderHeight - stickyHeaderHeight) > 1) {
          mainHeaderRow.style.height = `${maxHeaderHeight}px`;
          stickyHeaderRow.style.height = `${maxHeaderHeight}px`;
        }

        // Then sync body row heights
        mainRows.forEach((row, index) => {
          if (index < stickyRows.length && !loading) {
            const stickyRow = stickyRows[index];
            const mainRowHeight = row.offsetHeight;
            const stickyRowHeight = stickyRow.offsetHeight;

            // Only sync if there's a meaningful difference
            if (Math.abs(mainRowHeight - stickyRowHeight) > 1) {
              const maxHeight = Math.max(mainRowHeight, stickyRowHeight);
              row.style.height = `${maxHeight}px`;
              stickyRow.style.height = `${maxHeight}px`;
            }
          }
        });
      });
    };

    // Don't sync during loading to prevent flickering
    if (loading) return;

    // Use multiple RAF to ensure proper rendering order
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        syncRowHeights();
      });
    });

    // Debounced resize observer to prevent excessive calls
    let resizeTimeout;
    const debouncedSync = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(syncRowHeights, 16); // ~60fps
    };

    const resizeObserver = new ResizeObserver(debouncedSync);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Debounced window resize handler
    let windowResizeTimeout;
    const debouncedWindowResize = () => {
      clearTimeout(windowResizeTimeout);
      windowResizeTimeout = setTimeout(syncRowHeights, 100);
    };

    window.addEventListener("resize", debouncedWindowResize);

    return () => {
      cancelAnimationFrame(timer);
      clearTimeout(resizeTimeout);
      clearTimeout(windowResizeTimeout);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      window.removeEventListener("resize", debouncedWindowResize);
    };
  }, [displayData, rightStickyColumns, loading]);

  // Check if can scroll left/right (horizontal scrolling)
  const checkHorizontalScrollability = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    // Can scroll left if scrolled at least 1px
    setCanScrollLeft(scrollLeft > 0);

    // Check if scroll has reached the end
    // Using a small buffer (2px) to account for rounding errors
    const hasReachedEnd = scrollLeft + clientWidth >= scrollWidth - 2;

    // Can scroll right if there's more content to scroll to
    setCanScrollRight(!hasReachedEnd);

    // Shadow effect
    setHasScrolled(scrollLeft > 0);
  };

  // Check if reached vertical bottom
  const checkVerticalScroll = () => {
    if (
      !parentScrollRef.current ||
      loading ||
      hasCalledScrollEnd.current ||
      isDataEmpty
    )
      return;

    // Calculate if we've reached the bottom
    let isAtBottom = false;

    if (parentScrollRef.current === window) {
      // For window scrolling
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // Check if we're near the bottom (within 20px)
      isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

      // If the content is too short to scroll, don't trigger the callback
      if (scrollHeight <= clientHeight) {
        return;
      }
    } else {
      // For div scrolling
      const { scrollTop, scrollHeight, clientHeight } = parentScrollRef.current;

      // Check if we're near the bottom (within 20px)
      isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

      // If the content is too short to scroll, don't trigger the callback
      if (scrollHeight <= clientHeight) {
        return;
      }
    }

    // If scrolled to bottom and callback exists, call it
    if (isAtBottom && scrollEndCallback && !hasCalledScrollEnd.current) {
      scrollEndCallback();
      hasCalledScrollEnd.current = true;
    }
  };

  useEffect(() => {
    // Only reset the flag when loading has completed
    if (!loading) {
      hasCalledScrollEnd.current = false;
    }
  }, [data, loading]);

  // Handle horizontal and vertical scroll events
  useEffect(() => {
    // Set up horizontal scroll event listener
    if (scrollContainerRef.current) {
      checkHorizontalScrollability(); // Check initial state
      scrollContainerRef.current.addEventListener(
        "scroll",
        checkHorizontalScrollability
      );
    }

    // Set up vertical scroll event listener (on the scrollable parent)
    if (parentScrollRef.current && scrollEndCallback) {
      checkVerticalScroll(); // Check initial state

      const scrollHandler = checkVerticalScroll;

      if (parentScrollRef.current === window) {
        window.addEventListener("scroll", scrollHandler);
      } else {
        parentScrollRef.current.addEventListener("scroll", scrollHandler);
      }

      return () => {
        // Clean up both event listeners
        if (scrollContainerRef.current) {
          scrollContainerRef.current.removeEventListener(
            "scroll",
            checkHorizontalScrollability
          );
        }

        if (parentScrollRef.current === window) {
          window.removeEventListener("scroll", scrollHandler);
        } else if (parentScrollRef.current) {
          parentScrollRef.current.removeEventListener("scroll", scrollHandler);
        }
      };
    }

    // Only clean up horizontal scroll if no vertical scroll was set up
    return () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener(
          "scroll",
          checkHorizontalScrollability
        );
      }
    };
  }, [loading, data, scrollEndCallback, isDataEmpty]); // Re-attach when loading, data or empty state changes

  // Navigation handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current && canScrollLeft) {
      // Scroll left by a reasonable amount (e.g., 200px)
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current && canScrollRight) {
      // Scroll right by a reasonable amount (e.g., 200px)
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Handle mouse hover for tooltips
  const handleMouseEnter = (tooltipKey) => {
    setActiveTooltip(tooltipKey);
  };

  const handleMouseLeave = () => {
    setActiveTooltip(null);
  };

  // Ensure rightStickyColumns matches displayData length
  const normalizedStickyColumns = useMemo(() => {
    // If rightStickyColumns is an array of arrays (one per row)
    if (
      Array.isArray(rightStickyColumns) &&
      rightStickyColumns.length > 0 &&
      Array.isArray(rightStickyColumns[0])
    ) {
      // If rightStickyColumns already matches displayData length, use it as-is
      if (rightStickyColumns.length === displayData.length) {
        return rightStickyColumns;
      }

      // Otherwise, pad or truncate to match displayData length
      return Array(displayData.length)
        .fill(0)
        .map((_, i) =>
          i < rightStickyColumns.length ? rightStickyColumns[i] : []
        );
    }

    // If rightStickyColumns is just a single array of column configs (same for all rows)
    // or if it's something else, return empty arrays for each row
    return Array(displayData.length)
      .fill(0)
      .map((_) => []);
  }, [rightStickyColumns, displayData]);

  // NEW: Get width for individual sticky column
  const getStickyColumnWidth = (columnIndex) => {
    if (
      stickyColumnsConfig.columnWidths &&
      Array.isArray(stickyColumnsConfig.columnWidths)
    ) {
      return stickyColumnsConfig.columnWidths[columnIndex] || stickyColumnWidth;
    }
    return stickyColumnWidth;
  };

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Main scrollable table container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto hideScrollbar"
        style={{
          paddingRight: `${data?.length == 0 ? 0 : stickyColumnsWidth}px`,
        }} // Important: Make space for sticky columns
      >
        <table
          ref={mainTableRef}
          className="w-full border-none"
          style={{ minWidth: "100%" }}
        >
          <thead>
            <tr className="bg-white border-b border-[#E0E1EA]">
              {regularHeaders.map((header) => (
                <th
                  key={header.key}
                  className="px-4 py-3 text-left text-[#7D82A4] font-medium whitespace-nowrap"
                  style={{
                    width: header.width || "auto",
                    minWidth: header.minWidth || "120px",
                  }}
                >
                  <div className="flex text-[13px] justify-between items-center">
                    {header.label}
                    {header.sortable && header.sortableKey ? (
                      <SortIcon
                        sortState={getSortStateForHeader(header)}
                        onClick={() => handleSortClick(header)}
                      />
                    ) : (
                      header.sortable && (
                        <Image
                          src={chevronDown}
                          width={10}
                          height={10}
                          alt="logo"
                        />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData?.map((row, rowIndex) => {
              // Handle empty state
              if (row.isEmpty) {
                return <NoRecordsFound key="no-records" />;
              }
              const uniqueKey = row.isShimmer
                ? `shimmer-${rowIndex}-${Date.now()}`
                : row.id
                ? `row-${row.id}-${rowIndex}`
                : `row-${rowIndex}-${Object.keys(row).join("-")}`;

              return (
                <tr
                  key={uniqueKey}
                  className="border-b border-[#E0E1EA] bg-white hover:bg-gray-50"
                  onMouseEnter={() =>
                    handleTicketMouseEnter(row?.seat_category_id)
                  }
                  onMouseLeave={() => handleTicketMouseLeave()}
                >
                  {regularHeaders?.map((header) => {
                    const rawValue = row[header?.key];
                    const formattedValue = formatCellValue(
                      rawValue,
                      header.key
                    );

                    const displayText =
                      typeof formattedValue == "string"
                        ? formattedValue?.toLowerCase()
                        : formattedValue;

                    return (
                      <td
                        key={`${rowIndex}-${header.key}`}
                        className="py-2 px-4 text-[12px] whitespace-nowrap overflow-hidden text-ellipsis align-middle"
                      >
                        {row.isShimmer ? (
                          <ShimmerCell
                            width={`${Math.floor(50 + Math.random() * 100)}px`}
                          />
                        ) : (
                          <span
                            className={`
                              ${
                                header.key === "status" &&
                                (displayText == "available" ||
                                  displayText == "fulfilled")
                                  ? "text-green-500"
                                  : displayText == "incomplete"
                                  ? "text-yellow-500"
                                  : "text-[#343432]"
                              }
                             ${
                               header?.key == "bookingNo" &&
                               (displayText == "pending"
                                 ? "text-[#343432]"
                                 : displayText == "cancelled"
                                 ? "text-red-500"
                                 : displayText == "confirmed"
                                 ? "text-green-500"
                                 : displayText == "delivered"
                                 ? "text-[#0037D5]"
                                 : displayText == "shipped"
                                 ? "text-[#0037D5]"
                                 : "text-[#343432]")
                             } capitalize`}
                            title={
                              isDateString(rawValue) ? rawValue : undefined
                            } // Show original value on hover for dates
                          >
                            {formattedValue}
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

      {/* Sticky right columns with navigation controls */}
      {maxStickyColumnsLength > 0 && (
        <div
          className={`absolute top-0 right-0 h-full bg-white border-l border-[#E0E1EA] ${
            hasScrolled ? "shadow-md" : ""
          }`}
          style={{ width: `${stickyColumnsWidth}px` }}
        >
          <div className="h-full">
            <table
              ref={stickyTableRef}
              className="w-full h-full border-collapse table-fixed"
            >
              {rightStickyHeaders?.length > 0 ? (
                <thead>
                  <tr className="bg-white border-b border-[#E0E1EA]">
                    {rightStickyHeaders?.map((header, idx) => (
                      <th
                        key={`sticky-header-${idx}`}
                        className="py-2 px-2 text-left text-[#7D82A4] text-[13px] border-r-[1px] border-[#E0E1EA] font-medium whitespace-nowrap"
                        style={{
                          width: getStickyColumnWidth(idx),
                          minWidth: getStickyColumnWidth(idx),
                        }}
                      >
                        {header}
                      </th>
                    ))}
                    {maxStickyColumnsLength > rightStickyHeaders?.length && (
                      <th
                        colSpan={
                          maxStickyColumnsLength - rightStickyHeaders?.length
                        }
                        className="py-2 px-2"
                      >
                        <div className="flex justify-end items-center">
                          {/* Left arrow */}
                          <button
                            onClick={scrollLeft}
                            disabled={!canScrollLeft}
                            className={`p-1 rounded cursor-pointer ${
                              canScrollLeft
                                ? "text-[#343432] hover:bg-gray-100"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            aria-label="Scroll left"
                          >
                            <ChevronRight
                              className="rotate-180"
                              color={canScrollLeft ? "" : "#B4B7CB"}
                            />
                          </button>

                          {/* Right arrow */}
                          <button
                            onClick={scrollRight}
                            disabled={!canScrollRight}
                            className={`p-1 rounded cursor-pointer ${
                              canScrollRight
                                ? "text-[#343432] hover:bg-gray-100"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                            aria-label="Scroll right"
                          >
                            <ChevronRight
                              color={canScrollRight ? "" : "#B4B7CB"}
                            />
                          </button>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
              ) : (
                <thead>
                  <tr className="bg-white border-b border-[#E0E1EA]">
                    {/* Create individual header cells instead of a single spanning cell */}
                    {Array.from({ length: maxStickyColumnsLength - 1 }).map(
                      (_, idx) => (
                        <th
                          key={`empty-header-${idx}`}
                          className="py-2 px-2"
                          style={{
                            width: getStickyColumnWidth(idx),
                            minWidth: getStickyColumnWidth(idx),
                          }}
                        ></th>
                      )
                    )}
                    {/* Navigation arrows in the last header cell */}
                    <th className="py-2 px-2">
                      <div className="flex justify-end items-center">
                        {/* Left arrow */}
                        <button
                          onClick={scrollLeft}
                          disabled={!canScrollLeft}
                          className={`p-1 rounded cursor-pointer ${
                            canScrollLeft
                              ? "text-[#343432] hover:bg-gray-100"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          aria-label="Scroll left"
                        >
                          <ChevronRight
                            className="rotate-180"
                            color={canScrollLeft ? "" : "#B4B7CB"}
                          />
                        </button>

                        {/* Right arrow */}
                        <button
                          onClick={scrollRight}
                          disabled={!canScrollRight}
                          className={`p-1 rounded cursor-pointer ${
                            canScrollRight
                              ? "text-[#343432] hover:bg-gray-100"
                              : "text-gray-300 cursor-not-allowed"
                          }`}
                          aria-label="Scroll right"
                        >
                          <ChevronRight
                            color={canScrollRight ? "" : "#B4B7CB"}
                          />
                        </button>
                      </div>
                    </th>
                  </tr>
                </thead>
              )}

              <tbody>
                {displayData?.map((row, rowIndex) => {
                  // Handle empty state for sticky table
                  if (row.isEmpty) {
                    return (
                      <tr
                        key="no-records-sticky"
                        className="border-b border-[#E0E1EA] bg-white"
                      >
                        <td colSpan={maxStickyColumnsLength}></td>
                      </tr>
                    );
                  }

                  // Get the row-specific sticky columns, or empty array if not defined
                  const uniqueKey = row.isShimmer
                    ? `shimmer-${rowIndex}-${Date.now()}`
                    : row.id
                    ? `row-${row.id}-${rowIndex}`
                    : `row-${rowIndex}-${Object.keys(row).join("-")}`;

                  const rowStickyColumns =
                    !loading && Array.isArray(normalizedStickyColumns[rowIndex])
                      ? normalizedStickyColumns[rowIndex]
                      : [];

                  return (
                    <tr
                      key={uniqueKey}
                      className="border-b border-[#E0E1EA] bg-white hover:bg-gray-50"
                    >
                      {/* Render shimmer for loading state or actual content */}
                      {row.isShimmer ? (
                        // Render shimmer cells for the maximum possible number of sticky columns
                        Array(maxStickyColumnsLength)
                          .fill(0)
                          .map((_, colIndex) => (
                            <td
                              key={`shimmer-${rowIndex}-${colIndex}`}
                              className="py-2 text-sm align-middle text-center"
                              style={{
                                width: getStickyColumnWidth(colIndex),
                                minWidth: getStickyColumnWidth(colIndex),
                              }}
                            >
                              <div className="flex justify-center">
                                <div className="w-8 h-8">
                                  <ShimmerCell width="32px" />
                                </div>
                              </div>
                            </td>
                          ))
                      ) : (
                        // Render actual sticky columns
                        <>
                          {rowStickyColumns.map((column, colIndex) => (
                            <td
                              key={`sticky-${rowIndex}-${colIndex}`}
                              className={`text-sm align-middle text-center border-r-[1px] border-[#E0E1EA] ${
                                column?.className || ""
                              }`}
                              style={{
                                width: getStickyColumnWidth(colIndex),
                                minWidth: getStickyColumnWidth(colIndex),
                              }}
                            >
                              <div className="flex justify-center">
                                {column?.icon && column?.tooltipComponent ? (
                                  <TooltipWrapper
                                    component={column?.tooltipComponent}
                                    position={column.tooltipPosition || "top"}
                                    tooltipKey={`${rowIndex}-${column.key}`}
                                    activeKey={activeTooltip}
                                    setActiveKey={setActiveTooltip}
                                  >
                                    <div
                                      className="cursor-pointer"
                                      onMouseEnter={() =>
                                        handleMouseEnter(
                                          `${rowIndex}-${column.key}`
                                        )
                                      }
                                      onMouseLeave={handleMouseLeave}
                                    >
                                      {column.icon}
                                    </div>
                                  </TooltipWrapper>
                                ) : column.icon ? (
                                  <div className="cursor-pointer">
                                    {column.icon}
                                  </div>
                                ) : null}
                                {column?.cta && <button>{column?.cta}</button>}
                              </div>
                            </td>
                          ))}

                          {/* Add empty cells to maintain column count if this row has fewer sticky columns */}
                          {Array.from({
                            length: Math.max(
                              0,
                              maxStickyColumnsLength - rowStickyColumns.length
                            ),
                          }).map((_, i) => (
                            <td
                              key={`${rowIndex}-empty-${i}`}
                              className="py-2 text-sm"
                              style={{
                                width: getStickyColumnWidth(
                                  rowStickyColumns.length + i
                                ),
                                minWidth: getStickyColumnWidth(
                                  rowStickyColumns.length + i
                                ),
                              }}
                            ></td>
                          ))}
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StickyDataTable;
