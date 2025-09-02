import React, { useState, useMemo, useCallback, useEffect } from "react";
import Button from "../commonComponents/button";
import { useDispatch, useSelector } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import EventsTable from "./eventsTable";
import { useRouter } from "next/router";
import { fetchBulkListing } from "@/utils/apiHandler/request";
import { ChevronDown, Filter, X } from "lucide-react";
import reloadIcon from "../../../public/reload.svg";
import Image from "next/image";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const BulkListings = (props) => {
  const { response, filters = {} } = props;
  const [selectedRows, setSelectedRows] = useState([]);
  const [filtersApplied, setFiltersApplied] = useState({
    venue: filters?.venue,
    searchValue: filters?.query || "",
  });
  const [eventDate, setEventDate] = useState("");
  const [eventsData, setEventsData] = useState(
    response?.bulkListingData?.value?.events
  );
  console.log(response, "responseresponse");
  const [searchValue, setSearchValue] = useState(filters?.query || "");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState({
    search: true,
    tournament: true,
    venue: true,
    eventDate: true,
  });
  const [activeFilters, setActiveFilters] = useState({});
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const router = useRouter();

  // Debounce search value
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Available filters configuration
  const filterOptions = [
    { key: "search", label: "Search", component: "input", name: "Search" },
    {
      key: "tournament",
      label: "Tournament",
      component: "select",
      name: "Tournament",
    },
    { key: "venue", label: "Venue", component: "select", name: "Venue" },
    {
      key: "eventDate",
      label: "Event Date",
      component: "dateRange",
      name: "Event Date",
    },
  ];

  // Effect for debounced search
  useEffect(() => {
    if (
      debouncedSearchValue !== undefined &&
      debouncedSearchValue !== filtersApplied.searchValue
    ) {
      const params = {
        ...filtersApplied,
        query: debouncedSearchValue,
        page: 1,
      };
      setFiltersApplied((prev) => ({
        ...prev,
        query: debouncedSearchValue,
      }));
      if (debouncedSearchValue || Object.keys(filtersApplied).length > 0) {
        fetchApiCall(params);
      }
    }
  }, [debouncedSearchValue]);

  const handleAddticket = () => {
    if (selectedRows?.length == 1) {
      router.push(`/add-listings/${selectedRows[0]}`);
    } else {
      const values = selectedRows?.join(",");
      router.push(`/bulk-listings/match?k=${values}`);
    }
  };

  const headers = [
    { title: "Event Name", key: "match_name" },
    { title: "Event Date", key: "match_date" },
    { title: "Event Time", key: "match_time" },
    { title: "Tournament", key: "tournament_name" },
    { title: "Price Range", key: "ticket_fare_from" },
    { title: "Tickets Available", key: "tickets_available" },
  ];

  const handleDateChange = (dateRange, key) => {
    let params = {};
    if (key == "eventDate") {
      setEventDate(dateRange);
      params = {
        ...filtersApplied,
        start_date: dateRange?.startDate,
        end_date: dateRange?.endDate,
        page: 1,
      };
      fetchApiCall(params);
    }
  };

  const fetchApiCall = async (params) => {
    function filterPresentKeys(obj) {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined && value !== "") {
          result[key] = value;
        }
      }
      return result;
    }
    let values = filterPresentKeys(params);
    setLoader(true);
    try {
      const response = await fetchBulkListing("", values);
      setEventsData(response?.events);
    } catch (error) {
      console.error("Error fetching data:", error);
      setEventsData([]);
    } finally {
      setLoader(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchValue(value);
  };

  const handleSelectChange = async (value, key) => {
    const params = {
      ...filtersApplied,
      [key]: value,
      page: 1,
    };
    setFiltersApplied({
      ...filtersApplied,
      [key]: value,
    });
    await fetchApiCall(params);
  };

  const handleFilterToggle = (filterKey) => {
    setVisibleFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const clearAllFilters = () => {
    setFiltersApplied({});
    setSearchValue("");
    setEventDate("");
    setEventsData(response?.bulkListingData?.value?.events);
  };

  // Memoize eventListViews to prevent unnecessary re-renders
  const eventListViews = useMemo(() => {
    return (
      eventsData?.map((list) => ({
        ...list,
      })) || []
    );
  }, [eventsData]);

  const activeFiltersCount =
    Object.values(visibleFilters).filter(Boolean).length;

  const onFilterChange = async (filterKey, value) => {
    const params = { ...filtersApplied, [filterKey]: value };

    switch (filterKey) {
      case "search":
        params.query = "";
        setSearchValue("");
        break;
      case "tournament":
        params.tournament_id = "";
        delete params.tournament;
        break;
      case "venue":
        delete params.venue;
        break;
      case "eventDate":
        delete params.eventDate;
        setEventDate("");
        break;
      default:
        break;
    }

    setFiltersApplied(params);
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));

    await fetchApiCall(params);
  };

  const onClearAllFilters = async () => {
    const params = { query: filtersApplied?.query };

    setActiveFilters({});
    setFiltersApplied((prev) => ({
      ...prev,
      tournament_id: "",
      venue: "",
    }));
    await fetchApiCall(params);
  };
  const ActiveFilterPills = ({
    activeFilters,
    filterConfig,
    onFilterChange,
    onClearAllFilters,
    currentTab,
  }) => {
    const getFilterDisplayValue = (filterKey, value, config) => {
      if (!value) return null;

      const filterConfig = config?.find((f) => f.key === filterKey);
      if (!filterConfig) return null;

      if (filterConfig.component === "select" && filterConfig.options) {
        const option = filterConfig.options.find((opt) => opt.value === value);
        return option ? option.label : value;
      }

      return typeof value === "object"
        ? `${value.startDate} - ${value.endDate}`
        : value;
    };

    const getActiveFilterEntries = () => {
      const entries = [];
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (key === "page" || !value || value === "") return;
        const displayValue = getFilterDisplayValue(key, value, filterConfig);
        if (displayValue) {
          entries.push({ key, value, displayValue });
        }
      });
      return entries;
    };

    const activeEntries = getActiveFilterEntries();
    if (activeEntries.length === 0) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap px-3">
        {activeEntries.length > 1 && (
          <Image
            onClick={onClearAllFilters}
            src={reloadIcon}
            width={30}
            height={30}
            alt="image-logo"
          />
        )}
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

  const { showFullDisplay } = useSelector((state) => state.common);
  return (
    <div className="bg-[#F5F7FA] w-full h-full relative max-md:overflow-auto">
      <div className="flex bg-white items-center py-2 md:py-2 justify-between px-4 md:px-6 border-b border-[#eaeaf1]">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              type="outlined"
              classNames={{
                root: "px-3 py-2 border border-[#D1D5DB] flex items-center gap-2",
                label_: "text-sm font-medium",
              }}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              label={
                <div className="flex items-center gap-2">
                  <Filter size={16} />
                  <span>Filters ({activeFiltersCount})</span>
                  <ChevronDown size={16} />
                </div>
              }
            />

            {showFilterDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#D1D5DB] rounded-md shadow-lg z-50 min-w-[200px]">
                <div className="p-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#323A70]">
                      Show Filters
                    </span>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {filterOptions.map((filter) => (
                    <label
                      key={filter.key}
                      className="flex items-center gap-2 py-2 cursor-pointer hover:bg-gray-50 px-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={visibleFilters[filter.key]}
                        onChange={() => handleFilterToggle(filter.key)}
                        className="h-4 w-4 text-gray-600"
                      />
                      <span className="text-sm text-[#323A70]">
                        {filter.label}
                      </span>
                    </label>
                  ))}

                  {/* <div className="border-t border-gray-200 mt-3 pt-3">
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-gray-600 hover:text-blue-800 font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          type="primary"
          classNames={{
            root: "px-2 md:px-3 py-1.5 md:py-2",
            label_: "text-xs md:text-sm font-medium",
          }}
          onClick={handleAddticket}
          disabled={selectedRows.length === 0}
          label="+ Add Tickets"
        />
      </div>

      {/* Dynamic Filters Section */}
      <div className="border-b-[1px] bg-white border-[#DADBE5] p-4">
        <div className="flex max-md:flex-col gap-4 md:items-center ">
          {visibleFilters.search && (
            <div className="md:w-[40%] md:min-w-[300px]">
              <FloatingLabelInput
                id="selectedMatch"
                name="selectedMatch"
                keyValue={"selectedMatch"}
                value={searchValue}
                type="text"
                onChange={handleSearchChange}
                label="Search by Tournament, Event, Venue"
                parentClassName=""
                className={"!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "}
                paddingClassName=""
                autoComplete="off"
              />
            </div>
          )}

          {visibleFilters.tournament && (
            <div className="md:w-[20%] min-w-[150px]">
              <FloatingSelect
                label={"Tournament"}
                selectedValue={filtersApplied?.tournament_id}
                options={response?.tournamentsList?.value?.map((list) => {
                  return {
                    label: list.tournament_name,
                    value: list.tournament_id,
                  };
                })}
                onSelect={(e) => {
                  let obj = response?.tournamentsList?.value?.find(
                    (r) => r.tournament_id == e
                  );
                  setActiveFilters((prev) => {
                    return {
                      ...prev,
                      tournament: obj?.tournament_name,
                    };
                  });
                  handleSelectChange(e, "tournament_id");
                }}
                parentClassName="w-full"
                paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                keyValue="tournament_id"
                className=""
              />
            </div>
          )}

          {visibleFilters.venue && (
            <div className="md:w-[20%] md:min-w-[150px]">
              <FloatingSelect
                label={"Venue"}
                selectedValue={filtersApplied?.venue}
                onSelect={(e) => {
                  setActiveFilters((prev) => {
                    let obj = response?.venueList?.value?.find(
                      (r) => r.stadium_id == e
                    );
                    return {
                      ...prev,
                      venue: obj?.stadium_name,
                    };
                  });

                  handleSelectChange(e, "venue");
                }}
                options={response?.venueList?.value?.map((list) => {
                  return {
                    label: list.stadium_name,
                    value: list.stadium_id,
                  };
                })}
                parentClassName="w-full"
                paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
                keyValue="venue"
                className=""
              />
            </div>
          )}

          {visibleFilters.eventDate && (
            <div className="md:w-[20%] ">
              <FloatingDateRange
                id="eventDate"
                name="eventDate"
                keyValue="eventDate"
                label="Event Date"
                subParentClassName="w-full"
                className="!py-[8px] !px-[16px] mobile:text-xs"
                value={eventDate}
                onChange={(dateValue) => {
                  setActiveFilters((prev) => {
                    return {
                      ...prev,
                      eventDate: dateValue,
                    };
                  });
                  handleDateChange(dateValue, "eventDate");
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-b-[1px] bg-white border-[#DADBE5] flex items-center">
        <p className="text-[14px] p-4 text-[#323A70] font-medium border-r-[1px] border-[#DADBE5] w-fit">
          {loader ? "Loading..." : `${eventListViews.length} Events`}
        </p>
        <ActiveFilterPills
          activeFilters={activeFilters}
          filterConfig={filterOptions}
          onFilterChange={onFilterChange}
          onClearAllFilters={onClearAllFilters}
          currentTab="tickets"
        />
      </div>

      <div
        className={`m-6 bg-white rounded max-h-[calc(100vh-300px)] overflow-scroll ${
          selectedRows?.length > 0 ? "mb-20" : ""
        }`}
      >
        <div className="overflow-y-auto overflow-x-auto h-full">
          <EventsTable
            events={eventListViews}
            headers={headers}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            loader={loader}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {selectedRows?.length > 0 && (
        <div
          className={`fixed bottom-0 w-full left-0 ${
            showFullDisplay ? "pl-42" : "pl-15"
          } right-0 bg-white border-t border-[#E5E7EB] shadow-lg z-50 
    
    /* Mobile responsive adjustments */
    sm:pl-0 /* Remove left padding on mobile */
    ${
      showFullDisplay ? "lg:pl-42" : "lg:pl-15"
    } /* Apply desktop padding only on large screens */`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            {/* Left section - Request Event button */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* <Button
                type="outlined"
                classNames={{
                  root: "px-3 py-2 sm:px-4 sm:py-2 text-[#374151] bg-[#03BA8A]",
                  label_: "text-xs sm:text-sm text-white font-medium",
                }}
                label="Request Event"
              /> */}
              {/* Show selected count on mobile */}
              <span className="text-xs text-[#6B7280] sm:hidden">
                {selectedRows.length} selected
              </span>
            </div>

            {/* Right section - Action buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                type="outlined"
                classNames={{
                  root: `px-3 py-2 sm:px-4 sm:py-2 border border-[#D1D5DB] 
                   text-[#374151] hover:bg-[#F9FAFB]
                   /* Hide text on very small screens, show icon or shorter text */`,
                  label_: "text-xs sm:text-sm font-medium",
                }}
                onClick={() => {
                  setSelectedRows([]);
                }}
                label={
                  <span className="sm:inline">
                    <span className="hidden sm:inline">Cancel</span>
                    <span className="sm:hidden">✕</span>
                  </span>
                }
              />
              <Button
                type="primary"
                classNames={{
                  root: "px-3 py-2 sm:px-4 sm:py-2",
                  label_: "text-xs sm:text-sm font-medium",
                }}
                onClick={handleAddticket}
                label={
                  <span>
                    <span className="hidden sm:inline">Add Tickets</span>
                    <span className="sm:hidden">Add</span>
                  </span>
                }
              />
            </div>
          </div>

          {/* Optional: Mobile-specific selected items indicator */}
          {/* <div className="sm:hidden px-4 pb-2">
            <div className="text-xs text-[#6B7280]">
              {selectedRows.length} item{selectedRows.length !== 1 ? "s" : ""}{" "}
              selected
            </div>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default BulkListings;
