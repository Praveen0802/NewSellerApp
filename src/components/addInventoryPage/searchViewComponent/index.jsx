import SubjectDescriptionPopup from "@/components/settingPage/subjectDescriptionPopup";
import { useState } from "react";
import InventorySearchedList from "../inventorySearchList";

const SearchedViewComponent = ({
  searchEventLoader,
  searchedEvents,
  hasSearched,
  searchValue,
  handleSearchedEventClick,
  show,
  handleBulkNavigateClick,
  setShow,
  onItemSelect, // New prop to handle item selection
}) => {
  // Handle event click with proper dropdown closing
  const handleEventClick = (item) => {
    handleSearchedEventClick(item);
    if (onItemSelect) onItemSelect(); // Close dropdown after selection
  };

  // Handle bulk navigate click with proper dropdown closing
  const handleBulkClick = (route) => {
    handleBulkNavigateClick(route);
    if (onItemSelect) onItemSelect(); // Close dropdown after selection
  };

  // Handle request click with proper dropdown closing
  const handleRequestClick = () => {
    setShow(true);
    if (onItemSelect) onItemSelect(); // Close dropdown after selection
  };

  if (searchEventLoader) {
    return (
      <div className="max-h-[300px] overflow-y-auto p-3 flex justify-center items-center shadow-sm border border-[#E0E1EA]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Searching...</span>
        </div>
      </div>
    );
  }

  const hasEvents = searchedEvents?.events?.length > 0;
  const hasPerformers = searchedEvents?.performers?.length > 0;
  const hasVenues = searchedEvents?.venues?.length > 0;
  const hasAnyResults = hasEvents || hasPerformers || hasVenues;

  if (hasSearched && !hasAnyResults) {
    return (
      <div className="max-h-[300px] overflow-y-auto p-6 flex flex-col items-center justify-center shadow-sm border border-[#E0E1EA]">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No results found
          </h3>
          <p className="text-xs text-gray-500">
            If your event not found ?{" "}
            <span
              onClick={handleRequestClick}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              click here
            </span>{" "}
            to request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-[300px] overflow-y-auto px-3 py-2 flex flex-col gap-3 shadow-sm border border-[#E0E1EA]">
      {hasEvents && (
        <div className="flex flex-col">
          <p className="text-[13px] font-medium">Events</p>
          <div className="flex flex-col">
            {searchedEvents.events.map((item, index) => (
              <div
                key={index}
                onClick={() => handleEventClick(item)}
                className="cursor-pointer transition-transform duration-300 hover:bg-gray-50 rounded-md p-1"
              >
                <InventorySearchedList item={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {hasPerformers && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium">Performers</p>
          {searchedEvents.performers.map((item, index) => (
            <p
              key={index}
              onClick={() => handleBulkClick(`?query=${item?.team_name}`)}
              className="border border-[#E0E1EA] px-2 rounded-md py-1 text-[13px] text-[#343432] cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
            >
              {item?.team_name}
            </p>
          ))}
        </div>
      )}

      {hasVenues && (
        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium">Venues</p>
          {searchedEvents.venues.map((item, index) => (
            <p
              key={index}
              onClick={() => handleBulkClick(`?venue=${item?.stadium_id}`)}
              className="border border-[#E0E1EA] px-2 rounded-md py-1 text-[13px] text-[#343432] cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50"
            >
              {item?.stadium}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchedViewComponent;
