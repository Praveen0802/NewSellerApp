import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import logo from "../../../public//template-logo.png";
import arrowRight from "../../../public/arrow-right.svg";
import category from "../../../public/category.svg";
import addSquare from "../../../public/add-square.svg";
import diagram from "../../../public/diagram.svg";
import ticket from "../../../public/ticket.svg";
import leftMenuTicket from "../../../public/leftMenuTicket.svg";
import listing from "../../../public/listing.svg";
import shopping from "../../../public/shopping-cart-02.svg";
import logout from "../../../public/logout.svg";
import Bulkticket from "../../../public/Bulkticket.svg";
import leftArrow from "../../../public/leftArrow.jpg";
import ticketStar from "../../../public/ticket-star.svg";
import { Menu, Bell, ChevronDown, ChevronRight, Check } from "lucide-react";
import useIsMobile from "@/utils/helperFunctions/useIsmobile";
import { useRouter } from "next/router";
import { setCookie, getCookie } from "@/utils/helperFunctions/cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotificationHistory,
  fetchActivityHistory,
  fetchNotificationCount,
} from "@/utils/apiHandler/request";
import { updateNotificationCount } from "@/utils/redux/common/action";

// Temporary fallback for IconStore.leftArrow if import fails
const LeftArrowIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

// Fixed Shimmer effect component
const ShimmerEffect = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Fixed Notification item shimmer
const NotificationShimmer = () => (
  <div className="flex items-start gap-3 p-3 border-b border-gray-200">
    <ShimmerEffect className="w-2 h-2 mt-2 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <ShimmerEffect className="w-8 h-3" />
        <ShimmerEffect className="w-12 h-3" />
      </div>
      <ShimmerEffect className="w-full h-4" />
      <ShimmerEffect className="w-3/4 h-3" />
    </div>
  </div>
);

// Fixed Activity item shimmer
const ActivityShimmer = () => (
  <div className="flex items-start gap-3 p-3 border-b border-gray-200">
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <ShimmerEffect className="w-12 h-3" />
        <ShimmerEffect className="w-16 h-3" />
      </div>
      <ShimmerEffect className="w-full h-4" />
    </div>
  </div>
);

// Completion message component
const CompletionMessage = ({ type }) => (
  <div className="flex items-center justify-center gap-2 p-4 text-green-600 text-sm">
    <Check className="w-4 h-4" />
    <span>All {type} loaded</span>
  </div>
);

// Helper function to format timestamp
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
};

// Helper function to format activity timestamp
const formatActivityDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return (
    date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};

