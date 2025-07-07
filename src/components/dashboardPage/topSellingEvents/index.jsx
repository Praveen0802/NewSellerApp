import CustomSelect from "@/components/commonComponents/customSelect";
import Image from "next/image";
import React from "react";
import calendarIcon from "../../../../public/calendar-03.svg";

const TopSellingEvents = (props) => {
  const { sellingEvents } = props;
  const { secondSelect, firstSelect } = sellingEvents;
  return (
    <div className="bg-white rounded-md border border-[#eaeaf1] flex flex-col h-full">
      <div className="flex flex-col sm:flex-row p-3 sm:p-5 border-b border-[#F0F0F5] gap-3 sm:justify-between sm:items-center">
        <h2 className="text-base sm:text-lg font-medium">
          {sellingEvents.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          <CustomSelect
            selectedValue={firstSelect?.selectedOption}
            options={firstSelect?.options}
            onSelect={firstSelect?.onChange}
            textSize="text-xs sm:text-sm"
            buttonPadding="px-2 sm:px-3 py-1 sm:py-1.5"
            dropdownItemPadding="py-1 pl-2 pr-4 sm:pr-6"
          />
          <CustomSelect
            selectedValue={secondSelect?.selectedOption}
            options={secondSelect?.options}
            onSelect={secondSelect?.onChange}
            textSize="text-xs sm:text-sm"
            buttonPadding="px-2 sm:px-3 py-1 sm:py-1.5"
            dropdownItemPadding="py-1 pl-2 pr-4 sm:pr-6"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="max-h-[300px] overflow-auto overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                {sellingEvents.tableViews.title.map((title, index) => (
                  <th
                    key={index}
                    className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm text-gray-600"
                  >
                    {title}
                  </th>
                ))}
                <th className="w-24 sm:w-32"></th>
              </tr>
            </thead>
            <tbody>
              {sellingEvents.tableViews.body.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">
                    {row.eventName}
                  </td>
                  <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Image
                        src={calendarIcon}
                        width={14}
                        height={14}
                        alt="calendar icon"
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      />
                      <span>{row.eventDate}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 sm:px-4 text-right">
                    <button className="bg-[#0137D5] text-white py-1 px-2 rounded-md text-xs sm:text-sm hover:bg-[#0137D5] transition-colors whitespace-nowrap">
                      {row.ctaName}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TopSellingEvents;
