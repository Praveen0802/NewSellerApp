import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";

// Import your existing components
import TabbedLayout from "../tabbedLayout";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingCheckbox from "../floatinginputFields/floatingCheckBox";

import useNotification from "./useNotification";
import NotificationPopup from "./NotificationPopup";
import { Pin } from "lucide-react";

// Main NotificationPage component
const NotificationPage = (props) => {
  // destructure props
  const { notify, notifyData: initialApiData } = props;

  const { notificationCountData } = useSelector((state) => state.common);

  // Consolidated state management
  const [state, setState] = useState({
    notifyData: initialApiData || {},
    activeTab: notify || "home",
    selectedItems: [], // Changed from selectedItem to selectedItems array
    popupItem: null,
    showPopup: false,
    isLoading: false,
    hasMore: true,
    currentPage: 1,
    isInitialLoad: true,
    notificationData: [],
    activityData: [],
    pinnedItems: [],
    viewedItems: [],
    all_notification_count: 0,
    all_activity_count: 0,
  });

  const [filtersApplied, setFiltersApplied] = useState({
    upcomming: 0,
    expired: 0,
    page: 1,
    keyword: "",
    ticket_status: "",
    start_date: "",
    end_date: "",
    selectedActivity: "",
    team_member: "",
    activity_type: "",
  });

  // State for managing filter data that syncs between ActiveFiltersBox and FilterSection
  const [selectedFilterData, setSelectedFilterData] = useState({});

  const [actionBarStates, setActionBarStates] = useState({
    markAsViewed: false,
    markAsPinned: false,
    markAsUnpinned: false,
  });

  // Add loading states for each action
  const [actionLoadingStates, setActionLoadingStates] = useState({
    markAsViewed: false,
    markAsPinned: false,
    markAsUnpinned: false,
  });

  // FIXED: Use refs to track current filters and loading state for scroll functionality
  const filtersRef = useRef(filtersApplied);

  const {
    LoadingShimmer,
    transformNotificationData,
    transformActivityData,
    SCROLL_THROTTLE_DELAY,
    tabsConfig,
    listItemsConfig,
    filterConfig,
    getCurrentData,
    handleCheckboxToggle,
    handleItemSelect,
    handleViewItem,
    handleClearFilters,
    hasActiveFilters,
    handleClosePopup,
    handleScroll,
    handleTabChange,
    handleFilterChange,
    scrollContainerRef,
    loadingRef,
    hasMoreRef,
    currentPageRef,
    handleActionBarChange,
  } = useNotification({
    state,
    setState,
    notificationCountData,
    setActionBarStates,
    setActionLoadingStates,
    filtersApplied,
    filtersRef,
    setSelectedFilterData,
    setFiltersApplied,
  });

  // USE EFFECTS
  // Update refs when state changes
  useEffect(() => {
    filtersRef.current = filtersApplied;
  }, [filtersApplied]);

  useEffect(() => {
    loadingRef.current = state.isLoading;
    hasMoreRef.current = state.hasMore;
    currentPageRef.current = state.currentPage;
  }, [state.isLoading, state.hasMore, state.currentPage]);

  // Initialize data from SSR
  useEffect(() => {
    if (initialApiData) {
      const isHome = notify === "home";
      const transformedData = isHome
        ? transformNotificationData(initialApiData)
        : transformActivityData(initialApiData);

      const meta = initialApiData.data?.meta;

      setState((prev) => ({
        ...prev,
        [isHome ? "notificationData" : "activityData"]: transformedData,
        currentPage: meta?.current_page || 1,
        hasMore: meta
          ? meta.current_page < meta.last_page || meta.next_page_url !== null
          : true,
        isInitialLoad: false,
        all_notification_count:
          initialApiData?.data?.all_notification_count || 0,
        all_activity_count: initialApiData?.data?.all_activity_count || 0,
      }));

      // Update refs
      currentPageRef.current = meta?.current_page || 1;
      hasMoreRef.current = meta
        ? meta.current_page < meta.last_page || meta.next_page_url !== null
        : true;
    }
  }, [initialApiData, notify]);

  // Initialize pinned and viewed items from API data
  useEffect(() => {
    if (state.notificationData.length > 0) {
      setState((prev) => ({
        ...prev,
        pinnedItems: state.notificationData
          .filter((item) => item.isPinned)
          .map((item) => item.id),
        viewedItems: state.notificationData
          .filter((item) => item.isRead)
          .map((item) => item.id),
      }));
    }
  }, [state.notificationData]);

  // Enhanced scroll listener with better throttling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let scrollTimeout;
    let isThrottled = false;

    const throttledScroll = () => {
      if (isThrottled) return;

      isThrottled = true;
      handleScroll();

      setTimeout(() => {
        isThrottled = false;
      }, SCROLL_THROTTLE_DELAY);
    };

    scrollContainer.addEventListener("scroll", throttledScroll, {
      passive: true,
    });

    return () => {
      scrollContainer.removeEventListener("scroll", throttledScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [handleScroll, SCROLL_THROTTLE_DELAY]);

  // Reset pagination and data when tab changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      currentPage: 1,
      hasMore: true,
      isLoading: false,
      selectedItems: [], // Reset selected items when changing tabs
    }));

    // Update refs
    currentPageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;

    // Reset filters when switching tabs
    const clearedFilters = {
      upcomming: 0,
      expired: 0,
      page: 1,
      keyword: "",
      ticket_status: "",
      start_date: "",
      end_date: "",
      selectedActivity: "",
      team_member: "",
      activity_type: "",
    };

    setFiltersApplied(clearedFilters);
    setSelectedFilterData({});
    filtersRef.current = clearedFilters;

    // Scroll to top when changing tabs
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [state.activeTab]);

  // Auto-hide action bar when no items selected
  useEffect(() => {
    if (state.selectedItems.length === 0) {
      setActionBarStates({
        markAsViewed: false,
        markAsPinned: false,
        markAsUnpinned: false,
      });
    }
  }, [state.selectedItems.length]);

  // Updated handleItemSelect for multi-select
  const handleMultiItemSelect = useCallback((itemId) => {
    setState((prev) => {
      const isSelected = prev.selectedItems.includes(itemId);
      return {
        ...prev,
        selectedItems: isSelected
          ? prev.selectedItems.filter((id) => id !== itemId)
          : [...prev.selectedItems, itemId],
      };
    });
  }, []);

  // Clear all selections
  const handleClearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedItems: [] }));
    setActionBarStates({
      markAsViewed: false,
      markAsPinned: false,
      markAsUnpinned: false,
    });
  }, []);

  // Memoized list item renderer
  const renderListItem = useCallback(
    (item, index) => {
      const isSelected = state.selectedItems.includes(item.id);
      const isPinned = state.pinnedItems.includes(item.id);
      const isViewed = state.viewedItems.includes(item.id);

      return (
        <div
          key={item.id}
          className={`flex items-start hover:bg-gray-50 transition-all duration-200 ${
            isPinned
              ? "border-l-2 border-l-green-300 bg-blue-50/30"
              : "border-b border-gray-100"
          } ${state.activeTab === "activity" ? "gap-0" : "gap-3"}`}
        >
          {/* Only show checkbox for home tab (notifications) */}
          {state.activeTab === "home" && (
            <div className="pl-4 pr-0 pt-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleMultiItemSelect(item.id)}
                className="mt-1 rounded border-gray-300"
                aria-label={`Select ${item.title}`}
              />
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div
                className={`flex-1 px-4 py-2 transition-all duration-200 ${
                  isPinned
                    ? "border-l-2 border-l-green-200 bg-gradient-to-r from-blue-50/50 to-transparent"
                    : state.activeTab === "activity"
                    ? "border-l-2 border-l-transparent"
                    : "border-x-[1px] border-gray-200"
                } ${state.activeTab === "activity" ? "ml-0" : ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {isPinned && <Pin className="w-3 h-3 text-gray-900" />}
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      item.status === "new" ? "bg-green-200" : "bg-green-200"
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
                    <span className="text-xs bg-white text-green-700 px-2 py-0.5 p-1 rounded-full font-medium">
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
                aria-label={`View details for ${item.title}`}
              >
                <IconStore.eye className="size-5" />
              </button>
            </div>
          </div>
        </div>
      );
    },
    [
      state.selectedItems,
      state.pinnedItems,
      state.viewedItems,
      state.activeTab,
      handleMultiItemSelect,
      handleViewItem,
    ]
  );

  // Loading and error states
  if (state.isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (state.notifyData && !state.notifyData.success) {
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
        currentFilterValues={selectedFilterData}
        onClearAllFilters={() => {
          setSelectedFilterData({});
          handleClearFilters();
        }}
        showSelectedFilterPills={true}
        hideVisibleColumns={true}
      />

      {/* List View Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mx-4 mt-4 mb-24">
        {/* List Header */}
        {/* <div className="px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-sm font-medium text-gray-900">
            {currentData.length}{" "}
            {state.activeTab === "home" ? "Notifications" : "Activity Logs"}
          </h3>
        </div> */}

        {/* Scrollable Content Container */}
        <div
          ref={scrollContainerRef}
          className="max-h-[calc(100dvh-380px)] overflow-y-auto !pb-[120px]"
          style={{ scrollBehavior: "smooth" }}
        >
          {/* List Items */}
          {currentData.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {currentData.map(renderListItem)}
            </div>
          ) : !state.isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="max-w-sm mx-auto">
                <div className="mb-4">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">
                  No{" "}
                  {state.activeTab === "home"
                    ? "notifications"
                    : "activity logs"}{" "}
                  found
                </p>
                {/* Show different message and clear button for filtered vs no data */}
                {hasActiveFilters ? (
                  <></>
                ) : (
                  <p className="text-sm text-gray-400">
                    No{" "}
                    {state.activeTab === "home"
                      ? "notifications"
                      : "activity logs"}{" "}
                    available at the moment.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {/* Loading Shimmer - Show during initial load and search */}
          {state.isLoading && (
            <div
              className={
                currentData.length > 0 ? "border-t border-gray-100" : ""
              }
            >
              <LoadingShimmer count={currentData.length > 0 ? 3 : 6} />
            </div>
          )}

          {/* End of List Indicator */}
          {!state.hasMore && currentData.length > 0 && !state.isLoading && (
            <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-100">
              <p> You've reached the end</p>
              <p className="text-xs mt-1 text-gray-400">
                {currentData.length}{" "}
                {state.activeTab === "home" ? "notifications" : "activity logs"}{" "}
                loaded
              </p>
            </div>
          )}

          {/* Extra spacing for scroll clearance */}
          {!state.hasMore && currentData.length > 0 && (
            <div className="h-32"></div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar - Only show for home tab */}
      {state.activeTab === "home" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto pl-20">
            <div className="flex items-center gap-4">
              {/* Action Checkboxes - Only show when items are selected */}
              {state.selectedItems.length > 0 && (
                <>
                  <div className="flex items-center">
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
                        <div className="flex items-center gap-1 relative">
                          {!actionLoadingStates.markAsViewed && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          {actionLoadingStates.markAsViewed && (
                            <div className="w-2 h-2 border border-blue-500 border-dotted rounded-full animate-spin"></div>
                          )}
                        </div>
                      }
                    />
                  </div>

                  <div className="flex items-center">
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
                        <div className="flex items-center gap-1 relative">
                          {!actionLoadingStates.markAsPinned && (
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          )}
                          {actionLoadingStates.markAsPinned && (
                            <div className="w-2 h-2 border border-gray-400 border-dotted rounded-full animate-spin"></div>
                          )}
                        </div>
                      }
                    />
                  </div>

                  <div className="flex items-center">
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
                        <div className="flex items-center gap-1 relative">
                          {!actionLoadingStates.markAsUnpinned && (
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          )}
                          {actionLoadingStates.markAsUnpinned && (
                            <div className="w-2 h-2 border border-gray-300 border-dotted rounded-full animate-spin"></div>
                          )}
                        </div>
                      }
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right side info - Show when items are selected */}

            {state.selectedItems.length > 0 && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 group hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-medium text-blue-700">
                    {state.selectedItems.length} notification
                    {state.selectedItems.length > 1 ? "s" : ""} selected
                  </span>
                  <button
                    onClick={handleClearSelection}
                    className="text-green-500 hover:text-blue-700 hover:bg-blue-200 rounded-full p-1 transition-colors cursor-pointer"
                    aria-label="Clear all selections"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Popup */}
      <NotificationPopup
        item={state.popupItem}
        isVisible={state.showPopup}
        onClose={handleClosePopup}
      />
    </div>
  );
};

export default NotificationPage;
