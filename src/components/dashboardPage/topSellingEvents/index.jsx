import CustomSelect from "@/components/commonComponents/customSelect";
import Image from "next/image";
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import calendarIcon from "../../../../public/calendar-03.svg";
import {
  formatDateTime,
  formatDateToBoldDisplay,
} from "@/utils/helperFunctions";
import NoDataFound from "@/components/NoDataFound";

// Optimized Shimmer Component
const ShimmerRow = React.memo(({ index }) => (
  <tr
    key={`shimmer-${index}`}
    className="border-b border-gray-100 animate-pulse"
  >
    <td className="py-2 sm:py-3 px-3 sm:px-4">
      <div className="relative overflow-hidden bg-gray-200 rounded h-4 w-3/4">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>
    </td>
    <td className="py-2 sm:py-3 px-3 sm:px-4">
      <div className="flex items-center gap-2">
        <div className="relative overflow-hidden bg-gray-200 rounded w-3.5 h-3.5 sm:w-4 sm:h-4">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>
        <div className="relative overflow-hidden bg-gray-200 rounded h-4 w-20">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>
      </div>
    </td>
    <td className="py-2 px-3 sm:px-4 text-right">
      <div className="relative overflow-hidden bg-gray-200 rounded h-6 w-20 ml-auto">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>
    </td>
  </tr>
));

ShimmerRow.displayName = "ShimmerRow";

// Optimized Table Row Component
const EventRow = React.memo(({ row, index, handleClick }) => (
  <tr
    key={`event-${index}`}
    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
  >
    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-900">
      {row.eventName || "N/A"}
    </td>
    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">
      <div className="flex items-center gap-2">
        <Image
          src={calendarIcon}
          width={14}
          height={14}
          alt="calendar icon"
          className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
          loading="lazy"
        />
        <span className="text-gray-700">
          {row?.eventDate ? formatDateToBoldDisplay(row.eventDate) : "N/A"}
        </span>
      </div>
    </td>
    <td className="py-2 px-3 sm:px-4 text-right">
      <button
        className="bg-[#0137D5] text-white py-1 px-2 rounded-md text-xs sm:text-sm hover:bg-[#0127B5] active:bg-[#011F95] transition-colors duration-150 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0137D5] focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleClick}
        type="button"
        aria-label={`Create listing for ${row.eventName || "event"}`}
      >
        {row.ctaName || "Create Listing"}
      </button>
    </td>
  </tr>
));

EventRow.displayName = "EventRow";

const TopSellingEvents = (props) => {
  const {
    sellingEvents,
    handleClick = () => {},
    handleScrollEnd,
    loader = false,
  } = props;

  const {
    secondSelect = {},
    firstSelect = {},
    tableViews = { title: [], body: [] },
    meta = null,
    keyValue = "topSelling",
  } = sellingEvents || {};

  const tableContainerRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Memoized shimmer rows to prevent re-rendering
  const shimmerRows = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => (
        <ShimmerRow key={`shimmer-${index}`} index={index} />
      )),
    []
  );

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const container = tableContainerRef.current;
    if (!container || isLoadingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 10;

    // Check if user has scrolled to the bottom
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      // Check if there are more pages to load
      if (meta?.current_page < meta?.last_page && !loader && handleScrollEnd) {
        isLoadingRef.current = true;
        handleScrollEnd(keyValue);
      }
    }
  }, [meta, loader, handleScrollEnd, keyValue]);

  // Reset loading ref when loader changes
  useEffect(() => {
    if (!loader) {
      isLoadingRef.current = false;
    }
  }, [loader]);

  // Debounced scroll event listener
  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    let timeoutId;
    const debouncedScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    container.addEventListener("scroll", debouncedScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", debouncedScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // Memoized table body content
  const tableContent = useMemo(() => {
    const hasData =
      Array.isArray(tableViews.body) && tableViews.body.length > 0;

    if (!hasData && !loader) {
      return (
        <tbody>
          <tr>
            <td colSpan="3" className="p-0">
              <NoDataFound />
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody>
        {hasData &&
          tableViews.body.map((row, index) => (
            <EventRow
              key={row.eventName || index}
              row={row}
              index={index}
              handleClick={handleClick}
            />
          ))}
        {loader && shimmerRows}
      </tbody>
    );
  }, [tableViews.body, loader, shimmerRows, handleClick]);

  // Error boundary for safer rendering
  if (!sellingEvents) {
    return (
      <div className="bg-white rounded-md border border-[#eaeaf1] flex flex-col h-full">
        <div className="p-4 text-center text-gray-500">
          Unable to load top selling events data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md border border-[#eaeaf1] flex flex-col h-full">
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row p-3 sm:p-5 border-b border-[#F0F0F5] gap-3 sm:justify-between sm:items-center">
        <h2 className="text-base sm:text-lg font-medium text-gray-900">
          {sellingEvents.title || "Top Selling Events"}
        </h2>
        <div className="flex flex-wrap gap-2">
          {firstSelect.options && (
            <CustomSelect
              selectedValue={firstSelect.selectedOption}
              options={firstSelect.options}
              onSelect={firstSelect.onChange}
              textSize="text-xs sm:text-sm"
              buttonPadding="px-2 sm:px-3 py-1 sm:py-1.5"
              dropdownItemPadding="py-1 pl-2 pr-4 sm:pr-6"
            />
          )}
          {secondSelect.options && (
            <CustomSelect
              selectedValue={secondSelect.selectedOption}
              options={secondSelect.options}
              onSelect={secondSelect.onChange}
              textSize="text-xs sm:text-sm"
              buttonPadding="px-2 sm:px-3 py-1 sm:py-1.5"
              dropdownItemPadding="py-1 pl-2 pr-4 sm:pr-6"
            />
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="flex flex-col flex-1 min-h-0">
        <div
          ref={tableContainerRef}
          className="flex-1 overflow-auto max-h-[300px]"
          role="region"
          aria-label="Top selling events table"
        >
          <table className="min-w-full table-fixed">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
              <tr>
                {(tableViews.title || []).map((title, index) => (
                  <th
                    key={`header-${index}`}
                    className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm text-gray-600 bg-white"
                    scope="col"
                  >
                    {title}
                  </th>
                ))}
                <th
                  className="w-24 sm:w-32 bg-white"
                  scope="col"
                  aria-label="Actions"
                ></th>
              </tr>
            </thead>
            {tableContent}
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TopSellingEvents);
