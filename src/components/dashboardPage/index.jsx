import React, { useState } from "react";

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
  dashbordReports, // Add your reports API function here
} from "@/utils/apiHandler/request";

const DashboardPage = (props) => {
  console.log("props", props);

  const [resultData, setResultData] = useState(props?.response);
  console.log(" ", resultData);

  const [loader, setLoader] = useState({
    salesOverView: false,
    awaitingDelivery: false,
    activity: false,
    notifications: false,
    topSelling: false,
    reports: false,
  });

  const [filters, setFilters] = useState({
    salesOverView: "last_180days",
    awaitingDelivery: "today",
  });

  // Track current page for pagination - Added notifications, activity, and reports
  const [currentPages, setCurrentPages] = useState({
    salesOverView: 1,
    awaitingDelivery: 1,
    notifications: 1,
    activity: 1,
    reports: 1,
  });

  const updateApiCall = async (keyValue, params, isPagination = false) => {
    let response;
    setLoader((prevLoader) => ({
      ...prevLoader,
      [keyValue]: true,
    }));

    try {
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
            // Update meta with new pagination info
            meta: response?.meta,
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
    }
  };

  const handleSelectOptionChange = (filterKey, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: value,
    }));

    updateApiCall(filterKey, {
      date_format: value,
      page: 1, // Reset to first page when filter changes
    });
  };

  const handleScrollEnd = async (keyValue) => {
    // Extended to handle notifications, activity, and reports pagination
    if (
      [
        "salesOverView",
        "awaitingDelivery",
        "notifications",
        "activity",
        "reports",
      ].includes(keyValue)
    ) {
      const currentMeta = resultData[keyValue]?.meta;

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
        }

        // For reports, no additional params needed, just page
        // For notifications and activity, no additional params needed, just page

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
        { value: "today", label: "Today" },
        { value: "last_login", label: "Last Login" },
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
        { value: "past_events", label: "Past Events" },
        { value: "next_24hours", label: "Events in next 24 hours" },
        { value: "next_48hours", label: "Events in next 48 hours" },
        { value: "next_7days", label: "Events in next 7 days" },
        { value: "next_14days", label: "Events in next 14 days" },
        { value: "next_30days", label: "Events in next 30 days" },
        { value: "next_180days", label: "Events in next 6 months" },
      ],
      selectedOption: filters?.awaitingDelivery,
      onchange: (value) => {
        handleSelectOptionChange("awaitingDelivery", value);
      },
      listValues: [
        {
          image: Pound,
          text: "Orders",
          count: resultData?.awaitingDelivery?.orders_count || 0,
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
    options: [
      { value: "today", label: "Today" },
      { value: "yesterday", label: "Yesterday" },
    ],
    selectedOption: "today",
    onchange: () => {},
    reports: [
      {
        image: Pound,
        text: "Total Revenue",
        desc: resultData?.reports?.over_view?.[0]?.revenue_with_currency,
      },
      {
        image: Shopping,
        text: "Total Sales",
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
      body: resultData?.reports?.history?.map((item) => ({
        matchName: item?.match_name,
        revenue: item?.revenue,
      })) || [],
    },
    // Add pagination support for reports
    handleScrollEnd: handleScrollEnd,
    keyValue: "reports",
    meta: resultData?.reports?.meta,
    loader: loader.reports,
  };

  const sellingEvents = {
    title: "Top Selling Events",
    firstSelect: {
      options: [
        { value: "today", label: "Today" },
        { value: "yesterday", label: "Yesterday" },
      ],
      selectedOption: "today",
      onchange: () => {},
    },
    secondSelect: {
      options: [
        { value: "allCategories", label: "All Categories" },
        { value: "sports", label: "Sports" },
        { value: "concerts", label: "Concerts" },
      ],
      selectedOption: "allCategories",
      onchange: () => {},
    },
    tableViews: {
      title: ["Event Description", "Event Date"],
      body: [
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
        {
          eventName: "Arsenal FC vs Nottingham Forest FC",
          eventDate: "Sat, 23 Nov 2024",
          ctaName: "Create Listing",
        },
      ],
    },
  };

  return (
    <div className="flex flex-col h-full">
      <Subheader />

      <div className="overflow-auto p-4 md:p-6 w-full h-full flex flex-col gap-4 md:gap-5 bg-[#F5F7FA]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
          <div className="w-full md::w-1/2 flex flex-col gap-4 md:gap-6">
            <NotificationActivityList
              notificationsList={resultData?.notifications}
              activities={resultData?.activity}
              handleScrollEnd={handleScrollEnd}
              loader={loader}
            />
          </div>
          <div className="w-full md::w-1/2 flex flex-col">
            <TopSellingEvents sellingEvents={sellingEvents} />
          </div>
        </div>
        <TradeTickets />
        <ReportViewContainer reportValues={reportValues} />
      </div>
    </div>
  );
};

export default DashboardPage;