import { useEffect, useState } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";
import {
  constructTeamMembersDetails,
  convertKeyToDisplayName,
} from "@/utils/helperFunctions";
import Button from "../commonComponents/button";
import {
  downloadSalesCSVReport,
  fetchSalesInventoryLogs,
  fetchSalesOrderDetails,
  fetchSalesOrderLogs,
  fetchSalesPageData,
} from "@/utils/apiHandler/request";
import { Clock, Eye } from "lucide-react";
import { inventoryLog } from "@/data/testOrderDetails";
import useTeamMembersDetails from "@/Hooks/useTeamMembersDetails";
import { toast } from "react-toastify";
import useCSVDownload from "@/Hooks/useCsvDownload";

function convertISOToMMDDYYYY(isoTimestamp, options = {}) {
  // Handle null, undefined, empty string, or non-string inputs
  if (!isoTimestamp || typeof isoTimestamp !== 'string') {
    return options.returnNullOnError ? null : '';
  }

  try {
    // Create date object from ISO string
    const date = new Date(isoTimestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return options.returnNullOnError ? null : '';
    }

    // Extract date components
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const year = date.getFullYear();

    // Handle invalid date components
    if (!month || !day || !year || month < 1 || month > 12 || day < 1 || day > 31) {
      return options.returnNullOnError ? null : '';
    }

    // Format with or without zero padding
    const mm = options.noPadding ? month.toString() : month.toString().padStart(2, '0');
    const dd = options.noPadding ? day.toString() : day.toString().padStart(2, '0');
    
    // Custom separator (default is '/')
    const separator = options.separator || '/';
    
    return `${mm}${separator}${dd}${separator}${year}`;
    
  } catch (error) {
    // Handle any parsing errors
    if (options.throwOnError) {
      throw new Error(`Failed to convert ISO timestamp: ${error.message}`);
    }
    return options.returnNullOnError ? null : '';
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
console.log(response,'responseresponse')
  const [filtersApplied, setFiltersApplied] = useState({
    order_status: profile,
  });

  const { teamMembers } = useTeamMembersDetails();

  const [activeTab, setActiveTab] = useState(profile || "pending");

  const [overViewData, setOverViewData] = useState(
    response?.salesPage?.overview
  );
  const [salesData, setSalesData] = useState(response?.salesPage?.list);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);

  // Define table headers - filter based on visible columns
  const allHeaders = [
    { key: "booking_no", label: "Order Id" },
    { key: "created_date", label: "Order Date" },
    { key: "currency_type", label: "Currency Type" },
    { key: "match_id", label: "Match ID" },
    { key: "match_name", label: "Match Name" },
    { key: "match_date", label: "Match Date" },
    { key: "match_time", label: "Match Time" },
    { key: "tournament_name", label: "Tournament Name" },
    { key: "tournament_id", label: "Tournament ID" },
    { key: "row", label: "Row" },
    { key: "ticket_block", label: "Ticket Block" },
    { key: "section", label: "Section" },
    { key: "ticket_type", label: "Ticket Type" },
    // { key: "listing_note", label: "Listing Note" },
    { key: "split", label: "Split" },
    { key: "stadium_name", label: "Stadium Name" },
    { key: "seat_category", label: "Seat Category" },
    { key: "country_name", label: "Country Name" },
    { key: "city_name", label: "City Name" },
    { key: "quantity", label: "Quantity" },
  ];

  const apiCall = async (params) => {
    setPageLoader(true);
    const updatedFilters = { ...filtersApplied, ...params };
    setFiltersApplied(updatedFilters);
    const salesData = await fetchSalesPageData("", updatedFilters);
    if (salesData) {
      setOverViewData(salesData.overview);
      setSalesData(salesData.list);
    }

    setPageLoader(false);
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
    // setPageLoader(true);

    setShowInfoPopup((prev) => {
      return {
        ...prev,
        flag: true,
        isLoading: true,
      };
    });

    const salesData = await fetchSalesOrderDetails("", {
      booking_id: item?.bg_id,
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
    // setPageLoader(false);
  };

  const getLogDetailsDetails = async (item) => {
    // setPageLoader(true);
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
    // setPageLoader(false);
  };
  // Create right sticky columns with action buttons
  const rightStickyColumns = salesData.map((item) => [
    {
      icon: (
        <Clock onClick={() => getLogDetailsDetails(item)} className="size-4" />
      ),
      className: " cursor-pointer",
    },
    {
      icon: <Eye onClick={() => getOrderDetails(item)} className="size-5" />,
      className: " cursor-pointer",
    },
  ]);

  const listItemsConfig = {
    [profile]: Object.entries(overViewData).reduce((acc, [key, value]) => {
      // Format decimal numbers to 2 decimal places
      const formattedValue =
        typeof value === "number" && value % 1 !== 0
          ? parseFloat(value.toFixed(2))
          : value;

      acc.push({
        name: convertKeyToDisplayName(key),
        value: formattedValue,
      });
      return acc;
    }, []),
  };

  const [csvLoader, setCsvLoader] = useState(false);
  // Configuration for filters per tab
  const filterConfig = {
    [profile]: [
      {
        type: "text",
        name: "searchMatch",
        value: filtersApplied?.searchMatch,
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
        parentClassName: "!w-[300px]",
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
        type: "select",
        value: filtersApplied?.ticket_type,
        name: "ticket_type",
        label: "Ticket Type",
        options: [
          { value: "none", label: "None" },
          { value: "vip", label: "VIP" },
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
        ],
        parentClassName: "!w-[15%]",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "tournament",
        label: "Tournament",
        value: filtersApplied?.tournament,
        options: tournamentOptions,
        parentClassName: "!w-[20%]",
        className: "!py-[6px] !px-[12px] w-full max-md:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "orderDate",
        singleDateMode: false,
        label: "Order Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
      },
    ],
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedItems([]);
  };

  const handleFilterChange = async (filterKey, value) => {
    let params = {};
    if (filterKey === "orderDate") {
      params = {
        ...params,
        order_date_from: value?.startDate,
        order_date_to: value?.endDate,
      };
    } else {
      params = {
        ...params,
        [filterKey]: value,
      };
    }
    await apiCall(params);
  };

  const handleCheckboxToggle = (checkboxKey, isChecked, allCheckboxValues) => {
    console.log("Sales checkbox toggled:", {
      checkboxKey,
      isChecked,
      allCheckboxValues,
    });

    const params = {
      ...filtersApplied,
      [checkboxKey]: isChecked ? 1 : 0,
      page: 1,
    };

    setFiltersApplied(params);
  };

  // Handle column toggle
  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Configuration for tabs - matching your screenshot
  const tabsConfig = [
    {
      name: "Pending",
      key: "pending",
      count: listData.length,
      amount: listData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/pending",
    },
    {
      name: "Delivered",
      key: "delivered",
      count: listData.length,
      amount: listData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/delivered",
    },
    {
      name: "Completed",
      key: "completed",
      count: listData.length,
      amount: listData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/completed",
    },
    {
      name: "Cancelled",
      key: "cancelled",
      count: listData.length,
      amount: listData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/cancelled",
    },
  ];
  const { downloadCSV } = useCSVDownload();

  const handleDownloadCSV = async () => {
    setCsvLoader(true);
    try {
      const response = await downloadSalesCSVReport();
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
      // Handle error (show toast, alert, etc.)
    } finally {
      setCsvLoader(false);
    }
  };

  const refreshPopupData = () => {
    if (showInfoPopup.flag) {
      getOrderDetails({ bg_id: showInfoPopup?.bg_id });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TabbedLayout
        tabs={tabsConfig}
        initialTab={profile || "pending"}
        listItemsConfig={listItemsConfig}
        filterConfig={filterConfig}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={handleCheckboxToggle}
        onColumnToggle={handleColumnToggle}
        visibleColumns={visibleColumns}
        showSelectedFilterPills={true}
        currentFilterValues={{ ...filtersApplied, order_status: "" }}
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

      {/* StickyDataTable section */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b flex justify-between  border-gray-200">
            <h2 className="text-lg font-semibold">
              {formatTabName(activeTab)} Orders ({listData.length})
            </h2>
            <Button
              onClick={() => handleDownloadCSV()}
              variant="primary"
              loading={csvLoader}
              classNames={{
                root: "py-[4px] justify-center cursor-pointer",
                label_: "text-[12px] px-[2]",
              }}
            >
              {" "}
              Export CSV
            </Button>
          </div>

          {/* StickyDataTable */}
          <div className="max-h-[250px] overflow-auto">
            <StickyDataTable
              headers={headers}
              data={listData}
              rightStickyColumns={rightStickyColumns}
              loading={pageLoader}
              onScrollEnd={() => {
                console.log("Reached end of table - load more data");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
