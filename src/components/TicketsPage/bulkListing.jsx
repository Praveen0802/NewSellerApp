import React from "react";
import Button from "../commonComponents/button";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import EventsTable from "./eventsTable";

const BulkListings = (props) => {
  console.log(props, "propspropsssss");
  const { response } = props;
  const dispatch = useDispatch();
  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  const headers = [
    { title: "Event Name", key: "match_name" },
    { title: "Tournament Name", key: "tournament_name" },
    { title: "Match Date", key: "match_date" },
    { title: "Match Time", key: "match_time" },
    { title: "Stadium", key: "stadium" },
    { title: "Total Ticket", key: "total_ticket" },
    { title: "Total Fare", key: "ticket_fare_from" },
  ];

  // Updated event data to match the screenshot
  const eventListViews = response?.value?.events?.map((list) => ({
    ...list,
  }));

  return (
    <div className="bg-[#F5F7FA] w-full h-full">
      <div className="flex bg-white items-center py-2 md:py-2 justify-between px-4 md:px-6 border-b border-[#eaeaf1]">
        <p>Filter</p>
        <Button
          type="blueType"
          classNames={{
            root: "px-2 md:px-3 py-1.5 md:py-2",
            label_: "text-xs md:text-sm font-medium",
          }}
          onClick={() => {
            handleOpenAddWalletPopup();
          }}
          label="+ Add Deposit"
        />
      </div>
      <div className="border-b-[1px] bg-white border-[#DADBE5] p-4">
        <div className="flex gap-4 items-center w-[80%]">
          <FloatingLabelInput
            id="selectedMatch"
            name="selectedMatch"
            keyValue={"selectedMatch"}
            type="text"
            label="Search Match Event"
            className={"!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "}
            paddingClassName=""
            autoComplete="off"
          />
          <FloatingSelect
            label={"Ticket Status"}
            options={[
              { value: "fulfilled", label: "Fulfilled" },
              { value: "incomplete", label: "Incomplete" },
            ]}
            keyValue="ticket_status"
            className=""
            paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
          />
          <FloatingSelect
            label={"Booking Status"}
            keyValue="booking_status"
            className=""
            paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
          />
          <FloatingDateRange
            id="eventDate"
            name="eventDate"
            keyValue="eventDate"
            parentClassName=""
            label="Event Date"
            subParentClassName=""
            className="!py-[8px] !px-[16px] mobile:text-xs"
          />
        </div>
      </div>
      <div className="border-b-[1px] bg-white border-[#DADBE5] flex items-center">
        <p className="text-[14px] p-4 text-[#323A70] font-medium border-r-[1px] border-[#DADBE5] w-fit">
          {eventListViews.length} Events
        </p>
      </div>
      <div className="m-6 bg-white rounded  max-h-[calc(100vh-300px)] overflow-scroll">
        {/* This div creates the scrollable container with fixed height */}
        <div className="overflow-y-auto overflow-x-auto h-full">
          <EventsTable events={eventListViews} headers={headers} />
        </div>
      </div>
    </div>
  );
};

export default BulkListings;
