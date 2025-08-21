import { dateFormat, desiredFormatDate } from "@/utils/helperFunctions";
import Image from "next/image";
import crossHand from "../../../public/cross-hand.svg";
import blueClock from "../../../public/blue-clock.svg";
import blueCalendar from "../../../public/blue-calendar.svg";
import blueLocation from "../../../public/blue-location.svg";
import attachmentPin from "../../../public/attachment-pin.svg";
import attachment6 from "../../../public/attachment-6.svg";
import attachment3 from "../../../public/attachment-3.svg";
import attachment1 from "../../../public/attachment-1.svg";
import React from "react";

const EventDetails = ({ data }) => {
  const displayViewList = [
    {
      name: "Quantity",
      value: data?.quantity,
    },
    {
      name: "Category",
      value: data?.Category,
    },
    {
      name: "Section/block",
      value: data?.ticket_block,
    },
    {
      name: "Row",
      value: data?.row,
    },
    {
      name: "Ticket Type",
      value: data?.Ticket_type,
    },
    {
      name: "Match Date",
      value: desiredFormatDate(data?.match_date),
    },
  ];

  const renderContent = (icon, text) => {
    return (
      <div className="flex gap-1 items-center">
        {icon && icon}
        <p className="text-[12px] font-normal">{text}</p>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-md">
      <p className="px-4 py-2 border-b border-gray-200 text-[18px] font-medium">
        {data?.match_name}
      </p>
      <div className="border-b border-gray-200 flex items-center justify-between">
        <div className="flex max-md:flex-col gap-3 md:items-center px-4 py-2">
          {renderContent(
            <Image src={blueCalendar} alt="location" width={14} height={14} />,
            desiredFormatDate(data?.match_date)
          )}
          {renderContent(
            <Image src={blueClock} alt="location" width={14} height={14} />,
            data?.match_time
          )}
          {renderContent(
            <Image src={blueLocation} alt="location" width={14} height={14} />,
            `${data?.stadium_name}${
              data?.country_name ? `,${data?.country_name}` : ""
            }${data?.city_name ? `,${data?.city_name}` : ""}`
          )}
        </div>
        <div className="flex gap-2 px-4 border-l border-gray-200 items-center py-2">
          <Image
            width={12}
            height={12}
            src={
              data?.ticket_type_id == 2
                ? attachmentPin
                : data?.ticket_type_id == 4 || data?.ticket_type_id == 6
                ? attachment6
                : data?.ticket_type_id == 3
                ? attachment3
                : data?.ticket_type_id == 1
                ? attachment1
                : attachmentPin
            }
            alt="attach"
          />
          <Image width={12} height={12} src={crossHand} alt="hand" />
        </div>
      </div>
      <div className="border-b border-gray-200 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {displayViewList?.map((item, index) => {
          return (
            <div key={index} className="flex flex-col gap-1">
              <p className="text-gray-700 text-[11px] font-normal">
                {item?.name}
              </p>
              <p className="text-[12px] font-medium">{item?.value}</p>
            </div>
          );
        })}
      </div>
      {/* <div className="flex flex-col gap-1 px-4 py-2">
        <p className="text-gray-700 text-[11px] font-normal">Buying from</p>
        <p className="text-[12px] font-medium">
          {data?.country},{data?.city}
        </p>
      </div> */}
    </div>
  );
};

export default EventDetails;
