import React, { useState } from "react";
import { useRouter } from "next/router";

import canelTicket from "../../../public/cancel-ticke.svg";
import replaced from "../../../public/replaced.svg";
import Pound from "../../../public/dashboard-pound.svg";
import Currency from "../../../public/dashboard-currency.svg";
import Shopping from "../../../public/dashboard-shopping.svg";
import ViewContainer from "./viewContainer";
import Subheader from "./subheader";
import ReportViewContainer from "./reportViewContainer";
import TopSellingEvents from "./topSellingEvents";
import TradeTickets from "./tradeTickets";
import NotificationActivityList from "./notificationActivityList";
import OrderList from "./orderList";
import LatestOrderView from "./latestOrderView";
import LatestBookingTable from "./latestBookingTable";
import {
  dashboardActivity,
  dashboardAwaitingDelivery,
  dashboardNotifications,
  fetchSalesOverview,
  topSellingEvents,
  fetchReports,
  dashbordReports,
  fetchPurchaseTracking, // Add this API function
  fetchTradeOrders,
  LMTpurchaseTracking,
  LMTTradeOrders, // Add this API function
} from "@/utils/apiHandler/request";
import { useSelector } from "react-redux";
import AccessDeniedComponent from "../secureLayout/accessDeniedComponent";
import PageLoader from "../pageLoader";

