import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Button from "../commonComponents/button";
import { useDispatch, useSelector } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import EventsTable from "./eventsTable";
import { useRouter } from "next/router";
import { fetchBulkListing, uploadExcelTickets } from "@/utils/apiHandler/request";
import { ChevronDown, Filter, X, Download } from "lucide-react";
import reloadIcon from "../../../public/reload.svg";
import Image from "next/image";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import RequestEvent from "../addInventoryPage/requestFeaturePopup";
import CustomModal from "@/components/commonComponents/customModal";

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
    query: filters?.query || "",
  });
  const [eventDate, setEventDate] = useState("");
  const [eventsData, setEventsData] = useState(
    response?.bulkListingData?.value?.events
  );
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
  const { currentUser } = useSelector((state) => state.currentUser || {});

  // Debounce search value
  const debouncedSearchValue = useDebounce(searchValue, 500);

  // Upload Excel modal state and handlers
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState({ type: null, text: "" });

  const resetUploadState = () => {
    setExcelFile(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadMessage({ type: null, text: "" });
  };

  // Auto-close modal after a short delay on successful upload
  useEffect(() => {
    if (uploadMessage?.type === "success" && showUploadModal) {
      const timeout = setTimeout(() => {
        setShowUploadModal(false);
        resetUploadState();
        // Redirect to My Listings after closing the modal
        router.push("/my-listings");
      }, 1500); // keep success message visible briefly
      return () => clearTimeout(timeout);
    }
  }, [uploadMessage?.type, showUploadModal]);

  const handleUploadClick = () => {
    resetUploadState();
    setShowUploadModal(true);
  };

  const handleModalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
    ];
    const isExcel =
  allowedTypes.includes(file.type) || /\.(xlsx|xls|csv)$/i.test(file.name);
    if (!isExcel) {
  setUploadMessage({ type: "error", text: "Please select a valid file (.xlsx, .xls, or .csv)" });
      return;
    }
    setUploadMessage({ type: null, text: "" });
    setExcelFile(file);
  };

  const handleDownloadSample = () => {
    try {
      const link = document.createElement("a");
      link.href = "/url_excel_template/sample_ticket_upload.xlsx";
      link.download = "sample_ticket_upload.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      // Fallback: open in new tab
      window.open("/url_excel_template/sample_ticket_upload.xlsx", "_blank");
    }
  };

  const handleModalUpload = async () => {
    if (!excelFile || uploading) return;
    setUploadMessage({ type: null, text: "" });
    const form = new FormData();
    if (currentUser?.seller_id) form.append("seller_id", currentUser.seller_id);
    form.append("excel_file", excelFile);
    try {
      setUploading(true);
      setUploadProgress(0);
      const res = await uploadExcelTickets("", form, (evt) => {
        if (!evt?.total) return;
        const percent = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(percent);
      });
      const success = res?.success !== false; // default treat as success if API returns success flag true
      setUploadMessage({ type: success ? "success" : "error", text: res?.message || (success ? "Uploaded successfully." : "Upload failed.") });
      // Optionally refresh events on success
      // if (success) await fetchApiCall(filtersApplied);
    } catch (err) {
      setUploadMessage({ type: "error", text: "Upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  };

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
    if (debouncedSearchValue === undefined) return;
    // Fetch whenever the debounced search changes, including when cleared
    if (debouncedSearchValue !== filtersApplied.query) {
      const params = {
        ...filtersApplied,
        query: debouncedSearchValue,
        page: 1,
      };
      setFiltersApplied((prev) => ({
        ...prev,
        query: debouncedSearchValue,
      }));
      fetchApiCall(params);
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
    { title: "Event Date Time (Local)", key: "match_date_time" },
    { title: "Tournament", key: "tournament_name" },
    { title: "Venue", key: "stadium" },
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
    // If search is cleared, immediately refetch full list (without waiting for debounce)
    if (!value || value.trim() === "") {
      const params = {
        ...filtersApplied,
        query: "",
        page: 1,
      };
      setFiltersApplied((prev) => ({ ...prev, query: "" }));
      fetchApiCall(params);
    }
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
    setFiltersApplied({ query: "" });
    setSearchValue("");
    setEventDate("");
    // Refetch from API to ensure fresh list
    fetchApiCall({ page: 1 });
  };

  function convertDateFormat(dateString) {
    // Parse the input date string
    const date = new Date(dateString);

    // Options for formatting
    const options = {
      weekday: "short", // Sat
      day: "2-digit", // 23
      month: "short", // Nov
      year: "numeric", // 2024
      hour: "2-digit", // 08
      minute: "2-digit", // 00
      hour12: true, // AM/PM
    };

    // Format the date
    const formattedDate = date.toLocaleDateString("en-US", options);

    // The above gives us something like "Sat, 23 Nov 2024, 08:00 AM"
    // But we need to adjust the format slightly
    return formattedDate.replace(
      /(\d{1,2}):(\d{2}):(\d{2})\s(AM|PM)/,
      "$1:$2 $4"
    );
  }

  // Memoize eventListViews to prevent unnecessary re-renders
  const eventListViews = useMemo(() => {
    return (
      eventsData?.map((list) => ({
        ...list,
        match_date_time: convertDateFormat(list.match_date),
      })) || []
    );
  }, [eventsData]);

  console.log(eventsData, "eventsDataeventsData");

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

  const [showRequestPopup, setShowRequestPopup] = useState(false);

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

  const isMobile = useIsMobile();
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

  <div className="flex items-center gap-3">
          {currentUser?.email?.toLowerCase() === "trade@1boxoffice.ae" && (
            <Button
              type="primary"
              classNames={{
                root: "px-2 md:px-3 py-1.5 md:py-2",
                label_: "text-xs md:text-sm font-medium",
              }}
              onClick={handleUploadClick}
              label="Upload Excel"
            />
          )}
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
                label="Search by Event, Venue"
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
      showFullDisplay ? "md:pl-46" : "md:pl-15"
    } /* Apply desktop padding only on large screens */`}
        >
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
            {/* Left section - Request Event button */}
            {!isMobile && (
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  type="outlined"
                  classNames={{
                    root: "px-3 py-2 sm:px-4 sm:py-2 text-[#374151] bg-[#03BA8A]",
                    label_: "text-xs sm:text-sm text-white font-medium",
                  }}
                  onClick={() => {
                    setShowRequestPopup(true);
                  }}
                  label="Request Event"
                />
                {/* Show selected count on mobile */}
                <span className="text-xs text-[#6B7280] sm:hidden">
                  {selectedRows.length} selected
                </span>
              </div>
            )}

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
      {showRequestPopup && (
        <RequestEvent
          show={showRequestPopup}
          onClose={() => setShowRequestPopup(false)}
        />
      )}

      {/* Upload Excel Modal */}
      {showUploadModal && (
        <CustomModal
          show={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            resetUploadState();
          }}
          outSideClickClose={!uploading}
          className="!w-auto !max-w-[560px]"
        >
          <div className="bg-white rounded-lg w-[92vw] max-w-[520px]">
            <div className="flex px-4 md:px-[24px] py-3 md:py-[16px] border-b-[1px] border-[#E0E1EA] justify-between items-center">
              <p className="text-[16px] md:text-[18px] text-[#343432] font-semibold">Upload Excel</p>
              <button
                onClick={() => {
                  if (!uploading) {
                    setShowUploadModal(false);
                    resetUploadState();
                  }
                }}
                className="cursor-pointer"
              >
                <X className="size-5 stroke-[#323A70]" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="mb-3">
                <label className="block text-sm text-[#343432] font-medium mb-1">Choose Excel file</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  disabled={uploading}
                  onChange={handleModalFileChange}
                  className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-[#EEF2FF] file:text-[#323A70] hover:file:bg-[#E5E9FF]"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted: .xlsx, .xls, .csv</p>
              </div>

              {uploading && (
                <div className="w-full bg-gray-200 rounded h-2 mb-3">
                  <div
                    className="bg-[#343432] h-2 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  />
                  <p className="text-xs text-gray-600 mt-1">{uploadProgress}%</p>
                </div>
              )}

              {uploadMessage?.text && (
                <div
                  className={`text-sm mb-3 ${
                    uploadMessage.type === "success"
                      ? "text-green-600"
                      : uploadMessage.type === "error"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {uploadMessage.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4 mt-4">
                <div>
                  <Button
                    type="outlined"
                    onClick={handleDownloadSample}
                    label={
                      <span className="inline-flex items-center gap-2">
                        <Download size={16} />
                        <span>Download Sample File</span>
                      </span>
                    }
                    classNames={{
                      root: "px-[10px] py-[8px]",
                      label_: "text-xs md:text-sm font-medium",
                    }}
                  />
                </div>
                <div className="flex gap-3 md:gap-4 items-center justify-end">
                <Button
                  type="secondary"
                  label="Cancel"
                  onClick={() => {
                    if (!uploading) {
                      setShowUploadModal(false);
                      resetUploadState();
                    }
                  }}
                  classNames={{
                    root: "px-[10px] justify-center w-[80px] py-[8px]",
                  }}
                />
                <Button
                  type="primary"
                  onClick={handleModalUpload}
                  disabled={!excelFile || uploading}
                  label={uploading ? "Uploading..." : "Upload"}
                  classNames={{
                    root: "w-[80px] justify-center py-[8px] bg-[#343432]",
                  }}
                />
                </div>
              </div>
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default BulkListings;
