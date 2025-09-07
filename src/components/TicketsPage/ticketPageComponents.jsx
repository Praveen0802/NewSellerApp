import { ChevronLeft, ChevronRight } from "lucide-react";

export const ShimmerCard = ({ isMobile, isSmallMobile }) => (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden animate-pulse">
      {/* Header Shimmer */}
      <div
        className={`bg-gray-300 ${isSmallMobile ? "px-2 py-2" : "px-3 py-2.5"}`}
      >
        <div
          className={`flex items-center ${
            isMobile ? "flex-col space-y-2" : "justify-between"
          }`}
        >
          <div
            className={`flex items-center ${
              isMobile ? "w-full justify-between" : "space-x-3"
            }`}
          >
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <div
              className={`${isMobile ? "w-32" : "w-48"} h-4 bg-gray-400 rounded`}
            ></div>
            {!isMobile && (
              <div className="flex items-center space-x-3">
                <div className="w-20 h-3 bg-gray-400 rounded"></div>
                <div className="w-16 h-3 bg-gray-400 rounded"></div>
                <div className="w-24 h-3 bg-gray-400 rounded"></div>
              </div>
            )}
          </div>
          {isMobile && (
            <div className="flex items-center space-x-3 w-full">
              <div className="w-20 h-3 bg-gray-400 rounded"></div>
              <div className="w-16 h-3 bg-gray-400 rounded"></div>
              <div className="w-24 h-3 bg-gray-400 rounded"></div>
            </div>
          )}
          <div className="w-16 h-3 bg-gray-400 rounded"></div>
        </div>
      </div>
  
      {/* Table Content Shimmer */}
      <div className="w-full bg-white">
        <div className="relative">
          {/* Table Header Shimmer */}
          <div
            className={`bg-gray-100 border-b border-gray-200 ${
              isSmallMobile ? "p-2" : "p-3"
            }`}
          >
            <div className={`flex ${isMobile ? "space-x-2" : "space-x-4"}`}>
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              {Array.from({ length: isMobile ? 4 : 8 }).map((_, index) => (
                <div
                  key={index}
                  className={`${
                    isMobile ? "w-16" : "w-24"
                  } h-4 bg-gray-300 rounded`}
                ></div>
              ))}
            </div>
          </div>
  
          {/* Table Rows Shimmer */}
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className={`border-b border-gray-200 ${
                isSmallMobile ? "p-2" : "p-3"
              }`}
            >
              <div
                className={`flex ${
                  isMobile ? "space-x-2" : "space-x-4"
                } items-center`}
              >
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                {Array.from({ length: isMobile ? 4 : 8 }).map((_, colIndex) => (
                  <div
                    key={colIndex}
                    className={`${
                      isMobile ? "w-16" : "w-24"
                    } h-4 bg-gray-200 rounded`}
                  ></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  export   const ShimmerLoader = ({ isMobile, isSmallMobile }) => (
    <div
      className={`${
        isSmallMobile ? "m-3" : "m-6"
      } max-h-[calc(100vh-300px)] overflow-y-auto`}
    >
      {Array.from({ length: 2 }).map((_, index) => (
        <ShimmerCard
          key={index}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
        />
      ))}
    </div>
  );
  
  export const ActiveFilterPills = ({
    activeFilters,
    filterConfig,
    onFilterChange,
    onClearAllFilters,
    currentTab,
    isMobile = false,
    isSmallMobile = false,
  }) => {
    console.log(activeFilters, "activeFiltersactiveFilters");
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
        console.log(key, "key");
        const displayValue = getFilterDisplayValue(
          key,
          value,
          filterConfig[currentTab]
        );
        console.log(displayValue, "displayValuedisplayValue");
        if (displayValue) {
          entries.push({ key, value, displayValue });
        }
      });
      if (activeFilters?.start_date && activeFilters?.end_date) {
        entries.push({
          key: "event_date",
          value: `${activeFilters?.start_date} - ${activeFilters?.end_date}`,
          displayValue: `${activeFilters?.start_date} - ${activeFilters?.end_date}`,
        });
      }
      console.log(entries, "entriesentries");
      return entries;
    };
  
    const activeEntries = getActiveFilterEntries();
  
    if (activeEntries.length === 0) return null;
  
    return (
      <div className="flex items-center gap-2">
        {/* Fixed clear all button */}
        {activeEntries.length > 0 && (
          <Image
            onClick={onClearAllFilters}
            src={reloadIcon}
            width={isSmallMobile ? 24 : 30}
            height={isSmallMobile ? 24 : 30}
            className="cursor-pointer flex-shrink-0"
            alt="image-logo"
          />
        )}
  
        {/* Scrollable filters container */}
        <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide min-w-0 flex-1">
          <div className="flex gap-2 items-center whitespace-nowrap">
            {activeEntries.map(({ key, value, displayValue }) => (
              <div
                key={key}
                className={`inline-flex items-center gap-1 ${
                  isSmallMobile ? "px-2 py-0.5" : "px-3 py-1"
                } border-1 border-gray-300 rounded-sm ${
                  isSmallMobile ? "text-xs" : "text-sm"
                } flex-shrink-0`}
              >
                <span className="font-medium capitalize whitespace-nowrap">
                  {isMobile
                    ? key.replace(/_/g, " ").split(" ")[0]
                    : key.replace(/_/g, " ")}
                  :
                </span>
                <span
                  className={`${
                    isMobile ? "max-w-16 truncate" : ""
                  } whitespace-nowrap`}
                >
                  {displayValue}
                </span>
                <button
                  onClick={() =>
                    onFilterChange(key, "", activeFilters, currentTab)
                  }
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 flex-shrink-0"
                >
                  <X size={isSmallMobile ? 12 : 14} />
                </button>
              </div>
            ))}
          </div>
        </div>
  
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    );
  };
  
  export const Pagination = ({
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
    isMobile = false,
    isSmallMobile = false,
  }) => {
    return (
      <div
        className={`flex ${
          isMobile ? "flex-col gap-2" : "items-center justify-between"
        } ${isSmallMobile ? "px-3" : "px-6"} bg-white`}
      >
        {/* Left side - Total items count */}
        <div
          className={`flex items-center ${
            isMobile
              ? "justify-between w-full overflow-auto hideScrollbar"
              : "gap-4"
          }`}
        >
          <div
            className={`${isSmallMobile ? "py-2 pr-2" : "py-3 pr-4"} ${
              !isMobile ? "border-r-[1px] border-r-[#E0E1EA]" : ""
            } ${
              isSmallMobile ? "text-xs" : "text-sm"
            } text-[#323A70] font-medium`}
          >
            {totalItems} Events
          </div>
          <div
            className={`flex items-center ${
              isMobile ? "flex-1 justify-end" : "gap-4"
            }`}
          >
            <ActiveFilterPills
              activeFilters={activeFilters}
              filterConfig={filterConfig}
              onFilterChange={onFilterChange}
              onClearAllFilters={onClearAllFilters}
              currentTab="tickets"
              isMobile={isMobile}
              isSmallMobile={isSmallMobile}
            />
          </div>
        </div>
  
        {/* Right side - View selector, page info and navigation */}
        <div
          className={`flex items-center ${
            isMobile ? "justify-between w-full space-x-2" : "space-x-6"
          } ${isSmallMobile ? "py-2" : "py-3"} ${
            !isMobile ? "border-l-[1px] border-l-[#E0E1EA] pl-4" : ""
          }`}
        >
          {/* View selector */}
          <div
            className={`flex items-center space-x-2 ${
              isSmallMobile ? "text-xs" : "text-sm"
            } text-gray-700`}
          >
            {!isSmallMobile && <span>View</span>}
            <select
              value={itemsPerPage}
              onChange={(e) =>
                onItemsPerPageChange &&
                onItemsPerPageChange(parseInt(e.target.value))
              }
              className={`border border-gray-300 rounded ${
                isSmallMobile ? "px-1 py-0.5 text-xs" : "px-2 py-1 text-sm"
              } focus:outline-none focus:border-blue-500 bg-white`}
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

  