import React from "react";

const ToggleStatus = ({ listItems, selectedItem, onClick }) => {
  return (
    <div className="border-[1px] flex items-center border-[#E0E1EA] p-[1px] sm:p-[2px] rounded-[6px] sm:rounded-[8px] bg-white">
      {listItems?.map((item, index) => {
        return (
          <div
            onClick={() => onClick(item)}
            className={`w-[50%] text-[10px] sm:text-[12px] text-center py-[4px] sm:py-[5px] cursor-pointer ${
              selectedItem == item?.key
                ? "text-white font-normal rounded-[5px] sm:rounded-md bg-[#343432] "
                : ""
            }`}
            key={index}
          >
            {item?.label}
          </div>
        );
      })}
    </div>
  );
};

export default ToggleStatus;