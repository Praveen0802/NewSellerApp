import CustomSelect from "@/components/commonComponents/customSelect";
import React from "react";
import LeftViewContainer from "./leftViewContainer";
import RightViewContainer from "./rightViewContainer";

const ReportViewContainer = ({ reportValues }) => {
  const { 
    title, 
    options, 
    selectedOption, 
    onChange, 
    reports, 
    tableView, 
    handleScrollEnd, 
    keyValue, 
    meta, 
    loader 
  } = reportValues;

  return (
    <div className="bg-white border border-[#eaeaf1] p-3 md:p-5 rounded-md flex flex-col gap-3 md:gap-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm md:text-base font-semibold">{title}</p>
        <CustomSelect
          selectedValue={selectedOption}
          options={options}
          onSelect={onChange}
          textSize="text-xs md:text-sm"
          buttonPadding="px-2 md:px-3 py-1 md:py-1.5"
          dropdownItemPadding="py-1 pl-2 pr-4 md:pr-6"
        />
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:gap-5 flex-1">
        <LeftViewContainer reports={reports} />
        <RightViewContainer 
          tableView={tableView} 
          handleScrollEnd={handleScrollEnd}
          keyValue={keyValue}
          meta={meta}
          loader={loader}
        />
      </div>
    </div>
  );
};

export default ReportViewContainer;