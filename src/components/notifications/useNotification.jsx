import { useCallback, useMemo, useRef } from "react";
import { toast } from "react-toastify";

import {
  fetchActivityHistory,
  fetchNotificationHistory,
  updateNotification,
  updateNotificationLog,
} from "@/utils/apiHandler/request";
import useTeamMembersDetails from "@/Hooks/useTeamMembersDetails";

const useNotification = ({
  notificationCountData,
  state,
  setState,
  setActionBarStates,
  setActionLoadingStates, // New prop for loading states
  filtersApplied,
  filtersRef,
  setSelectedFilterData,
  setFiltersApplied,
} = {}) => {
  // Constants for better maintainability
  const SCROLL_THROTTLE_DELAY = 100;
  const SCROLL_THRESHOLD = 0.85;
  const NEAR_BOTTOM_THRESHOLD = 50;
  const DEFAULT_SHIMMER_COUNT = 3;

  const scrollContainerRef = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const currentPageRef = useRef(1);

  const { teamMembers } = useTeamMembersDetails();

  // Optimized Shimmer component (memoized to prevent unnecessary re-renders)
  const ShimmerItem = () => (
    <div className="flex items-start gap-3 p-4 border-b border-gray-100 animate-pulse">
      <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 px-4 py-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-3 bg-gray-200 rounded"></div>
              <div className="w-24 h-3 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  // Memoized loading shimmer component
  const LoadingShimmer = ({ count = DEFAULT_SHIMMER_COUNT }) => (
    <div>
      {Array.from({ length: count }, (_, index) => (
        <ShimmerItem key={index} />
      ))}
    </div>
  );

  // Optimized helper functions with memoization where applicable
  const extractTicketCount = (description) => {
    const match = description.match(/(\d+)\s+ticket\(s\)/);
    return match ? parseInt(match[1]) : 1;
  };

  const extractEventName = (description) => {
    const match = description.match(/for\s+(.+?)\s+on\s+\d{4}-\d{2}-\d{2}/);
    return match ? match[1] : "Event";
  };

  const extractVenue = () => "Venue";

  const extractUserId = (description) => {
    const match = description.match(/#(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const extractUserName = (description) => {
    const match = description.match(/\(([^)]+)\)/);
    return match ? match[1] : "User";
  };

  // Optimized date formatting function
  const formatDate = (timestamp) =>
    new Date(timestamp * 1000).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Optimized transformation functions
  const transformNotificationData = (apiData) => {
    if (!apiData?.data?.notification_list) return [];

    return apiData.data.notification_list.map((item) => ({
      id: item.id,
      type: "seller_notification",
      title: item.description,
      date: formatDate(item.created_at),
      status: item.viewed ? "read" : "new",
      isRead: item.viewed === 1,
      category: "order",
      isPinned: item.pinned === 1,
      ticketCount: extractTicketCount(item.description),
      artist: extractEventName(item.description),
      venue: extractVenue(item.description),
      rawTimestamp: item.created_at,
    }));
  };

  const transformActivityData = (apiData) => {
    if (!apiData?.data?.activity_list) return [];

    return apiData.data.activity_list.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.description,
      date: formatDate(item.created_at),
      status: "completed",
      category: "authentication",
      userId: extractUserId(item.description),
      userName: extractUserName(item.description),
      activityType: item.type,
      rawTimestamp: item.created_at,
    }));
  };

  // Memoized helper functions
  const getCurrentData = useCallback(() => {
    return state.activeTab === "home"
      ? state.notificationData
      : state.activityData;
  }, [state.activeTab, state.notificationData, state.activityData]);

  const getNotificationCounts = useMemo(() => {
    const total = state.notifyData?.data?.notification_count || 0;
    const unread = state.notifyData?.data?.unread_count || 0;
    return { total, unread };
  }, [state.notifyData]);

  // const getActivityCounts = useMemo(() => {
  //   const total = state.notifyData?.data?.activity_count || 0;
  //   const weekAgo = new Date();
  //   weekAgo.setDate(weekAgo.getDate() - 7);

  //   const recent = state.activityData.filter((item) => {
  //     const itemDate = new Date(item.rawTimestamp * 1000);
  //     return itemDate > weekAgo;
  //   }).length;

  //   return { total, recent };
  // }, [state.notifyData, state.activityData]);

  // Memoized configurations
  const tabsConfig = [
    {
      name: "Notifications",
      key: "home",
      count: notificationCountData?.notification,
      route: "/notifications/home",
    },
    {
      name: "Activity",
      key: "activity",
      count: notificationCountData?.activity,
      route: "/notifications/activity",
    },
  ];

  // Fixed: Conditional checkbox configuration based on activeTab
  const listItemsConfig = useMemo(
    () => ({
      home: [
        {
          name: "Notifications",
          value: state?.all_notification_count ?? 0,
        },
        {
          name: "New Notifications",
          value: getNotificationCounts.unread ?? 0,
          showCheckbox: true,
          key: "new_notification",
          isChecked: false,
        },
      ],
      activity: [
        { name: "Activity Logs", value: state?.all_activity_count || 0 },
        {
          name: "New Activity",
          value: notificationCountData?.activity || 0,
          showCheckbox: true,
          key: "new_activity",
          isChecked: false,
        },
      ],
    }),
    [
      getNotificationCounts,
      state?.all_notification_count,
      state?.all_activity_count,
      notificationCountData,
    ]
  );

  const filterConfig = useMemo(
    () => ({
      home: [
        {
          type: "text",
          name: "keyword",
          label: "Search Match event or Booking number",
          className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
          placeholder: "Search Match event or Booking number",
          parentClassName: "!w-[300px]",
          // onKeyDown: (e) => handleFilterChange(),
        },
        {
          type: "select",
          name: "team_member",
          label: "Team Member",
          options: teamMembers,
          parentClassName: "md:!w-[10%]",
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
          startDateKey: "start_date",
          endDateKey: "end_date",
        },
      ],
      activity: [
        {
          type: "text",
          name: "keyword",
          label: "Search Activity",
          className: "!py-[7px] !px-[12px] !text-[#343432] !text-[14px]",
          onEnter: true,
          placeholder: "Search Activity",
          parentClassName: "!w-[300px]",
        },
        {
          type: "select",
          name: "team_member",
          label: "Team members",
          options: teamMembers,
          parentClassName: "!w-[15%]",
          className: "!py-[6px] !px-[12px] w-full mobile:text-xs",
          labelClassName: "!text-[11px]",
        },
        {
          type: "select",
          name: "activity_type",
          label: "Activity type",
          options: [
            { value: "none", label: "None" },
            ...(state.notifyData?.data?.activity_types || []).map((type) => ({
              value: type.type,
              label: type.name,
            })),
          ],
          parentClassName: "!w-[15%]",
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
          startDateKey: "start_date",
          endDateKey: "end_date",
        },
      ],
    }),
    [state.activityData, state.notifyData, teamMembers]
  );

  // Updated API actions for batch operations
  const apiActions = useMemo(
    () => ({
      markNotificationsAsViewed: async (ids) => {
        const idsString = Array.isArray(ids) ? ids.join(",") : ids;
        return updateNotification("", {
          notificationId: idsString, // Changed to support multiple IDs
          is_viewed: 1,
        });
      },
      markNotificationsAsPinned: async (ids) => {
        const idsString = Array.isArray(ids) ? ids.join(",") : ids;
        return updateNotification("", {
          notificationId: idsString, // Changed to support multiple IDs
          is_pinned: 1,
        });
      },
      markNotificationsAsUnpinned: async (ids) => {
        const idsString = Array.isArray(ids) ? ids.join(",") : ids;
        return updateNotification("", {
          notificationId: idsString, // Changed to support multiple IDs
          is_pinned: 0,
        });
      },
    }),
    []
  );

  // Updated event handlers for multi-select
  const handleActionBarChange = useCallback(
    async (e, keyValue) => {
      const { checked } = e.target;

      setActionBarStates((prev) => ({ ...prev, [keyValue]: checked }));

      if (checked && state.selectedItems.length > 0) {
        // Set loading state
        setActionLoadingStates((prev) => ({ ...prev, [keyValue]: true }));

        const actions = {
          markAsViewed: () => {
            setState((prev) => ({
              ...prev,
              viewedItems: [
                ...new Set([...prev.viewedItems, ...state.selectedItems]),
              ],
            }));
            return apiActions.markNotificationsAsViewed(state.selectedItems);
          },
          markAsPinned: () => {
            setState((prev) => ({
              ...prev,
              pinnedItems: [
                ...new Set([...prev.pinnedItems, ...state.selectedItems]),
              ],
            }));
            return apiActions.markNotificationsAsPinned(state.selectedItems);
          },
          markAsUnpinned: () => {
            setState((prev) => ({
              ...prev,
              pinnedItems: prev.pinnedItems.filter(
                (id) => !state.selectedItems.includes(id)
              ),
            }));
            return apiActions.markNotificationsAsUnpinned(state.selectedItems);
          },
        };

        try {
          await actions[keyValue]?.();
          const itemCount = state.selectedItems.length;
          const actionText = keyValue.replace(/([A-Z])/g, " $1").toLowerCase();

          toast.success(
            `Successfully ${actionText} ${itemCount} notification${
              itemCount > 1 ? "s" : ""
            }`
          );
          // Don't clear selections - let user continue with other actions
          // setState((prev) => ({ ...prev, selectedItems: [] }));
        } catch (e) {
          toast.error(
            `Failed to ${keyValue.replace(/([A-Z])/g, " $1").toLowerCase()}`
          );
        } finally {
          // Clear loading state but keep checkbox checked and selections intact
          setActionLoadingStates((prev) => ({ ...prev, [keyValue]: false }));
          // Don't clear checkbox state - let user uncheck manually if needed
          setActionBarStates((prev) => ({ ...prev, [keyValue]: false }));
        }
      }
    },
    [state.selectedItems, apiActions]
  );

  const loadMoreData = useCallback(
    async (page, resetData = false, customFilters = null) => {
      if (loadingRef.current || (!hasMoreRef.current && !resetData)) {
        return;
      }
      setState((prev) => ({ ...prev, isLoading: true }));
      loadingRef.current = true;

      try {
        // Use custom filters if provided, otherwise use latest filters from ref
        const currentFilters = customFilters || filtersRef.current;
        const params = { ...currentFilters, page };

        // Remove upcomming and expired keys from filters
        if (params.upcomming !== undefined) {
          delete params.upcomming;
        }
        if (params.expired !== undefined) {
          delete params.expired;
        }

        // Clean up empty parameters
        Object.keys(params).forEach((key) => {
          if (
            params[key] === "" ||
            params[key] === null ||
            params[key] === undefined ||
            params[key] === "none"
          ) {
            delete params[key];
          }
        });

        const response =
          state.activeTab === "home"
            ? await fetchNotificationHistory("", params)
            : await fetchActivityHistory("", params);

        if (response.success) {
          const newData =
            state.activeTab === "home"
              ? transformNotificationData(response)
              : transformActivityData(response);

          const meta = response.data?.meta;
          const morePages = meta
            ? meta.current_page < meta.last_page ||
              meta.next_page_url !== null ||
              newData.length === meta.per_page
            : false;

          console.log("Processed data:", {
            newDataLength: newData.length,
            meta,
            morePages,
            currentPage: meta?.current_page,
          });

          setState((prev) => {
            const newState = {
              ...prev,
              [state.activeTab === "home"
                ? "notificationData"
                : "activityData"]: resetData
                ? newData
                : [
                    ...prev[
                      state.activeTab === "home"
                        ? "notificationData"
                        : "activityData"
                    ],
                    ...newData,
                  ],
              currentPage: meta?.current_page || prev.currentPage,
              hasMore: morePages,
            };

            // Update refs immediately
            currentPageRef.current = newState.currentPage;
            hasMoreRef.current = newState.hasMore;

            return newState;
          });
        }
      } catch (error) {
        console.error("Error loading more data:", error);
        toast.error("Failed to load data");
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
        loadingRef.current = false;
      }
    },
    [state.activeTab, transformNotificationData, transformActivityData]
  );

  // FIXED: Enhanced scroll handler with better state management
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    // Use refs to get real-time state values
    if (loadingRef.current || !hasMoreRef.current) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    const nearBottom =
      scrollHeight - scrollTop - clientHeight < NEAR_BOTTOM_THRESHOLD;

    if (scrollPercentage > SCROLL_THRESHOLD || nearBottom) {
      loadMoreData(currentPageRef.current + 1);
    }
  }, [loadMoreData, SCROLL_THRESHOLD, NEAR_BOTTOM_THRESHOLD]);

  const handleTabChange = useCallback((tab) => {
    setState((prev) => ({ ...prev, activeTab: tab }));
  }, []);

  const handleFilterChange = useCallback(
    async (filterKey, value, allFilters, currentTab) => {
      setSelectedFilterData(allFilters || {});

      // Process filters and handle eventDate transformation
      const processedFilters = { ...allFilters };

      // Handle eventDate transformation
      if (allFilters?.eventDate) {
        const { eventDate, ...restFilters } = allFilters;

        // Extract start_date and end_date from eventDate object
        processedFilters.start_date = eventDate.startDate || "";
        processedFilters.end_date = eventDate.endDate || "";

        // Remove the eventDate object from processed filters
        delete processedFilters.eventDate;
      }

      if (allFilters?.activityDate) {
        const { activityDate, ...restFilters } = allFilters;
        processedFilters.start_date = activityDate.startDate || "";
        processedFilters.end_date = activityDate.endDate || "";
        delete processedFilters.activityDate;
      }

      const updatedParams = {
        ...filtersApplied,
        ...processedFilters,
        page: 1,
      };

      console.log("Final updatedParams:", updatedParams);

      setFiltersApplied(updatedParams);
      filtersRef.current = updatedParams;

      // Reset data and pagination state
      setState((prev) => ({
        ...prev,
        currentPage: 1,
        hasMore: true,
        selectedItems: [], // Clear selections when filtering
        isLoading: false,
        [state.activeTab === "home" ? "notificationData" : "activityData"]: [],
      }));

      // Update refs
      currentPageRef.current = 1;
      hasMoreRef.current = true;
      loadingRef.current = false;

      // Scroll to top when applying filters
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // FIXED: Pass the updated filters directly to loadMoreData
      setTimeout(() => {
        loadMoreData(1, true, updatedParams);
      }, 100);
    },
    [filtersApplied, state.activeTab, loadMoreData]
  );

  // FIXED: Enhanced handleCheckboxToggle
  const handleCheckboxToggle = useCallback(
    async (checkboxKey, isChecked, allCheckboxValues) => {
      const updatedParams = {
        ...filtersApplied,
        // upcomming: allCheckboxValues?.upcomming ? 1 : 0,
        // expired: allCheckboxValues?.expired ? 1 : 0,
        page: 1,
        [checkboxKey]: isChecked ? 1 : 0,
      };

      setFiltersApplied(updatedParams);
      filtersRef.current = updatedParams;

      // Reset data and pagination
      setState((prev) => ({
        ...prev,
        currentPage: 1,
        hasMore: true,
        selectedItems: [], // Clear selections when filtering
        isLoading: false,
        [state.activeTab === "home" ? "notificationData" : "activityData"]: [],
      }));

      // Update refs
      currentPageRef.current = 1;
      hasMoreRef.current = true;
      loadingRef.current = false;

      // Scroll to top when applying checkbox filters
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // FIXED: Pass updated params directly
      setTimeout(() => {
        console.log("Triggering loadMoreData after checkbox change");
        loadMoreData(1, true, updatedParams);
      }, 100);
    },
    [filtersApplied, state.activeTab, loadMoreData]
  );

  const handleItemSelect = useCallback((itemId) => {
    setState((prev) => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(itemId)
        ? prev.selectedItems.filter((id) => id !== itemId)
        : [...prev.selectedItems, itemId],
    }));
  }, []);

  const handleViewItem = useCallback(async (item) => {
    setState((prev) => ({ ...prev, popupItem: item, showPopup: true }));
    await updateNotificationLog("", { id: item.id });
  }, []);

  const handleClearFilters = useCallback(async () => {
    // Reset all filters to initial state
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
    filtersRef.current = clearedFilters;
    setSelectedFilterData({});

    // Reset state
    setState((prev) => ({
      ...prev,
      currentPage: 1,
      hasMore: true,
      selectedItems: [], // Clear selections when clearing filters
      isLoading: false,
      [state.activeTab === "home" ? "notificationData" : "activityData"]: [],
    }));

    // Update refs
    currentPageRef.current = 1;
    hasMoreRef.current = true;
    loadingRef.current = false;

    // Scroll to top when clearing filters
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }

    // Load fresh data without filters
    setTimeout(() => {
      console.log("Triggering loadMoreData after clearing filters");
      loadMoreData(1, true, clearedFilters);
    }, 100);

    toast.success("Filters cleared");
  }, [state.activeTab, loadMoreData]);

  // Check if any filters are applied
  const hasActiveFilters = useMemo(() => {
    return (
      (filtersApplied.keyword && filtersApplied.keyword.trim() !== "") ||
      (filtersApplied.selectedActivity &&
        filtersApplied.selectedActivity.trim() !== "") ||
      filtersApplied.start_date ||
      filtersApplied.end_date ||
      filtersApplied.ticket_status ||
      filtersApplied.team_member ||
      filtersApplied.activity_type ||
      filtersApplied.upcomming ||
      filtersApplied.expired
    );
  }, [filtersApplied]);

  const handleClosePopup = useCallback(() => {
    setState((prev) => ({ ...prev, showPopup: false, popupItem: null }));
  }, []);

  return {
    LoadingShimmer,
    transformNotificationData,
    transformActivityData,
    SCROLL_THRESHOLD,
    NEAR_BOTTOM_THRESHOLD,
    SCROLL_THROTTLE_DELAY,
    tabsConfig,
    listItemsConfig,
    filterConfig,
    getCurrentData,
    apiActions,
    handleActionBarChange,
    handleCheckboxToggle,
    handleItemSelect,
    handleViewItem,
    handleClearFilters,
    hasActiveFilters,
    handleClosePopup,
    loadMoreData,
    handleScroll,
    handleTabChange,
    handleFilterChange,
    scrollContainerRef,
    loadingRef,
    hasMoreRef,
    currentPageRef,
  };
};

export default useNotification;
