import { useState } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import Button from "../commonComponents/button";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";

// Static data for reports
const staticReportsData = [
  {
    id: "89670327",
    orderDate: "27/02/2025",
    orderValue: 400.0,
    event: "Dubai Duty Free Tennis Championships",
    venue: "Dubai Tennis Stadium, Dubai, UAE",
    eventDate: "28/02/2025",
    ticketDetails: "Grandstand East Lower 3",
    quantity: 2,
    category: "Sports",
    performer: "Tennis Tournament",
  },
  {
    id: "F54D8D53",
    orderDate: "15/02/2025",
    orderValue: 90.0,
    event: "Christina Aguilera Abu Dhabi",
    venue: "Saadiyat Island",
    eventDate: "15/02/2025",
    ticketDetails: "Bronze - Row N/A",
    quantity: 1,
    category: "Concert",
    performer: "Christina Aguilera",
  },
  {
    id: "9CF730AD",
    orderDate: "15/02/2025",
    orderValue: 400.0,
    event: "Christina Aguilera Abu Dhabi",
    venue: "Saadiyat Island",
    eventDate: "15/02/2025",
    ticketDetails: "Platinum Floor",
    quantity: 1,
    category: "Concert",
    performer: "Christina Aguilera",
  },
  {
    id: "BD4CA2B7",
    orderDate: "07/02/2025",
    orderValue: 1000.0,
    event: "Christina Aguilera Abu Dhabi",
    venue: "Saadiyat Island",
    eventDate: "15/02/2025",
    ticketDetails: "Bronze",
    quantity: 2,
    category: "Concert",
    performer: "Christina Aguilera",
  },
  {
    id: "FDF21F93",
    orderDate: "31/01/2025",
    orderValue: 350.0,
    event: "Christina Aguilera Abu Dhabi",
    venue: "Saadiyat Island",
    eventDate: "15/02/2025",
    ticketDetails: "Bronze",
    quantity: 1,
    category: "Concert",
    performer: "Christina Aguilera",
  },
  {
    id: "94274686",
    orderDate: "30/01/2025",
    orderValue: 600.0,
    event: "UFC Fight Night Adesanya vs Imavov",
    venue: "The Venue",
    eventDate: "01/02/2025",
    ticketDetails: "Block GN5",
    quantity: 3,
    category: "Sports",
    performer: "UFC",
  },
  {
    id: "AD7D51D9",
    orderDate: "24/01/2025",
    orderValue: 2450.0,
    event: "Christina Aguilera Abu Dhabi",
    venue: "Saadiyat Island",
    eventDate: "15/02/2025",
    ticketDetails: "Bronze",
    quantity: 7,
    category: "Concert",
    performer: "Christina Aguilera",
  },
  {
    id: "19C37555",
    orderDate: "14/01/2025",
    orderValue: 2000.0,
    event: "Coldplay Abu Dhabi",
    venue: "Zayed Sports City Stadium",
    eventDate: "14/01/2025",
    ticketDetails: "Lower 53",
    quantity: 2,
    category: "Concert",
    performer: "Coldplay",
  },
];

