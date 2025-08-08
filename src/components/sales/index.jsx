import { useEffect, useState } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import uploadListing from "../../../public/uploadListing.svg";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";
import {
  constructTeamMembersDetails,
  convertKeyToDisplayName,
  separateDateTime,
} from "@/utils/helperFunctions";
import Button from "../commonComponents/button";
import {
  downloadSalesCSVReport,
  fetchSalesHistory,
  fetchSalesInventoryLogs,
  fetchSalesOrderDetails,
  fetchSalesOrderLogs,
  fetchSalesPageData,
  getSalesCount,
} from "@/utils/apiHandler/request";
import { Clock, Eye, Upload } from "lucide-react";
import { inventoryLog } from "@/data/testOrderDetails";
import useTeamMembersDetails from "@/Hooks/useTeamMembersDetails";
import { toast } from "react-toastify";
import useCSVDownload from "@/Hooks/useCsvDownload";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import Image from "next/image";
import Tooltip from "../addInventoryPage/simmpleTooltip";
import UploadTickets from "../ModalComponents/uploadTickets";

function convertISOToMMDDYYYY(isoTimestamp, options = {}) {
  // Handle null, undefined, empty string, or non-string inputs
  if (!isoTimestamp || typeof isoTimestamp !== "string") {
    return options.returnNullOnError ? null : "";
  }

  try {
    // Create date object from ISO string
    const date = new Date(isoTimestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return options.returnNullOnError ? null : "";
    }

    // Extract date components
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const year = date.getFullYear();

    // Handle invalid date components
    if (
      !month ||
      !day ||
      !year ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return options.returnNullOnError ? null : "";
    }

    // Format with or without zero padding
    const mm = options.noPadding
      ? month.toString()
      : month.toString().padStart(2, "0");
    const dd = options.noPadding
      ? day.toString()
      : day.toString().padStart(2, "0");

    // Custom separator (default is '/')
    const separator = options.separator || "/";

    return `${mm}${separator}${dd}${separator}${year}`;
  } catch (error) {
    // Handle any parsing errors
    if (options.throwOnError) {
      throw new Error(`Failed to convert ISO timestamp: ${error.message}`);
    }
    return options.returnNullOnError ? null : "";
  }
}

