import Image from "next/image";
import React from "react";
import grayClock from "../../../public/gray-clock.svg";
import grayLocation from "../../../public/gray-location.svg";
import grayCalendar from "../../../public/gray-calendar.svg";
import { desiredFormatDate, formatDateTime } from "@/utils/helperFunctions";

const InventorySearchedList = ({ item }) => {
  const renderIconText = (icon, text, className = "") => {
    return (
      <div className="flex gap-2 items-center">
        {icon}
        <p
          title={text}
          className={`text-[#7D82A4] ${className}  w-[90%] text-[10px] font-normal`}
        >
          {text}
        </p>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-1 p-2  hover:bg-gray-100 border-[1px] border-[#E0E1EA] rounded-md">
      <p className="text-[13px] text-[#343432] font-semibold">
        {item?.match_name}
      </p>
      <div className="flex items-center gap-3">
        {renderIconText(
          <Image src={grayCalendar} width={14} height={14} alt="logo" />,
          desiredFormatDate(item?.match_date),
          "whitespace-nowrap"
        )}
        <div className="flex items-center gap-3">
          {renderIconText(
            <Image src={grayClock} width={14} height={14} alt="logo" />,
            item?.match_time
          )}

          {renderIconText(
            <Image src={grayLocation} width={14} height={14} alt="logo" />,
            `${item?.stadium} , ${item?.city} , ${item?.country}`,
            "truncate"
          )}
        </div>
      </div>
    </div>
  );
};

export default InventorySearchedList;
