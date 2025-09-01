import React from "react";

const AvailableList = ({ list, loading = false }) => {
  // Separate handler for checkbox to prevent event propagation
  const handleCheckboxClick = (e) => {
    e.stopPropagation(); // Prevent the parent click event

    // Don't proceed if checkbox is disabled
    if (list?.disabled) {
      return;
    }

    if (list?.onCheckChange) {
      list.onCheckChange(e);
    }
  };

  // Handler for the entire component click
  const handleItemClick = () => {
    // Container is always clickable
    if (list?.showCheckbox && list?.onClick) {
      list.onClick();
    }
  };

  // Shimmer component
  const ShimmerBlock = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  // If loading, show shimmer
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-md bg-white py-2 px-2  max-md:w-[200px] md:flex-1 flex flex-col gap-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <ShimmerBlock className="h-6 w-16" />
          <ShimmerBlock className="h-4 w-12 rounded-xl" />
        </div>
        <div className="flex items-center gap-2 justify-between">
          <ShimmerBlock className="h-3 w-20" />
          <ShimmerBlock className="h-4 w-4 rounded" />
        </div>
      </div>
    );
  }

  // Determine styling - container is always enabled, only checkbox can be disabled
  const containerClasses = `
    border border-gray-200 rounded-md bg-white py-2 px-2 
     max-md:w-[200px] md:flex-1 flex-shrink-0
    ${list?.className || ''} flex flex-col gap-2
    ${
      list?.showCheckbox
        ? "cursor-pointer hover:bg-gray-50 transition-colors"
        : ""
    }
  `;

  const valueTextClasses = "text-[18px] text-[#343432]";

  const nameTextClasses = "text-[11px] font-normal text-gray-500";

  return (
    <div
      className={containerClasses}
      onClick={handleItemClick}
      role={list?.showCheckbox ? "button" : undefined}
      tabIndex={list?.showCheckbox ? 0 : -1}
      onKeyDown={(e) => {
        if (
          list?.showCheckbox &&
          (e.key === "Enter" || e.key === " ")
        ) {
          handleItemClick();
        }
      }}
    >
      <div className="flex justify-between items-center">
        <p className={valueTextClasses}>{list?.value}</p>
        {list?.smallTooptip && (
          <p className="bg-[#F8F8FA] rounded-xl px-3 py-1 text-[10px]">
            {list?.smallTooptip}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 justify-between">
        <p className={nameTextClasses}>{list?.name}</p>
        {list?.showCheckbox && (
          <input
            type="checkbox"
            checked={list?.isChecked || false}
            disabled={list?.disabled || false}
            onChange={handleCheckboxClick}
            onClick={(e) => e.stopPropagation()}
            className={`
              accent-[#51428E]
              ${
                list?.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              }
            `}
          />
        )}
      </div>
    </div>
  );
};

export default AvailableList;