// Notifications Popup Component
const NotificationsPopup = ({
  isOpen = false,
  onClose,
  showFullDisplay,
} = {}) => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [notificationMeta, setNotificationMeta] = useState({});
  const [activityMeta, setActivityMeta] = useState({});
  const [notificationPage, setNotificationPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [allNotificationsLoaded, setAllNotificationsLoaded] = useState(false);
  const [allActivitiesLoaded, setAllActivitiesLoaded] = useState(false);

  // Refs for scroll containers
  const notificationScrollRef = useRef(null);
  const activityScrollRef = useRef(null);

  const router = useRouter();
  const isMobile = useIsMobile();
  const { currentUser } = useSelector((state) => state.currentUser);
  const { notificationCountData } = useSelector((state) => state.common);
  const dispatch = useDispatch();
console.log(notificationCountData, "notificationCountData");
  // API functions using your actual API calls
  const fetchNotificationHistoryData = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setAllNotificationsLoaded(false);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Get token from cookie or Redux store
      const token = getCookie("auth_token") || currentUser?.token;

      // Call your actual API function
      const { data } = await fetchNotificationHistory(token, {
        page: page,
      });

      if (data && data.notification_list) {
        const newNotifications = data.notification_list || [];

        if (append) {
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        dispatch(
          updateNotificationCount({
            ...notificationCountData,
            notification: data.unread_count,
          })
        );
        setNotificationMeta(data.meta || {});
        setNotificationPage(page);

        // Check if all data is loaded
        const meta = data.meta || {};
        if (meta.current_page >= meta.last_page) {
          setAllNotificationsLoaded(true);
        }
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchActivityHistoryData = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
        setAllActivitiesLoaded(false);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      // Get token from cookie or Redux store
      const token = getCookie("auth_token") || currentUser?.token;

      // Call your actual API function with POST data
      const data = await fetchActivityHistory(token, { page: page });

      if (data && data.data && data.data.activity_list) {
        const newActivities = data.data.activity_list || [];

        if (append) {
          setActivities((prev) => [...prev, ...newActivities]);
        } else {
          setActivities(newActivities);
        }

        dispatch(
          updateNotificationCount({
            ...notificationCountData,
            activity: data.data.unread_count || data.data.activity_count,
          })
        );
        setActivityMeta(data.data.meta || {});
        setActivityPage(page);

        // Check if all data is loaded
        const meta = data.data.meta || {};
        if (meta.current_page >= meta.last_page) {
          setAllActivitiesLoaded(true);
        }
      } else {
        throw new Error("Failed to fetch activity");
      }
    } catch (err) {
      setError("Failed to load activity");
      console.error("Error fetching activity:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Check if we can load more
  const canLoadMoreNotifications = () => {
    const meta = notificationMeta;
    return (
      meta.current_page && meta.last_page && meta.current_page < meta.last_page
    );
  };

  const canLoadMoreActivities = () => {
    const meta = activityMeta;
    return (
      meta.current_page && meta.last_page && meta.current_page < meta.last_page
    );
  };

  // Infinite scroll handler with improved detection
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;

      // More generous threshold for better detection (50px from bottom)
      const threshold = 50;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      // Additional check for when content is shorter than container
      const isContentShort = scrollHeight <= clientHeight;

      if ((isNearBottom || isContentShort) && !loadingMore && !loading) {
        if (
          activeTab === "notifications" &&
          canLoadMoreNotifications() &&
          !allNotificationsLoaded
        ) {
          fetchNotificationHistoryData(notificationPage + 1, true);
        } else if (
          activeTab === "activity" &&
          canLoadMoreActivities() &&
          !allActivitiesLoaded
        ) {
          fetchActivityHistoryData(activityPage + 1, true);
        }
      }
    },
    [
      activeTab,
      loadingMore,
      loading,
      notificationPage,
      activityPage,
      allNotificationsLoaded,
      allActivitiesLoaded,
    ]
  );

  // Throttled scroll handler to prevent excessive calls
  const throttledHandleScroll = useCallback(
    (e) => {
      clearTimeout(throttledHandleScroll.timeoutId);
      throttledHandleScroll.timeoutId = setTimeout(() => handleScroll(e), 100);
    },
    [handleScroll]
  );

  // Fetch data when popup opens and tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "notifications") {
        // Reset pagination and fetch first page
        setNotificationPage(1);
        setAllNotificationsLoaded(false);
        fetchNotificationHistoryData(1, false);
      } else if (activeTab === "activity") {
        // Reset pagination and fetch first page
        setActivityPage(1);
        setAllActivitiesLoaded(false);
        fetchActivityHistoryData(1, false);
      }
    }
  }, [isOpen, activeTab]);

  // Check if initial load should trigger more data fetching
  useEffect(() => {
    if (isOpen && !loading && !loadingMore) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const container =
          activeTab === "notifications"
            ? notificationScrollRef.current
            : activityScrollRef.current;
        if (container) {
          const { scrollHeight, clientHeight } = container;
          // If content doesn't fill the container and we have more data, load it
          if (scrollHeight <= clientHeight) {
            if (
              activeTab === "notifications" &&
              canLoadMoreNotifications() &&
              !allNotificationsLoaded
            ) {
              fetchNotificationHistoryData(notificationPage + 1, true);
            } else if (
              activeTab === "activity" &&
              canLoadMoreActivities() &&
              !allActivitiesLoaded
            ) {
              fetchActivityHistoryData(activityPage + 1, true);
            }
          }
        }
      }, 200);
    }
  }, [notifications, activities, activeTab, loading, loadingMore, isOpen]);

  // Cleanup throttle timeout on unmount
  useEffect(() => {
    return () => {
      if (throttledHandleScroll.timeoutId) {
        clearTimeout(throttledHandleScroll.timeoutId);
      }
    };
  }, []);

  const notificationRedict = () => {
    router.push(`/notifications/home`);
    onClose();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null); // Clear any previous errors
  };

  const renderNotificationItem = (notification) => (
    <div
      key={notification.id}
      className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b-1 border-gray-200 rounded-lg mb-4"
    >
      <div
        className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
          notification.viewed === 0 ? "bg-green-500" : "bg-gray-300"
        }`}
      ></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {notification.viewed === 0 && (
            <span className="text-xs text-green-600 font-medium">New</span>
          )}
          <span className="text-xs text-gray-500">
            {formatDate(notification.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-900 font-medium mb-1">
          {notification.name
            ?.replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">
          {notification.description}
        </p>
      </div>
    </div>
  );

  const renderActivityItem = (activity) => (
    <div
      key={activity.id}
      className="flex items-start gap-3 p-3 hover:bg-gray-50 border-b-1 border-gray-200 rounded-lg"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              activity.type === "logged_in"
                ? "bg-green-100 text-green-600"
                : activity.type === "logged_out"
                ? "bg-red-100 text-red-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {activity.type
              ?.replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
          <span className="text-xs text-gray-500">
            {formatActivityDate(activity.created_at)}
          </span>
        </div>
        <p className="text-sm text-gray-900 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  const sidebarWidth = showFullDisplay ? 174 : 60;

  // Mobile layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Popup positioned from left */}
        <div className="absolute top-20 left-4 right-4 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-hidden z-[10000]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={notificationRedict}
                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
              >
                View all
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => handleTabChange("notifications")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "notifications"
                  ? "border-purple-600 text-purple-600 bg-purple-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Notifications
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {notificationCountData?.notification}
              </span>
            </button>
            <button
              onClick={() => handleTabChange("activity")}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 ${
                activeTab === "activity"
                  ? "border-purple-600 text-purple-600 bg-purple-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Activity log
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {notificationCountData?.activity}
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            className="max-h-96 overflow-y-auto pb-20"
            onScroll={throttledHandleScroll}
            style={{
              overflowY: "auto",
              maxHeight: "24rem",
              paddingBottom: "80px",
            }}
          >
            {error && (
              <div className="p-4 text-center">
                <p className="text-red-500 text-sm mb-2">{error}</p>
                <button
                  onClick={() =>
                    activeTab === "notifications"
                      ? fetchNotificationHistoryData(1, false)
                      : fetchActivityHistoryData(1, false)
                  }
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Retry
                </button>
              </div>
            )}

            {loading && (
              <div className="p-2">
                {Array.from({ length: 5 }).map((_, index) =>
                  activeTab === "notifications" ? (
                    <NotificationShimmer key={index} />
                  ) : (
                    <ActivityShimmer key={index} />
                  )
                )}
              </div>
            )}

            {!loading && !error && (
              <>
                {activeTab === "notifications" && (
                  <div className="p-2">
                    {notifications.length > 0 ? (
                      <>
                        {notifications.map(renderNotificationItem)}

                        {/* Loading More Shimmer */}
                        {loadingMore && (
                          <div className="p-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <NotificationShimmer key={`loading-${index}`} />
                            ))}
                          </div>
                        )}

                        {/* Completion Message */}
                        {allNotificationsLoaded && (
                          <CompletionMessage type="notifications" />
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>No notifications found</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "activity" && (
                  <>
                    {activities.length > 0 ? (
                      <>
                        {activities.map(renderActivityItem)}

                        {/* Loading More Shimmer */}
                        {loadingMore && (
                          <div className="p-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                              <ActivityShimmer key={`loading-${index}`} />
                            ))}
                          </div>
                        )}

                        {/* Completion Message */}
                        {allActivitiesLoaded && (
                          <CompletionMessage type="activities" />
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p>No recent activity</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 bg-opacity-50"
        onClick={onClose}
      />

      {/* Popup positioned to span from sidebar to right edge */}
      <div
        className="absolute top-0 bottom-0 w-[300px] bg-white shadow-xl z-[10000]"
        style={{
          left: `${sidebarWidth}px`,
          right: "20px",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-1 border-gray-200">
          <h2 className="text-ld font-semibold text-gray-900">Notifications</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={notificationRedict}
              className="px-3 py-1 cursor-pointer bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              View all
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col gap-2 p-4">
          <button
            onClick={() => handleTabChange("notifications")}
            className={`flex-1 px-4 py-3 text-sm font-medium border-1 cursor-pointer rounded-sm ${
              activeTab === "notifications"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Notifications
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {notificationCountData?.notification}
            </span>
          </button>
          <button
            onClick={() => handleTabChange("activity")}
            className={`flex-1 px-4 py-3 text-sm font-medium cursor-pointer border-1 ${
              activeTab === "activity"
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Activity log
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {notificationCountData?.activity}
            </span>
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto h-[calc(100vh-200px)] pb-20"
          onScroll={throttledHandleScroll}
          ref={
            activeTab === "notifications"
              ? notificationScrollRef
              : activityScrollRef
          }
          style={{ overflowY: "auto", paddingBottom: "80px" }}
        >
          {error && (
            <div className="p-4 text-center">
              <p className="text-red-500 text-sm mb-2">{error}</p>
              <button
                onClick={() =>
                  activeTab === "notifications"
                    ? fetchNotificationHistoryData(1, false)
                    : fetchActivityHistoryData(1, false)
                }
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}

          {loading && (
            <div className="p-2">
              {Array.from({ length: 5 }).map((_, index) =>
                activeTab === "notifications" ? (
                  <NotificationShimmer key={index} />
                ) : (
                  <ActivityShimmer key={index} />
                )
              )}
            </div>
          )}

          {!loading && !error && (
            <>
              {activeTab === "notifications" && (
                <>
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map(renderNotificationItem)}

                      {/* Loading More Shimmer */}
                      {loadingMore && (
                        <div className="p-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <NotificationShimmer key={`loading-${index}`} />
                          ))}
                        </div>
                      )}

                      {/* Completion Message */}
                      {allNotificationsLoaded && (
                        <CompletionMessage type="notifications" />
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No notifications found</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === "activity" && (
                <>
                  {activities.length > 0 ? (
                    <>
                      {activities.map(renderActivityItem)}

                      {/* Loading More Shimmer */}
                      {loadingMore && (
                        <div className="p-2">
                          {Array.from({ length: 3 }).map((_, index) => (
                            <ActivityShimmer key={`loading-${index}`} />
                          ))}
                        </div>
                      )}

                      {/* Completion Message */}
                      {allActivitiesLoaded && (
                        <CompletionMessage type="activities" />
                      )}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p>No recent activity</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LeftMenuBar = () => {
  const [showFullDisplay, setShowFullDisplay] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [salesExpanded, setSalesExpanded] = useState(false);

  const { currentUser } = useSelector((state) => state.currentUser);
  const { notificationCountData } = useSelector((state) => state.common);

  const name = currentUser?.first_name?.slice(0, 2).toUpperCase();
  const userName = currentUser?.first_name;

  const dispatch = useDispatch();

  // Fetch notification count for badge
  const fetchNotificationCountForBadge = async () => {
    try {
      const token = getCookie("auth_token") || currentUser?.token;
      const { data } = (await fetchNotificationCount()) ?? {};
      const { unread_count = 0 } = data ?? {};

      // Update Redux store with notification count
      dispatch(updateNotificationCount(unread_count));
    } catch (err) {
      console.error("Error fetching notification count:", err);
    }
  };

  // Fetch notification count on component mount
  useEffect(() => {
    // if (notificationCountData.isLoaded) {
      fetchNotificationCountForBadge();
    // }
  }, [notificationCountData.isLoaded]);

  function getUnReadNotificationCount(notificationCountData) {
    // if (notificationCountData?.isLoaded) {
      const notification = Number(notificationCountData?.notification) || 0;
      const activity = Number(notificationCountData?.activity) || 0;

      return notification;
    // }
    // return 0;
  }

  // Updated sales sub items to match your requirements with counts
  const salesSubItems = [
    { name: "Pending", route: "sales/pending", key: "sales-pending", count: 0 },

    {
      name: "Delivered",
      route: "sales/delivered",
      key: "sales-delivered",
      count: 0,
    },
    {
      name: "Completed",
      route: "sales/completed",
      key: "sales-completed",
      count: 19,
    },
    {
      name: "Cancelled",
      route: "sales/cancelled",
      key: "sales-cancelled",
      count: 2,
    },
  ];

  const leftPaneValues = [
    {
      image: showFullDisplay ? "" : arrowRight,
      icon: <LeftArrowIcon className="size-4 stroke-white" />,
      name: "Minimise",
    },
    {
      text: "US",
      name: "User",
      key: "name",
      route: "settings/myAccount",
    },
    {
      image: category,
      name: "Dashboard",
      route: "dashboard",
      key: "dashboard",
    },
    {
      icon: <Bell className="size-6 w-[23px] text-white" />,
      name: "Notifications",
      key: "notifications",
      isNotification: true,
      badge: getUnReadNotificationCount(notificationCountData),
    },
    {
      image: addSquare,
      name: "Add Listings",
      key: "add-listings",
      route: "add-listings",
    },
    {
      image: listing,
      name: "Bulk Listings",
      key: "my-listings",
      route: "my-listings",
    },
    {
      image: shopping,
      name: "Sales",
      key: "sales",
      hasSubItems: true,
      subItems: salesSubItems,
    },
    {
      image: leftMenuTicket,
      name: "Reports",
      key: "report-history",
      route: "report-history",
    },
    {
      image: diagram,
      name: "Wallet",
      key: "reports",
      route: "reports/wallet",
    },
    {
      image: Bulkticket,
      name: "TX Trade",
      key: "tx-trade",
      route: "trade/home",
    },
  ];

  const router = useRouter();
  const isMobile = useIsMobile();
  const [active, setActive] = useState(router?.pathname?.replace("/", ""));

  // Helper function to determine if a sales sub-item should be active
  const getSalesActiveState = () => {
    const currentPath = router?.pathname;
    if (currentPath.startsWith("/sales/")) {
      const salesPage = currentPath.replace("/sales/", "");
      return `sales-${salesPage}`;
    }
    return null;
  };

  // Update active state when route changes for sales pages
  useEffect(() => {
    const currentPath = router?.pathname?.replace("/", "");
    if (currentPath.startsWith("sales/")) {
      const salesActiveKey = getSalesActiveState();
      if (salesActiveKey) {
        setActive(salesActiveKey);
        setSalesExpanded(true);
      }
    } else {
      setActive(currentPath);
    }
  }, [router?.pathname]);

  const handleSelectedClick = (index, item) => {
    if (index === 0 && !isMobile) {
      setShowFullDisplay(!showFullDisplay);
      return;
    }

    if (item?.isNotification) {
      setNotificationsOpen(true);
      return;
    }

    if (item?.hasSubItems) {
      setSalesExpanded(!salesExpanded);
      return;
    }

    setActive(item?.key);

    if (isMobile) {
      setMobileMenuOpen(false);
    }
    if (item?.route) {
      router.push(`/${item?.route}`);
    }
  };

  const handleSubItemClick = (subItem) => {
    setActive(subItem?.key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
    if (subItem?.route) {
      router.push(`/${subItem?.route}`);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    setCookie("auth_token", "", -1);
    setCookie("auth_token_validity", "", -1);
    setCookie("user_token", "", -1);
    router.push("/login");
  };

  // Mobile view with updated notification handling
  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-[#343432] h-16 flex items-center justify-between px-4 z-20">
          <Image src={logo} alt="logo" width={60} height={32} />
          <button onClick={toggleMobileMenu} className="p-2 text-white">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Slide-in Menu */}
        <div
          className={`fixed top-0 right-0 h-full bg-[#343432] w-64 transform z-[9999] transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#51428E]">
            <Image src={logo} alt="logo" width={32} height={32} />
            <button onClick={toggleMobileMenu} className="p-2 text-white">
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          <div className="flex flex-col p-4 gap-4">
            {leftPaneValues
              .filter((_, index) => index !== 0)
              .map((item, idx) => {
                const index = idx + 1;
                return (
                  <div title={item?.name} key={index}>
                    <div
                      onClick={() => handleSelectedClick(index, item)}
                      className={`cursor-pointer flex gap-3 items-center p-3 transition-colors duration-200 ${
                        item?.key === active ||
                        (item?.key === "sales" && active?.startsWith("sales-"))
                          ? "bg-[#64EAA5] rounded-md"
                          : "hover:bg-[#5f6365] rounded-md"
                      }`}
                    >
                      {item?.image && (
                        <Image
                          src={item?.image}
                          alt="icon"
                          width={24}
                          height={24}
                        />
                      )}
                      {item?.icon && item?.icon}
                      {item?.text && (
                        <p className="text-[18px] font-medium text-[#FFFFFF]">
                          {item?.text}
                        </p>
                      )}
                      <div className="text-white capitalize text-[14px] flex-1">
                        {item?.name}
                      </div>
                      {item?.badge && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {item?.badge}
                        </span>
                      )}
                      {item?.hasSubItems && (
                        <ChevronRight
                          className={`size-4 text-white transition-transform duration-200 ${
                            salesExpanded ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </div>

                    {/* Sub items for mobile */}
                    {item?.hasSubItems && salesExpanded && (
                      <div className="ml-4 mt-2 space-y-1">
                        {item?.subItems?.map((subItem, subIndex) => (
                          <div
                            key={subItem.key}
                            onClick={() => handleSubItemClick(subItem)}
                            className={`cursor-pointer flex items-center justify-between p-2 text-sm transition-colors duration-200 relative ${
                              subItem?.key === active
                                ? "bg-[#64EAA5] rounded-md text-black"
                                : "text-gray-300 hover:bg-[#5f6365] rounded-md"
                            }`}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                            <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-400 -translate-y-1/2"></div>
                            {subIndex < item?.subItems?.length - 1 && (
                              <div className="absolute left-0 top-1/2 bottom-0 w-0.5 bg-gray-400"></div>
                            )}

                            <div className="flex items-center gap-2 ml-4">
                              <span>{subItem.name}</span>
                            </div>

                            {subItem.count !== undefined && (
                              <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                                {subItem.count}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className="absolute bottom-0 w-full p-4 border-t border-[#51428E]">
            <div
              onClick={handleLogout}
              className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#5f6365] rounded-md"
            >
              <Image src={logout} alt="logout" width={24} height={24} />
              <span className="text-white text-[14px]">Logout</span>
            </div>
          </div>
        </div>

        {/* Notifications Popup for Mobile */}
        <NotificationsPopup
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          showFullDisplay={false} // Mobile always uses compact layout
        />

        {/* Overlay when menu is open */}
        {(mobileMenuOpen || notificationsOpen) && (
          <div
            className="fixed inset-0 bg-gray-200 bg-opacity-50 z-[9998]"
            onClick={() => {
              setMobileMenuOpen(false);
              setNotificationsOpen(false);
            }}
          />
        )}

        <div className="pt-16 pb-16"></div>
      </>
    );
  }

  // Desktop view
  return (
    <>
      <div
        className={`bg-[#343432] z-[99] flex flex-col justify-between transition-all duration-300 ${
          showFullDisplay ? "w-[200px]" : "w-[60px]"
        } h-[100vh] relative`}
      >
        <div>
          <div className="h-[80px] px-[10px] py-[20px] border-b-[1px] border-[#51428E] flex items-center justify-center">
            <Image src={logo} alt="logo" width={40} height={40} />
          </div>
          <div className="flex flex-col p-[10px] gap-3">
            {leftPaneValues.map((item, index) => (
              <div key={index}>
                <div
                  onClick={() => handleSelectedClick(index, item)}
                  className={`cursor-pointer flex gap-3 items-center p-[6px] transition-colors duration-200 relative ${
                    item?.key === active ||
                    (item?.key === "sales" && active?.startsWith("sales-"))
                      ? "bg-[#64EAA5] rounded-md"
                      : "hover:bg-[#5f6365] rounded-md"
                  }`}
                >
                  {item?.image && (
                    <Image
                      src={item?.image}
                      alt="logo"
                      width={24}
                      height={24}
                    />
                  )}
                  {item?.icon && item?.icon}
                  {item?.text && (
                    <p className="text-[18px] font-medium text-[#FFFFFF]">
                      {item?.text}
                    </p>
                  )}
                  {item?.name && showFullDisplay && (
                    <div
                      className={`text-white capitalize text-[15px] whitespace-nowrap overflow-hidden transition-all duration-300 flex-1 ${
                        showFullDisplay
                          ? "max-w-[120px] opacity-100"
                          : "max-w-0 opacity-0"
                      }`}
                    >
                      {item?.name}
                    </div>
                  )}
                  {item?.badge && item?.badge > 0 && showFullDisplay && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {item?.badge}
                    </span>
                  )}
                  {item?.hasSubItems && showFullDisplay && (
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div
                        className={`w-2 h-2 border-r-2 border-b-2 border-white transition-transform duration-200 ${
                          salesExpanded
                            ? "rotate-45 -translate-y-0.5"
                            : "-rotate-45 translate-y-0.5"
                        }`}
                      />
                    </div>
                  )}
                </div>

                {/* Sub items for desktop */}
                {item?.hasSubItems && salesExpanded && showFullDisplay && (
                  <div className="ml-4 mt-2 space-y-1 relative">
                    {item?.subItems?.map((subItem, subIndex) => (
                      <div
                        key={subItem.key}
                        onClick={() => handleSubItemClick(subItem)}
                        className={`cursor-pointer flex items-center justify-between p-2 text-sm transition-colors duration-200 rounded relative ${
                          subItem?.key === active
                            ? "bg-[#64EAA5] text-black"
                            : "text-gray-300 hover:bg-[#5f6365]"
                        }`}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
                        <div className="absolute left-0 top-1/2 w-4 h-0.5 bg-gray-400 -translate-y-1/2"></div>
                        {subIndex < item?.subItems?.length - 1 && (
                          <div className="absolute left-0 top-1/2 bottom-0 w-0.5 bg-gray-400"></div>
                        )}

                        <div className="flex items-center gap-2 ml-4">
                          <span>{subItem.name}</span>
                        </div>

                        {subItem.count !== undefined && (
                          <span className="bg-gray-600 text-white text-xs px-2 py-0.5 rounded-full ml-auto">
                            {subItem.count}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div onClick={handleLogout} className="p-[10px] cursor-pointer">
          <Image
            src={logout}
            alt="logo"
            width={24}
            height={24}
            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
          />
        </div>
      </div>

      {/* Notifications Popup */}
      <NotificationsPopup
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        showFullDisplay={showFullDisplay}
      />
    </>
  );
};

export default LeftMenuBar;
