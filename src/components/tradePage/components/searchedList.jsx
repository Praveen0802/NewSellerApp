import Image from "next/image";
import React from "react";
import grayClock from "../../../../public/gray-clock.svg";
import grayLocation from "../../../../public/gray-location.svg";
import grayCalendar from "../../../../public/gray-calendar.svg";
import { desiredFormatDate, formatDateTime } from "@/utils/helperFunctions";

const SearchedList = ({ item }) => {
  const renderIconText = (icon, text,className='') => {
    return (
      <div className="flex gap-2 items-center">
        {icon}
        <p
          title={text}
          className={`text-[#7D82A4] ${className}  w-[80%] text-[12px] font-normal`}
        >
          {text}
        </p>
      </div>
    );
  };
  return (
    <div className="flex flex-col gap-2 p-4  hover:bg-gray-100 border-[1px] border-[#E0E1EA] rounded-md">
      <p className="text-[14px] text-[#343432] font-semibold">
        {item?.match_name}
      </p>
      <div className="flex items-center gap-4">
        {renderIconText(
          <Image src={grayCalendar} width={16} height={16} alt="logo" />,
          desiredFormatDate(item?.match_date),
          'whitespace-nowrap'
        )}
        {renderIconText(
          <Image src={grayClock} width={16} height={16} alt="logo" />,
          item?.match_time
        )}
      </div>
      {renderIconText(
        <Image src={grayLocation} width={16} height={16} alt="logo" />,
        `${item?.stadium} , ${item?.city} , ${item?.country}`,
        'truncate'
      )}
    </div>
  );
};

export default SearchedList;
