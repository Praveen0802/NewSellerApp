// Helper function to transform API notification data to component format
const transformNotificationData = (apiData) => {
  if (!apiData?.data?.notification_list) return [];

  return apiData.data.notification_list.map((item) => ({
    id: item.id,
    type: "seller_notification",
    title: item.description,
    date: new Date(item.created_at * 1000).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: item.viewed ? "read" : "new",
    isRead: item.viewed === 1,
    category: "order",
    isPinned: item.pinned === 1,
    // Extract ticket info from description if available
    ticketCount: extractTicketCount(item.description),
    artist: extractEventName(item.description),
    venue: extractVenue(item.description),
    rawTimestamp: item.created_at,
  }));
};

// Helper function to transform API activity data to component format
const transformActivityData = (apiData) => {
  if (!apiData?.data?.activity_list) return [];

  return apiData.data.activity_list.map((item) => ({
    id: item.id,
    type: item.type,
    title: item.description,
    date: new Date(item.created_at * 1000).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: "completed",
    category: "authentication",
    userId: extractUserId(item.description),
    userName: extractUserName(item.description),
    activityType: item.type,
    rawTimestamp: item.created_at,
  }));
};

// Helper functions to extract information from descriptions
const extractTicketCount = (description) => {
  const match = description.match(/(\d+)\s+ticket\(s\)/);
  return match ? parseInt(match[1]) : 1;
};

const extractEventName = (description) => {
  // Extract event name from order descriptions
  const match = description.match(/for\s+(.+?)\s+on\s+\d{4}-\d{2}-\d{2}/);
  return match ? match[1] : "Event";
};

const extractVenue = (description) => {
  // For this API, venue info might not be directly available
  // You may need to extract it differently based on your data structure
  return "Venue";
};

const extractUserId = (description) => {
  const match = description.match(/#(\d+)/);
  return match ? parseInt(match[1]) : null;
};

const extractUserName = (description) => {
  const match = description.match(/\(([^)]+)\)/);
  return match ? match[1] : "User";
};

