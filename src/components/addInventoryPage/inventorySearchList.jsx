import Image from "next/image";
import React from "react";
import grayClock from "../../../public/gray-clock.svg";
import grayLocation from "../../../public/gray-location.svg";
import grayCalendar from "../../../public/gray-calendar.svg";
import { desiredFormatDate, formatDateTime } from "@/utils/helperFunctions";

const InventorySearchedList = ({ item }) => {
  const renderIconText = (icon, text, className = "") => {
    return (
      <div className="flex gap-1 items-center min-w-0">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <p
          title={text}
          className={`text-[#7D82A4] text-[10px] font-normal ${className}`}
        >
          {text}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-2 p-2 hover:bg-gray-100 border-[1px] border-[#E0E1EA] rounded-md">
      <p className="text-[13px] text-[#343432] font-semibold leading-tight">
        {item?.match_name}
      </p>
      
      {/* Responsive layout: single row on desktop, stacked on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
        {/* Date and Time - always together */}
        <div className="flex items-center gap-2 sm:gap-3">
          {renderIconText(
            <Image src={grayCalendar} width={12} height={12} alt="calendar" />,
            desiredFormatDate(item?.match_date),
            "whitespace-nowrap flex-shrink-0"
          )}
          {renderIconText(
            <Image src={grayClock} width={12} height={12} alt="clock" />,
            item?.match_time,
            "whitespace-nowrap flex-shrink-0"
          )}
        </div>
        
        {/* Location - separate line on mobile, same line on desktop */}
        <div className="min-w-0 flex-1">
          {renderIconText(
            <Image src={grayLocation} width={12} height={12} alt="location" />,
            `${item?.stadium} , ${item?.city} , ${item?.country}`,
            "truncate min-w-0"
          )}
        </div>
      </div>
    </div>
  );
};

export default InventorySearchedList;