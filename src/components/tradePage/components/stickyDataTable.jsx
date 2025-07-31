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
}) => {
  // Use whichever callback is provided
  const scrollEndCallback = onScrollEnd || fetchScrollEnd;

  // Calculate the width of sticky columns based on consistent sizing
  const maxStickyColumnsLength =
    rightStickyColumns.length > 0
      ? Math.max(
          ...rightStickyColumns.map((cols) =>
            Array.isArray(cols) ? cols.length : 0
          ),
          0
        )
      : 0;
  const stickyColumnsWidth = maxStickyColumnsLength * 50; // 50px per column

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
  const [activeTooltipKey, setActiveTooltipKey] = useState(null);

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

      // Reset heights first to avoid compounding issues
      const mainRows = mainTableRef.current.querySelectorAll("tbody tr");
      const stickyRows = stickyTableRef.current.querySelectorAll("tbody tr");

      // Ensure we have the same number of rows to sync
      if (mainRows.length !== stickyRows.length) {
        console.warn("Row count mismatch between main and sticky tables");
        return;
      }

      // Reset all heights to auto first
      mainRows.forEach((row) => (row.style.height = "auto"));
      stickyRows.forEach((row) => (row.style.height = "auto"));

      // Sync header heights
      const mainHeaderRow = mainTableRef.current.querySelector("thead tr");
      const stickyHeaderRow = stickyTableRef.current.querySelector("thead tr");

      if (mainHeaderRow && stickyHeaderRow) {
        const headerHeight = mainHeaderRow.offsetHeight;
        stickyHeaderRow.style.height = `${headerHeight}px`;
      }

      // Allow the browser to recalculate natural heights
      requestAnimationFrame(() => {
        // Sync body row heights using row index as key
        mainRows.forEach((row, index) => {
          if (index < stickyRows.length) {
            const stickyRow = stickyRows[index];
            // Get the natural heights of both rows
            const mainRowHeight = row.offsetHeight;
            const stickyRowHeight = stickyRow.offsetHeight;

            // Use the larger of the two heights
            const maxHeight = Math.max(mainRowHeight, stickyRowHeight);
            row.style.height = `${maxHeight}px`;
            stickyRow.style.height = `${maxHeight}px`;
          }
        });
      });
    };

    // Wait for rendering to complete before measuring
    const timer = setTimeout(() => {
      syncRowHeights();
    }, 0);

    // Set up resize observer for continuous monitoring
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
    setActiveTooltipKey(tooltipKey);
  };

  const handleMouseLeave = () => {
    setActiveTooltipKey(null);
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

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Main scrollable table container */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto hideScrollbar"
        style={{ paddingRight: `${stickyColumnsWidth}px` }} // Important: Make space for sticky columns
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
                >
                  <div className="flex text-[13px] justify-between items-center">
                    {header.label}
                    {header.sortable && (
                      <Image
                        src={chevronDown}
                        width={10}
                        height={10}
                        alt="logo"
                      />
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

              return (
                <tr
                  key={
                    row.isShimmer ? `shimmer-${rowIndex}` : row.id || rowIndex
                  }
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
                                 ? "text-[#00A3ED]"
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
      <div
        className={`absolute top-0 right-0 h-full bg-white border-l border-[#E0E1EA] ${
          hasScrolled ? "shadow-md" : ""
        }`}
        style={{ width: `${stickyColumnsWidth}px` }}
      >
        <div className="h-full">
          <table ref={stickyTableRef} className="w-full h-full border-collapse">
            {rightStickyHeaders?.length > 0 ? (
              <thead>
                <tr className="bg-white border-b border-[#E0E1EA]">
                  {rightStickyHeaders?.map((header, idx) => (
                    <th
                      key={`sticky-header-${idx}`}
                      className="py-2 px-2 text-left text-[#7D82A4] text-[13px] border-r-[1px] border-[#E0E1EA] font-medium whitespace-nowrap"
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
                  {/* Navigation arrows in header */}
                  <th colSpan={maxStickyColumnsLength} className="py-2 px-2">
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
                        <ChevronRight color={canScrollRight ? "" : "#B4B7CB"} />
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
                const rowStickyColumns =
                  !loading && Array.isArray(normalizedStickyColumns[rowIndex])
                    ? normalizedStickyColumns[rowIndex]
                    : [];

                return (
                  <tr
                    key={
                      row.isShimmer
                        ? `shimmer-sticky-${rowIndex}`
                        : row.id
                        ? `sticky-${row.id}`
                        : `sticky-${rowIndex}`
                    }
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
                            className={`text-sm align-middle text-center ${
                              column?.className || ""
                            }`}
                          >
                            <div className="flex justify-center">
                              {column?.icon && column?.tooltipComponent ? (
                                <TooltipWrapper
                                  component={column?.tooltipComponent}
                                  position={column.tooltipPosition || "top"}
                                  tooltipKey={`${rowIndex}-${column.key}`}
                                  activeKey={activeTooltipKey}
                                  setActiveKey={setActiveTooltipKey}
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
    </div>
  );
};

export default StickyDataTable;
