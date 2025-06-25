import { useState } from "react";
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import StickyDataTable from "../tradePage/components/stickyDataTable";
import OrderInfo from "../orderInfoPopup";
import LogDetailsModal from "../ModalComponents/LogDetailsModal";

// Static data for different order statuses
const staticPendingData = [
  {
    id: 1,
    status: "pending",
    amount: 50.0,
    customer: "John Doe",
    date: "2024-06-20",
    event: "Chelsea vs Arsenal",
    bookingNo: "BK001",
    venue: "Stamford Bridge",
    category: "VIP",
    ticketType: "Adult",
    qty: 2,
    deliveryMethod: "Email",
  },
  {
    id: 2,
    status: "pending",
    amount: 125.5,
    customer: "Sarah Wilson",
    date: "2024-06-21",
    event: "Liverpool vs City",
    bookingNo: "BK002",
    venue: "Anfield",
    category: "Premium",
    ticketType: "Adult",
    qty: 1,
    deliveryMethod: "Mobile",
  },
];

const staticAwaitingDeliveryData = [
  {
    id: 3,
    status: "awaiting_delivery",
    amount: 75.0,
    customer: "Jane Smith",
    date: "2024-06-19",
    event: "Liverpool vs City",
    bookingNo: "BK003",
    venue: "Etihad Stadium",
    category: "Standard",
    ticketType: "Adult",
    qty: 3,
    deliveryMethod: "Postal",
  },
  {
    id: 4,
    status: "awaiting_delivery",
    amount: 200.0,
    customer: "Mike Johnson",
    date: "2024-06-18",
    event: "United vs Spurs",
    bookingNo: "BK004",
    venue: "Old Trafford",
    category: "VIP",
    ticketType: "Adult",
    qty: 2,
    deliveryMethod: "Email",
  },
];

const staticDeliveredData = [
  {
    id: 5,
    status: "delivered",
    amount: 1850.0,
    customer: "Bob Johnson",
    date: "2024-06-18",
    event: "United vs Spurs",
    bookingNo: "BK005",
    venue: "Wembley Stadium",
    category: "Premium",
    ticketType: "Adult",
    qty: 4,
    deliveryMethod: "Mobile",
  },
  {
    id: 6,
    status: "delivered",
    amount: 950.0,
    customer: "Emma Davis",
    date: "2024-06-17",
    event: "Arsenal vs City",
    bookingNo: "BK006",
    venue: "Emirates Stadium",
    category: "Standard",
    ticketType: "Adult",
    qty: 2,
    deliveryMethod: "Email",
  },
];

const staticCompletedData = [
  {
    id: 7,
    status: "completed",
    amount: 9792.5,
    customer: "Alice Brown",
    date: "2024-06-17",
    event: "Arsenal vs City",
    bookingNo: "BK007",
    venue: "Emirates Stadium",
    category: "VIP",
    ticketType: "Adult",
    qty: 8,
    deliveryMethod: "Postal",
  },
  {
    id: 8,
    status: "completed",
    amount: 5500.0,
    customer: "Charlie Wilson",
    date: "2024-06-16",
    event: "Chelsea vs United",
    bookingNo: "BK008",
    venue: "Stamford Bridge",
    category: "Premium",
    ticketType: "Adult",
    qty: 6,
    deliveryMethod: "Mobile",
  },
];

const staticCancelledData = [
  {
    id: 9,
    status: "cancelled",
    amount: 7000.0,
    customer: "David Lee",
    date: "2024-06-15",
    event: "Spurs vs Liverpool",
    bookingNo: "BK009",
    venue: "Tottenham Stadium",
    category: "VIP",
    ticketType: "Adult",
    qty: 4,
    deliveryMethod: "Email",
  },
  {
    id: 10,
    status: "cancelled",
    amount: 3200.0,
    customer: "Eva Garcia",
    date: "2024-06-14",
    event: "City vs Arsenal",
    bookingNo: "BK010",
    venue: "Etihad Stadium",
    category: "Standard",
    ticketType: "Adult",
    qty: 8,
    deliveryMethod: "Postal",
  },
];

