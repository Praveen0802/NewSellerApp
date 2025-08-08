import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import Button from "../commonComponents/button";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";
import { convertKeyToDisplayName } from "@/utils/helperFunctions";
import {
  downloadReports,
  fetchReportsInventoryLogs,
  fetchReportsOrderDetails,
  fetchReportsOrderLogs,
  reportEventSearch,
  reportHistory,
  reportsOverview,
} from "@/utils/apiHandler/request";
import useTeamMembersDetails from "@/Hooks/useTeamMembersDetails";
import { toast } from "react-toastify";
import useCSVDownload from "@/Hooks/useCsvDownload";
import { SearchIcon } from "lucide-react";

// Currency Slider Component
const CurrencySlider = ({
  overViewData,
  onCurrencyChange,
  setTransitionDirection,
}) => {
  // Extract currencies from the overview data
  const getCurrencies = () => {
    if (!overViewData) return [];

    const currencies = new Set();
    Object.keys(overViewData).forEach((key) => {
      const parts = key.split("_");
      const currency = parts[parts.length - 1];
      if (["gbp", "usd", "eur", "aed"].includes(currency)) {
        currencies.add(currency);
      }
    });

    return Array.from(currencies);
  };

  const currencies = getCurrencies();
  const [currentCurrencyIndex, setCurrentCurrencyIndex] = useState(0);
  const currentCurrency = currencies[currentCurrencyIndex];

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = {
      gbp: "£",
      usd: "$",
      eur: "€",
      aed: "د.إ",
    };
    return symbols[currency] || currency.toUpperCase();
  };

  // Extract data for current currency
  const getCurrentCurrencyData = () => {
    if (!overViewData || !currentCurrency) return [];

    const data = [];
    const prefix = `total_sales_${currentCurrency}`;
    const revenuePrefix = `total_revenue_${currentCurrency}`;
    const payoutsPrefix = `total_payouts_${currentCurrency}`;
    const ticketsPrefix = `tickets_sold_${currentCurrency}`;

    if (overViewData[prefix] !== undefined) {
      data.push({
        name: "Total Sales",
        value: overViewData[prefix],
        key: `sales_${currentCurrency}`,
      });
    }

    if (overViewData[revenuePrefix] !== undefined) {
      data.push({
        name: "Total Revenue",
        value: overViewData[revenuePrefix],
        key: `revenue_${currentCurrency}`,
      });
    }

    if (overViewData[payoutsPrefix] !== undefined) {
      data.push({
        name: "Total Payouts",
        value: overViewData[payoutsPrefix],
        key: `payouts_${currentCurrency}`,
      });
    }

    if (overViewData[ticketsPrefix] !== undefined) {
      data.push({
        name: "Tickets Sold",
        value: overViewData[ticketsPrefix],
        key: `tickets_${currentCurrency}`,
      });
    }

    return data;
  };

  const handlePrevious = () => {
    const newIndex =
      currentCurrencyIndex === 0
        ? currencies.length - 1
        : currentCurrencyIndex - 1;
    if (setTransitionDirection) {
      setTransitionDirection("prev"); // Set direction BEFORE changing currency
      // Reset direction after a short delay to prevent multiple triggers
      setTimeout(() => setTransitionDirection(null), 100);
    }
    setCurrentCurrencyIndex(newIndex);
    onCurrencyChange?.(currencies[newIndex]);
  };

  const handleNext = () => {
    const newIndex =
      currentCurrencyIndex === currencies.length - 1
        ? 0
        : currentCurrencyIndex + 1;
    if (setTransitionDirection) {
      setTransitionDirection("next"); // Set direction BEFORE changing currency
      // Reset direction after a short delay to prevent multiple triggers
      setTimeout(() => setTransitionDirection(null), 100);
    }
    setCurrentCurrencyIndex(newIndex);
    onCurrencyChange?.(currencies[newIndex]);
  };

  const currentData = getCurrentCurrencyData();

  if (currencies.length === 0) {
    return [];
  }

  return {
    data: currentData,
    currentCurrency,
    currencies,
    currentCurrencyIndex,
    handlePrevious,
    handleNext,
    getCurrencySymbol,
  };
};

