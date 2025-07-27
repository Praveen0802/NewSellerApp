import React, { useState, useMemo } from "react";
import Button from "../commonComponents/button";
import { useDispatch } from "react-redux";
import { updateWalletPopupFlag } from "@/utils/redux/common/action";
import FloatingLabelInput from "../floatinginputFields";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import EventsTable from "./eventsTable";
import { useRouter } from "next/router";

const BulkListings = (props) => {
  const { response } = props;
  const [selectedRows, setSelectedRows] = useState([]);
  const dispatch = useDispatch();
  console.log(selectedRows, "selectedRowsselectedRows");
  const router = useRouter();

  const handleOpenAddWalletPopup = () => {
    dispatch(
      updateWalletPopupFlag({
        flag: true,
      })
    );
  };

  const handleAddticket = () => {
    if (selectedRows?.length == 1) {
      router.push(`/add-listings/${selectedRows[0]}`);
    } else {
      const values = selectedRows?.join(",");
      router.push(`/bulk-listings/match?k=${values}`);
    }
  };

  const headers = [
    { title: "Event Name", key: "match_name" },
    { title: "Match Date", key: "match_date" },
    { title: "Match Time", key: "match_time" },
    { title: "Stadium", key: "stadium" },
    { title: "Total Ticket", key: "total_ticket" },
    { title: "Total Fare", key: "ticket_fare_from" },
  ];

  // ✅ FIX: Memoize eventListViews to prevent unnecessary re-renders
  const eventListViews = useMemo(() => {
    return (
      response?.value?.events?.map((list) => ({
        ...list,
      })) || []
    );
  }, [response?.value?.events]);

  return (
    <div className="bg-[#F5F7FA] w-full h-full relative">
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
      <div
        className={`m-6 bg-white rounded max-h-[calc(100vh-300px)] overflow-scroll ${
          selectedRows?.length > 0 ? "mb-20" : ""
        }`}
      >
        <div className="overflow-y-auto overflow-x-auto h-full">
          <EventsTable
            events={eventListViews}
            headers={headers}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
          />
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {selectedRows?.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] shadow-lg z-50">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#323A70] font-medium"></span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="outlined"
                classNames={{
                  root: "px-4 py-2 border border-[#D1D5DB] text-[#374151] hover:bg-[#F9FAFB]",
                  label_: "text-sm font-medium",
                }}
                onClick={() => setSelectedRows([])}
                label="Cancel"
              />
              <Button
                type="blueType"
                classNames={{
                  root: "px-4 py-2",
                  label_: "text-sm font-medium",
                }}
                onClick={() => {
                    handleAddticket();
                }}
                label="Add Tickets"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkListings;
