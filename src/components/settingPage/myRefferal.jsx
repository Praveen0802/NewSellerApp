import React from "react";
import ComponentWrapper from "./components/componentWrapper";
import ListView from "./components/listView";
import { IconStore } from "@/utils/helperFunctions/iconStore";
import FloatingSelect from "../floatinginputFields/floatingSelect";
import FloatingDateRange from "../commonComponents/dateRangeInput";
import FloatingLabelInput from "../floatinginputFields";
import SubjectDescriptionPopup from "./subjectDescriptionPopup";

const MyRefferal = () => {
  const myRefferalValues = [
    {
      title: "0.00",
      desc: "Total Earnings",
      icon: <IconStore.circleTick className="stroke-green-600 size-5" />,
    },
    { title: "0.00", desc: "Total Earnings" },
    { title: "0.00", desc: "Total Earnings" },
    { title: "0.00", desc: "Total Earnings" },
    { title: "0.00", desc: "Total Earnings" },
  ];
  return (
    <div>
      <div className="bg-white  border-l-[1px] border-[#DADBE5] h-full">
        <div className="py-2 p-4 border-b-[1px] border-[#DADBE5]">
          <p className="text-base">Filters</p>
        </div>
        <div className="grid grid-cols-5 gap-4 p-4 border-b-[1px] border-[#DADBE5]">
          {myRefferalValues?.map((item, index) => (
            <ListView
              key={index}
              title={item.title}
              desc={item.desc}
              icon={item?.icon}
            />
          ))}
        </div>
        <div className="grid grid-cols-5 gap-4 items-center border-b-[1px] border-[#DADBE5] p-4">
          <FloatingLabelInput
            id="selectedMatch"
            name="selectedMatch"
            keyValue={"selectedMatch"}
            type="text"
            label="Search Match Event"
            //   value={selectedMatch}
            className={"!py-[7px] !px-[12px] !text-[#323A70] !text-[14px] "}
            //   onChange={handleMatchSearch}
            paddingClassName=""
            autoComplete="off"
          />
          <FloatingDateRange
            id="eventDate"
            name="eventDate"
            keyValue="eventDate"
            parentClassName=""
            label="Event Date"
            subParentClassName=""
            className="!py-[8px] !px-[16px] mobile:text-xs"
            //   value={eventDate}
            //   onChange={(dateValue) => handleDateChange(dateValue, "eventDate")}
          />
          <FloatingDateRange
            id="orderDate"
            name="orderDate"
            keyValue="orderDate"
            parentClassName=""
            subParentClassName="!"
            label="Order Date"
            className="!py-[8px] !px-[16px] mobile:text-xs"
            //   value={orderDate}
            //   onChange={(dateValue) => handleDateChange(dateValue, "orderDate")}
          />
          <FloatingSelect
            label={"Ticket Status"}
            options={[
              { value: "fulfilled", label: "Fulfilled" },
              { value: "incomplete", label: "Incomplete" },
            ]}
            //   selectedValue={selectedTicketStatus}
            keyValue="ticket_status"
            className=""
            //   onSelect={(e) => {
            //     handleSelectChange(e, "ticket_status");
            //   }}
            paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
          />
          <FloatingSelect
            label={"Booking Status"}
            //   options={bookingStatusOptions}
            //   selectedValue={selectedBookingStatus}
            keyValue="booking_status"
            className=""
            //   onSelect={(e) => {
            //     handleSelectChange(e, "booking_status");
            //   }}
            paddingClassName="!py-[6px] !px-[12px] w-full mobile:text-xs"
          />
        </div>
        <div className="border-b-[1px] border-[#DADBE5]">
          <p className="p-4 border-r-[1px] border-[#DADBE5] w-fit">0 Result</p>
        </div>
      </div>
      
    </div>
  );
};

export default MyRefferal;