const staticReplacedData = [
  {
    id: 11,
    status: "replaced",
    amount: 4500.0,
    customer: "Frank Miller",
    date: "2024-06-13",
    event: "United vs Chelsea",
    bookingNo: "BK011",
    venue: "Old Trafford",
    category: "Premium",
    ticketType: "Adult",
    qty: 3,
    deliveryMethod: "Mobile",
  },
  {
    id: 12,
    status: "replaced",
    amount: 2800.0,
    customer: "Grace Taylor",
    date: "2024-06-12",
    event: "Liverpool vs Spurs",
    bookingNo: "BK012",
    venue: "Anfield",
    category: "Standard",
    ticketType: "Adult",
    qty: 4,
    deliveryMethod: "Email",
  },
];

// Additional data for stats cards
const staticOrdersData = [];
const staticETicketData = [];
const staticExternalTransferData = [];
const staticMobileLinkData = [];
const staticMobileScreenshotData = [
  { id: 10, type: "mobile_screenshot", date: "2024-06-20" },
];

const SalesPage = (props) => {
  const { profile } = props;
  const [filtersApplied, setFiltersApplied] = useState({
    pending: 0,
    awaiting_delivery: 0,
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
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  // Helper function to safely format tab name
  const formatTabName = (tabKey) => {
    if (!tabKey || typeof tabKey !== "string") {
      return "Pending";
    }
    return (
      tabKey.charAt(0).toUpperCase() + tabKey.slice(1).replace(/[-_]/g, " ")
    );
  };
  const [selectedItems, setSelectedItems] = useState([]);
  const [showLogDetailsModal, setShowLogDetailsModal] = useState(false);

  // Configuration for tabs - matching your screenshot
  const tabsConfig = [
    {
      name: "Pending",
      key: "pending",
      count: staticPendingData.length,
      amount: staticPendingData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/pending",
    },
    {
      name: "Awaiting Delivery",
      key: "awaiting-delivery",
      count: staticAwaitingDeliveryData.length,
      amount: staticAwaitingDeliveryData.reduce(
        (sum, item) => sum + item.amount,
        0
      ),
      route: "/sales/awaiting-delivery",
    },
    {
      name: "Delivered",
      key: "delivered",
      count: staticDeliveredData.length,
      amount: staticDeliveredData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/delivered",
    },
    {
      name: "Completed",
      key: "completed",
      count: staticCompletedData.length,
      amount: staticCompletedData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/completed",
    },
    {
      name: "Cancelled",
      key: "cancelled",
      count: staticCancelledData.length,
      amount: staticCancelledData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/cancelled",
    },
    {
      name: "Replaced",
      key: "replaced",
      count: staticReplacedData.length,
      amount: staticReplacedData.reduce((sum, item) => sum + item.amount, 0),
      route: "/sales/replaced",
    },
  ];

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case "pending":
        return staticPendingData;
      case "awaiting-delivery":
        return staticAwaitingDeliveryData;
      case "delivered":
        return staticDeliveredData;
      case "completed":
        return staticCompletedData;
      case "cancelled":
        return staticCancelledData;
      case "replaced":
        return staticReplacedData;
      default:
        return staticPendingData;
    }
  };

  // Define table headers
  const headers = [
    { key: "status", label: "Status" },
    { key: "bookingNo", label: "Booking No" },
    { key: "customer", label: "Customer" },
    { key: "date", label: "Order Date" },
    { key: "event", label: "Event" },
    { key: "venue", label: "Venue" },
    { key: "category", label: "Category" },
    { key: "ticketType", label: "Ticket Type" },
    { key: "qty", label: "Qty" },
    { key: "amount", label: "Amount" },
    { key: "deliveryMethod", label: "Delivery Method" },
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

  const handleDelete = (item) => {
    console.log("Delete item:", item);
    // Add your delete logic here
  };

  const handlePrint = (item) => {
    console.log("Print item:", item);
    // Add your print logic here
  };

  // Transform data for the table
  const transformedData = getCurrentData().map((item) => ({
    ...item,
    status: item.status.replace(/_/g, " "),
    amount: `£${item.amount.toFixed(2)}`,
  }));

  // Create right sticky columns with action buttons
  const rightStickyColumns = getCurrentData().map((item) => [
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

  // Configuration for list items per tab (stats cards below tabs)
  const listItemsConfig = {
    pending: [
      {
        name: "Pending Revenue",
        value: `£${staticPendingData
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2)}`,
      },
      { name: "Orders", value: staticOrdersData.length },
      { name: "E-ticket", value: staticETicketData.length },
      { name: "External Transfer", value: staticExternalTransferData.length },
      { name: "Mobile Link/PKPASS", value: staticMobileLinkData.length },
      { name: "Mobile Screenshot", value: staticMobileScreenshotData.length },
    ],
    "awaiting-delivery": [
      {
        name: "Awaiting Revenue",
        value: `£${staticAwaitingDeliveryData
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2)}`,
      },
      { name: "Orders", value: staticOrdersData.length },
      { name: "E-ticket", value: staticETicketData.length },
      { name: "External Transfer", value: staticExternalTransferData.length },
      { name: "Mobile Link/PKPASS", value: staticMobileLinkData.length },
      { name: "Mobile Screenshot", value: staticMobileScreenshotData.length },
    ],
    delivered: [
      {
        name: "Delivered Revenue",
        value: `£${staticDeliveredData
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2)}`,
      },
      { name: "Orders", value: staticOrdersData.length },
      { name: "E-ticket", value: staticETicketData.length },
      { name: "External Transfer", value: staticExternalTransferData.length },
      { name: "Mobile Link/PKPASS", value: staticMobileLinkData.length },
      { name: "Mobile Screenshot", value: staticMobileScreenshotData.length },
    ],
    completed: [
      {
        name: "Completed Revenue",
        value: `£${staticCompletedData
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2)}`,
      },
      { name: "Orders", value: staticOrdersData.length },
      { name: "E-ticket", value: staticETicketData.length },
      { name: "External Transfer", value: staticExternalTransferData.length },
      { name: "Mobile Link/PKPASS", value: staticMobileLinkData.length },
      { name: "Mobile Screenshot", value: staticMobileScreenshotData.length },
    ],
    cancelled: [
      {
        name: "Cancelled Amount",
        value: `£${staticCancelledData
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2)}`,
      },
      { name: "Orders", value: staticOrdersData.length },
      { name: "E-ticket", value: staticETicketData.length },
      { name: "External Transfer", value: staticExternalTransferData.length },
      { name: "Mobile Link/PKPASS", value: staticMobileLinkData.length },
      { name: "Mobile Screenshot", value: staticMobileScreenshotData.length },
    ],
    replaced: [
      {
        name: "Replaced Amount",
        value: `£${staticReplacedData
          .reduce((sum, item) => sum + item.amount, 0)
          .toFixed(2)}`,
      },
      { name: "Orders", value: staticOrdersData.length },
      { name: "E-ticket", value: staticETicketData.length },
      { name: "External Transfer", value: staticExternalTransferData.length },
      { name: "Mobile Link/PKPASS", value: staticMobileLinkData.length },
      { name: "Mobile Screenshot", value: staticMobileScreenshotData.length },
    ],
  };

  // Configuration for filters per tab
  const filterConfig = {
    pending: [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
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
    "awaiting-delivery": [
      {
        type: "text",
        name: "searchMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "team_members",
        label: "Team Members",
        options: [
          { value: "1_selected", label: "1 selected" },
          { value: "mark_johnson", label: "Mark Johnson" },
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
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "deliverByDate",
        label: "Deliver by Date",
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
      />
      <LogDetailsModal show={showLogDetailsModal} onClose={() => setShowLogDetailsModal(false)} />
      <OrderInfo show={showInfoPopup} onClose={() => setShowInfoPopup(false)} />
      {/* StickyDataTable section */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              {formatTabName(activeTab)} Orders ({getCurrentData().length})
            </h2>
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

      {/* Order Details Modal/Popup (you can add this component) */}
      {selectedOrderDetails.flag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-2">
              <p>
                <strong>Booking No:</strong>{" "}
                {selectedOrderDetails.data.bookingNo}
              </p>
              <p>
                <strong>Customer:</strong> {selectedOrderDetails.data.customer}
              </p>
              <p>
                <strong>Event:</strong> {selectedOrderDetails.data.event}
              </p>
              <p>
                <strong>Amount:</strong> £{selectedOrderDetails.data.amount}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrderDetails.data.status}
              </p>
            </div>
            <button
              onClick={() => setSelectedOrderDetails({ flag: false, data: {} })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPage;
