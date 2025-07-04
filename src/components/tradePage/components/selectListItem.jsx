import React from "react";

const SelectListItem = ({ selectedIndex, item, handleSelectItemClick }) => {
  return (
    <div
      onClick={() => handleSelectItemClick(item)}
      className={`${
        selectedIndex ? "bg-white" : "bg-[#F6F7F9]"
      } py-3 px-4 flex items-center cursor-pointer  justify-between w-full  rounded-t-xl`}
    >
      <p
        className={`text-[16px] whitespace-nowrap font-medium ${
          selectedIndex ? "text-[#343432]" : "text-[#343432]"
        }`}
      >
        {item?.name}
      </p>
      {item?.icon && item?.icon}
      {item?.count && <p className="text-[16px] font-medium rounded-sm bg-[#F6F7F9] px-4 py-2">{item?.count}</p>}
    </div>
  );
};

export default SelectListItem;
