import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SelectListItem = ({
  selectedIndex,
  item,
  handleSelectItemClick,
  onCurrencyChange, // New prop for handling currency changes
  selectedCurrency = "GBP", // New prop for current selected currency
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCurrencySelect = (currency, event) => {
    event.stopPropagation(); // Prevent tab selection when clicking currency
    if (onCurrencyChange) {
      onCurrencyChange(currency.value, item.key);
    }
    setShowDropdown(false);
  };

  const handleDropdownToggle = (event) => {
    event.stopPropagation(); // Prevent tab selection when clicking dropdown
    setShowDropdown(!showDropdown);
  };

  return (
    <div
      onClick={() => handleSelectItemClick(item)}
      className={`${selectedIndex ? "bg-white" : "bg-[#F6F7F9]"} p-3 w-full ${
        item?.amount ? "flex flex-col " : ""
      } rounded-t-xl cursor-pointer  transition-colors duration-200`}
    >
      <div className="flex justify-between items-center w-full">
        <p
          className={`text-[14px] whitespace-nowrap font-medium ${
            selectedIndex ? "text-[#343432]" : "text-[#343432]"
          }`}
        >
          {item?.name}
        </p>
        {item?.icon && item?.icon}
        {item?.count ? (
          <p className="text-[14px] font-medium rounded-sm bg-[#F6F7F9] p-2">
            {item?.count}
          </p>
        ) : (
          <></>
        )}
      </div>

      {item?.amount && (
        <div className="flex gap-4 justify-between w-full items-center">
          <p className="text-[#7D82A4] text-[12px]">{item?.amount}</p>

          {/* Currency Dropdown - only show if options are available */}
          {item?.options && item?.options.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={handleDropdownToggle}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] ${
                  selectedIndex ? "bg-white" : "bg-gray-100"
                } rounded border-none transition-colors duration-200`}
              >
                <span className="text-[#7D82A4]">
                  {item?.options.find((opt) => opt.value === selectedCurrency)
                    ?.label || selectedCurrency}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#7D82A4] transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border-none rounded-md shadow-lg z-50 min-w-[80px]">
                  <div className="py-1">
                    {item.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleCurrencySelect(option, e)}
                        className={`w-full text-left px-3 py-1 text-[11px] hover:bg-gray-100 transition-colors duration-150 ${
                          selectedCurrency === option.value
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectListItem;
