import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  Edit,
  MapPin,
  X,
  XCircle,
} from "lucide-react";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import CustomModal from "@/components/commonComponents/customModal";
import CustomSelect from "@/components/commonComponents/customSelect";
import {
  getmarketingInsights,
  updateTicketsPrice,
} from "@/utils/apiHandler/request";
import Tooltip from "@/components/addInventoryPage/simmpleTooltip";

// Shimmer Loader Component - Mobile Responsive
const ShimmerLoader = ({ isMobile }) => {
  return (
    <div className="animate-pulse w-full">
      {/* Header shimmer */}
      {isMobile ? (
        // Mobile card-style shimmer
        <>
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border-b border-gray-200 p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </>
      ) : (
        // Desktop table shimmer
        <>
          <div className="flex border-b border-gray-200 bg-white">
            <div className="p-3 w-32">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="p-3 w-20">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="p-3 w-24">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="p-3 w-40">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="p-3 w-28">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
            <div className="p-3 flex-1">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </div>

          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex border-b border-gray-200">
              <div className="p-3 w-32">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="p-3 w-20">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="p-3 w-24">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="p-3 w-40">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="p-3 w-28">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="p-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

// Empty State Component
const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-gray-400 mb-4">
        <Calendar className="w-12 h-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No listings found
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        There are currently no ticket listings available for this match.
      </p>
    </div>
  );
};

// Loading indicator for pagination
const PaginationLoader = () => (
  <div className="flex justify-center py-4">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

const ListingsMarketplace = ({ show, onClose, matchInfo, filters }) => {
  const [listValueData, setListvalueData] = useState(null);
  const [allListings, setAllListings] = useState([]); // Store all loaded listings
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);

  // Responsive breakpoint detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Filter states - moved up before useCallback
  const [filtersApplied, setFiltersApplied] = useState({
    ticket_category: "",
    quantity: "",
  });

  const getInsightsData = async (params = {}, page = 1, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setIsLoading(true);
        setAllListings([]); // Reset listings when not loading more
        setCurrentPage(1);
        setHasMorePages(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      const res = await getmarketingInsights("", {
        match_id: matchInfo?.match_id,
        page: page,
        ...params,
      });

      console.log(res, 'resres');

      setListvalueData(res);

      // Handle pagination data
      const listings = res?.listings?.data || [];
      const currentPageNum = res?.listings?.current_page || 1;
      const lastPage = res?.listings?.last_page || 1;

      if (isLoadMore) {
        // Append new listings to existing ones
        setAllListings(prevListings => [...prevListings, ...listings]);
      } else {
        // Replace listings with new data
        setAllListings(listings);
      }

      setCurrentPage(currentPageNum);
      setHasMorePages(currentPageNum < lastPage);

    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load ticket listings. Please try again.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load more data when scrolling to bottom
  const loadMoreData = useCallback(() => {
    if (!isLoadingMore && hasMorePages) {
      const nextPage = currentPage + 1;
      getInsightsData(filtersApplied, nextPage, true);
    }
  }, [isLoadingMore, hasMorePages, currentPage, filtersApplied]);

  // Scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when 80% scrolled
    if (scrollPercentage > 0.8 && hasMorePages && !isLoadingMore) {
      loadMoreData();
    }
  }, [hasMorePages, isLoadingMore, loadMoreData]);

  // Throttled scroll handler
  const throttledHandleScroll = useCallback(() => {
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(handleScroll, 100);
  }, [handleScroll]);

  useEffect(() => {
    if (show && matchInfo?.match_id) {
      getInsightsData();
    }
  }, [show, matchInfo?.match_id]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', throttledHandleScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', throttledHandleScroll);
        clearTimeout(window.scrollTimeout);
      };
    }
  }, [throttledHandleScroll]);

  const [selectedTab, setSelectedTab] = useState("Listings");
  const [editingRow, setEditingRow] = useState(null);
  const [editPrices, setEditPrices] = useState({});

  // Filter states
  const [sections, setSections] = useState("All Sections");
  const [venues, setVenues] = useState("All Venue Areas");
  const [quantities, setQuantities] = useState("All Quantities");

  const matchDetails = {
    title: matchInfo?.match_name || "Match Details",
    date: matchInfo?.match_date || matchInfo?.match_date_format || "Date TBD",
    venue: `${matchInfo?.stadium_name || "Stadium"}, ${
      matchInfo?.city_name || "City"
    }, ${matchInfo?.country_name || "Country"}`,
  };

  const filterOptions = [
    ...Object.entries(filters?.block_data || {}).map(([key, value]) => ({
      value: key,
      label: value,
    })),
  ];

  const generateQuantityOptions = (max = 50) => {
    return Array.from({ length: max }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    }));
  };

  const quantityOptions = generateQuantityOptions();

  // Function to handle price edit initialization
  const startEditPrice = (ticketId, currentPrice) => {
    setEditingRow(ticketId);
    setEditPrices({
      ...editPrices,
      [ticketId]: String(currentPrice || "").replace(/[^0-9.]/g, "") || "",
    });
  };

  // Function to handle price input change
  const handlePriceChange = (ticketId, value) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleanValue.split(".");
    const formattedValue =
      parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleanValue;

    setEditPrices({
      ...editPrices,
      [ticketId]: formattedValue,
    });
  };

  // Function to save price and refresh data
  const savePrice = async (item) => {
    if (!item?.ticket_id) return;

    try {
      const updatedPrice = editPrices[item.ticket_id];

      console.log("Updated price:", updatedPrice);

      const response = await updateTicketsPrice("", "", {
        ticket_id: item.ticket_id,
        new_price: updatedPrice,
      });

      console.log(response, "response");

      // Clear editing state first
      setEditingRow(null);
      setEditPrices((prevPrices) => {
        const newPrices = { ...prevPrices };
        delete newPrices[item.ticket_id];
        return newPrices;
      });

      // Update the specific item in allListings instead of refetching all data
      setAllListings(prevListings => 
        prevListings.map(listing => 
          listing.ticket_id === item.ticket_id 
            ? { ...listing, price: updatedPrice }
            : listing
        )
      );

      // Trigger callback function with updated data
      if (onPriceUpdate) {
        const updatedItem = {
          ...item,
          price: `$ ${updatedPrice}`,
        };
        onPriceUpdate(updatedItem, updatedPrice);
      }
    } catch (err) {
      console.error("Error updating price:", err);
      // You might want to show an error message to the user here
    }
  };

  // Function to cancel price edit
  const cancelEdit = () => {
    setEditingRow(null);
    setEditPrices({});
  };

  // Function to get benefits text from ticket_details
  const getBenefitsText = (ticketDetails) => {
    if (
      !ticketDetails ||
      !Array.isArray(ticketDetails) ||
      ticketDetails.length === 0
    ) {
      return "No benefits";
    }
    return (
      ticketDetails
        .slice(0, 2)
        .filter((detail) => detail?.name) // Filter out null/undefined names
        .map((detail) => detail.name)
        .join(", ") || "No benefits"
    );
  };

  // Callback function that can be passed as prop
  const onPriceUpdate = (updatedItem, newPrice) => {
    // This function will be called when price is updated
    console.log("Price updated for item:", updatedItem);
    console.log("New price:", newPrice);
  };

  const handleSelectChange = async (value, key) => {
    const updatedFilters = {
      ...filtersApplied,
      [key]: value,
    };
    // Reset to page 1 when filters change
    getInsightsData(updatedFilters, 1, false);
    setFiltersApplied(updatedFilters);
  };

  console.log(listValueData, "listValueDatalistValueDatalistValueData");

  return (
    <div className="p-4">
      <CustomModal show={show} onClose={() => onClose()}>
        <div className="bg-white  md:w-4xl rounded-md">
          {/* Header with match details - Responsive */}
          <div className={`${isMobile ? "px-3 pt-3" : "px-4 pt-4"} flex justify-between items-center`}>
            <h2 className={`${isMobile ? "text-base" : "text-lg"} font-medium text-[#323A70] truncate pr-2`}>
              {matchDetails.title}
            </h2>
            <button
              onClick={() => onClose()}
              className="text-gray-500 cursor-pointer flex-shrink-0"
            >
              <XCircle size={isMobile ? 20 : 24} />
            </button>
          </div>

          {/* Date and venue info - Responsive */}
          <div className={`${isMobile ? "px-3 py-2" : "px-4 py-2"} border-b border-gray-200`}>
            <div className={`flex items-center ${isMobile ? "flex-col space-y-2" : "gap-4"}`}>
              <div className={`flex items-center gap-2 ${isMobile ? "justify-center" : "pr-4 border-r border-gray-200"}`}>
                <span className="text-[#323A70]">
                  <Calendar className="w-4 h-4 text-[#00A3ED]" />
                </span>
                <span className={`${isMobile ? "text-xs" : "text-sm"} text-[#323A70]`}>
                  {matchDetails.date}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#323A70]">
                  <MapPin className="w-4 h-4 text-[#00A3ED]" />
                </span>
                <span className={`${isMobile ? "text-xs text-center" : "text-sm"}`}>
                  {matchDetails.venue}
                </span>
              </div>
            </div>
          </div>

          {/* Filters - Responsive */}
          <div className={`${isMobile ? "px-3 py-2" : "px-4 py-2"} border-b border-gray-200`}>
            <div className={`flex ${isMobile ? "flex-col space-y-2" : "justify-between items-center"}`}>
              <div className="flex">
                {/* Tab buttons if needed */}
              </div>

              <div className={`flex ${isMobile ? "flex-col space-y-2" : "items-center gap-2"}`}>
                <span className={`${isMobile ? "text-xs" : "text-sm"} text-[#323A70] ${isMobile ? "font-medium" : ""}`}>
                  Filter by:
                </span>
                <div className={`flex ${isMobile ? "space-x-2" : "gap-2"}`}>
                  <CustomSelect
                    selectedValue={filtersApplied?.ticket_category}
                    options={filterOptions}
                    onSelect={(e) => {
                      handleSelectChange(e, "ticket_category");
                    }}
                    placeholder="All Sections"
                    textSize={isMobile ? "text-xs" : "text-xs"}
                    buttonPadding={isMobile ? "px-2 py-1.5" : "px-2 py-1"}
                    className={`${isMobile ? "!w-[140px]" : "!w-[200px]"}`}
                  />
                  <CustomSelect
                    selectedValue={filtersApplied?.quantity}
                    options={quantityOptions}
                    onSelect={(e) => {
                      handleSelectChange(e, "quantity");
                    }}
                    placeholder="All Quantities"
                    textSize={isMobile ? "text-xs" : "text-xs"}
                    buttonPadding={isMobile ? "px-2 py-1.5 !w-full" : "px-2 py-1 !w-full"}
                    className={`${isMobile ? "!w-[140px]" : "!w-[200px]"}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            className={`${isMobile ? "px-3 pb-3" : "px-4 pb-4"} max-h-[500px] overflow-auto`}
          >
            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-red-400 mb-4">
                  <X className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error
                </h3>
                <p className="text-gray-500 text-center max-w-sm mb-4">
                  {error}
                </p>
                <button
                  onClick={() => getInsightsData()}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <ShimmerLoader isMobile={isMobile} />}

            {/* Empty State */}
            {!isLoading && !error && allListings.length === 0 && (
              <EmptyState />
            )}

            {/* Data State - Responsive Layout */}
            {!isLoading && !error && allListings.length > 0 && (
              <>
                {isMobile ? (
                  // Mobile: Card Layout
                  <div className="space-y-3">
                    {allListings.map((item, index) => {
                      if (!item) return null;

                      return (
                        <div
                          key={item.ticket_id || index}
                          className={`${
                            item.flag === 1 ? "bg-gray-50" : "bg-white"
                          } border border-gray-200 rounded-lg p-3 space-y-2`}
                        >
                          {/* Header Row */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[#323A70] text-sm truncate">
                                {item.block_id || "-"}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {item.ticket_category || "-"}
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              {editingRow === item.ticket_id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-gray-600 text-xs">
                                    {item?.currencyIcon}
                                  </span>
                                  <input
                                    type="text"
                                    value={`${editPrices[item.ticket_id]}` || ""}
                                    onChange={(e) =>
                                      handlePriceChange(
                                        item.ticket_id,
                                        e.target.value.replace(/[^0-9.]/g, "")
                                      )
                                    }
                                    className="border border-blue-500 rounded w-16 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="0.00"
                                    autoFocus
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => savePrice(item)}
                                      className="bg-green-600 hover:bg-green-700 text-white rounded p-1 transition-colors"
                                      title="Save price"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="bg-gray-400 hover:bg-gray-500 text-white rounded p-1 transition-colors"
                                      title="Cancel edit"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 group">
                                  <span className="text-gray-600 text-xs">
                                    {item?.currencyIcon}
                                  </span>
                                  <span
                                    className={`text-sm font-medium ${
                                      item.flag === 1
                                        ? "cursor-pointer text-gray-700"
                                        : "text-gray-700"
                                    }`}
                                    onClick={() =>
                                      item.flag === 1 &&
                                      startEditPrice(item.ticket_id, item.price)
                                    }
                                  >
                                    {item.price || "-"}
                                  </span>
                                  {item.flag === 1 && (
                                    <button
                                      onClick={() =>
                                        startEditPrice(item.ticket_id, item.price)
                                      }
                                      className="ml-1 bg-[#343432]  text-white rounded p-1 transition-all duration-200"
                                      title="Edit price"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500 font-medium">Row:</span>
                              <span className="ml-1 text-[#323A70]">{item.row || "-"}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Qty:</span>
                              <span className="ml-1 text-[#323A70]">{item.quantity || "-"}</span>
                            </div>
                          </div>

                          {/* Benefits */}
                          <div className="border-t border-gray-100 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 font-medium">Benefits:</span>
                              <Tooltip
                                content={getBenefitsText(item.ticket_details)}
                                position="top"
                              >
                                <button className="text-gray-400 flex-shrink-0">
                                  <IconStore.document />
                                </button>
                              </Tooltip>
                            </div>
                            <p className="text-xs text-[#323A70] mt-1 line-clamp-2">
                              {getBenefitsText(item.ticket_details)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Desktop: Table Layout with fixed category column width
                  <>
                    {/* Table header with flex layout */}
                    <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
                      <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-32">
                        Section/Block
                      </div>
                      <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-20">
                        Row
                      </div>
                      <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-24">
                        Quantity
                      </div>
                      {/* Fixed: Increased width from w-24 to w-40 for Category column */}
                      <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-40">
                        Category
                      </div>
                      <div className="p-3 text-[12px] font-medium text-[#7D82A4] w-28 flex items-center">
                      Proceed Price <ChevronDown className="ml-1 w-4 h-4" />
                      </div>
                      <div className="p-3 text-[12px] font-medium text-[#7D82A4] flex-1">
                        Benefits & Restrictions
                      </div>
                    </div>

                    {/* Table rows with flex layout */}
                    {allListings.map((item, index) => {
                      if (!item) return null;

                      return (
                        <div
                          key={item.ticket_id || index}
                          className={`${
                            item.flag === 1 ? "bg-gray-100" : ""
                          } flex border-b border-gray-200  text-[#323A70]`}
                        >
                          <div
                            className="p-3 text-[12px] w-32 truncate"
                            title={item.block_id}
                          >
                            {item.block_id || "-"}
                          </div>
                          <div className="p-3 text-[12px] w-20">
                            {item.row || "-"}
                          </div>
                          <div className="p-3 text-[12px] w-24">
                            {item.quantity || "-"}
                          </div>
                          {/* Fixed: Increased width and removed truncate to show full category text */}
                          <div
                            className="p-3 text-[12px] w-40 break-words"
                            title={item.ticket_category}
                          >
                            {item.ticket_category || "-"}
                          </div>
                          <div className="p-3 text-[12px] w-32">
                            {editingRow === item.ticket_id ? (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-600">
                                  {item?.currencyIcon}
                                </span>
                                <input
                                  type="text"
                                  value={`${editPrices[item.ticket_id]}` || ""}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      item.ticket_id,
                                      e.target.value.replace(/[^0-9.]/g, "")
                                    )
                                  }
                                  className="border border-blue-500 rounded w-16 px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder="0.00"
                                  autoFocus
                                />
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => savePrice(item)}
                                    className="bg-green-600 hover:bg-green-700 text-white rounded p-1 transition-colors"
                                    title="Save price"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="bg-gray-400 hover:bg-gray-500 text-white rounded p-1 transition-colors"
                                    title="Cancel edit"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={`flex items-center  gap-1 group`}>
                                <span className="text-gray-600">
                                  {item?.currencyIcon}
                                </span>
                                <span
                                  className={`${
                                    item.flag === 1
                                      ? "cursor-pointer hover:text-blue-600 transition-colors"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() =>
                                    item.flag === 1 &&
                                    startEditPrice(item.ticket_id, item.price)
                                  }
                                  title={
                                    item.flag === 1
                                      ? "Click to edit price"
                                      : "Price not editable"
                                  }
                                >
                                  {item.price || "-"}
                                </span>
                                {item.flag === 1 && (
                                  <button
                                    onClick={() =>
                                      startEditPrice(item.ticket_id, item.price)
                                    }
                                    className="ml-2 opacity-0 group-hover:opacity-100 bg-[#343432]  text-white rounded p-1 transition-all duration-200"
                                    title="Edit price"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="p-3 text-[12px] flex-1 flex items-center justify-between">
                            <span
                              className="break-words pr-2 max-w-[180px]"
                              title={getBenefitsText(item.ticket_details)}
                            >
                              {getBenefitsText(item.ticket_details)}
                            </span>
                            <Tooltip
                              content={getBenefitsText(item.ticket_details)}
                              position="top"
                            >
                              <button className="text-gray-400 flex-shrink-0">
                                <IconStore.document />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Loading more indicator */}
                {isLoadingMore && <PaginationLoader />}

                {/* End of data indicator */}
                {!hasMorePages && allListings.length > 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No more listings to load
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default ListingsMarketplace;