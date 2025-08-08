import Button from "@/components/commonComponents/button";
import React, { useState, useRef, useEffect } from "react";
import TradeTicketsContainer from "./tradeTicketsContainer";
import {
  FetchEventSearch,
  FetchPerformerOrVenueListing,
} from "@/utils/apiHandler/request";
import { useRouter } from "next/router";
import InventorySearchedList from "@/components/addInventoryPage/inventorySearchList";
import { Calendar, Clock, MapPin } from "lucide-react";
import { desiredFormatDate } from "@/utils/helperFunctions";

const TradeTickets = ({ resultData, handleScrollEnd, loader }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // New state to track if search was performed
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const tracking = {
    title: "Tracking",
    count: resultData?.purchaseTracking?.tracking || "0",
    subHeading: "price",
    listItems:
      resultData?.purchaseTracking?.ticket_details?.map((item) => ({
        title: item?.match_name,
        amount: item?.price_with_currency,
      })) || [],
    keyValue: "purchaseTracking",
    meta: resultData?.purchaseTracking?.pagination,
  };

  const purchases = {
    title: "Purchases",
    count: resultData?.tradeOrders?.total_count || "0",
    subHeading: "Event Date",
    listItems:
      resultData?.tradeOrders?.data?.data?.map((item) => ({
        title: item?.match_name,
        amount: item?.match_datetime,
      })) || [],
    keyValue: "tradeOrders",
    meta: resultData?.tradeOrders?.data,
  };

  // Handle search API call
  const fetchApiCall = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setHasSearched(false);
      return;
    }
    console.log(query, "queryquery");
    setIsSearching(true);
    setHasSearched(false);
    try {
      const response = await FetchPerformerOrVenueListing("", { query: query });
      console.log(response, "responseresponse");
      const events = response?.data?.events || [];
      setSearchResults(events);
      setHasSearched(true);
      setShowDropdown(true); // Show dropdown regardless of results
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setHasSearched(true);
      setShowDropdown(true); // Show dropdown to display error/no results
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        fetchApiCall(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle find tickets button click
  const handleFindTicketsClick = () => {
    setIsSearchVisible(true);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 300);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setHasSearched(false);
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setHasSearched(false);
    setIsSearchVisible(false);
  };

  // Handle item click
  const handleItemClick = (item) => {
    // Navigate to the event page - adjust the route as needed
    router.push(`/trade/inventory/${item.m_id}`);
    handleClearSearch();
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !searchInputRef.current?.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderIconText = (icon, text, className = "") => {
    return (
      <div className="flex gap-2 items-center">
        {icon}
        <p
          title={text}
          className={`text-[#7D82A4] ${className}  w-[90%] text-[10px] font-normal`}
        >
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className="border-[1px] border-[#eaeaf1] rounded-md bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b-[1px] border-[#eaeaf1]">
        <p className="text-[16px] text-[#343432] font-semibold mb-3 sm:mb-0">
          Trade Tickets
        </p>

        <div className="relative flex items-center ">
          {/* Search Bar with Transition */}
          <div
            className={`transition-all w-[350px] duration-300 ease-in-out overflow-hidden ${
              isSearchVisible
                ? "max-w-xl opacity-100 mr-2"
                : "max-w-0 opacity-0"
            }`}
          >
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search events..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md   focus:border-transparent text-sm"
              />
              {/* Clear button (X) */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 "
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {/* Loading indicator */}
              {isSearching && (
                <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {/* Updated dropdown logic to handle no results */}
            {showDropdown && hasSearched && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-[350px] overflow-y-auto"
              >
                <div className="p-2 flex flex-col gap-2">
                  {searchResults.length > 0 ? (
                    // Render search results
                    searchResults.map((item) => (
                      <div
                        key={item.m_id}
                        onClick={() => handleItemClick(item)}
                        className="cursor-pointer transition-colors duration-150"
                      >
                        <div className="border border-[#eaeaf1] rounded-md p-2 hover:bg-[#eaeaf1]">
                          {/* Match name with proper text overflow */}
                          <p 
                            className="text-[13px] text-[#343432] font-semibold mb-2 truncate" 
                            title={item?.match_name}
                          >
                            {item?.match_name}
                          </p>
                          
                          {/* Details container with flexible layout */}
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                            {/* Date */}
                            <div className="flex items-center gap-1 min-w-0">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span 
                                className="text-[#7D82A4] text-[10px] font-normal truncate" 
                                title={desiredFormatDate(item?.match_date)}
                              >
                                {desiredFormatDate(item?.match_date)}
                              </span>
                            </div>

                            {/* Time */}
                            <div className="flex items-center gap-1 min-w-0">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span 
                                className="text-[#7D82A4] text-[10px] font-normal truncate"
                                title={item?.match_time}
                              >
                                {item?.match_time}
                              </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-1 min-w-0 flex-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span 
                                className="text-[#7D82A4] text-[10px] font-normal truncate"
                                title={`${item?.stadium}, ${item?.city}, ${item?.country}`}
                              >
                                {item?.stadium}, {item?.city}, {item?.country}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // No results found message
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg 
                          className="w-12 h-12 mx-auto mb-3" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                          />
                        </svg>
                      </div>
                      <p className="text-[14px] text-[#7D82A4] font-medium">
                        No results found
                      </p>
                      <p className="text-[12px] text-[#7D82A4] mt-1">
                        Try searching with different keywords
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Find Tickets Button */}
          {!isSearchVisible && (
            <div
              className={`transition-all duration-300 ${
                isSearchVisible
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100"
              }`}
            >
              <Button
                type="blueType"
                label="Find Tickets"
                onClick={handleFindTicketsClick}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <TradeTicketsContainer
          tracking={tracking}
          className="w-full md:w-[50%] border-b-[1px] md:border-b-0 md:border-r-[1px] border-[#eaeaf1]"
          handleScrollEnd={handleScrollEnd}
          loader={loader?.purchaseTracking}
        />
        <TradeTicketsContainer
          tracking={purchases}
          className="w-full md:w-[50%]"
          handleScrollEnd={handleScrollEnd}
          loader={loader?.tradeOrders}
        />
      </div>
    </div>
  );
};

export default TradeTickets;