const RportHistory = (props) => {
  const { profile } = props;
  const [filtersApplied, setFiltersApplied] = useState({
    reports: 0,
    page: 1,
  });

  const [activeTab, setActiveTab] = useState("reports");
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState({
    flag: false,
    data: {},
  });
  const [selectedItems, setSelectedItems] = useState([]);

  // Calculate totals
  const totalSales = staticReportsData.length;
  const totalRevenue = staticReportsData.reduce(
    (sum, item) => sum + item.orderValue,
    0
  );
  const totalPayouts = totalRevenue; // Assuming same as revenue for now
  const averageOrderValue = totalRevenue / totalSales;
  const totalTicketsSold = staticReportsData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const averageTicketsPerOrder = totalTicketsSold / totalSales;

  // Configuration for tabs - only reports tab
  const tabsConfig = [
    {
      name: "Reports",
      key: "reports",
      count: staticReportsData.length,
      amount: totalRevenue,
      route: "/reports",
    },
  ];

  // Define table headers based on your UI screenshot
  const headers = [
    { key: "id", label: "Order ID" },
    { key: "orderDate", label: "Order Date" },
    { key: "orderValue", label: "Order Value" },
    { key: "event", label: "Event" },
    { key: "venue", label: "Venue" },
    { key: "eventDate", label: "Event Date" },
    { key: "ticketDetails", label: "Ticket Details" },
    { key: "quantity", label: "Qty" },
  ];

  // Handle action clicks
  const handleViewDetails = (item) => {
    setSelectedOrderDetails({
      flag: true,
      data: item,
    });
    console.log("View details for:", item);
  };

  const handleEdit = (item) => {
    console.log("Edit item:", item);
    // Add your edit logic here
  };

  const handleExport = (item) => {
    console.log("Export item:", item);
    // Add your export logic here
  };

  // Transform data for the table
  const transformedData = staticReportsData.map((item) => ({
    ...item,
    orderValue: `£${item.orderValue.toFixed(2)}`,
  }));

  // Create right sticky columns with action buttons
  const rightStickyColumns = staticReportsData.map((item) => [
    {
        icon: (
          <IconStore.clock
            onClick={() => setShowLogDetailsModal(true)}
            className="size-5"
          />
        ),
        className: " cursor-pointer",
      },
      {
        icon: (
          <IconStore.eye
            onClick={() => setShowInfoPopup(true)}
            className="size-5"
          />
        ),
        className: " cursor-pointer",
      },
  ]);

  // Configuration for list items (stats cards)
  const listItemsConfig = {
    reports: [
      { name: "Total Sales", value: totalSales },
      { name: "Total Revenue", value: `£${totalRevenue.toFixed(2)}` },
      { name: "Total Payouts", value: `£${totalPayouts.toFixed(2)}` },
      {
        name: "Average Order Value",
        value: `£${averageOrderValue.toFixed(2)}`,
      },
      { name: "Total Tickets Sold", value: totalTicketsSold },
      {
        name: "Average Tickets per Order",
        value: averageTicketsPerOrder.toFixed(2),
      },
    ],
  };

  // Configuration for filters
  const filterConfig = {
    reports: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search event or order ID",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "venue",
        label: "Venue",
        options: [
          { value: "all", label: "All Venues" },
          { value: "dubai_tennis", label: "Dubai Tennis Stadium" },
          { value: "saadiyat_island", label: "Saadiyat Island" },
          { value: "the_venue", label: "The Venue" },
          { value: "zayed_stadium", label: "Zayed Sports City Stadium" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        options: [
          { value: "1_selected", label: "1 selected" },
          { value: "amir_khan", label: "Amir Khan" },
          { value: "mark_johnson", label: "Mark Johnson" },
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
          { value: "all", label: "All Categories" },
          { value: "sports", label: "Sports" },
          { value: "concert", label: "Concert" },
          { value: "theatre", label: "Theatre" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "performer",
        label: "Performer",
        options: [
          { value: "all", label: "All Performers" },
          { value: "christina_aguilera", label: "Christina Aguilera" },
          { value: "coldplay", label: "Coldplay" },
          { value: "tennis_tournament", label: "Tennis Tournament" },
          { value: "ufc", label: "UFC" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
    ],
  };

  const handleTabChange = (tab) => {
    console.log("Reports tab changed to:", tab);
    setActiveTab(tab);
    setSelectedItems([]);
  };

  const handleFilterChange = (filterKey, value, allFilters, currentTab) => {
    console.log("Reports filter changed:", {
      filterKey,
      value,
      allFilters,
      currentTab,
    });
  };

  const handleCheckboxToggle = (checkboxKey, isChecked, allCheckboxValues) => {
    console.log("Reports checkbox toggled:", {
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

  const handleExportCSV = () => {
    console.log("Export CSV clicked");
    // Add CSV export logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TabbedLayout
        initialTab="reports"
        listItemsConfig={listItemsConfig}
        filterConfig={filterConfig}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={handleCheckboxToggle}
      />
       <LogDetailsModal show={showLogDetailsModal} onClose={() => setShowLogDetailsModal(false)} />
      <OrderInfo show={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      {/* StickyDataTable section */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-semibold">
              Reports ({staticReportsData.length})
            </h2>
            <Button
              onClick={handleExportCSV}
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
          <div className="max-h-[500px] overflow-auto">
            <StickyDataTable
              headers={headers}
              data={transformedData}
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

export default RportHistory;
