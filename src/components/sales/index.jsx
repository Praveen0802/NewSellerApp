import { useState } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";
import { convertKeyToDisplayName } from "@/utils/helperFunctions";
import Button from "../commonComponents/button";
import { downloadSalesCSVReport } from "@/utils/apiHandler/request";
import { Clock, Eye } from "lucide-react";

const SalesPage = (props) => {
  const { profile, response = {} } = props;

  const [filtersApplied, setFiltersApplied] = useState({
    pending: 0,
    delivered: 0,
    completed: 0,
    cancelled: 0,
    replaced: 0,
    page: 1,
  });

  const [activeTab, setActiveTab] = useState(profile || "pending");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({
    flag: false,
    data: {},
  });

  const [overViewData, setOverViewData] = useState(response?.overview);
  const [salesData, setSalesData] = useState(response?.list);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);

  // Define table headers - filter based on visible columns
  const allHeaders = [
    { key: "booking_no", label: "Booking No" },
    { key: "total_amount", label: "Total Amount" },
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
    { key: "listing_note", label: "Listing Note" },
    { key: "split", label: "Split" },
    { key: "stadium_name", label: "Stadium Name" },
    { key: "seat_category", label: "Seat Category" },
    { key: "country_name", label: "Country Name" },
    { key: "city_name", label: "City Name" },
    { key: "quantity", label: "Quantity" },
  ];

  // Dynamically create initial visible columns state from allHeaders
  const createInitialVisibleColumns = () => {
    return allHeaders.reduce((acc, header) => {
      acc[header.key] = true; // Set all columns as visible by default
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

  const handleEdit = (item) => {
    console.log("Edit item:", item);
  };

  const handleDelete = (item) => {
    console.log("Delete item:", item);
  };

  const handlePrint = (item) => {
    console.log("Print item:", item);
  };

  // Create right sticky columns with action buttons
  const rightStickyColumns = salesData.map((item) => [
    {
      icon: (
        <Clock
          onClick={() => setShowLogDetailsModal(true)}
          className="size-4"
        />
      ),
      className: " cursor-pointer",
    },
    {
      icon: (
        <Eye
          onClick={() => setShowInfoPopup(true)}
          className="size-5"
        />
      ),
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

  const [csvLoader,setCsvLoader] = useState(false)


  // Configuration for filters per tab
  const filterConfig = {
    pending: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
        parentClassName: "!w-[300px]",
      },
      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        options: [
          { value: "1_selected", label: "1 selected" },
          { value: "mark_johnson", label: "Mark Johnson" },
          { value: "john_doe", label: "John Doe" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "ticket_type",
        label: "Ticket Type",
        options: [
          { value: "none", label: "None" },
          { value: "vip", label: "VIP" },
          { value: "standard", label: "Standard" },
          { value: "premium", label: "Premium" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "category",
        label: "Category",
        options: [
          { value: "none", label: "None" },
          { value: "football", label: "Football" },
          { value: "concert", label: "Concert" },
          { value: "theatre", label: "Theatre" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "orderDate",
        label: "Order Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
      {
        type: "date",
        name: "deliverByDate",
        label: "Deliver by Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
      {
        type: "date",
        name: "eventDate",
        label: "Event Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
    delivered: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "delivery_method",
        label: "Delivery Method",
        options: [
          { value: "all", label: "All Methods" },
          { value: "email", label: "Email" },
          { value: "mobile", label: "Mobile" },
          { value: "postal", label: "Postal" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "deliveryDate",
        label: "Delivery Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
    completed: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "completion_status",
        label: "Completion Status",
        options: [
          { value: "all", label: "All" },
          { value: "successful", label: "Successful" },
          { value: "partial", label: "Partial" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "completionDate",
        label: "Completion Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
    cancelled: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "cancellation_reason",
        label: "Cancellation Reason",
        options: [
          { value: "all", label: "All Reasons" },
          { value: "customer_request", label: "Customer Request" },
          { value: "event_cancelled", label: "Event Cancelled" },
          { value: "payment_failed", label: "Payment Failed" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "cancellationDate",
        label: "Cancellation Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
    replaced: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "replacement_reason",
        label: "Replacement Reason",
        options: [
          { value: "all", label: "All Reasons" },
          { value: "damaged", label: "Damaged" },
          { value: "lost", label: "Lost" },
          { value: "upgrade", label: "Upgrade" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "replacementDate",
        label: "Replacement Date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
  };

  const handleTabChange = (tab) => {
    console.log("Sales tab changed to:", tab);
    setActiveTab(tab);
    setSelectedItems([]);
  };

  const handleFilterChange = (filterKey, value, allFilters, currentTab) => {
    console.log("Sales filter changed:", {
      filterKey,
      value,
      allFilters,
      currentTab,
    });
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

  const handleDownloadCSV = async() =>{
    setCsvLoader(true);
    try {
      const response = await downloadSalesCSVReport();
      // Check if response is successful
      if (response ) {
        // Create a blob from the response data
        const blob = new Blob([response], { 
          type: 'application/csv;charset=utf-8;' 
        });
        
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
        
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = url;
        
        // Set the filename (you can customize this)
        const filename = `export_${new Date().toISOString().slice(0, 10)}.csv`;
        link.download = filename;
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        window.URL.revokeObjectURL(url);
        
        // Optional: Show success message
        console.log('CSV downloaded successfully');
        
      } else {
        console.error('No data received from server');
      }
      
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Handle error (show toast, alert, etc.)
    } finally {
      setCsvLoader(false);
    }
  
  }

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
      />
      <LogDetailsModal
        show={showLogDetailsModal}
        onClose={() => setShowLogDetailsModal(false)}
      />
      <OrderInfo show={showInfoPopup} onClose={() => setShowInfoPopup(false)} />

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
              > Export CSV</Button>
          </div>

          {/* StickyDataTable */}
          <div className="max-h-[250px] overflow-auto">
            <StickyDataTable
              headers={headers}
              data={listData}
              rightStickyColumns={rightStickyColumns}
              loading={false}
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
