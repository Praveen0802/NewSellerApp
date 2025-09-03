import React, { useState, useRef, useEffect } from "react";

const CustomSelect = ({
  options = [],
  selectedValue = null,
  onSelect,
  placeholder = "Select Your option",
  className = "",
  buttonClassName="",
  textSize = "text-lg", // Default text size
  buttonPadding = "px-4 py-2", // Default button padding
  dropdownItemPadding = "py-2 pl-3 pr-9", // Default dropdown item padding
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(selectedValue);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update selected value when prop changes
  useEffect(() => {
    setSelected(selectedValue);
  }, [selectedValue]);

  const handleSelect = (option) => {
    // If clicking the already selected option, clear the selection
    if (
      selected === option ||
      (option.value !== undefined && selected === option.value)
    ) {
      setSelected(null);
      if (onSelect) {
        onSelect(null);
      }
    } else {
      setSelected(option.value !== undefined ? option.value : option);
      if (onSelect) {
        onSelect(option.value !== undefined ? option.value : option);
      }
    }
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Find the currently selected option's label
  const getSelectedLabel = () => {
    if (!selected && placeholder) return { placeholder: placeholder };

    const selectedOption = options.find(
      (option) => option.value === selected || option === selected
    );

    return selectedOption
      ? selectedOption.label || selectedOption
      : { placeholder: placeholder };
  };

  const viewingValue = getSelectedLabel();

  return (
    <div className={`relative w-full sm:w-fit ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className={`flex items-center justify-between ${buttonClassName} w-full px-2 sm:px-4 py-2 text-xs sm:text-sm text-left text-gray-700 bg-white border-[1px] border-[#DADBE5] rounded-[4px] focus:outline-none min-h-[44px]`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className={`${
            viewingValue?.placeholder ? "text-gray-400" : "text-[#343432]"
          } font-normal text-xs sm:text-[12px] truncate`}
        >
          {viewingValue?.placeholder ? viewingValue?.placeholder : viewingValue}
        </span>
        <svg
          className={`w-4 h-4 ml-2 flex-shrink-0 ${
            viewingValue?.placeholder ? "text-gray-400" : "text-[#130061]"
          } transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[999] w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul
            className={`py-1 overflow-auto text-xs sm:text-sm rounded-md max-h-48 sm:max-h-60 focus:outline-none`}
            role="listbox"
          >
            {options.map((option, index) => {
              const value = option.value !== undefined ? option.value : option;
              const label = option.label !== undefined ? option.label : option;
              const isSelectedOption =
                selected === value || selected === option;

              return (
                <li
                  key={index}
                  className={`cursor-pointer select-none flex justify-between items-center relative py-2 pl-2 sm:pl-3  hover:bg-indigo-50 min-h-[44px] sm:min-h-auto ${
                    isSelectedOption
                      ? "bg-indigo-100 text-[#130061]"
                      : "text-gray-900"
                  }`}
                  id={`option-${index}`}
                  role="option"
                  aria-selected={isSelectedOption}
                  onClick={() => handleSelect(option)}
                >
                  <span
                    className={`block truncate text-xs sm:text-sm ${
                      isSelectedOption ? "font-medium" : "font-normal"
                    }`}
                  >
                    {label}
                  </span>

                  {isSelectedOption && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect("");
                      }}
                      className="rounded-full cursor-pointer hover:bg-gray-200 p-1 sm:p-2 min-w-[20px] min-h-[20px] flex items-center justify-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-3 sm:size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
