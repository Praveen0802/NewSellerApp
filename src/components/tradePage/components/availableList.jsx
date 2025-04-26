import React from "react";

const AvailableList = ({ list }) => {
  // Separate handler for checkbox to prevent event propagation
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent the parent click event
    if (list?.onCheckChange) {
      list.onCheckChange(e);
    }
  };

  // Handler for the entire component click
  const handleItemClick = () => {
    if (list?.showCheckbox && list?.onClick) {
      list.onClick();
    }
  };

  return (
    <div
      className={`border border-gray-200 rounded-md bg-white py-3 px-4 w-full flex flex-col gap-2 ${
        list?.showCheckbox
          ? "cursor-pointer hover:bg-gray-50 transition-colors"
          : ""
      }`}
      onClick={handleItemClick}
      role={list?.showCheckbox ? "button" : undefined}
      tabIndex={list?.showCheckbox ? 0 : undefined}
      onKeyDown={(e) => {
        if (list?.showCheckbox && (e.key === "Enter" || e.key === " ")) {
          handleItemClick();
        }
      }}
    >
      <p className="text-2xl text-[#343432]">{list?.value}</p>
      <div className="flex items-center gap-2 justify-between">
        <p className="text-xs text-gray-500 font-normal">{list?.name}</p>
        {list?.showCheckbox && (
          <input
            type="checkbox"
            checked={list?.isChecked || false}
            onChange={handleCheckboxClick}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer accent-[#51428E]"
          />
        )}
      </div>
    </div>
  );
};

export default AvailableList;