// Updated Popup component - positioned on the right side
const NotificationPopup = ({ item, onClose, isVisible }) => {
  if (!isVisible || !item) return null;

  return (
    <RightViewModal show={isVisible} onClose={onClose}>
      <div className="bg-white h-full shadow-xl overflow-y-auto">
        {/* Close button - positioned at top right of panel */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl font-bold z-10"
        >
          ×
        </button>

        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
              {item.status === "new"
                ? "New"
                : item.type === "logged_in" || item.type === "logged_out"
                ? "Activity"
                : "Notification"}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-900 pr-8">
            {item.date}
          </h3>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-800 leading-relaxed mb-4">
            {item.title}
          </p>

          {item.type === "seller_notification" && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                {item.artist && (
                  <div>
                    <strong>Event:</strong> {item.artist}
                  </div>
                )}
                {item.venue && (
                  <div>
                    <strong>Venue:</strong> {item.venue}
                  </div>
                )}
                {item.ticketCount && (
                  <div>
                    <strong>Tickets:</strong> {item.ticketCount}
                  </div>
                )}
              </div>
            </div>
          )}

          {(item.type === "logged_in" || item.type === "logged_out") && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-xs text-gray-600 space-y-1">
                {item.userName && (
                  <div>
                    <strong>User:</strong> {item.userName}
                  </div>
                )}
                {item.userId && (
                  <div>
                    <strong>User ID:</strong> {item.userId}
                  </div>
                )}
                <div>
                  <strong>Activity:</strong> {item.type.replace("_", " ")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </RightViewModal>
  );
};

import { useState, useEffect } from "react";
// Import your existing TabbedLayout component
import TabbedLayout from "../tabbedLayout";
import RightViewModal from "../commonComponents/rightViewModal";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingCheckbox from "../floatinginputFields/floatingCheckBox";

// NotificationPage component
const NotificationPage = (props) => {
  const { notify, notifyData } = props;
  console.log("NotificationPage props:", props);

  const [filtersApplied, setFiltersApplied] = useState({
    upcomming: 0,
    expired: 0,
    page: 1,
  });

  const [activeTab, setActiveTab] = useState(notify || "home");
  const [selectedItems, setSelectedItems] = useState([]);
  const [popupItem, setPopupItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Transform API data to component format
  const [notificationData, setNotificationData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    // Transform the API data when component mounts or data changes
    if (notifyData) {
      if (notify === "home") {
        setNotificationData(transformNotificationData(notifyData));
      } else if (notify === "activity") {
        setActivityData(transformActivityData(notifyData));
      }
    }
  }, [notifyData, notify]);

  const [actionBarStates, setActionBarStates] = useState({
    selectAll: false,
    markAsViewed: false,
    markAsPinned: false,
    markAsUnpinned: false,
  });

  // Add these arrays to track item states
  const [pinnedItems, setPinnedItems] = useState([]); // Track pinned items
  const [viewedItems, setViewedItems] = useState([]); // Track viewed items

  // Initialize pinned and viewed items from API data
  useEffect(() => {
    if (notificationData.length > 0) {
      setPinnedItems(
        notificationData.filter((item) => item.isPinned).map((item) => item.id)
      );
      setViewedItems(
        notificationData.filter((item) => item.isRead).map((item) => item.id)
      );
    }
  }, [notificationData]);

  // Updated handler functions
  const handleActionBarChange = (e, keyValue) => {
    const { checked } = e.target;

    if (keyValue === "selectAll") {
      // Handle select all logic
      if (checked) {
        const currentData = getCurrentData();
        setSelectedItems(currentData.map((item) => item.id));
      } else {
        setSelectedItems([]);
      }
    }

    setActionBarStates((prev) => ({
      ...prev,
      [keyValue]: checked,
    }));

    // Handle the respective actions
    if (checked) {
      switch (keyValue) {
        case "markAsViewed":
          console.log("Marking as viewed:", selectedItems);
          // Add selected items to viewed items
          setViewedItems((prev) => [...new Set([...prev, ...selectedItems])]);
          // TODO: Call API to mark as viewed
          // markNotificationsAsViewed(selectedItems);
          // Reset the checkbox after action
          setTimeout(() => {
            setActionBarStates((prev) => ({ ...prev, markAsViewed: false }));
          }, 1000);
          break;
        case "markAsPinned":
          console.log("Marking as pinned:", selectedItems);
          // Add selected items to pinned items
          setPinnedItems((prev) => [...new Set([...prev, ...selectedItems])]);
          // TODO: Call API to mark as pinned
          // markNotificationsAsPinned(selectedItems);
          // Reset the checkbox after action
          setTimeout(() => {
            setActionBarStates((prev) => ({ ...prev, markAsPinned: false }));
          }, 1000);
          break;
        case "markAsUnpinned":
          console.log("Marking as unpinned:", selectedItems);
          // Remove selected items from pinned items
          setPinnedItems((prev) =>
            prev.filter((id) => !selectedItems.includes(id))
          );
          // TODO: Call API to mark as unpinned
          // markNotificationsAsUnpinned(selectedItems);
          // Reset the checkbox after action
          setTimeout(() => {
            setActionBarStates((prev) => ({ ...prev, markAsUnpinned: false }));
          }, 1000);
          break;
      }
    }
  };

  // Get counts from API data
  const getNotificationCounts = () => {
    const total = notifyData?.data?.notification_count || 0;
    const unread = notifyData?.data?.unread_count || 0;
    return { total, unread };
  };

  const getActivityCounts = () => {
    const total = notifyData?.data?.activity_count || 0;
    const recent = activityData.filter((item) => {
      const itemDate = new Date(item.rawTimestamp * 1000);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate > weekAgo;
    }).length;
    return { total, recent };
  };

  // Configuration for tabs
  const tabsConfig = [
    {
      name: "Notifications",
      key: "home",
      count: getNotificationCounts().total,
      route: "/notifications/home",
    },
    {
      name: "Activity",
      key: "activity",
      count: getActivityCounts().total,
      route: "/notifications/activity",
    },
  ];

  // Configuration for list items per tab
  const listItemsConfig = {
    home: [
      { name: "Notifications", value: getNotificationCounts().total },
      {
        name: "New Notifications",
        value: getNotificationCounts().unread,
        showCheckbox: true,
        key: "upcomming",
        isChecked: false,
      },
    ],
    activity: [
      { name: "Activity Logs", value: getActivityCounts().total },
      {
        name: "Recent Activity",
        value: getActivityCounts().recent,
        showCheckbox: true,
        key: "expired",
        isChecked: false,
      },
    ],
  };

  // Configuration for filters per tab
  const filterConfig = {
    home: [
      {
        type: "text",
        name: "selectedMatch",
        label: "Search Match event or Booking number",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "ticket_status",
        label: "Ticket status",
        options: [
          { value: "fulfilled", label: "Fulfilled" },
          { value: "incomplete", label: "Incomplete" },
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "eventDate",
        label: "Event date",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
    activity: [
      {
        type: "text",
        name: "selectedActivity",
        label: "Search Activity",
        className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
      },
      {
        type: "select",
        name: "team_member",
        label: "Team members",
        options: [
          { value: "none", label: "None" },
          // Generate options from unique users in activity data
          ...Array.from(new Set(activityData.map((item) => item.userName)))
            .filter(Boolean)
            .map((userName) => ({ value: userName, label: userName })),
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "select",
        name: "activity_type",
        label: "Activity type",
        options: [
          { value: "none", label: "None" },
          // Generate options from activity types in API data
          ...(notifyData?.data?.activity_types || []).map((type) => ({
            value: type.type,
            label: type.name,
          })),
        ],
        parentClassName: "!w-[30%]",
        className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
        labelClassName: "!text-[11px]",
      },
      {
        type: "date",
        name: "activityDate",
        label: "Date range",
        parentClassName: "!w-[200px]",
        className: "!py-[8px] !px-[16px] mobile:text-xs",
        singleDateMode: false,
      },
    ],
  };

  const handleTabChange = (tab) => {
    console.log("Tab changed to:", tab);
    setActiveTab(tab);
    setSelectedItems([]);
  };

  const handleFilterChange = (filterKey, value, allFilters, currentTab) => {
    console.log("Filter changed:", {
      filterKey,
      value,
      allFilters,
      currentTab,
    });
    // TODO: Implement API call to filter data
  };

  const handleCheckboxToggle = (checkboxKey, isChecked, allCheckboxValues) => {
    console.log("Checkbox toggled:", {
      checkboxKey,
      isChecked,
      allCheckboxValues,
    });

    const params = {
      ...filtersApplied,
      upcomming: allCheckboxValues?.upcomming ? 1 : 0,
      expired: allCheckboxValues?.expired ? 1 : 0,
      page: 1,
    };

    setFiltersApplied(params);
    // TODO: Implement API call to fetch filtered data
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Handle popup
  const handleViewItem = (item) => {
    setPopupItem(item);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setPopupItem(null);
  };

  // Get current data based on active tab
  const getCurrentData = () => {
    return activeTab === "home" ? notificationData : activityData;
  };

  const handleSelectAll = () => {
    const currentData = getCurrentData();
    const newSelection =
      selectedItems.length === currentData.length
        ? []
        : currentData.map((item) => item.id);
    setSelectedItems(newSelection);

    setActionBarStates((prev) => ({
      ...prev,
      selectAll: newSelection.length === currentData.length,
    }));
  };

  // Render list item
  const renderListItem = (item, index) => {
    const isSelected = selectedItems.includes(item.id);
    const isPinned = pinnedItems.includes(item.id);
    const isViewed = viewedItems.includes(item.id);

    return (
      <div
        key={item.id}
        className={`flex items-start gap-3 hover:bg-gray-50 transition-all duration-200 ${
          isPinned
            ? "border-l-4 border-l-blue-500 bg-blue-50/30"
            : "border-b border-gray-100"
        }`}
      >
        <div className="pl-4 pr-0 pt-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleItemSelect(item.id)}
            className="mt-1 rounded border-gray-300"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div
              className={`flex-1 border-x-[1px] px-4 py-2 transition-all duration-200 ${
                isPinned
                  ? "border-blue-200 bg-gradient-to-r from-blue-50/50 to-transparent"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Pin indicator */}
                {isPinned && (
                  <svg
                    className="w-3 h-3 text-blue-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    item.status === "new" ? "bg-green-500" : "bg-blue-500"
                  }`}
                ></span>
                <span className="text-xs text-gray-500 font-medium">
                  {item.status === "new"
                    ? "New"
                    : item.type === "logged_in" || item.type === "logged_out"
                    ? "Activity"
                    : "Notification"}
                </span>
                <span className="text-xs text-gray-400">{item.date}</span>
                {isPinned && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    Pinned
                  </span>
                )}
              </div>
              <p
                className={`text-sm leading-relaxed transition-colors duration-200 ${
                  isViewed
                    ? "text-gray-500"
                    : isPinned
                    ? "text-gray-900 font-medium"
                    : "text-gray-800"
                }`}
              >
                {item.title}
              </p>
            </div>
            <button
              onClick={() => handleViewItem(item)}
              className="hover:bg-gray-100 py-4 px-2 rounded cursor-pointer transition-colors"
            >
              <IconStore.eye className="size-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (!notifyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (notifyData && !notifyData.success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading notifications</p>
        </div>
      </div>
    );
  }

  const currentData = getCurrentData();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <TabbedLayout
        tabs={tabsConfig}
        initialTab={notify || "home"}
        listItemsConfig={listItemsConfig}
        filterConfig={filterConfig}
        onTabChange={handleTabChange}
        onFilterChange={handleFilterChange}
        onCheckboxToggle={handleCheckboxToggle}
      />

      {/* List View Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mt-4 mb-20 max-h-[calc(100vh-385px)] overflow-y-auto">
        {/* List Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">
            {currentData.length}{" "}
            {activeTab === "home" ? "Notifications" : "Activity Logs"}
          </h3>
        </div>

        {/* List Items */}
        {currentData.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {currentData.map((item, index) => renderListItem(item, index))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <p>
              No {activeTab === "home" ? "notifications" : "activity logs"}{" "}
              found
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Bar - Fixed */}
      <div className="fixed bottom-0 w-full left-20 right-0 bg-white border-t border-gray-200 p-4 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Select All Checkbox */}
            <div className="w-[140px]">
              <FloatingCheckbox
                id="selectAll"
                name="selectAll"
                keyValue="selectAll"
                label="Select all"
                checked={
                  selectedItems.length === currentData.length &&
                  currentData.length > 0
                }
                onChange={handleActionBarChange}
                className=""
                labelClassName=""
              />
            </div>

            {/* Conditional Action Checkboxes - only show when items are selected */}
            {selectedItems.length > 0 && (
              <>
                <div className="">
                  <FloatingCheckbox
                    id="markAsViewed"
                    name="markAsViewed"
                    keyValue="markAsViewed"
                    label="Mark as viewed"
                    checked={actionBarStates.markAsViewed}
                    onChange={handleActionBarChange}
                    className=""
                    labelClassName="!text-gray-700"
                    beforeIcon={
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    }
                  />
                </div>

                <div className="">
                  <FloatingCheckbox
                    id="markAsPinned"
                    name="markAsPinned"
                    keyValue="markAsPinned"
                    label="Mark as pinned"
                    checked={actionBarStates.markAsPinned}
                    onChange={handleActionBarChange}
                    className=""
                    labelClassName="!text-gray-700"
                    beforeIcon={
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    }
                  />
                </div>

                <div className="">
                  <FloatingCheckbox
                    id="markAsUnpinned"
                    name="markAsUnpinned"
                    keyValue="markAsUnpinned"
                    label="Mark as unpinned"
                    checked={actionBarStates.markAsUnpinned}
                    onChange={handleActionBarChange}
                    className=""
                    labelClassName="!text-gray-700"
                    beforeIcon={
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* Right side info and navigation */}
          {selectedItems.length > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {selectedItems.length} selected
              </span>
              <div className="flex gap-2">
                <button className=" hover:bg-gray-100 cursor-pointer p-1 rounded border border-gray-300">
                  <IconStore.chevronLeft className="size-4 text-gray-400" />
                </button>
                <button className="cursor-pointer hover:bg-gray-100  p-1 rounded border border-gray-300">
                  <IconStore.chevronRight className="size-4 text-gray-400" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notification Popup */}
      <NotificationPopup
        item={popupItem}
        isVisible={showPopup}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default NotificationPage;