const DashboardPage = (props) => {
  const [resultData, setResultData] = useState(props?.response);
  const [loader, setLoader] = useState({
    salesOverView: false,
    awaitingDelivery: false,
    activity: false,
    notifications: false,
    topSelling: false,
    reports: false,
    purchaseTracking: false,
    tradeOrders: false,
    reports: false,
  });
  const [wholerLoader, setWholerLoader] = useState(false);
  const [filters, setFilters] = useState({
    salesOverView: "last_180days",
    awaitingDelivery: "next_24hours",
    topSelling: "last_180days",
    topSellingCategory: "", //allCategories
    reports: "GBP", // Default currency
  });
  const { userRoles } = useSelector((state) => state.common);
  console.log(userRoles, "userRolesuserRolesuserRoles");
  // Track current page for pagination - Added all sections

  // const isDashboardVisible = userRoles?.permission?.filter(
  //   (item) => item?.name == "dashboard" && item.is_can_access == 1
  // );
  // console.log(isDashboardVisible, "isDashboardVisibleisDashboardVisible");
  // Derive permission state
  const permissions = userRoles?.permission;
  const permissionsLoading = permissions === undefined;
  const canAccessDashboard = Array.isArray(permissions)
    ? permissions.some(
        (p) => p?.name === "dashboard" && Number(p?.is_can_access) === 1
      )
    : false;
  const [currentPages, setCurrentPages] = useState({
    salesOverView: 1,
    awaitingDelivery: 1,
    notifications: 1,
    activity: 1,
    reports: 1,
    topSelling: 1,
    purchaseTracking: 1,
    tradeOrders: 1,
  });

  const updateApiCall = async (keyValue, params, isPagination = false) => {
    let response;

    setLoader((prevLoader) => ({
      ...prevLoader,
      [keyValue]: true,
    }));

    if (keyValue == "reports" && !isPagination) {
      setWholerLoader(true);
    }

    try {
      if (keyValue === "currency") {
        response = await dashbordReports(token);
      }
      if (keyValue === "salesOverView") {
        response = await fetchSalesOverview("", params);
      } else if (keyValue === "awaitingDelivery") {
        response = await dashboardAwaitingDelivery("", params);
      } else if (keyValue === "activity") {
        response = await dashboardActivity("", params);
      } else if (keyValue === "notifications") {
        response = await dashboardNotifications("", params);
      } else if (keyValue === "topSelling") {
        response = await topSellingEvents("", params);
      } else if (keyValue === "reports") {
        response = await dashbordReports("", params);
      } else if (keyValue === "purchaseTracking") {
        response = await LMTpurchaseTracking("", params);
      } else if (keyValue === "tradeOrders") {
        response = await LMTTradeOrders("", params);
      }

      if (isPagination) {
        // For pagination, append new data to existing data
        setResultData((prevData) => ({
          ...prevData,
          [keyValue]: {
            ...response,
            // Handle different list property names
            events_list: [
              ...(prevData[keyValue]?.events_list || []),
              ...(response?.events_list || []),
            ],
            notification_list: [
              ...(prevData[keyValue]?.notification_list || []),
              ...(response?.notification_list || []),
            ],
            activity_list: [
              ...(prevData[keyValue]?.activity_list || []),
              ...(response?.activity_list || []),
            ],
            // Add reports history for pagination
            history: [
              ...(prevData[keyValue]?.history || []),
              ...(response?.history || []),
            ],
            // Add support for purchase tracking ticket details
            ticket_details: [
              ...(prevData[keyValue]?.ticket_details || []),
              ...(response?.ticket_details || []),
            ],
            // Add support for trade orders data
            data:
              keyValue === "tradeOrders"
                ? {
                    ...response?.data,
                    data: [
                      ...(prevData[keyValue]?.data?.data || []),
                      ...(response?.data?.data || []),
                    ],
                  }
                : prevData[keyValue]?.data,
            // Update meta with new pagination info
            meta: response?.meta,
            pagination: response?.pagination, // For purchase tracking
          },
        }));
      } else {
        // For filter changes, replace the data
        setResultData((prevData) => ({
          ...prevData,
          [keyValue]: response,
        }));
        // Reset pagination when filter changes
        setCurrentPages((prevPages) => ({
          ...prevPages,
          [keyValue]: 1,
        }));
      }
    } catch (error) {
      console.error("Error updating API call:", error);
    } finally {
      setLoader((prevLoader) => ({
        ...prevLoader,
        [keyValue]: false,
      }));
      setWholerLoader(false);
    }
  };

  const handleSelectOptionChange = (filterKey, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));
    // Prepare params based on filter type
    let params = { page: 1 };
    let apiKey = filterKey;

    if (filterKey === "topSelling") {
      // For date range changes, include both date and category
      params = {
        date_format: value,
        category: filters.topSellingCategory,
        page: 1,
      };
    } else if (filterKey === "topSellingCategory") {
      // For category changes, include both category and current date range
      params = {
        date_format: filters.topSelling,
        category: value,
        page: 1,
      };
      apiKey = "topSelling"; // Use topSelling API for category changes
    } else if (
      filterKey === "salesOverView" ||
      filterKey === "awaitingDelivery"
    ) {
      params = {
        date_format: value,
        page: 1,
      };
    } else if (filterKey === "reports") {
      params = {
        currency: value,
        page: 1,
      };
    }

    updateApiCall(apiKey, params);
  };

  const handleScrollEnd = async (keyValue) => {
    // Extended to handle all sections including purchaseTracking and tradeOrders
    if (
      [
        "salesOverView",
        "awaitingDelivery",
        "notifications",
        "activity",
        "reports",
        "topSelling",
        "purchaseTracking",
        "tradeOrders",
      ].includes(keyValue)
    ) {
      let currentMeta;

      // Handle different meta structures
      if (keyValue === "purchaseTracking") {
        currentMeta = resultData[keyValue]?.pagination;
      } else if (keyValue === "tradeOrders") {
        currentMeta = resultData[keyValue]?.data;
      } else {
        currentMeta = resultData[keyValue]?.meta;
      }

      // Check if there are more pages to load
      if (currentMeta && currentMeta.current_page < currentMeta.last_page) {
        const nextPage = currentMeta.current_page + 1;

        // Update current page
        setCurrentPages((prevPages) => ({
          ...prevPages,
          [keyValue]: nextPage,
        }));

        // Prepare params based on keyValue
        let params = { page: nextPage };

        // For salesOverView and awaitingDelivery, include date_format
        if (keyValue === "salesOverView" || keyValue === "awaitingDelivery") {
          params.date_format = filters[keyValue];
        } else if (keyValue === "topSelling") {
          // Include both date and category for topSelling pagination
          params = {
            page: nextPage,
            date_format: filters.topSelling,
            category: filters.topSellingCategory,
          };
        }
        if (keyValue === "reports") {
          params.currency = filters.reports;
        }

        // For purchaseTracking and tradeOrders, no additional params needed, just page

        // Call API with next page
        await updateApiCall(keyValue, params, true); // isPagination = true
      }
    }
  };

  const listValues = [
    {
      title: "Sales",
      keyValue: "salesOverView",
      options: [
        { value: "all", label: "All Sales" },
        { value: "today", label: "Today" },
        { value: "last_7days", label: "Last 7 days" },
        { value: "last_15days", label: "Last 15 days" },
        { value: "last_30days", label: "Last 30 days" },
        { value: "last_180days", label: "Last 6 months" },
      ],
      selectedOption: filters?.salesOverView,
      onchange: (value) => {
        handleSelectOptionChange("salesOverView", value);
      },
      listValues: [
        {
          image: Pound,
          text: "Sales",
          count: resultData?.salesOverView?.sales_count,
        },
        {
          image: Currency,
          text: "Tickets",
          count: resultData?.salesOverView?.tickets_count,
        },
      ],
      displayValues: resultData?.salesOverView?.events_list?.map((item) => ({
        displayName: item?.match_name,
        count: item?.revenue,
        matchId: item?.match_id,
        bookingId: item?.booking_id,
      })),
      meta: resultData?.salesOverView?.meta,
    },
    {
      title: "Awaiting Delivery",
      keyValue: "awaitingDelivery",
      options: [
        { value: "all", label: "All Events" },
        { value: "today", label: "Today" },
        { value: "past_events", label: "Past Events" },
        { value: "next_24hours", label: "Next 24 hours" },
        { value: "next_48hours", label: "Next 48 hours" },
        { value: "next_7days", label: "Next 7 days" },
        { value: "next_14days", label: "Next 14 days" },
        { value: "next_30days", label: "Next 30 days" },

        { value: "next_180days", label: "Next 6 months" },
      ],
      selectedOption: filters?.awaitingDelivery,
      onchange: (value) => {
        handleSelectOptionChange("awaitingDelivery", value);
      },
      listValues: [
        {
          image: Pound,
          text: "Orders",
          count: resultData?.awaitingDelivery?.order_count || 0,
        },
        {
          image: Shopping,
          text: "Tickets",
          count: resultData?.awaitingDelivery?.tickets_count || 0,
        },
      ],
      displayValues:
        resultData?.awaitingDelivery?.events_list?.map((item) => ({
          displayName: item?.match_name,
          count: item?.revenue,
          matchId: item?.match_id,
          bookingId: item?.booking_id,
        })) || [],
      meta: resultData?.awaitingDelivery?.meta,
    },
  ];
  const reportValues = {
    title: "Reports",
    options: resultData?.currencyOptions?.map((item) => ({
      value: item?.code,
      label: item?.code,
    })),
    selectedOption: filters?.reports,
    onChange: (value) => {
      handleSelectOptionChange("reports", value);
    },
    reports: [
      {
        image: Pound,
        text: "Total Revenue",
        desc: resultData?.reports?.over_view?.[0]?.revenue_with_currency,
      },
      {
        image: Shopping,
        text: "Total Orders",
        desc: resultData?.reports?.over_view?.[0]?.total_sales,
      },
      {
        image: Currency,
        text: "Tickets Sold",
        desc: resultData?.reports?.over_view?.[0]?.tickets_sold,
      },
      {
        image: canelTicket,
        text: "Cancelled Tickets",
        desc: resultData?.reports?.over_view?.[0]?.cancelled_order,
      },
      {
        image: replaced,
        text: "Replaced Orders",
        desc: resultData?.reports?.over_view?.[0]?.replaced_order,
      },
    ],
    tableView: {
      head: ["Match Name", "Revenue"],
      body:
        resultData?.reports?.history?.map((item) => ({
          matchName: item?.match_name,
          revenue: item?.revenue,
        })) || [],
    },
    // Add pagination support for reports
    handleScrollEnd: handleScrollEnd,
    keyValue: "reports",
    meta: resultData?.reports?.meta,
    loader: loader.reports,
    wholeLoader: wholerLoader,
  };

  const sellingEvents = {
    title: "Top Selling Events",
    firstSelect: {
      options: [
        { value: "last_7days", label: "Last 7 days" },
        { value: "last_15days", label: "Last 15 days" },
        { value: "last_30days", label: "Last 30 days" },
        { value: "last_60days", label: "Last 60 days" },
        { value: "last_180days", label: "Last 6 months" },
      ],
      selectedOption: filters.topSelling,
      onChange: (value) => {
        handleSelectOptionChange("topSelling", value);
      },
    },
    tableViews: {
      title: ["Event Description", "Event Date"],
      body:
        resultData?.topSelling?.events_list?.map((item) => ({
          eventName: item?.match_name,
          eventDate: item?.match_date,
          ctaName: "Create Listing",
          matchId: item?.match_id,
        })) || [],
    },
    // Add pagination support for topSelling
    handleScrollEnd: handleScrollEnd,
    keyValue: "topSelling",
    meta: resultData?.topSelling?.meta,
    loader: loader.topSelling,
  };

  const router = useRouter();
  const handleCreateListing = (item) => {
    const { matchId = null } = item ?? {};
    router.push(`/add-listings${matchId ? `/${matchId}` : ""}`);
  };
  return (
    <div className="flex flex-col h-full">
      <Subheader />
      {permissionsLoading ? (
        <div className="flex items-center justify-center py-16">
          <PageLoader />
        </div>
      ) : canAccessDashboard ? (
        <div className="overflow-auto p-3 sm:p-4 md:p-6 w-full h-full flex flex-col gap-3 sm:gap-4 md:gap-5 bg-[#F5F7FA]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {listValues?.map((listItem, listIndex) => {
                  return (
                    <ViewContainer
                      key={listIndex}
                      title={listItem?.title}
                      options={listItem?.options}
                      listValues={listItem?.listValues}
                      onChange={listItem?.onchange}
                      loader={loader[listItem?.keyValue]}
                      selectedOption={listItem?.selectedOption}
                      displayValues={listItem?.displayValues}
                      handleScrollEnd={handleScrollEnd}
                      keyValue={listItem?.keyValue}
                      meta={listItem?.meta}
                    />
                  );
                })}
              </div>
              <ReportViewContainer reportValues={reportValues} />
            </div>
            <div className="w-full flex flex-col">
              <TopSellingEvents
                sellingEvents={sellingEvents}
                handleClick={handleCreateListing}
                handleScrollEnd={handleScrollEnd}
                loader={loader.topSelling}
              />
            </div>
          </div>

          <TradeTickets
            resultData={resultData}
            handleScrollEnd={handleScrollEnd}
            loader={loader}
          />
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6">
            <div className="w-full lg:w-1/2 flex flex-col gap-3 sm:gap-4 md:gap-6">
              <NotificationActivityList
                notificationsList={resultData?.notifications}
                activities={resultData?.activity}
                handleScrollEnd={handleScrollEnd}
                loader={loader}
              />
            </div>
          </div>
        </div>
      ):(
        <AccessDeniedComponent />
      )}
    </div>
  );
};

export default DashboardPage;
