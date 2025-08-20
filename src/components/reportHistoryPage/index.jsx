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
import InventoryLogsInfo from "../inventoryLogsInfo";

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
      setTransitionDirection("prev");
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
      setTransitionDirection("next");
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
  // Pagination states - similar to SalesPage
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

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
    setTransitionDirection: setTransitionDirection,
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
    }, 1000);
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
  };

  const loadLogData = async (item) => {
    try {
      const results = await Promise.allSettled([
        fetchReportsOrderLogs("", { booking_id: item?.id }),
        fetchReportsInventoryLogs("", { ticket_id: item?.id }),
      ]);

      const orderLogs =
        results[0].status === "fulfilled" ? results[0].value : [];
      const inventoryLogs =
        results[1].status === "fulfilled" ? results[1].value : [];

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

  // Configuration for list items - uses currency slider data
  const listItemsConfig = {
    reports: currencySliderResult.data || [],
  };

  // Currency navigation component
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
        <button
          onClick={() => {
            setTransitionDirection("prev");
            handlePrevious();
            setTimeout(() => setTransitionDirection(null), 100);
          }}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-200 transition-colors z-10"
          disabled={currencies.length <= 1}
        >
          <IconStore.chevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-700">
            {getCurrencySymbol(currentCurrency)} {currentCurrency.toUpperCase()}
          </span>
          <div className="flex gap-2">
            {currencies.map((currency, index) => (
              <div
                key={currency}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentCurrencyIndex
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            setTransitionDirection("next");
            handleNext();
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

  // UPDATED: Modified API call to handle pagination like SalesPage
  const apiCall = async (
    params,
    handleCountApiCall = false,
    isLoadMore = false,
    isClear = false
  ) => {
    // Only show main loader for initial load, not for pagination
    if (!isLoadMore) {
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    let updatedFilters = {};
    if (isClear) {
      updatedFilters = { ...params, page: 1 };
    } else {
      updatedFilters = { ...filtersApplied, ...params };
    }

    setFiltersApplied(updatedFilters);

    try {
      const [reportOverview, reportData] = await Promise.all([
        // Only fetch overview if not loading more or if explicitly requested
        (!isLoadMore || handleCountApiCall) ? reportsOverview("", updatedFilters) : Promise.resolve(overViewData),
        reportHistory("", updatedFilters),
      ]);

      // Handle pagination metadata
      if (reportData?.meta) {
        setCurrentPage(reportData.meta.current_page || 1);
        setTotalPages(reportData.meta.last_page || 1);
        setHasNextPage(reportData.meta.next_page_url !== null);
      }

      if (isLoadMore) {
        // Append new data to existing data
        setStaticReportsData((prevData) => ({
          ...prevData,
          reports_history: [
            ...(prevData?.reports_history || []),
            ...(reportData?.reports_history || []),
          ],
          meta: reportData?.meta,
        }));
      } else {
        // Replace data for new search/filter
        setStaticReportsData(reportData);
        if (!isLoadMore || handleCountApiCall) {
          setOverViewData(reportOverview);
        }
      }
    } catch (error) {
      console.error("API call error:", error);
      toast.error("Error loading data");
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // NEW: Load more data when scrolling to end - similar to SalesPage
  const handleScrollEnd = async () => {
    if (loadingMore || !hasNextPage) {
      return;
    }

    console.log("Loading more data...", { currentPage, hasNextPage });
    const nextPage = currentPage + 1;
    await apiCall({ page: nextPage }, false, true);
  };

  const handleSearchMatchChange = async (value) => {
    // Reset pagination when searching
    setCurrentPage(1);
    setHasNextPage(true);
    setStaticReportsData({ reports_history: [], meta: {} });

    const updatedFilters = {
      ...filtersApplied,
      searchMatch: value,
      page: 1,
    };

    await apiCall(updatedFilters);
  };

  // Handle sort functionality
  const handleSort = async (sortData) => {
    try {
      // Show loading state
      setIsLoading(true);

      // Reset pagination-related states when sorting
      setCurrentPage(1);
      setHasNextPage(true);
      setStaticReportsData({ reports_history: [], meta: {} });

      // Update sort state
      setSortState(sortData);

      // Prepare sort parameters for API call
      const sortParams = sortData
        ? {
            order_by: sortData.sortableKey,
            sort_order: sortData.sort_order,
          }
        : {
            order_by: undefined,
            sort_order: undefined,
          };

      // Call API with sort parameters
      const updatedFilters = {
        ...filtersApplied,
        ...sortParams,
        page: 1,
      };

      // Remove undefined/null values from the filters before API call
      const cleanedFilters = Object.fromEntries(
        Object.entries(updatedFilters).filter(([_, value]) => value != null)
      );

      await apiCall(cleanedFilters, false, false, false);
    } catch (error) {
      console.error("Sort error:", error);
      toast.error("Error sorting data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = async (
    filterKey,
    value,
    allFilters,
    currentTab
  ) => {
    // Reset pagination when filtering
    setCurrentPage(1);
    setHasNextPage(true);
    setStaticReportsData({ reports_history: [], meta: {} });

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
        page: 1,
      };
    } else if (filterKey === "transactionDate") {
      params = {
        ...params,
        transaction_start_date: value?.startDate,
        transaction_end_date: value?.endDate,
        page: 1,
      };
    } else if (filterKey === "eventDate") {
      params = {
        ...params,
        event_start_date: value?.startDate,
        event_end_date: value?.endDate,
        page: 1,
      };
    } else {
      params = {
        ...params,
        [filterKey]: value,
        page: 1,
      };
    }

    const updatedFilters = {
      ...filtersApplied,
      ...params,
      page: 1,
    };

    // Handle query field with both dropdown search and API call debouncing
    if (filterKey === "query" && value?.target?.value) {
      debouncedSearch(value?.target?.value);
      debouncedApiCall(updatedFilters);
    }
    // For text inputs, use debounced API call
    else if (
      filterKey === "query" ||
      (typeof value === "object" && value?.target)
    ) {
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
    // Reset pagination when clearing filters
    setCurrentPage(1);
    setHasNextPage(true);
    setStaticReportsData({ reports_history: [], meta: {} });
    setSortState(null);
    
    apiCall({}, false, false, true);
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
    }, 500);
  }, []);

  // Cleanup function
  const cleanup = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (apiCallDebounceTimer.current) {
      clearTimeout(apiCallDebounceTimer.current);
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  const { downloadCSV } = useCSVDownload();

  const handleExportCSV = async () => {
    setExportLoader(true);

    try {
      const response = await downloadReports("");
      if (response) {
        downloadCSV(response);
        toast.success("Report downloaded");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Error downloading Report");
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
    "order_by",
    "sort_order", 
    "page",
    "limit",
    "offset",
  ];

  const customTableComponent = () => {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                Reports ({staticReportsData?.reports_history?.length || 0})
              </h2>
              {hasNextPage && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
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

          <div className="overflow-auto">
            <StickyDataTable
              headers={filteredHeaders}
              data={transformedData}
              rightStickyColumns={rightStickyColumns}
              loading={isLoading}
              dateFormatConfig={{
                order_date: "dateOnly",
                event_date: "dateOnly",
              }}
              onSort={handleSort}
              currentSort={sortState}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
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
          transitionDirection={transitionDirection}
          excludedKeys={EXCLUDED_ACTIVE_FILTER_KEYS}
          showCustomTable={true}
          customTableComponent={customTableComponent}
          reportsPage={true}
          // NEW PROPS FOR SCROLL HANDLING - same as SalesPage
          onScrollEnd={handleScrollEnd}
          loadingMore={loadingMore}
          hasNextPage={hasNextPage}
          scrollThreshold={100}
        />
      </div>

      <InventoryLogsInfo
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
        isLoading={showLogDetailsModal?.isLoading}
        showTabs={true}
      />
      
      <OrderInfo
        show={showInfoPopup?.flag}
        data={showInfoPopup?.data}
        onClose={() => setShowInfoPopup({ flag: false, data: [] })}
        refreshPopupData={refreshPopupData}
        type="report"
        showShimmer={showInfoPopup?.isLoading}
      />
    </div>
  );
};

export default RportHistory;