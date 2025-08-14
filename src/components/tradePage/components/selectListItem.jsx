import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SelectListItem = ({
  selectedIndex,
  item,
  handleSelectItemClick,
  onCurrencyChange, // New prop for handling currency changes
  selectedCurrency = "GBP", // New prop for current selected currency
  loading = false, // New prop for loading state
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
    if (onCurrencyChange && !loading) {
      onCurrencyChange(currency.value, item.key);
    }
    setShowDropdown(false);
  };

  const handleDropdownToggle = (event) => {
    event.stopPropagation(); // Prevent tab selection when clicking dropdown
    if (!loading) {
      setShowDropdown(!showDropdown);
    }
  };

  const handleItemClick = () => {
    if (!loading) {
      handleSelectItemClick(item);
    }
  };

  // Shimmer component
  const Shimmer = ({ width = "100%", height = "16px", className = "" }) => (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={{ width, height }}
    />
  );

  if (loading) {
    return (
      <div
        className={`${selectedIndex ? "bg-white" : "bg-[#F6F7F9]"} p-3 w-full ${
          item?.amount ? "flex flex-col " : ""
        } rounded-t-xl transition-colors duration-200`}
      >
        <div className="flex justify-between items-center w-full">
          {/* Tab name shimmer */}
          <Shimmer width="80px" height="16px" />
          
          {/* Count/icon shimmer */}
          {item?.count !== undefined ? (
            <Shimmer width="40px" height="28px" className="rounded-sm" />
          ) : (
            <Shimmer width="20px" height="20px" className="rounded" />
          )}
        </div>

        {item?.amount && (
          <div className="flex gap-4 justify-between w-full items-center mt-2">
            {/* Amount shimmer */}
            <Shimmer width="60px" height="12px" />

            {/* Currency dropdown shimmer */}
            {item?.options && item?.options.length > 0 && (
              <Shimmer width="50px" height="20px" className="rounded" />
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleItemClick}
      className={`${selectedIndex ? "bg-white" : "bg-[#F6F7F9]"} p-3 w-full ${
        item?.amount ? "flex flex-col " : ""
      } rounded-t-xl cursor-pointer transition-colors duration-200 ${
        loading ? "pointer-events-none" : ""
      }`}
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
                disabled={loading}
                className={`flex items-center gap-1 px-2 py-1 text-[10px] ${
                  selectedIndex ? "bg-white" : "bg-gray-100"
                } rounded border-none transition-colors duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span className="text-[#7D82A4]">
                  {item?.options.find((opt) => opt.value === selectedCurrency)
                    ?.label || selectedCurrency}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#7D82A4] transition-transform duration-200 ${
                    showDropdown ? "rotate-180" : ""
                  } ${loading ? "opacity-50" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && !loading && (
                <div className="absolute right-0 top-full mt-1 bg-white border-none rounded-md shadow-lg z-50 min-w-[80px]">
                  <div className="py-1">
                    {item.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleCurrencySelect(option, e)}
                        className={`w-full text-left px-3 py-1 text-[11px] hover:bg-gray-100 transition-colors duration-150 ${
                          selectedCurrency === option.value
                            ? "bg-blue-50 text-gray-600 font-medium"
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

      {/* CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-pulse {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SelectListItem;