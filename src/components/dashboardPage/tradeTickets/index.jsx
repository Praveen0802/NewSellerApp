import Button from "@/components/commonComponents/button";
import React from "react";
import TradeTicketsContainer from "./tradeTicketsContainer";
import { FetchEventSearch } from "@/utils/apiHandler/request";

const TradeTickets = ({ resultData, handleScrollEnd, loader }) => {
  const tracking = {
    title: "Tracking",
    count: resultData?.purchaseTracking?.tracking || "0",
    subHeading: "price",
    listItems:
      resultData?.purchaseTracking?.ticket_details?.map((item) => ({
        title: item?.match_name,
        amount: item?.price_with_currency,
      })) || [],
    keyValue: "purchaseTracking",
    meta: resultData?.purchaseTracking?.pagination,
  };

  const purchases = {
    title: "Purchases",
    count: resultData?.tradeOrders?.total_count || "0",
    subHeading: "Event Date",
    listItems:
      resultData?.tradeOrders?.data?.data?.map((item) => ({
        title: item?.match_name,
        amount: item?.match_datetime,
      })) || [],
    keyValue: "tradeOrders",
    meta: resultData?.tradeOrders?.data,
  };
  const fetchApiCall = async (params) => {
    // setLoading(true);
    // const response = await FetchEventSearch("", params);
    // setLoading(false);
  };
  

  return (
    <div className="border-[1px] border-[#eaeaf1] rounded-md bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b-[1px] border-[#eaeaf1]">
        <p className="text-[16px] text-[#343432] font-semibold mb-3 sm:mb-0">
          Trade Tickets
        </p>
        <Button type="blueType" label="Find Tickets" />
      </div>
      <div className="flex flex-col md:flex-row">
        <TradeTicketsContainer
          tracking={tracking}
          className="w-full md:w-[50%] border-b-[1px] md:border-b-0 md:border-r-[1px] border-[#eaeaf1]"
          handleScrollEnd={handleScrollEnd}
          loader={loader?.purchaseTracking}
        />
        <TradeTicketsContainer
          tracking={purchases}
          className="w-full md:w-[50%]"
          handleScrollEnd={handleScrollEnd}
          loader={loader?.tradeOrders}
        />
      </div>
    </div>
  );
};

export default TradeTickets;