const SalesPage = (props) => {
  const { profile, response = {} } = props;
  const { tournamentList } = response;
  const tournamentOptions = tournamentList?.map((item) => ({
    value: item.tournament_id,
    label: item.tournament_name,
  }));
  const [pageLoader, setPageLoader] = useState(false);

  // Pagination states
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [filtersApplied, setFiltersApplied] = useState({
    order_status: profile,
    page: 1,
  });
  console.log(response, "oooooooooooooo");
  const { teamMembers } = useTeamMembersDetails();

  const [activeTab, setActiveTab] = useState(profile || "pending");

  const [salesCount, setSalesCount] = useState(
    response?.salesCount?.sales_count
  );

  const [overViewData, setOverViewData] = useState(response?.salesPage || {});
  const [salesData, setSalesData] = useState(
    response?.salesHistory?.data?.sales_history || []
  );
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState({
    show: false,
    data: null,
    type: "",
  });

  // Define table headers - filter based on visible columns
  const allHeaders = [
    { key: "order_id", label: "Order Id" },
    { key: "order_date", label: "Order Date" },
    { key: "order_value", label: "Order Value" },
    { key: "event", label: "Event" },
    { key: "venue", label: "Venue" },
    { key: "event_date", label: "Event Date" },
    { key: "ticket_details", label: "Ticket Details" },
    { key: "quantity", label: "Quantity" },
    { key: "ticket_type_label", label: "Ticket Type" },
    { key: "category", label: "Category" },
    { key: "order_status_label", label: "Order Status" },
    { key: "section", label: "Section" },
    { key: "row", label: "Row" },
    { key: "days_to_event", label: "Days to Event" },
  ];

  // Modified API call to handle pagination
  const apiCall = async (
    params,
    handleCountApiCall,
    isLoadMore = false,
    isClear = false
  ) => {
    // Only show main loader for initial load, not for pagination
    if (!isLoadMore) {
      setPageLoader(true);
    } else {
      setLoadingMore(true);
    }
    let updatedFilters = {};
    if (isClear) {
      updatedFilters = { currency: currency };
    } else {
      updatedFilters = { ...filtersApplied, ...params, currency: currency };
    }

    setFiltersApplied(updatedFilters);

    try {
      const salesDataResponse = await fetchSalesPageData("", updatedFilters);
      const history = await fetchSalesHistory("", updatedFilters);

      if (handleCountApiCall) {
        const count = await getSalesCount("", params);
        setSalesCount(count?.sales_count);
      }

      // Handle pagination metadata
      if (history?.data?.meta) {
        setCurrentPage(history.data.meta.current_page);
        setTotalPages(history.data.meta.last_page);
        setHasNextPage(history.data.meta.next_page_url !== null);
      }

      if (isLoadMore) {
        // Append new data to existing data
        setSalesData((prevData) => [
          ...prevData,
          ...(history?.data?.sales_history || []),
        ]);
      } else {
        // Replace data for new search/filter
        setSalesData(history?.data?.sales_history || []);
        setOverViewData(salesDataResponse);
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
      toast.error("Error loading data");
    } finally {
      setPageLoader(false);
      setLoadingMore(false);
    }
  };

  // Load more data when scrolling to end - THIS IS THE KEY FUNCTION
  const handleScrollEnd = async () => {
    if (loadingMore || !hasNextPage) {
      return;
    }

    console.log("Loading more data...", { currentPage, hasNextPage });
    const nextPage = currentPage + 1;
    await apiCall({ page: nextPage }, false, true);
  };

  const hideColumnKeys = ["tournament_id", "match_id", "row"];

  // Dynamically create initial visible columns state from allHeaders
  const createInitialVisibleColumns = () => {
    return allHeaders.reduce((acc, header) => {
      acc[header.key] = true; // Set all columns as visible by default
      if (hideColumnKeys.includes(header.key)) {
        acc[header.key] = false;
      }
      return acc;
    }, {});
  };

  // New state for column visibility - dynamically formed from allHeaders
  const [visibleColumns, setVisibleColumns] = useState(
    createInitialVisibleColumns()
  );

  // Helper function to safely format tab name
  const formatTabName = (tabKey) => {
    if (!tabKey || typeof tabKey !== "string") {
      return "Pending";
    }
    return (
      tabKey.charAt(0).toUpperCase() + tabKey.slice(1).replace(/[-_]/g, " ")
    );
  };

  const listData = salesData?.map((item) => ({
    ...item,
  }));

  // Filter headers based on visibility
  const headers = allHeaders.filter((header) => visibleColumns[header.key]);

  const getOrderDetails = async (item) => {
    setShowInfoPopup((prev) => {
      return {
        ...prev,
        flag: true,
        isLoading: true,
      };
    });

    const salesData = await fetchSalesOrderDetails("", {
      booking_id: item?.order_id?.replace("1BX", ""),
    });
    setShowInfoPopup({
      flag: true,
      data: salesData?.map((list) => ({
        ...list,
        order_id_label: item?.booking_no ?? null,
      })),
      bg_id: item?.bg_id,
      isLoading: false,
    });
  };

  const getLogDetailsDetails = async (item) => {
    setShowLogDetailsModal((prev) => ({
      ...prev,
      flag: true,
      isLoading: true,
    }));
    const orderLogs = await fetchSalesOrderLogs("", {
      booking_id: item?.bg_id,
    });
    const inventoryLogs = await fetchSalesInventoryLogs("", {
      ticket_id: item?.bg_id,
    });
    setShowLogDetailsModal({
      flag: true,
      orderLogs: orderLogs,
      inventoryLogs: inventoryLogs,
      isLoading: false,
    });
  };

  const handleUploadAction = (rowData, rowIndex) => {
    // const ticketType = rowData.ticket_type;

    // // Find the matching object in the array
    // const matchingTicketType = response?.salesFilter?.data?.ticket_types.find(
    //   (option) => option.name === ticketType
    // );
    const matchDate = separateDateTime(rowData?.event_date)?.date;
    const matchTime = separateDateTime(rowData?.event_date)?.time;
    setShowUploadPopup({
      show: true,
      rowData: {
        ...rowData,
        // ticket_type_id: matchingTicketType?.id,
        matchDate,
        matchTime,
      },
      rowIndex,
    });
  };

  // Create right sticky columns with action buttons
  const rightStickyColumns = salesData.map((item, index) => [
    {
      icon: (
        <Tooltip content="logs">
          <Clock
            onClick={() => getLogDetailsDetails(item)}
            className="size-4"
          />
        </Tooltip>
      ),
      className: " cursor-pointer",
    },
    ...(profile == "confirmed"
      ? [
          {
            icon: (
              <Tooltip content="upload">
                <Image
                  src={uploadListing}
                  alt="tick"
                  width={16}
                  height={16}
                  className={`${"cursor-pointer hover:text-blue-500 transition-colors"}`}
                  onClick={() => {
                    handleUploadAction(item, index);
                  }}
                />
              </Tooltip>
            ),
            className: " cursor-pointer",
          },
        ]
      : []),
    {
      icon: (
        <Tooltip content="Details">
          <Eye onClick={() => getOrderDetails(item)} className="size-5" />
        </Tooltip>
      ),
      className: " cursor-pointer",
    },
  ]);

  const itemConfig = {
    [profile]: [
      { name: "Delivery Revenue", value: overViewData?.amount_with_currency },
      {
        name: "Orders",
        value: overViewData?.orders,
        smallTooptip: `${overViewData.ticket_count} Tickets`,
      },
      { name: "E-Ticket", value: overViewData?.e_tickets_count },
      {
        name: "External Transfer",
        value: overViewData?.external_transfer_count,
      },
      { name: "Mobile Link/PKPASS", value: overViewData?.mobile_ticket_count },
      { name: "Paper Ticket", value: overViewData?.paper_ticket_count },
      { name: "Local Delivery", value: overViewData?.local_delivery_count },
    ],
  };


  const [csvLoader, setCsvLoader] = useState(false);
  const [currency, setCurrency] = useState("GBP");

  // Configuration for filters per tab
  const filterConfig = {
    [profile]: [
      {
        type: "text",
        name: "query",
        value: filtersApplied?.query,
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
        parentClassName: "!w-[300px]",
      },
      {
        type: "select",
        value: filtersApplied?.ticket_type,
        name: "ticket_type",
        label: "Ticket Type",
        options: response?.salesFilter?.data?.ticket_types?.map((type) => ({
          value: type?.id,
          label: type?.name,
        })),
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },

      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        value: filtersApplied?.team_members,
        multiselect: true,
        options: teamMembers,
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "checkbox",
        name: "ticket_in_hand",
        label: "Tickets In Hand",
        value: filtersApplied?.ticket_in_hand || false,
        parentClassName: " !w-[15%] ",
        className:
          "!py-[3px] !px-[12px] pr-[20px] w-full text-xs sm:text-[10px] lg:text-xs",
        labelClassName:
          "!text-[11px] sm:!text-[10px] lg:!text-[11px] !text-[#7D82A4] font-medium",
        hideFromTable: true,
      },

      {
        type: "date",
        name: "orderDate",
        singleDateMode: false,
        value: filtersApplied?.orderDate,
        label: "Order Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "delivery_date",
        singleDateMode: false,
        label: "Delivery Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
      {
        type: "date",
        name: "event_Date",
        singleDateMode: false,
        label: "Event Date",
        parentClassName: "!w-[150px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },

      {
        type: "select",
        name: "tournament",
        label: "Tournament",
        value: filtersApplied?.tournament,
        options: tournamentOptions,
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },

      // {
      //   type: "select",
      //   name: "order_status",
      //   label: "Order Status",
      //   value: filtersApplied?.order_status,
      //   options: [
      //     { value: "paid", label: "Paid" },
      //     { value: "completed", label: "Completed" },
      //   ],
      //   parentClassName: "!w-[12%]",
      //   className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      //   labelClassName: "!text-[11px]",
      // },
      // {
      //   type: "select",
      //   name: "payment_status",
      //   label: "Payment Status",
      //   value: filtersApplied?.payment_status,
      //   options: [
      //     { value: "paid", label: "Paid" },
      //     { value: "unpaid", label: "Unpaid" },
      //   ],
      //   parentClassName: "!w-[12%]",
      //   className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
      //   labelClassName: "!text-[11px]",
      // },
      {
        type: "select",
        value: filtersApplied?.category,
        name: "category",
        label: "Category",
        options: response?.salesFilter?.data?.categories?.map((type) => ({
          value: type?.id,
          label: type?.name,
        })),
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },
    ],
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItems([]);
    // Reset pagination when changing tabs
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);
  };

  const handleFilterChange = async (filterKey, value) => {
    let params = {};
    if (filterKey === "orderDate") {
      params = {
        ...params,
        order_date_from: value?.startDate,
        order_date_to: value?.endDate,
        page: 1, // Reset to first page on filter change
      };
    } else if (filterKey === "delivery_date") {
      params = {
        ...params,
        delivery_date_from: value?.startDate,
        delivery_date_to: value?.endDate,
        page: 1, // Reset to first page on filter change
      };
    } else if (filterKey === "event_date") {
      params = {
        ...params,
        event_date_from: value?.startDate,
        event_date_to: value?.endDate,
        page: 1, // Reset to first page on filter change
      };
    } else {
      params = {
        ...params,
        [filterKey]: value,
        page: 1, // Reset to first page on filter change
      };
    }

    // Reset pagination state
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);

    await apiCall(params);
  };

  const handleCheckboxToggle = (checkboxKey, isChecked, allCheckboxValues) => {
    const params = {
      ...filtersApplied,
      [checkboxKey]: isChecked ? 1 : 0,
      page: 1,
    };

    // Reset pagination state
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);

    setFiltersApplied(params);
  };

  // Handle column toggle
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const [tabCurrencies, setTabCurrencies] = useState({});

  const handleCurrencyChange = (currencyCode, tabKey) => {
    // Update the currency for the specific tab
    setTabCurrencies((prev) => ({
      ...prev,
      [tabKey]: currencyCode,
    }));

    // Reset pagination and call API with new currency
    setCurrentPage(1);
    setHasNextPage(true);
    setSalesData([]);

    apiCall({ currency: currencyCode, page: 1 }, true);

    // Update global currency state if needed
    setCurrency(currencyCode);
  };

  const getCountByStatus = (status) => {
    return salesCount?.find((item) => item.status === status)?.orders || 0;
  };

  // Helper function to get amount by status
  const getAmountByStatus = (status) => {
    return (
      salesCount?.find((item) => item.status === status)?.amount || "£0.00"
    );
  };

  const tabsConfig = [
    {
      name: "Pending",
      key: "pending",
      count: getCountByStatus("pending"),
      route: "/sales/pending",
      amount: getAmountByStatus("pending"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Awaiting Delivery",
      key: "confirmed",
      count: getCountByStatus("confirmed"),
      route: "/sales/confirmed",
      amount: getAmountByStatus("confirmed"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Delivered",
      key: "delivered",
      count: getCountByStatus("delivered"),
      route: "/sales/delivered",
      amount: getAmountByStatus("delivered"),
      currencyDropdown: true,
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Completed",
      key: "completed",
      count: getCountByStatus("completed"),
      route: "/sales/completed",
      amount: getAmountByStatus("completed"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Cancelled",
      key: "cancelled",
      count: getCountByStatus("cancelled"),
      route: "/sales/cancelled",
      amount: getAmountByStatus("cancelled"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
    {
      name: "Replaced",
      key: "replaced",
      count: getCountByStatus("replaced"),
      route: "/sales/replaced",
      amount: getAmountByStatus("replaced"),
      options: response?.currencyValues?.map((list) => {
        return {
          label: list?.code,
          value: list?.code,
        };
      }),
    },
  ];

  const { downloadCSV } = useCSVDownload();

  const handleDownloadCSV = async () => {
    setCsvLoader(true);
    try {
      const response = await downloadSalesCSVReport({
        order_status: profile,
        currency: currency,
      });
      // Check if response is successful
      if (response) {
        downloadCSV(response);
        toast.success("Report downloaded");
      } else {
        console.error("No data received from server");
        toast.error("No data received");
      }
    } catch (error) {
      console.error("Error downloading CSV:", error);
      toast.error("Error downloading Report");
    } finally {
      setCsvLoader(false);
    }
  };

  const refreshPopupData = () => {
    if (showInfoPopup.flag) {
      getOrderDetails({ bg_id: showInfoPopup?.bg_id });
    }
  };

  const handleClearAllFilters = async () => {
    await apiCall({}, false, false, true);
  };

  const customTableComponent = () => {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b flex justify-between border-gray-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">
                {formatTabName(activeTab)} Orders ({listData.length})
              </h2>
              {hasNextPage && (
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
            <Button
              onClick={() => handleDownloadCSV()}
              variant="primary"
              loading={csvLoader}
              classNames={{
                root: "py-[4px] justify-center cursor-pointer",
                label_: "text-[12px] px-[2]",
              }}
            >
              Export CSV
            </Button>
          </div>

          {/* StickyDataTable - Removed onScrollEnd since scroll is now handled by TabbedLayout */}
          <div className="">
            <StickyDataTable
              headers={headers}
              data={listData}
              rightStickyColumns={rightStickyColumns}
              loading={pageLoader}
              // Removed loadingMore and onScrollEnd props since pagination is handled by parent
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TabbedLayout
        tabs={tabsConfig}
        initialTab={profile || "pending"}
        listItemsConfig={itemConfig}
        useHeaderV2={true}
        filterConfig={filterConfig}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={handleCheckboxToggle}
        onColumnToggle={handleColumnToggle}
        onCurrencyChange={handleCurrencyChange}
        selectedCurrency={currency}
        tabCurrencies={tabCurrencies}
        visibleColumns={visibleColumns}
        showSelectedFilterPills={true}
        headerV2ClassName="mb-4"
        showTabFullWidth={true}
        currentFilterValues={{ ...filtersApplied, order_status: "" }}
        loading={pageLoader}
        excludedKeys={["currency", "page"]}
        customTableComponent={customTableComponent}
        showCustomTable={true}
        // NEW PROPS FOR SCROLL HANDLING
        onScrollEnd={handleScrollEnd}
        loadingMore={loadingMore}
        hasNextPage={hasNextPage}
        scrollThreshold={100}
        onClearAllFilters={handleClearAllFilters}
      />
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
        type="sales"
        showShimmer={showInfoPopup?.isLoading}
      />

      {showUploadPopup?.show && (
        <UploadTickets
          show={showUploadPopup?.show}
          rowData={showUploadPopup?.rowData}
          matchDetails={{
            match_name: showUploadPopup?.rowData?.event,
            match_date_format: showInfoPopup?.rowData?.matchDate,
            match_time: showInfoPopup?.rowData?.matchTime,
            stadium_name: showInfoPopup?.rowData?.venue,
          }}
          rowIndex={showUploadPopup?.rowIndex}
          mySalesPage={true}
          onClose={() => {
            setShowUploadPopup({ show: false, rowData: null, rowIndex: null });
          }}
        />
      )}
    </div>
  );
};

export default SalesPage;