const RportHistory = (props) => {
  const [filtersApplied, setFiltersApplied] = useState({
    page: 1,
  });

  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exportLoader, setExportLoader] = useState(false);
  const [overViewData, setOverViewData] = useState(
    props?.response?.reportsOverviewData?.value
  );
  const [searchMatches, setSearchMatches] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentCurrency, setCurrentCurrency] = useState("gbp");

  // Add transition direction state for currency slider
  const [transitionDirection, setTransitionDirection] = useState(null);

  // Add sort state for table
  const [sortState, setSortState] = useState(null);

  const [staticReportsData, setStaticReportsData] = useState(
    props?.response?.reportHistoryData?.value
  );

  const { teamMembers } = useTeamMembersDetails();

  // Debounce timer ref
  const debounceTimer = useRef(null);

  // Get currency slider data with transition direction setter
  const currencySliderResult = CurrencySlider({
    overViewData,
    onCurrencyChange: setCurrentCurrency,
    setTransitionDirection: setTransitionDirection, // Pass the transition direction setter
  });

  // Debounced search function
  const debouncedSearch = useCallback(async (query) => {
    setSearchValue(query);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(async () => {
      if (query.trim()) {
        try {
          const response = await reportEventSearch("", { query: query });
          setSearchMatches(response?.events || []);
          setShowSearchDropdown(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchMatches([]);
          setShowSearchDropdown(false);
        }
      } else {
        setSearchMatches([]);
        setShowSearchDropdown(false);
      }
    }, 1000); // 300ms debounce delay
  }, []);

  // Define table headers based on your UI screenshot
  const headers = [
    { key: "order_id", label: "Order ID" },
    {
      key: "order_date",
      label: "Order Date",
      sortable: true,
      sortableKey: "order_date",
    },
    {
      key: "order_value",
      label: "Order Value",
      sortable: true,
      sortableKey: "order_value",
    },
    { key: "event", label: "Event", sortable: true, sortableKey: "event_name" },
    { key: "venue", label: "Venue", sortable: true, sortableKey: "venue_name" },
    {
      key: "event_date",
      label: "Event Date",
      sortable: true,
      sortableKey: "event_date",
    },
    {
      key: "ticket_details",
      label: "Ticket Details",
      sortable: true,
      sortableKey: "ticket_details",
    },
    { key: "quantity", label: "Qty", sortable: true, sortableKey: "quantity" },
    {
      key: "ticket_type",
      label: "Ticket Type",
      sortable: true,
      sortableKey: "ticket_type",
    },
    {
      key: "order_status_label",
      label: "Order Status",
      sortable: true,
      sortableKey: "order_status",
    },
    {
      key: "payment_status_label",
      label: "Payment Status",
      sortable: true,
      sortableKey: "payment_status",
    },
  ];

  const createInitialVisibleColumns = () => {
    return headers.reduce((acc, header) => {
      acc[header.key] = true; // Set all columns as visible by default
      return acc;
    }, {});
  };

  // New state for column visibility - dynamically formed from allHeaders
  const [visibleColumns, setVisibleColumns] = useState(
    createInitialVisibleColumns()
  );

  const filteredHeaders = headers.filter(
    (header) => visibleColumns[header.key]
  );

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Transform data for the table
  const transformedData = useMemo(() => {
    if (!staticReportsData?.reports_history) {
      return [];
    }

    return staticReportsData.reports_history.map((item) => ({
      ...item,
    }));
  }, [staticReportsData?.reports_history]);

  const getOrderDetails = async (item) => {
    // setIsLoading(true);
    setShowInfoPopup((prev) => {
      return {
        ...prev,
        flag: true,
        isLoading: true,
      };
    });
    const salesData = await fetchReportsOrderDetails("", {
      booking_id: item?.id,
    });

    setShowInfoPopup({
      flag: true,
      data: salesData.map((list) => ({
        ...list,
        order_id_label: item?.order_id,
      })),
      id: item?.id,
      isLoading: false,
    });
    // setIsLoading(false);
  };

  const loadLogData = async (item) => {
    try {
      const results = await Promise.allSettled([
        fetchReportsOrderLogs("", { booking_id: item?.id }),
        fetchReportsInventoryLogs("", { ticket_id: item?.id }),
      ]);

      // Extract results, handling both fulfilled and rejected promises
      const orderLogs =
        results[0].status === "fulfilled" ? results[0].value : [];
      const inventoryLogs =
        results[1].status === "fulfilled" ? results[1].value : [];

      // Optional: Log any errors
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const logType = index === 0 ? "Order" : "Inventory";
          console.error(`${logType} logs failed to load:`, result.reason);
        }
      });

      return { orderLogs, inventoryLogs };
    } catch (error) {
      console.error("Unexpected error loading log data:", error);
      toast.error("Unexpected error loading log data");
      throw error;
    }
  };

  const getLogDetailsDetails = async (item) => {
    setShowLogDetailsModal((prev) => ({
      ...prev,
      flag: true,
      isLoading: true,
    }));
    const { orderLogs, inventoryLogs } = await loadLogData(item);
    setShowLogDetailsModal({
      flag: true,
      orderLogs: orderLogs,
      inventoryLogs: inventoryLogs,
      id: item?.id,
      isLoading: false,
    });
  };

  // Create right sticky columns with action buttons
  const rightStickyColumns = useMemo(() => {
    if (
      !staticReportsData?.reports_history ||
      staticReportsData.reports_history.length === 0
    ) {
      return [];
    }

    return staticReportsData.reports_history.map((item) => [
      {
        icon: (
          <IconStore.clock
            onClick={() => getLogDetailsDetails(item)}
            className="size-5"
          />
        ),
        className: "cursor-pointer",
      },
      {
        icon: (
          <IconStore.eye
            onClick={() => getOrderDetails(item)}
            className="size-5"
          />
        ),
        className: "cursor-pointer",
      },
    ]);
  }, [staticReportsData?.reports_history]);

  // Modified configuration for list items (stats cards) - now uses currency slider data
  const listItemsConfig = {
    reports: currencySliderResult.data || [],
  };

  // Currency navigation component for full width container
  const CurrencyNavigationContainer = () => {
    const {
      currencies,
      currentCurrencyIndex,
      handlePrevious,
      handleNext,
      getCurrencySymbol,
      currentCurrency,
    } = currencySliderResult;

    if (currencies.length <= 1) return null;

    return (
      <div className="relative flex items-center justify-center px-4 py-2 bg-gray-50 border-b border-gray-200">
        {/* Left Arrow */}
        <button
          onClick={() => {
            setTransitionDirection("prev"); // Set direction first
            handlePrevious();
            // Reset after short delay
            setTimeout(() => setTransitionDirection(null), 100);
          }}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
          disabled={currencies.length <= 1}
        >
          <IconStore.chevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Center Content */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-700">
            {getCurrencySymbol(currentCurrency)} {currentCurrency.toUpperCase()}
          </span>
          <div className="flex gap-2">
            {currencies.map((currency, index) => (
              <div
                key={currency}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentCurrencyIndex ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => {
            setTransitionDirection("next"); // Set direction first
            handleNext();
            // Reset after short delay
            setTimeout(() => setTransitionDirection(null), 100);
          }}
          className="absolute right-4 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
          disabled={currencies.length <= 1}
        >
          <IconStore.chevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    );
  };

  const apiCall = async (params, clearAllFilter) => {
    setIsLoading(true);

    // Clean up undefined values before making API call
    // const cleanParams = Object.fromEntries(
    //   Object.entries(params).filter(
    //     ([_, value]) => value !== undefined && value !== null && value !== ""
    //   )
    // );
    let updatedFilters = {};
    if (clearAllFilter) {
      updatedFilters = { ...params, page: 1 };
    } else {
      updatedFilters = { ...filtersApplied, ...params, page: 1 };
    }

    setFiltersApplied(updatedFilters);

    try {
      const [reportOverview, reportData] = await Promise.all([
        reportsOverview("", updatedFilters),
        reportHistory("", updatedFilters),
      ]);

      // Clear old data before setting new data to prevent stale state
      setStaticReportsData(null);
      setOverViewData(null);

      // Set new data
      setStaticReportsData(reportData);
      setOverViewData(reportOverview);
    } catch (error) {
      console.error("API call error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchMatchChange = async (value) => {
    const updatedFilters = {
      ...filtersApplied,
      searchMatch: value,
      page: 1, // Reset to first page on new search
    };

    await apiCall(updatedFilters);
  };

  // Add this state variable at the top of your component
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  // Handle sort functionality
  const handleSort = async (sortData) => {
    // Reset the reached end state when sorting
    setHasReachedEnd(false);

    // Update sort state
    setSortState(sortData);

    // Prepare sort parameters for API call
    const sortParams = sortData
      ? {
          order_by: sortData.sortableKey,
          sort_order: sortData.sort_order,
        }
      : {
          // Remove sorting parameters when sortData is null
          order_by: null,
          sort_order: null,
        };

    // Call API with sort parameters - remove undefined values
    const updatedFilters = {
      ...filtersApplied,
      ...sortParams,
      page: 1, // Reset to first page when sorting
    };

    // Remove undefined/null values from the filters before API call
    const cleanedFilters = Object.fromEntries(
      Object.entries(updatedFilters).filter(([_, value]) => value != null)
    );

    try {
      await apiCall(cleanedFilters);
    } catch (error) {
      console.error("Sort error:", error);
      toast.error("Error sorting data");
    }
  };

  const handleFilterChange = async (
    filterKey,
    value,
    allFilters,
    currentTab
  ) => {
    // Reset the reached end state when filtering
    setHasReachedEnd(false);

    let params = {};
    console.log(
      filterKey,
      "filterKey",
      value,
      "value",
      allFilters,
      "allFilters",
      currentTab,
      "currentTab"
    );
    // Handle different filter types
    if (filterKey === "orderDate") {
      params = {
        ...params,
        order_date_from: value?.startDate,
        order_date_to: value?.endDate,
      };
    } else if (filterKey === "transactionDate") {
      params = {
        ...params,
        transaction_start_date: value?.startDate,
        transaction_end_date: value?.endDate,
      };
    } else if (filterKey === "eventDate") {
      params = {
        ...params,
        event_start_date: value?.startDate,
        event_end_date: value?.endDate,
      };
    } else {
      params = {
        ...params,
        [filterKey]: value,
      };
    }

    const updatedFilters = {
      ...filtersApplied,
      ...params,
      page: 1, // Reset to first page on filter change
    };
    console.log(updatedFilters, "updatedFiltersupdatedFilters");
    // Handle query field with both dropdown search and API call debouncing
    if (filterKey === "query" && value?.target?.value) {
      // Update the search dropdown (existing functionality)
      debouncedSearch(value?.target?.value);

      // Also debounce the API call for filtering
      debouncedApiCall(updatedFilters);
    }
    // For text inputs, use debounced API call
    else if (
      filterKey === "query" ||
      (typeof value === "object" && value?.target)
    ) {
      // This handles text inputs
      debouncedApiCall(updatedFilters);
    }
    // For non-text inputs (selects, dates, etc.), call API immediately
    else {
      try {
        await apiCall(updatedFilters);
      } catch (error) {
        console.error("Filter change error:", error);
      }
    }
  };
  const handleClearAllFilters = () => {
    apiCall({}, true); // Call the API with no filters
  };

  // Configuration for filters
  const filterConfig = {
    reports: [
      {
        type: "text",
        name: "query",
        value: filtersApplied?.query,
        showDelete: true,
        iconBefore: <SearchIcon />,
        deleteFunction: () => handleFilterChange("query", ""),
        // showDropdown: true,
        // dropDownComponent: searchMatchDropDown(),
        label: "Search Match event or Booking number",
        className: "!py-[7px]  !text-[#343432] !text-[14px]",
        parentClassName: "!w-[300px]",
      },

      {
        type: "select",
        name: "venue",
        label: "Venue",
        value: filtersApplied?.venue,
        options: props?.response?.reportFilter?.value?.stadiums?.map(
          (item) => ({
            value: item?.id,
            label: item?.name,
          })
        ),
        parentClassName: "!w-[12%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "transactionDate",
        singleDateMode: false,
        label: "Transaction Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "eventDate",
        singleDateMode: false,
        label: "Event Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },

      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        value: filtersApplied?.team_members,
        multiselect: true,
        options: teamMembers,
        parentClassName: "!w-[12%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "order_status",
        label: "Order Status",
        value: filtersApplied?.order_status,
        options: [
          { value: "paid", label: "Paid" },
          { value: "completed", label: "Completed" },
        ],
        parentClassName: "!w-[12%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "payment_status",
        label: "Payment Status",
        value: filtersApplied?.payment_status,
        options: [
          { value: "paid", label: "Paid" },
          { value: "unpaid", label: "Unpaid" },
        ],
        parentClassName: "!w-[12%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },

      {
        type: "select",
        name: "category",
        label: "Category",
        value: filtersApplied?.category,
        options: props?.response?.reportFilter?.value?.categories?.map(
          (item) => ({
            value: item?.id,
            label: item?.name,
          })
        ),
        parentClassName: "!w-[12%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
    ],
  };

  const handleScrollEnd = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading || hasReachedEnd) return; // Add hasReachedEnd check

    // Check if we've reached the end based on meta data
    if (filtersApplied.page >= staticReportsData?.meta?.total_pages) {
      setHasReachedEnd(true);
      return;
    }

    // Additional safety check - if no meta data, don't proceed
    if (!staticReportsData?.meta) return;

    setIsLoading(true);
    const updatedFilter = {
      ...filtersApplied,
      page: filtersApplied.page + 1,
    };

    try {
      const response = await reportHistory("", updatedFilter);
      console.log(response, "responseresponse");

      // Check if response has valid data before updating state
      if (
        response?.reports_history &&
        Array.isArray(response.reports_history)
      ) {
        // If the response is empty, we've reached the end
        if (response.reports_history.length === 0) {
          console.log("No more data to load - reached end");
          setHasReachedEnd(true); // Set flag instead of updating page
          return; // Don't update filtersApplied
        }

        // Only update state and page if we have data
        setStaticReportsData({
          reports_history: [
            ...staticReportsData?.reports_history,
            ...response.reports_history,
          ],
          meta: response?.meta,
        });
        setFiltersApplied(updatedFilter);
      } else {
        // Handle case where response structure is unexpected
        console.log("Invalid response structure");
        setHasReachedEnd(true);
      }
    } catch (error) {
      console.error("Scroll end error:", error);
      // Optionally set hasReachedEnd to true on error to prevent infinite retries
      // setHasReachedEnd(true);
    } finally {
      setIsLoading(false);
    }
  };

  const apiCallDebounceTimer = useRef(null);

  const debouncedApiCall = useCallback(async (params) => {
    if (apiCallDebounceTimer.current) {
      clearTimeout(apiCallDebounceTimer.current);
    }

    apiCallDebounceTimer.current = setTimeout(async () => {
      try {
        await apiCall(params);
      } catch (error) {
        console.error("Debounced API call error:", error);
      }
    }, 500); // 500ms debounce delay for API calls
  }, []);

  // Update the cleanup function to clear both timers
  const cleanup = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (apiCallDebounceTimer.current) {
      clearTimeout(apiCallDebounceTimer.current);
    }
  };

  // Make sure to call cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    // Reset any state that might cause stale data
    setHasReachedEnd(false);

    // If you have any row selection state, reset it here
    // setSelectedRows([]);

    // Reset sort state if needed when data changes completely
    if (filtersApplied.page === 1) {
      // Only reset sort on new filter (not pagination)
      // setSortState(null); // Uncomment if you want to reset sort on filter
    }
  }, [staticReportsData?.reports_history]);

  const { downloadCSV } = useCSVDownload();

  const handleExportCSV = async () => {
    setExportLoader(true);

    try {
      const response = await downloadReports("");
      // Check if response is successful
      if (response) {
        downloadCSV(response);
        toast.success("Report downloaded");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Error downloading Report");
      // Handle error (show toast, alert, etc.)
    } finally {
      setExportLoader(false);
    }
  };

  const refreshPopupData = () => {
    if (showInfoPopup.flag) {
      getOrderDetails({ id: showInfoPopup?.id });
    }
  };

  const EXCLUDED_ACTIVE_FILTER_KEYS = [
    "order_by", // Sorting parameter
    "sort_order", // Sorting parameter
    "page", // Pagination parameter
    "limit", // Pagination parameter (if you use it)
    "offset", // Pagination parameter (if you use it)
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        {/* Currency navigation container */}
        <CurrencyNavigationContainer />

        <TabbedLayout
          initialTab="reports"
          listItemsConfig={listItemsConfig}
          filterConfig={filterConfig}
          onTabChange={() => {}}
          onColumnToggle={handleColumnToggle}
          visibleColumns={visibleColumns}
          onClearAllFilters={handleClearAllFilters}
          onFilterChange={handleFilterChange}
          currentFilterValues={{ ...filtersApplied, page: "" }}
          showSelectedFilterPills={true}
          onCheckboxToggle={() => {}}
          transitionDirection={transitionDirection} // Pass transition direction to TabbedLayout
          excludedKeys={EXCLUDED_ACTIVE_FILTER_KEYS}
        />
      </div>

      <LogDetailsModal
        show={showLogDetailsModal?.flag}
        onClose={() =>
          setShowLogDetailsModal({
            flag: false,
            orderLogs: [],
            inventoryLogs: [],
          })
        }
        orderLogs={showLogDetailsModal?.orderLogs}
        inventoryLogs={showLogDetailsModal?.inventoryLogs}
        showShimmer={showLogDetailsModal?.isLoading}
      />
      <OrderInfo
        show={showInfoPopup?.flag}
        data={showInfoPopup?.data}
        onClose={() => setShowInfoPopup({ flag: false, data: [] })}
        refreshPopupData={refreshPopupData}
        type="report"
        showShimmer={showInfoPopup?.isLoading}
      />
      {/* StickyDataTable section */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold">Reports</h2>
            <Button
              onClick={handleExportCSV}
              loading={exportLoader}
              classNames={{
                label_: "text-xs",
                root: "flex gap-2 !px-2 items-center bg-[#F3F4F6] hover:bg-gray-200",
              }}
            >
              <IconStore.download className="size-4" />
              <span className="text-xs">Export CSV</span>
            </Button>
          </div>

          {/* StickyDataTable */}
          <div className="max-h-[calc(100vh-410px)] overflow-auto">
            <StickyDataTable
              headers={filteredHeaders}
              data={transformedData}
              rightStickyColumns={rightStickyColumns}
              loading={isLoading}
              onScrollEnd={() => {
                handleScrollEnd();
              }}
              dateFormatConfig={{
                order_date: "dateOnly",
                event_date: "dateOnly",
              }}
              onSort={handleSort} // Pass sort handler
              currentSort={sortState} // Pass current sort state
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RportHistory;
